/**
 * React hook for coordinate system management
 * Provides reactive access to coordinate data and management functions
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { 
  CoordinateManager,
  CoordinateSnapshot,
  Position,
  WCSSystem,
  isPositionEqual,
  createPosition
} from '../core/coordinates'

export type DisplayMode = 'machine' | 'work' | 'both'

export interface CoordinateHookState {
  // Position data
  machine: Position | null
  work: Position | null
  display: Position | { machine: Position; work: Position } | null
  
  // WCS data
  activeWCS: WCSSystem
  wcsOffsets: Record<WCSSystem, Position>
  
  // Display preferences
  displayMode: DisplayMode
  
  // Status
  isInitialized: boolean
  lastUpdate: Date | null
  
  // Actions
  setDisplayMode: (mode: DisplayMode) => void
  setActiveWCS: (wcs: WCSSystem) => void
  setWCSOffset: (wcs: WCSSystem, offset: Position) => void
  zeroActiveWCS: () => void
  zeroWCS: (wcs: WCSSystem) => void
  
  // Utility functions
  isAtPosition: (target: Position, tolerance?: number) => boolean
  toMachine: (workPos: Position) => Position
  toWork: (machinePos: Position) => Position
  
  // Validation
  validateJogMovement: (distance: number, axis: 'x' | 'y' | 'z') => {
    isValid: boolean
    errors: string[]
    targetPosition?: Position
  }
}

interface UseCoordinatesOptions {
  coordinateManager?: CoordinateManager
  initialDisplayMode?: DisplayMode
  enableAutoSync?: boolean
}

/**
 * Hook for accessing and managing coordinate system data
 */
export function useCoordinates(options: UseCoordinatesOptions = {}): CoordinateHookState {
  const {
    coordinateManager,
    initialDisplayMode = 'work',
    enableAutoSync = true
  } = options

  // Local state
  const [snapshot, setSnapshot] = useState<CoordinateSnapshot | null>(null)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialDisplayMode)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Track coordinate manager instance
  const managerRef = useRef<CoordinateManager | null>(coordinateManager || null)

  // Set up event subscriptions
  useEffect(() => {
    if (!managerRef.current || !enableAutoSync) return

    const manager = managerRef.current

    const handlePositionUpdate = (newSnapshot: CoordinateSnapshot) => {
      setSnapshot(newSnapshot)
      setIsInitialized(true)
    }

    // Subscribe to position updates
    const unsubscribe = manager.on('coordinates:position-updated', handlePositionUpdate)

    // Get initial state
    const initialSnapshot = manager.getAllPositions()
    setSnapshot(initialSnapshot)
    setIsInitialized(true)

    return () => {
      unsubscribe()
    }
  }, [managerRef.current, enableAutoSync])

  // Calculate display position based on mode
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
      default:
        return snapshot.work
    }
  }, [snapshot, displayMode])

  // Action: Set active WCS
  const setActiveWCS = useCallback((wcs: WCSSystem) => {
    if (managerRef.current) {
      managerRef.current.setActiveWCS(wcs)
    }
  }, [])

  // Action: Set WCS offset
  const setWCSOffset = useCallback((wcs: WCSSystem, offset: Position) => {
    if (managerRef.current) {
      managerRef.current.setWCSOffset(wcs, offset)
    }
  }, [])

  // Action: Zero active WCS
  const zeroActiveWCS = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.zeroActiveWCS()
    }
  }, [])

  // Action: Zero specific WCS
  const zeroWCS = useCallback((wcs: WCSSystem) => {
    if (managerRef.current) {
      managerRef.current.zeroWCS(wcs)
    }
  }, [])

  // Utility: Check if at specific position
  const isAtPosition = useCallback((target: Position, tolerance = 0.001): boolean => {
    if (!snapshot) return false
    
    const current = displayMode === 'machine' ? snapshot.machine : snapshot.work
    return isPositionEqual(current, target, tolerance)
  }, [snapshot, displayMode])

  // Utility: Convert work to machine coordinates
  const toMachine = useCallback((workPos: Position): Position => {
    if (!snapshot || !managerRef.current) return workPos
    
    const offset = snapshot.wcsOffsets[snapshot.activeWCS]
    return managerRef.current.convertWorkToMachine(workPos, offset)
  }, [snapshot])

  // Utility: Convert machine to work coordinates
  const toWork = useCallback((machinePos: Position): Position => {
    if (!snapshot || !managerRef.current) return machinePos
    
    const offset = snapshot.wcsOffsets[snapshot.activeWCS]
    return managerRef.current.convertMachineToWork(machinePos, offset)
  }, [snapshot])

  // Utility: Validate jog movement
  const validateJogMovement = useCallback((distance: number, axis: 'x' | 'y' | 'z') => {
    if (!managerRef.current) {
      return {
        isValid: false,
        errors: ['Coordinate manager not available']
      }
    }

    return managerRef.current.validateJogMovement(distance, axis)
  }, [])

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
    
    // Status
    isInitialized,
    lastUpdate: snapshot?.timestamp || null,
    
    // Actions
    setDisplayMode,
    setActiveWCS,
    setWCSOffset,
    zeroActiveWCS,
    zeroWCS,
    
    // Utilities
    isAtPosition,
    toMachine,
    toWork,
    validateJogMovement
  }
}

