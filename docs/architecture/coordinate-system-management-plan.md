# Coordinate System Management & Synchronization Plan

## Overview
Establish a single source of truth for managing multiple coordinate systems (Machine, Work Coordinate Systems, UI Display) and ensure synchronized position data across all UI components (2D/3D displays, jog controls, position readouts).

## Coordinate System Fundamentals

### CNC Coordinate System Types
```typescript
interface CoordinateSystemTypes {
  // Machine Coordinates (Absolute)
  machine: {
    description: 'Physical position relative to machine home'
    origin: 'Machine home position (typically limit switches)'
    example: { x: 30, y: 260, z: -31 }
    immutable: true
    reference: 'Always available, never changes meaning'
  }
  
  // Work Coordinate Systems (WCS) - G54, G55, G56, etc.
  work: {
    description: 'User-defined coordinate systems with custom origins'
    origin: 'User-set work piece zero or fixture location'
    systems: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    example: { x: 0, y: 0, z: 0 } // Same physical location as machine example
    mutable: true
    reference: 'Changes based on active WCS and offset values'
  }
  
  // Display Coordinates (UI)
  display: {
    description: 'What user sees in UI (can be machine or work)'
    configurable: true
    userPreference: 'machine' | 'work' | 'both'
    context: 'May change based on operation mode'
  }
}
```

### Coordinate System Relationships
```typescript
// Mathematical relationship between coordinate systems
interface CoordinateRelationship {
  // Core equation: Machine = Work + Offset
  machinePosition: Position    // Absolute physical position
  workOffset: Position        // WCS offset from machine zero
  workPosition: Position      // Calculated: Machine - Offset
  
  // Active Work Coordinate System
  activeWCS: 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59'
  
  // All available offsets
  wcsOffsets: Record<WCSSystem, Position>
}

// Example calculation
const machinePos = { x: 30, y: 260, z: -31 }     // From machine
const g54Offset = { x: 30, y: 260, z: -31 }      // User-set G54 offset
const workPos = {                                 // Calculated
  x: machinePos.x - g54Offset.x,  // 30 - 30 = 0
  y: machinePos.y - g54Offset.y,  // 260 - 260 = 0  
  z: machinePos.z - g54Offset.z   // -31 - (-31) = 0
}
```

## Single Source of Truth Architecture

### 1. Coordinate System Manager

```typescript
// Core coordinate system management
src/core/coordinates/
├── __tests__/
│   ├── coordinate-manager.test.ts
│   ├── wcs-manager.test.ts
│   ├── position-converter.test.ts
│   └── coordinate-validator.test.ts
├── types/
│   ├── coordinate-types.ts
│   ├── wcs-types.ts
│   └── position-types.ts
├── managers/
│   ├── CoordinateManager.ts           # Main coordinate system controller
│   ├── WCSManager.ts                  # Work coordinate system management
│   ├── PositionConverter.ts           # Conversion utilities
│   └── CoordinateValidator.ts         # Validation and bounds checking
├── utils/
│   ├── coordinate-math.ts             # Mathematical operations
│   ├── coordinate-formatting.ts       # Display formatting
│   └── coordinate-persistence.ts      # Save/load WCS offsets
├── config.js
└── index.ts
```

