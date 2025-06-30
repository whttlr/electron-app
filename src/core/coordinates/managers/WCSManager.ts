/**
 * Work Coordinate System Manager
 * Manages WCS offsets, active WCS, and WCS operations
 */

import { Position, WCSSystem, WCSProfile } from '../types/coordinate-types'
import { WCSOffsets, WCSManagerState, WCSOperation, DEFAULT_WCS_OFFSETS } from '../types/wcs-types'
import { clonePosition, isValidPosition } from '../utils/coordinate-math'

export class WCSManager {
  private state: WCSManagerState = {
    activeWCS: 'G54',
    offsets: { ...DEFAULT_WCS_OFFSETS }
  }
  
  private listeners: Set<(state: WCSManagerState) => void> = new Set()

  constructor(initialState?: Partial<WCSManagerState>) {
    if (initialState) {
      this.state = {
        ...this.state,
        ...initialState
      }
    }
  }

  // === STATE ACCESS ===

  /**
   * Get the currently active WCS
   */
  getActiveWCS(): WCSSystem {
    return this.state.activeWCS
  }

  /**
   * Get the offset for the active WCS
   */
  getActiveOffset(): Position {
    return clonePosition(this.state.offsets[this.state.activeWCS])
  }

  /**
   * Get offset for a specific WCS
   */
  getOffset(wcs: WCSSystem): Position {
    return clonePosition(this.state.offsets[wcs])
  }

  /**
   * Get all WCS offsets
   */
  getAllOffsets(): Record<WCSSystem, Position> {
    const result: Record<WCSSystem, Position> = {} as Record<WCSSystem, Position>
    
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    wcsSystems.forEach(wcs => {
      result[wcs] = clonePosition(this.state.offsets[wcs])
    })
    
    return result
  }

  /**
   * Get current state snapshot
   */
  getState(): WCSManagerState {
    return {
      activeWCS: this.state.activeWCS,
      offsets: this.getAllOffsets()
    }
  }

  // === WCS OPERATIONS ===

  /**
   * Set the active WCS
   */
  setActive(wcs: WCSSystem): void {
    if (this.state.activeWCS !== wcs) {
      this.state.activeWCS = wcs
      this.notifyListeners()
    }
  }

  /**
   * Set offset for a specific WCS
   */
  setOffset(wcs: WCSSystem, offset: Position): void {
    if (!isValidPosition(offset)) {
      throw new Error(`Invalid position for WCS ${wcs}: ${JSON.stringify(offset)}`)
    }

    const currentOffset = this.state.offsets[wcs]
    if (
      currentOffset.x !== offset.x ||
      currentOffset.y !== offset.y ||
      currentOffset.z !== offset.z
    ) {
      this.state.offsets[wcs] = clonePosition(offset)
      this.notifyListeners()
    }
  }

  /**
   * Zero the current position in the active WCS
   * This sets the current machine position as the WCS offset
   */
  zeroActiveWCS(currentMachinePosition: Position): void {
    if (!isValidPosition(currentMachinePosition)) {
      throw new Error(`Invalid machine position for zeroing: ${JSON.stringify(currentMachinePosition)}`)
    }

    this.setOffset(this.state.activeWCS, currentMachinePosition)
  }

  /**
   * Zero a specific WCS at the current machine position
   */
  zeroWCS(wcs: WCSSystem, currentMachinePosition: Position): void {
    if (!isValidPosition(currentMachinePosition)) {
      throw new Error(`Invalid machine position for zeroing WCS ${wcs}: ${JSON.stringify(currentMachinePosition)}`)
    }

    this.setOffset(wcs, currentMachinePosition)
  }

  /**
   * Copy offset from one WCS to another
   */
  copyOffset(fromWCS: WCSSystem, toWCS: WCSSystem): void {
    if (fromWCS === toWCS) {
      return // No-op if trying to copy to self
    }

    const sourceOffset = this.getOffset(fromWCS)
    this.setOffset(toWCS, sourceOffset)
  }

  /**
   * Reset WCS to machine coordinates (zero offset)
   */
  resetWCS(wcs: WCSSystem): void {
    this.setOffset(wcs, { x: 0, y: 0, z: 0 })
  }

  /**
   * Reset all WCS offsets to zero
   */
  resetAllWCS(): void {
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    wcsSystems.forEach(wcs => {
      this.resetWCS(wcs)
    })
  }

  // === PROFILE MANAGEMENT ===

