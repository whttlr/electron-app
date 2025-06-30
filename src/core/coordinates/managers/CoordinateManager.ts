/**
 * Coordinate System Manager - Single Source of Truth
 * Manages machine coordinates, work coordinate systems, and synchronization
 */

import { 
  Position, 
  WCSSystem, 
  CoordinateSnapshot, 
  MachineBounds,
  CoordinateError,
  CoordinateEvents
} from '../types/coordinate-types'
import { WCSManager } from './WCSManager'
import { CoordinateValidator } from './CoordinateValidator'
import { 
  clonePosition, 
  isValidPosition, 
  isPositionEqual,
  roundPosition
} from '../utils/coordinate-math'

export interface CoordinateManagerOptions {
  eventBus?: any
  logger?: any
  machineBounds?: MachineBounds
  safetyLimits?: MachineBounds
  initialMachinePosition?: Position
  initialActiveWCS?: WCSSystem
}

export class CoordinateManager {
  private machinePosition: Position = { x: 0, y: 0, z: 0 }
  private wcsManager: WCSManager
  private validator: CoordinateValidator
  private eventBus?: any
  private logger?: any
  
  // Event listeners
  private listeners: Map<keyof CoordinateEvents, Set<Function>> = new Map()
  
  // State tracking
  private lastEmittedSnapshot?: CoordinateSnapshot
  private isInitialized = false

  constructor(options: CoordinateManagerOptions = {}) {
    this.eventBus = options.eventBus
    this.logger = options.logger
    
    // Initialize WCS manager
    this.wcsManager = new WCSManager({
      activeWCS: options.initialActiveWCS || 'G54'
    })
    
    // Initialize validator
    this.validator = new CoordinateValidator(
      options.machineBounds,
      options.safetyLimits,
      this.logger
    )
    
    // Set initial machine position if provided
    if (options.initialMachinePosition) {
      this.machinePosition = clonePosition(options.initialMachinePosition)
    }
    
    // Subscribe to WCS changes
    this.wcsManager.subscribe((wcsState) => {
      this.handleWCSStateChange()
    })
    
    // Set up event bus subscriptions if available
    if (this.eventBus) {
      this.setupEventBusSubscriptions()
    }
    
    this.isInitialized = true
    this.emitPositionUpdate()
  }

  // === SINGLE SOURCE OF TRUTH METHODS ===

  /**
   * Update machine position - ONLY method that should update raw machine position
   */
  updateMachinePosition(
    position: Position, 
    source: 'machine-feedback' | 'manual-sync' | 'initialization' = 'machine-feedback'
  ): void {
    // Validate position
    const validation = this.validator.validatePosition(position)
    if (!validation.isValid) {
      const error: CoordinateError = {
        type: 'validation',
        message: `Invalid machine position: ${validation.errors.join(', ')}`,
        details: { position, source, errors: validation.errors },
        timestamp: new Date()
      }
      this.emitError(error)
      return
    }

    // Round to prevent floating point accumulation
    const roundedPosition = roundPosition(position, 4)
    
    // Check if position actually changed
    if (isPositionEqual(this.machinePosition, roundedPosition, 0.0001)) {
      return // No change, skip update
    }

    const previous = clonePosition(this.machinePosition)
    this.machinePosition = roundedPosition

    this.logDebug('Machine position updated', {
      previous,
      current: this.machinePosition,
      source,
      change: {
        x: this.machinePosition.x - previous.x,
        y: this.machinePosition.y - previous.y,
        z: this.machinePosition.z - previous.z
      }
    })

    // Emit synchronized position data to all consumers
    this.emitPositionUpdate()
  }