#### **Core Coordinate Manager**
```typescript
export class CoordinateManager {
  private machinePosition: Position = { x: 0, y: 0, z: 0 }
  private wcsManager: WCSManager
  private eventBus: EventBus
  private logger: Logger
  
  constructor(eventBus: EventBus, logger: Logger) {
    this.wcsManager = new WCSManager()
    this.eventBus = eventBus
    this.logger = logger
    
    // Subscribe to machine position updates
    this.eventBus.on('machine:position-changed', this.handleMachinePositionUpdate.bind(this))
    this.eventBus.on('machine:wcs-changed', this.handleWCSChange.bind(this))
  }
  
  // === SINGLE SOURCE OF TRUTH ===
  // All position data flows through these methods
  
  /**
   * Update machine position (from machine feedback)
   * This is the ONLY method that should update raw machine position
   */
  updateMachinePosition(position: Position, source: 'machine-feedback' | 'manual-sync'): void {
    const previous = { ...this.machinePosition }
    this.machinePosition = { ...position }
    
    this.logger.debug('Machine position updated', {
      previous,
      current: this.machinePosition,
      source
    })
    
    // Emit synchronized position data to all consumers
    this.emitPositionUpdate()
  }
  
  /**
   * Get current machine position (absolute)
   */
  getMachinePosition(): Position {
    return { ...this.machinePosition }
  }
  
  /**
   * Get current work position (relative to active WCS)
   */
  getWorkPosition(): Position {
    const activeOffset = this.wcsManager.getActiveOffset()
    return this.convertMachineToWork(this.machinePosition, activeOffset)
  }
  
  /**
   * Get position in specific WCS
   */
  getPositionInWCS(wcs: WCSSystem): Position {
    const offset = this.wcsManager.getOffset(wcs)
    return this.convertMachineToWork(this.machinePosition, offset)
  }
  
  /**
   * Get all position representations
   */
  getAllPositions(): CoordinateSnapshot {
    const activeWCS = this.wcsManager.getActiveWCS()
    const activeOffset = this.wcsManager.getActiveOffset()
    
    return {
      machine: { ...this.machinePosition },
      work: this.convertMachineToWork(this.machinePosition, activeOffset),
      activeWCS,
      wcsOffsets: this.wcsManager.getAllOffsets(),
      timestamp: new Date()
    }
  }
  
  // === COORDINATE CONVERSIONS ===
  
  convertMachineToWork(machinePos: Position, offset: Position): Position {
    return {
      x: machinePos.x - offset.x,
      y: machinePos.y - offset.y,
      z: machinePos.z - offset.z
    }
  }
  
  convertWorkToMachine(workPos: Position, offset: Position): Position {
    return {
      x: workPos.x + offset.x,
      y: workPos.y + offset.y,
      z: workPos.z + offset.z
    }
  }
  
  // === WCS MANAGEMENT ===
  
  setActiveWCS(wcs: WCSSystem): void {
    this.wcsManager.setActive(wcs)
    this.emitPositionUpdate() // Triggers UI updates
  }
  
  setWCSOffset(wcs: WCSSystem, offset: Position): void {
    this.wcsManager.setOffset(wcs, offset)
    if (wcs === this.wcsManager.getActiveWCS()) {
      this.emitPositionUpdate() // Only emit if active WCS changed
    }
  }
  
  // === EVENT EMISSION ===
  
  private emitPositionUpdate(): void {
    const snapshot = this.getAllPositions()
    
    // Emit to all UI components
    this.eventBus.emit('coordinates:position-updated', snapshot)
    this.eventBus.emit('coordinates:machine-position', snapshot.machine)
    this.eventBus.emit('coordinates:work-position', snapshot.work)
    this.eventBus.emit('coordinates:wcs-changed', {
      active: snapshot.activeWCS,
      offsets: snapshot.wcsOffsets
    })
  }
  
  private handleMachinePositionUpdate(data: { position: Position }): void {
    this.updateMachinePosition(data.position, 'machine-feedback')
  }
  
  private handleWCSChange(data: { wcs: WCSSystem, offset?: Position }): void {
    if (data.offset) {
      this.setWCSOffset(data.wcs, data.offset)
    }
    this.setActiveWCS(data.wcs)
  }
}
```