/**
 * Hook for providing coordinate manager to child components
 */
export function useCoordinateManager(): CoordinateManager | null {
  const [manager] = useState<CoordinateManager | null>(() => {
    // This would typically be provided by a context or service
    // For now, return null - implement context provider separately
    return null
  })

  return manager
}

/**
 * Hook for coordinate system operations without subscribing to updates
 */
export function useCoordinateActions(coordinateManager?: CoordinateManager) {
  const setActiveWCS = useCallback((wcs: WCSSystem) => {
    if (coordinateManager) {
      coordinateManager.setActiveWCS(wcs)
    }
  }, [coordinateManager])

  const setWCSOffset = useCallback((wcs: WCSSystem, offset: Position) => {
    if (coordinateManager) {
      coordinateManager.setWCSOffset(wcs, offset)
    }
  }, [coordinateManager])

  const zeroActiveWCS = useCallback(() => {
    if (coordinateManager) {
      coordinateManager.zeroActiveWCS()
    }
  }, [coordinateManager])

  const zeroWCS = useCallback((wcs: WCSSystem) => {
    if (coordinateManager) {
      coordinateManager.zeroWCS(wcs)
    }
  }, [coordinateManager])

  const copyWCSOffset = useCallback((fromWCS: WCSSystem, toWCS: WCSSystem) => {
    if (coordinateManager) {
      const wcsManager = coordinateManager.getWCSManager()
      wcsManager.copyOffset(fromWCS, toWCS)
    }
  }, [coordinateManager])

  const resetWCS = useCallback((wcs: WCSSystem) => {
    if (coordinateManager) {
      const wcsManager = coordinateManager.getWCSManager()
      wcsManager.resetWCS(wcs)
    }
  }, [coordinateManager])

  const validateJogMovement = useCallback((distance: number, axis: 'x' | 'y' | 'z') => {
    if (!coordinateManager) {
      return {
        isValid: false,
        errors: ['Coordinate manager not available']
      }
    }

    return coordinateManager.validateJogMovement(distance, axis)
  }, [coordinateManager])

  return {
    setActiveWCS,
    setWCSOffset,
    zeroActiveWCS,
    zeroWCS,
    copyWCSOffset,
    resetWCS,
    validateJogMovement
  }
}

/**
 * Hook for coordinate formatting and display
 */
export function useCoordinateFormatting() {
  const formatPosition = useCallback((
    position: Position,
    options: {
      precision?: number
      unit?: 'mm' | 'inch'
      showUnit?: boolean
      compact?: boolean
    } = {}
  ): string => {
    const {
      precision = 3,
      unit = 'mm',
      showUnit = true,
      compact = false
    } = options

    const formatValue = (value: number) => {
      const formatted = value.toFixed(precision)
      return showUnit ? `${formatted}${unit}` : formatted
    }

    if (compact) {
      return `X:${formatValue(position.x)} Y:${formatValue(position.y)} Z:${formatValue(position.z)}`
    } else {
      return `X: ${formatValue(position.x)}, Y: ${formatValue(position.y)}, Z: ${formatValue(position.z)}`
    }
  }, [])

  const formatDualPosition = useCallback((
    machinePos: Position,
    workPos: Position,
    activeWCS: WCSSystem,
    options: { precision?: number; compact?: boolean } = {}
  ): { machine: string; work: string; combined: string } => {
    const machine = `Machine: ${formatPosition(machinePos, { ...options, showUnit: false })}`
    const work = `${activeWCS}: ${formatPosition(workPos, { ...options, showUnit: false })}`
    const combined = `${machine} | ${work}`

    return { machine, work, combined }
  }, [formatPosition])

  const parsePosition = useCallback((
    xInput: string,
    yInput: string,
    zInput: string
  ): Position | null => {
    const parseValue = (input: string): number | null => {
      const trimmed = input.trim().replace(/[^\d\-\+\.]/g, '')
      const parsed = parseFloat(trimmed)
      return isNaN(parsed) ? null : parsed
    }

    const x = parseValue(xInput)
    const y = parseValue(yInput)
    const z = parseValue(zInput)

    if (x === null || y === null || z === null) {
      return null
    }

    return createPosition(x, y, z)
  }, [])

  return {
    formatPosition,
    formatDualPosition,
    parsePosition
  }
}

/**
 * Hook for coordinate system status and diagnostics
 */
export function useCoordinateStatus(coordinateManager?: CoordinateManager) {
  const [diagnostics, setDiagnostics] = useState<any>(null)

  useEffect(() => {
    if (!coordinateManager) return

    const updateDiagnostics = () => {
      setDiagnostics(coordinateManager.getDiagnostics())
    }

    updateDiagnostics()

    // Update diagnostics periodically
    const interval = setInterval(updateDiagnostics, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [coordinateManager])

  const summary = useMemo(() => {
    if (!coordinateManager) return null
    return coordinateManager.getSummary()
  }, [coordinateManager, diagnostics])

  return {
    diagnostics,
    summary,
    isHealthy: diagnostics && diagnostics.lastUpdate && 
               (Date.now() - diagnostics.lastUpdate.getTime()) < 10000 // Updated within 10 seconds
  }
}