  /**
   * Get current machine position (absolute)
   */
  getMachinePosition(): Position {
    return clonePosition(this.machinePosition)
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
      machine: clonePosition(this.machinePosition),
      work: this.convertMachineToWork(this.machinePosition, activeOffset),
      activeWCS,
      wcsOffsets: this.wcsManager.getAllOffsets(),
      timestamp: new Date()
    }
  }

  // === COORDINATE CONVERSIONS ===

  /**
   * Convert machine coordinates to work coordinates
   */
  convertMachineToWork(machinePos: Position, offset: Position): Position {
    // Validate conversion
    const result = {
      x: machinePos.x - offset.x,
      y: machinePos.y - offset.y,
      z: machinePos.z - offset.z
    }

    const validation = this.validator.validateCoordinateConversion(
      machinePos,
      result,
      'machine-to-work'
    )

    if (!validation.isValid) {
      this.logWarning('Machine to work conversion validation failed', {
        machine: machinePos,
        offset,
        result,
        errors: validation.errors
      })
    }

    return result
  }

  /**
   * Convert work coordinates to machine coordinates
   */
  convertWorkToMachine(workPos: Position, offset: Position): Position {
    // Validate conversion
    const result = {
      x: workPos.x + offset.x,
      y: workPos.y + offset.y,
      z: workPos.z + offset.z
    }

    const validation = this.validator.validateCoordinateConversion(
      workPos,
      result,
      'work-to-machine'
    )

    if (!validation.isValid) {
      this.logWarning('Work to machine conversion validation failed', {
        work: workPos,
        offset,
        result,
        errors: validation.errors
      })
    }

    return result
  }

  // === WCS MANAGEMENT ===

  /**
   * Set active WCS
   */
  setActiveWCS(wcs: WCSSystem): void {
    this.wcsManager.setActive(wcs)
    // Position update will be emitted by WCS state change handler
  }

  /**
   * Set WCS offset
   */
  setWCSOffset(wcs: WCSSystem, offset: Position): void {
    // Validate the offset
    const validation = this.validator.validateWCSOffset(
      offset,
      this.machinePosition,
      wcs
    )

    if (!validation.isValid) {
      const error: CoordinateError = {
        type: 'validation',
        message: `Invalid WCS offset for ${wcs}: ${validation.errors.join(', ')}`,
        details: { wcs, offset, machinePosition: this.machinePosition },
        timestamp: new Date()
      }
      this.emitError(error)
      return
    }

    this.wcsManager.setOffset(wcs, offset)
    // Position update will be emitted by WCS state change handler
  }

  /**
   * Zero current position in active WCS
   */
  zeroActiveWCS(): void {
    this.wcsManager.zeroActiveWCS(this.machinePosition)
    // Position update will be emitted by WCS state change handler
  }

  /**
   * Zero specific WCS at current position
   */
  zeroWCS(wcs: WCSSystem): void {
    this.wcsManager.zeroWCS(wcs, this.machinePosition)
    // Position update will be emitted by WCS state change handler if it's the active WCS
  }

  /**
   * Get WCS manager for advanced operations
   */
  getWCSManager(): WCSManager {
    return this.wcsManager
  }

  // === VALIDATION ===

  /**
   * Validate a jog movement
   */
  validateJogMovement(distance: number, axis: 'x' | 'y' | 'z'): {
    isValid: boolean
    errors: string[]
    targetPosition?: Position
  } {
    const validation = this.validator.validateJogMovement(
      this.machinePosition,
      distance,
      axis
    )

    if (validation.isValid) {
      const targetPosition = clonePosition(this.machinePosition)
      targetPosition[axis] += distance
      return {
        isValid: true,
        errors: [],
        targetPosition
      }
    }

    return {
      isValid: false,
      errors: validation.errors
    }
  }

  /**
   * Get coordinate validator for advanced validation
   */
  getValidator(): CoordinateValidator {
    return this.validator
  }

  // === MACHINE COMMUNICATION INTEGRATION ===

  /**
   * Process machine status response
   */
  processMachineStatusResponse(response: string): void {
    try {
      // Parse machine position from status response
      // Example: <Idle|MPos:30.000,260.000,-31.000|WPos:0.000,0.000,0.000>
      const mposMatch = response.match(/MPos:([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
      
      if (mposMatch) {
        const machinePosition = {
          x: parseFloat(mposMatch[1]),
          y: parseFloat(mposMatch[2]),
          z: parseFloat(mposMatch[3])
        }
        
        this.updateMachinePosition(machinePosition, 'machine-feedback')
      }

      // Optionally validate work position if reported
      const wposMatch = response.match(/WPos:([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
      if (wposMatch) {
        const reportedWorkPosition = {
          x: parseFloat(wposMatch[1]),
          y: parseFloat(wposMatch[2]),
          z: parseFloat(wposMatch[3])
        }
        
        this.validateWorkPositionCalculation(reportedWorkPosition)
      }
    } catch (error) {
      this.logError('Error processing machine status response', {
        response,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Process coordinate system data response
   */
  processCoordinateSystemResponse(response: string): void {
    try {
      // Parse coordinate system offsets
      // Example: $# G54:30.000,260.000,-31.000 G55:0.000,0.000,0.000
      const systems = response.match(/G5([4-9]):([-\d\.]+),([-\d\.]+),([-\d\.]+)/g)
      
      if (systems) {
        systems.forEach(system => {
          const match = system.match(/G5([4-9]):([-\d\.]+),([-\d\.]+),([-\d\.]+)/)
          if (match) {
            const wcsNumber = parseInt(match[1])
            const wcs = `G5${wcsNumber}` as WCSSystem
            const offset = {
              x: parseFloat(match[2]),
              y: parseFloat(match[3]),
              z: parseFloat(match[4])
            }
            
            // Update WCS offset without validation (trust machine data)
            this.wcsManager.setOffset(wcs, offset)
          }
        })
      }
    } catch (error) {
      this.logError('Error processing coordinate system response', {
        response,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Request coordinate system update from machine
   */
  requestCoordinateSystemUpdate(): void {
    if (this.eventBus) {
      this.eventBus.emit('machine:request-coordinate-systems')
    }
  }

  // === EVENT HANDLING ===

  /**
   * Subscribe to coordinate events
   */
  on<K extends keyof CoordinateEvents>(
    event: K,
    listener: (data: CoordinateEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    const eventListeners = this.listeners.get(event)!
    eventListeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      eventListeners.delete(listener)
    }
  }

  /**
   * Emit coordinate event
   */
  private emit<K extends keyof CoordinateEvents>(
    event: K,
    data: CoordinateEvents[K]
  ): void {
    // Emit to internal listeners
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          this.logError('Error in coordinate event listener', { event, error })
        }
      })
    }
    
    // Emit to external event bus if available
    if (this.eventBus) {
      this.eventBus.emit(event, data)
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Emit position update to all subscribers
   */
  private emitPositionUpdate(): void {
    if (!this.isInitialized) return

    const snapshot = this.getAllPositions()
    
    // Only emit if something actually changed
    if (this.lastEmittedSnapshot && this.isSnapshotEqual(snapshot, this.lastEmittedSnapshot)) {
      return
    }

    this.lastEmittedSnapshot = snapshot

    // Emit all coordinate events
    this.emit('coordinates:position-updated', snapshot)
    this.emit('coordinates:machine-position', snapshot.machine)
    this.emit('coordinates:work-position', snapshot.work)
    this.emit('coordinates:wcs-changed', {
      active: snapshot.activeWCS,
      offsets: snapshot.wcsOffsets
    })
  }

  /**
   * Handle WCS state changes
   */
  private handleWCSStateChange(): void {
    this.emitPositionUpdate()
  }

  /**
   * Set up event bus subscriptions
   */
  private setupEventBusSubscriptions(): void {
    if (!this.eventBus) return

    this.eventBus.on('machine:position-changed', (data: { position: Position }) => {
      this.updateMachinePosition(data.position, 'machine-feedback')
    })

    this.eventBus.on('machine:wcs-changed', (data: { wcs: WCSSystem, offset?: Position }) => {
      if (data.offset) {
        this.setWCSOffset(data.wcs, data.offset)
      }
      this.setActiveWCS(data.wcs)
    })
  }

  /**
   * Validate work position calculation against machine feedback
   */
  private validateWorkPositionCalculation(reportedWork: Position): void {
    const calculatedWork = this.getWorkPosition()
    const tolerance = 0.001

    if (!isPositionEqual(calculatedWork, reportedWork, tolerance)) {
      this.logWarning('Work position calculation mismatch', {
        calculated: calculatedWork,
        reported: reportedWork,
        difference: {
          x: Math.abs(calculatedWork.x - reportedWork.x),
          y: Math.abs(calculatedWork.y - reportedWork.y),
          z: Math.abs(calculatedWork.z - reportedWork.z)
        }
      })

      // Request coordinate system refresh
      this.requestCoordinateSystemUpdate()
    }
  }

  /**
   * Check if two snapshots are equal
   */
  private isSnapshotEqual(a: CoordinateSnapshot, b: CoordinateSnapshot): boolean {
    return (
      isPositionEqual(a.machine, b.machine, 0.0001) &&
      isPositionEqual(a.work, b.work, 0.0001) &&
      a.activeWCS === b.activeWCS
    )
  }

  /**
   * Emit coordinate error
   */
  private emitError(error: CoordinateError): void {
    this.emit('coordinates:error', error)
    this.logError('Coordinate error', error)
  }

  // === LOGGING HELPERS ===

  private logDebug(message: string, data?: any): void {
    if (this.logger?.debug) {
      this.logger.debug(`[CoordinateManager] ${message}`, data)
    }
  }

  private logWarning(message: string, data?: any): void {
    if (this.logger?.warn) {
      this.logger.warn(`[CoordinateManager] ${message}`, data)
    }
  }

  private logError(message: string, data?: any): void {
    if (this.logger?.error) {
      this.logger.error(`[CoordinateManager] ${message}`, data)
    }
  }

  // === PUBLIC UTILITY METHODS ===

  /**
   * Get coordinate system summary
   */
  getSummary(): {
    machinePosition: Position
    workPosition: Position
    activeWCS: WCSSystem
    wcsOffsets: Record<WCSSystem, Position>
    isInitialized: boolean
  } {
    return {
      machinePosition: this.getMachinePosition(),
      workPosition: this.getWorkPosition(),
      activeWCS: this.wcsManager.getActiveWCS(),
      wcsOffsets: this.wcsManager.getAllOffsets(),
      isInitialized: this.isInitialized
    }
  }

  /**
   * Get diagnostic information
   */
  getDiagnostics(): {
    lastUpdate: Date | undefined
    listenerCounts: Record<string, number>
    wcsManagerSummary: any
    validatorConfig: any
  } {
    const listenerCounts: Record<string, number> = {}
    this.listeners.forEach((listeners, event) => {
      listenerCounts[event] = listeners.size
    })

    return {
      lastUpdate: this.lastEmittedSnapshot?.timestamp,
      listenerCounts,
      wcsManagerSummary: this.wcsManager.getSummary(),
      validatorConfig: this.validator.getConfiguration()
    }
  }

  /**
   * Reset coordinate manager to initial state
   */
  reset(): void {
    this.machinePosition = { x: 0, y: 0, z: 0 }
    this.wcsManager.resetAllWCS()
    this.wcsManager.setActive('G54')
    this.lastEmittedSnapshot = undefined
    this.emitPositionUpdate()
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.listeners.clear()
    this.lastEmittedSnapshot = undefined
    this.isInitialized = false
  }
}