  /**
   * Create a WCS profile from current state
   */
  createProfile(name: string, description?: string): WCSProfile {
    return {
      name,
      description,
      offsets: this.getAllOffsets(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Load a WCS profile
   */
  loadProfile(profile: WCSProfile): void {
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    
    wcsSystems.forEach(wcs => {
      if (profile.offsets[wcs]) {
        this.setOffset(wcs, profile.offsets[wcs])
      }
    })
  }

  /**
   * Export current WCS configuration
   */
  exportConfiguration(): {
    activeWCS: WCSSystem
    offsets: Record<WCSSystem, Position>
    exportedAt: Date
  } {
    return {
      activeWCS: this.state.activeWCS,
      offsets: this.getAllOffsets(),
      exportedAt: new Date()
    }
  }

  /**
   * Import WCS configuration
   */
  importConfiguration(config: {
    activeWCS?: WCSSystem
    offsets: Record<WCSSystem, Position>
  }): void {
    // Validate all offsets first
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    wcsSystems.forEach(wcs => {
      if (config.offsets[wcs] && !isValidPosition(config.offsets[wcs])) {
        throw new Error(`Invalid offset for WCS ${wcs} in import configuration`)
      }
    })

    // Apply offsets
    wcsSystems.forEach(wcs => {
      if (config.offsets[wcs]) {
        this.state.offsets[wcs] = clonePosition(config.offsets[wcs])
      }
    })

    // Set active WCS if provided
    if (config.activeWCS) {
      this.state.activeWCS = config.activeWCS
    }

    this.notifyListeners()
  }

  // === VALIDATION ===

  /**
   * Validate WCS configuration
   */
  validateConfiguration(): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']

    // Check if active WCS is valid
    if (!wcsSystems.includes(this.state.activeWCS)) {
      errors.push(`Invalid active WCS: ${this.state.activeWCS}`)
    }

    // Validate all offsets
    wcsSystems.forEach(wcs => {
      const offset = this.state.offsets[wcs]
      if (!offset) {
        errors.push(`Missing offset for WCS ${wcs}`)
      } else if (!isValidPosition(offset)) {
        errors.push(`Invalid offset for WCS ${wcs}: ${JSON.stringify(offset)}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // === OPERATION EXECUTION ===

  /**
   * Execute a WCS operation
   */
  executeOperation(operation: WCSOperation): void {
    switch (operation.type) {
      case 'set-active':
        this.setActive(operation.wcs)
        break

      case 'set-offset':
        if (!operation.data?.position) {
          throw new Error('Position required for set-offset operation')
        }
        this.setOffset(operation.wcs, operation.data.position)
        break

      case 'zero-current':
        if (!operation.data?.position) {
          throw new Error('Current machine position required for zero-current operation')
        }
        this.zeroWCS(operation.wcs, operation.data.position)
        break

      case 'copy-offset':
        if (!operation.data?.fromWCS) {
          throw new Error('Source WCS required for copy-offset operation')
        }
        this.copyOffset(operation.data.fromWCS, operation.wcs)
        break

      case 'reset':
        this.resetWCS(operation.wcs)
        break

      default:
        throw new Error(`Unknown WCS operation type: ${(operation as any).type}`)
    }
  }

  // === EVENT HANDLING ===

  /**
   * Subscribe to WCS state changes
   */
  subscribe(listener: (state: WCSManagerState) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in WCS state listener:', error)
      }
    })
  }

  // === UTILITY METHODS ===

  /**
   * Check if any WCS has non-zero offsets
   */
  hasNonZeroOffsets(): boolean {
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    
    return wcsSystems.some(wcs => {
      const offset = this.state.offsets[wcs]
      return offset.x !== 0 || offset.y !== 0 || offset.z !== 0
    })
  }

  /**
   * Get list of WCS systems with non-zero offsets
   */
  getActiveWCSList(): WCSSystem[] {
    const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
    
    return wcsSystems.filter(wcs => {
      const offset = this.state.offsets[wcs]
      return offset.x !== 0 || offset.y !== 0 || offset.z !== 0
    })
  }

  /**
   * Get summary of WCS configuration
   */
  getSummary(): {
    activeWCS: WCSSystem
    totalWCS: number
    activeWCSCount: number
    hasOffsets: boolean
  } {
    const activeWCSList = this.getActiveWCSList()
    
    return {
      activeWCS: this.state.activeWCS,
      totalWCS: 6,
      activeWCSCount: activeWCSList.length,
      hasOffsets: activeWCSList.length > 0
    }
  }
}