#### **Work Coordinate System Manager**
```typescript
export class WCSManager {
  private activeWCS: WCSSystem = 'G54'
  private offsets: Record<WCSSystem, Position> = {
    G54: { x: 0, y: 0, z: 0 },
    G55: { x: 0, y: 0, z: 0 },
    G56: { x: 0, y: 0, z: 0 },
    G57: { x: 0, y: 0, z: 0 },
    G58: { x: 0, y: 0, z: 0 },
    G59: { x: 0, y: 0, z: 0 }
  }
  
  getActiveWCS(): WCSSystem {
    return this.activeWCS
  }
  
  getActiveOffset(): Position {
    return { ...this.offsets[this.activeWCS] }
  }
  
  getOffset(wcs: WCSSystem): Position {
    return { ...this.offsets[wcs] }
  }
  
  getAllOffsets(): Record<WCSSystem, Position> {
    return Object.fromEntries(
      Object.entries(this.offsets).map(([wcs, offset]) => [wcs, { ...offset }])
    ) as Record<WCSSystem, Position>
  }
  
  setActive(wcs: WCSSystem): void {
    this.activeWCS = wcs
  }
  
  setOffset(wcs: WCSSystem, offset: Position): void {
    this.offsets[wcs] = { ...offset }
  }
  
  // Zero current position in active WCS
  zeroActiveWCS(currentMachinePosition: Position): void {
    this.offsets[this.activeWCS] = { ...currentMachinePosition }
  }
  
  // Copy offset from one WCS to another
  copyOffset(from: WCSSystem, to: WCSSystem): void {
    this.offsets[to] = { ...this.offsets[from] }
  }
  
  // Reset WCS to machine coordinates
  resetWCS(wcs: WCSSystem): void {
    this.offsets[wcs] = { x: 0, y: 0, z: 0 }
  }
}
```

### 2. UI Synchronization Strategy

#### **Reactive Position Hook**
```typescript
// Hook for UI components to consume position data
export function useCoordinates() {
  const [snapshot, setSnapshot] = useState<CoordinateSnapshot | null>(null)
  const [displayMode, setDisplayMode] = useState<'machine' | 'work' | 'both'>('work')
  
  useEffect(() => {
    const handlePositionUpdate = (newSnapshot: CoordinateSnapshot) => {
      setSnapshot(newSnapshot)
    }
    
    eventBus.on('coordinates:position-updated', handlePositionUpdate)
    
    return () => {
      eventBus.off('coordinates:position-updated', handlePositionUpdate)
    }
  }, [])
  
  const displayPosition = useMemo(() => {
    if (!snapshot) return null
    
    switch (displayMode) {
      case 'machine':
        return snapshot.machine
      case 'work':
        return snapshot.work
      case 'both':
        return {
          machine: snapshot.machine,
          work: snapshot.work
        }
    }
  }, [snapshot, displayMode])
  
  return {
    // Position data
    machine: snapshot?.machine || null,
    work: snapshot?.work || null,
    display: displayPosition,
    
    // WCS data
    activeWCS: snapshot?.activeWCS || 'G54',
    wcsOffsets: snapshot?.wcsOffsets || {},
    
    // Display preferences
    displayMode,
    setDisplayMode,
    
    // Convenience methods
    isAtPosition: (target: Position, tolerance = 0.001) => {
      if (!snapshot) return false
      const current = displayMode === 'machine' ? snapshot.machine : snapshot.work
      return isPositionEqual(current, target, tolerance)
    },
    
    // Coordinate conversions
    toMachine: (workPos: Position) => {
      if (!snapshot) return workPos
      const offset = snapshot.wcsOffsets[snapshot.activeWCS]
      return coordinateManager.convertWorkToMachine(workPos, offset)
    },
    
    toWork: (machinePos: Position) => {
      if (!snapshot) return machinePos
      const offset = snapshot.wcsOffsets[snapshot.activeWCS]
      return coordinateManager.convertMachineToWork(machinePos, offset)
    }
  }
}
```

#### **Component Synchronization Examples**

**Position Display Components**
```typescript
// Synchronized position display
const PositionDisplay: React.FC = () => {
  const { display, displayMode, activeWCS } = useCoordinates()
  
  if (!display) return <div>No position data</div>
  
  return (
    <div className="position-display">
      <div className="coordinate-header">
        <span>Position ({displayMode === 'work' ? activeWCS : 'Machine'})</span>
        <CoordinateModeSwitcher />
      </div>
      
      {displayMode === 'both' ? (
        <div className="dual-display">
          <PositionRow label="Work" position={display.work} />
          <PositionRow label="Machine" position={display.machine} />
        </div>
      ) : (
        <PositionRow 
          label={displayMode === 'work' ? activeWCS : 'Machine'} 
          position={display} 
        />
      )}
    </div>
  )
}

// 2D/3D visualization components
const WorkingAreaPreview: React.FC = () => {
  const { machine, work, activeWCS } = useCoordinates()
  const { showMachineCoordinates, showWorkCoordinates } = useVisualizationSettings()
  
  return (
    <div className="working-area-preview">
      {showMachineCoordinates && machine && (
        <PositionMarker 
          position={machine} 
          label="Machine" 
          color="red" 
        />
      )}
      
      {showWorkCoordinates && work && (
        <PositionMarker 
          position={work} 
          label={activeWCS} 
          color="blue" 
        />
      )}
      
      <GridOverlay coordinateSystem={activeWCS} />
    </div>
  )
}

// Jog controls with coordinate awareness
const JogControls: React.FC = () => {
  const { displayMode, toMachine } = useCoordinates()
  const { jog } = useMachine()
  
  const handleJog = async (axis: Axis, distance: number) => {
    // Jog commands always sent in machine coordinates
    // Convert work coordinates to machine if needed
    const machineDistance = displayMode === 'work' 
      ? convertWorkDistanceToMachine(distance, axis)
      : distance
    
    await jog(axis, machineDistance)
  }
  
  return (
    <div className="jog-controls">
      <CoordinateSystemIndicator />
      <AxisControls onJog={handleJog} />
    </div>
  )
}
```

### 3. State Management Integration

#### **Coordinate Store**
```typescript
// Integration with existing state management
interface CoordinateState {
  // Current position snapshot
  current: CoordinateSnapshot | null
  
  // Display preferences
  displayMode: 'machine' | 'work' | 'both'
  showGridLines: boolean
  showOriginMarkers: boolean
  
  // WCS management
  wcsProfiles: Record<string, WCSProfile> // Named WCS setups
  
  // History
  positionHistory: PositionHistoryEntry[]
  
  // Status
  isCalibrating: boolean
  lastUpdate: Date | null
  errors: CoordinateError[]
}

export const useCoordinateStore = create<CoordinateState & CoordinateActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      current: null,
      displayMode: 'work',
      showGridLines: true,
      showOriginMarkers: true,
      wcsProfiles: {},
      positionHistory: [],
      isCalibrating: false,
      lastUpdate: null,
      errors: [],
      
      // Actions
      updatePosition: (snapshot: CoordinateSnapshot) => {
        set((state) => {
          state.current = snapshot
          state.lastUpdate = new Date()
          
          // Add to history (keep last 1000 entries)
          state.positionHistory.push({
            timestamp: new Date(),
            machine: snapshot.machine,
            work: snapshot.work,
            activeWCS: snapshot.activeWCS
          })
          
          if (state.positionHistory.length > 1000) {
            state.positionHistory = state.positionHistory.slice(-1000)
          }
        })
      },
      
      setDisplayMode: (mode: 'machine' | 'work' | 'both') => {
        set((state) => {
          state.displayMode = mode
        })
      },
      
      setWCSProfile: (name: string, profile: WCSProfile) => {
        set((state) => {
          state.wcsProfiles[name] = profile
        })
      },
      
      loadWCSProfile: (name: string) => {
        const { wcsProfiles } = get()
        const profile = wcsProfiles[name]
        if (profile) {
          // Apply WCS offsets from profile
          coordinateManager.wcsManager.loadProfile(profile)
        }
      }
    }))
  )
)
```

### 4. Machine Communication Integration

#### **Position Feedback Processing**
```typescript
// Integration with machine controller
export class MachinePositionProcessor {
  private coordinateManager: CoordinateManager
  
  constructor(coordinateManager: CoordinateManager) {
    this.coordinateManager = coordinateManager
  }
  
  /**
   * Process raw machine feedback and update coordinate system
   */
  processMachineResponse(response: string): void {
    // Parse different types of position responses
    if (response.startsWith('<')) {
      // Real-time status response: <Idle|MPos:30.000,260.000,-31.000|WPos:0.000,0.000,0.000>
      this.processStatusResponse(response)
    } else if (response.startsWith('$#')) {
      // Coordinate system data: $# G54:30.000,260.000,-31.000 G55:0.000,0.000,0.000
      this.processCoordinateSystemResponse(response)
    } else if (response.includes('PRB:')) {
      // Probe response: [PRB:0.000,0.000,-10.000:1]
      this.processProbeResponse(response)
    }
  }
  
  private processStatusResponse(response: string): void {
    const mposMatch = response.match(/MPos:([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
    const wposMatch = response.match(/WPos:([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
    
    if (mposMatch) {
      const machinePosition = {
        x: parseFloat(mposMatch[1]),
        y: parseFloat(mposMatch[2]),
        z: parseFloat(mposMatch[3])
      }
      
      // Update through coordinate manager (single source of truth)
      this.coordinateManager.updateMachinePosition(machinePosition, 'machine-feedback')
    }
    
    if (wposMatch) {
      // Work position is reported for verification
      // We calculate it ourselves, but can compare for accuracy
      const reportedWorkPosition = {
        x: parseFloat(wposMatch[1]),
        y: parseFloat(wposMatch[2]),
        z: parseFloat(wposMatch[3])
      }
      
      this.validateWorkPositionCalculation(reportedWorkPosition)
    }
  }
  
  private processCoordinateSystemResponse(response: string): void {
    // Parse coordinate system offsets: G54:30.000,260.000,-31.000
    const systems = response.match(/G5([4-9]):([-\d\.]+),([-\d\.]+),([-\d\.]+)/g)
    
    systems?.forEach(system => {
      const match = system.match(/G5([4-9]):([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
      if (match) {
        const wcsNumber = parseInt(match[1])
        const wcs = `G5${wcsNumber}` as WCSSystem
        const offset = {
          x: parseFloat(match[2]),
          y: parseFloat(match[3]),
          z: parseFloat(match[4])
        }
        
        this.coordinateManager.setWCSOffset(wcs, offset)
      }
    })
  }
  
  private validateWorkPositionCalculation(reportedWork: Position): void {
    const calculatedWork = this.coordinateManager.getWorkPosition()
    const tolerance = 0.001
    
    if (!isPositionEqual(calculatedWork, reportedWork, tolerance)) {
      console.warn('Work position calculation mismatch', {
        calculated: calculatedWork,
        reported: reportedWork,
        difference: {
          x: Math.abs(calculatedWork.x - reportedWork.x),
          y: Math.abs(calculatedWork.y - reportedWork.y),
          z: Math.abs(calculatedWork.z - reportedWork.z)
        }
      })
      
      // Could trigger a coordinate system refresh
      this.coordinateManager.requestCoordinateSystemUpdate()
    }
  }
}
```

### 5. UI Component Examples

#### **Coordinate System Switcher**
```typescript
const CoordinateSystemSwitcher: React.FC = () => {
  const { activeWCS, wcsOffsets, displayMode, setDisplayMode } = useCoordinates()
  const [showWCSManager, setShowWCSManager] = useState(false)
  
  return (
    <div className="coordinate-system-switcher">
      <div className="display-mode-selector">
        <ToggleGroup value={displayMode} onChange={setDisplayMode}>
          <ToggleButton value="work">Work ({activeWCS})</ToggleButton>
          <ToggleButton value="machine">Machine</ToggleButton>
          <ToggleButton value="both">Both</ToggleButton>
        </ToggleGroup>
      </div>
      
      <Button 
        variant="ghost" 
        onClick={() => setShowWCSManager(true)}
        className="wcs-manager-button"
      >
        <Settings className="w-4 h-4" />
        Manage WCS
      </Button>
      
      {showWCSManager && (
        <WCSManagerModal 
          isOpen={showWCSManager}
          onClose={() => setShowWCSManager(false)}
        />
      )}
    </div>
  )
}
```

#### **WCS Management Modal**
```typescript
const WCSManagerModal: React.FC<WCSManagerModalProps> = ({ isOpen, onClose }) => {
  const { wcsOffsets, activeWCS } = useCoordinates()
  const { machine, work } = useCoordinates()
  const [selectedWCS, setSelectedWCS] = useState<WCSSystem>(activeWCS)
  
  const handleSetCurrentAsZero = () => {
    if (machine) {
      coordinateManager.setWCSOffset(selectedWCS, machine)
    }
  }
  
  const handleCopyFromActive = () => {
    const activeOffset = wcsOffsets[activeWCS]
    coordinateManager.setWCSOffset(selectedWCS, activeOffset)
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Work Coordinate Systems">
      <div className="wcs-manager">
        <div className="wcs-selector">
          <label>Select WCS:</label>
          <select value={selectedWCS} onChange={(e) => setSelectedWCS(e.target.value as WCSSystem)}>
            {['G54', 'G55', 'G56', 'G57', 'G58', 'G59'].map(wcs => (
              <option key={wcs} value={wcs}>
                {wcs} {wcs === activeWCS ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="current-position">
          <h3>Current Position</h3>
          <PositionDisplay position={machine} label="Machine" />
          <PositionDisplay position={work} label={`Work (${activeWCS})`} />
        </div>
        
        <div className="wcs-offset">
          <h3>{selectedWCS} Offset</h3>
          <PositionInput 
            value={wcsOffsets[selectedWCS]}
            onChange={(offset) => coordinateManager.setWCSOffset(selectedWCS, offset)}
          />
        </div>
        
        <div className="wcs-actions">
          <Button onClick={handleSetCurrentAsZero}>
            Set Current Position as Zero
          </Button>
          <Button onClick={handleCopyFromActive}>
            Copy from {activeWCS}
          </Button>
          <Button onClick={() => coordinateManager.wcsManager.resetWCS(selectedWCS)}>
            Reset to Machine Zero
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### 6. Error Handling & Validation

#### **Coordinate Validation**
```typescript
export class CoordinateValidator {
  validatePosition(position: Position, bounds?: MachineBounds): ValidationResult {
    const errors: string[] = []
    
    // Check for valid numbers
    if (!isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) {
      errors.push('Position contains invalid numbers')
    }
    
    // Check machine bounds if provided
    if (bounds) {
      if (position.x < bounds.min.x || position.x > bounds.max.x) {
        errors.push(`X position ${position.x} is outside machine bounds`)
      }
      if (position.y < bounds.min.y || position.y > bounds.max.y) {
        errors.push(`Y position ${position.y} is outside machine bounds`)
      }
      if (position.z < bounds.min.z || position.z > bounds.max.z) {
        errors.push(`Z position ${position.z} is outside machine bounds`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  validateWCSOffset(offset: Position, machinePosition: Position, bounds?: MachineBounds): ValidationResult {
    const errors: string[] = []
    
    // Calculate what the work position would be
    const calculatedWork = {
      x: machinePosition.x - offset.x,
      y: machinePosition.y - offset.y,
      z: machinePosition.z - offset.z
    }
    
    // Validate the resulting work position makes sense
    const workValidation = this.validatePosition(calculatedWork)
    if (!workValidation.isValid) {
      errors.push('WCS offset would result in invalid work position')
      errors.push(...workValidation.errors)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
```

### 7. Testing Strategy

#### **Coordinate System Tests**
```typescript
describe('CoordinateManager', () => {
  let coordinateManager: CoordinateManager
  let eventBus: EventBus
  
  beforeEach(() => {
    eventBus = new EventBus()
    coordinateManager = new CoordinateManager(eventBus, mockLogger)
  })
  
  describe('Single Source of Truth', () => {
    test('should update machine position and emit synchronized events', () => {
      const position = { x: 30, y: 260, z: -31 }
      const positionListener = jest.fn()
      
      eventBus.on('coordinates:position-updated', positionListener)
      
      coordinateManager.updateMachinePosition(position, 'machine-feedback')
      
      expect(positionListener).toHaveBeenCalledWith(
        expect.objectContaining({
          machine: position,
          work: expect.any(Object),
          activeWCS: 'G54'
        })
      )
    })
    
    test('should maintain coordinate system relationships', () => {
      // Set machine position
      coordinateManager.updateMachinePosition({ x: 30, y: 260, z: -31 }, 'machine-feedback')
      
      // Set G54 offset to make work position 0,0,0
      coordinateManager.setWCSOffset('G54', { x: 30, y: 260, z: -31 })
      
      const positions = coordinateManager.getAllPositions()
      
      expect(positions.machine).toEqual({ x: 30, y: 260, z: -31 })
      expect(positions.work).toEqual({ x: 0, y: 0, z: 0 })
    })
  })
  
  describe('WCS Management', () => {
    test('should switch between work coordinate systems', () => {
      coordinateManager.updateMachinePosition({ x: 100, y: 200, z: 50 }, 'machine-feedback')
      
      // Set different offsets for G54 and G55
      coordinateManager.setWCSOffset('G54', { x: 50, y: 100, z: 25 })
      coordinateManager.setWCSOffset('G55', { x: 0, y: 0, z: 0 })
      
      // Switch to G54
      coordinateManager.setActiveWCS('G54')
      expect(coordinateManager.getWorkPosition()).toEqual({ x: 50, y: 100, z: 25 })
      
      // Switch to G55
      coordinateManager.setActiveWCS('G55')
      expect(coordinateManager.getWorkPosition()).toEqual({ x: 100, y: 200, z: 50 })
    })
  })
  
  describe('Coordinate Conversions', () => {
    test('should convert between machine and work coordinates accurately', () => {
      const machinePos = { x: 30, y: 260, z: -31 }
      const offset = { x: 30, y: 260, z: -31 }
      
      const workPos = coordinateManager.convertMachineToWork(machinePos, offset)
      expect(workPos).toEqual({ x: 0, y: 0, z: 0 })
      
      const backToMachine = coordinateManager.convertWorkToMachine(workPos, offset)
      expect(backToMachine).toEqual(machinePos)
    })
  })
})

describe('UI Synchronization', () => {
  test('useCoordinates hook should provide synchronized data', () => {
    const { result } = renderHook(() => useCoordinates())
    
    act(() => {
      coordinateManager.updateMachinePosition({ x: 50, y: 100, z: 25 }, 'machine-feedback')
    })
    
    expect(result.current.machine).toEqual({ x: 50, y: 100, z: 25 })
    expect(result.current.work).toBeDefined()
    expect(result.current.activeWCS).toBe('G54')
  })
})
```

## Implementation Timeline

### Phase 1: Core Coordinate System (1-2 weeks)
- [ ] Implement CoordinateManager as single source of truth
- [ ] Create WCSManager for work coordinate systems
- [ ] Add coordinate conversion utilities
- [ ] Implement validation and error handling
- [ ] Comprehensive unit tests

### Phase 2: UI Integration (1-2 weeks)
- [ ] Create useCoordinates hook for UI synchronization
- [ ] Update existing position displays to use coordinate manager
- [ ] Implement coordinate system switcher components
- [ ] Add WCS management UI
- [ ] Update 2D/3D visualizations

### Phase 3: Machine Integration (1 week)
- [ ] Integrate coordinate manager with machine controller
- [ ] Update machine response processing
- [ ] Add coordinate system validation
- [ ] Implement position feedback verification
- [ ] Test with real machine communication

### Phase 4: Advanced Features (1 week)
- [ ] Add WCS profiles and presets
- [ ] Implement coordinate system calibration workflows
- [ ] Add position history and tracking
- [ ] Create coordinate system diagnostics
- [ ] Performance optimization

## Benefits

### Technical Benefits
- **Single Source of Truth**: All position data flows through one manager
- **Automatic Synchronization**: UI components automatically stay in sync
- **Type Safety**: Comprehensive TypeScript types prevent coordinate system errors
- **Testability**: Clear interfaces make testing coordinate logic straightforward
- **Maintainability**: Centralized coordinate management reduces bugs

### User Experience Benefits
- **Consistent Display**: Same position data across all UI components
- **Clear Context**: Always know which coordinate system is active
- **Easy WCS Management**: Simple tools for setting up work coordinates
- **No Confusion**: Clear distinction between machine and work coordinates
- **Reliable Operation**: Validated coordinate transformations prevent errors

This architecture ensures that coordinate system management is robust, clear, and maintainable while providing a seamless user experience across all UI components.