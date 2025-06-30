/**
 * WCSManager Tests
 */

import { WCSManager } from '../managers/WCSManager'
import { Position, WCSSystem } from '../types/coordinate-types'

describe('WCSManager', () => {
  let wcsManager: WCSManager

  beforeEach(() => {
    wcsManager = new WCSManager()
  })

  describe('Basic WCS Operations', () => {
    test('should initialize with default values', () => {
      expect(wcsManager.getActiveWCS()).toBe('G54')
      expect(wcsManager.getActiveOffset()).toEqual({ x: 0, y: 0, z: 0 })

      const allOffsets = wcsManager.getAllOffsets()
      const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
      
      wcsSystems.forEach(wcs => {
        expect(allOffsets[wcs]).toEqual({ x: 0, y: 0, z: 0 })
      })
    })

    test('should set and get active WCS', () => {
      wcsManager.setActive('G55')
      expect(wcsManager.getActiveWCS()).toBe('G55')

      wcsManager.setActive('G56')
      expect(wcsManager.getActiveWCS()).toBe('G56')
    })

    test('should set and get WCS offsets', () => {
      const offset: Position = { x: 100, y: 200, z: 50 }

      wcsManager.setOffset('G54', offset)
      expect(wcsManager.getOffset('G54')).toEqual(offset)

      // Other WCS should remain unchanged
      expect(wcsManager.getOffset('G55')).toEqual({ x: 0, y: 0, z: 0 })
    })

    test('should maintain separate offsets for each WCS', () => {
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })
      wcsManager.setOffset('G56', { x: 70, y: 80, z: 90 })

      expect(wcsManager.getOffset('G54')).toEqual({ x: 10, y: 20, z: 30 })
      expect(wcsManager.getOffset('G55')).toEqual({ x: 40, y: 50, z: 60 })
      expect(wcsManager.getOffset('G56')).toEqual({ x: 70, y: 80, z: 90 })
    })
  })

  describe('WCS Zeroing Operations', () => {
    test('should zero active WCS at current machine position', () => {
      const machinePosition: Position = { x: 123.456, y: 789.012, z: 345.678 }

      wcsManager.setActive('G54')
      wcsManager.zeroActiveWCS(machinePosition)

      expect(wcsManager.getOffset('G54')).toEqual(machinePosition)
    })

    test('should zero specific WCS at current machine position', () => {
      const machinePosition: Position = { x: 50, y: 75, z: 100 }

      wcsManager.zeroWCS('G55', machinePosition)

      expect(wcsManager.getOffset('G55')).toEqual(machinePosition)
      // Active WCS and other offsets should be unchanged
      expect(wcsManager.getActiveWCS()).toBe('G54')
      expect(wcsManager.getOffset('G54')).toEqual({ x: 0, y: 0, z: 0 })
    })

    test('should reset WCS to zero offset', () => {
      // Set some non-zero offsets
      wcsManager.setOffset('G54', { x: 100, y: 200, z: 300 })
      wcsManager.setOffset('G55', { x: 150, y: 250, z: 350 })

      // Reset G54
      wcsManager.resetWCS('G54')

      expect(wcsManager.getOffset('G54')).toEqual({ x: 0, y: 0, z: 0 })
      // G55 should remain unchanged
      expect(wcsManager.getOffset('G55')).toEqual({ x: 150, y: 250, z: 350 })
    })

    test('should reset all WCS offsets', () => {
      // Set non-zero offsets for multiple WCS
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })
      wcsManager.setOffset('G56', { x: 70, y: 80, z: 90 })

      wcsManager.resetAllWCS()

      const wcsSystems: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']
      wcsSystems.forEach(wcs => {
        expect(wcsManager.getOffset(wcs)).toEqual({ x: 0, y: 0, z: 0 })
      })
    })
  })

  describe('WCS Copy Operations', () => {
    test('should copy offset from one WCS to another', () => {
      const sourceOffset: Position = { x: 111, y: 222, z: 333 }

      wcsManager.setOffset('G54', sourceOffset)
      wcsManager.copyOffset('G54', 'G55')

      expect(wcsManager.getOffset('G55')).toEqual(sourceOffset)
      expect(wcsManager.getOffset('G54')).toEqual(sourceOffset)
    })

    test('should handle copying to same WCS (no-op)', () => {
      const originalOffset: Position = { x: 100, y: 200, z: 300 }

      wcsManager.setOffset('G54', originalOffset)
      wcsManager.copyOffset('G54', 'G54')

      expect(wcsManager.getOffset('G54')).toEqual(originalOffset)
    })
  })

  describe('State Management', () => {
    test('should provide complete state snapshot', () => {
      wcsManager.setActive('G55')
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })

      const state = wcsManager.getState()

      expect(state.activeWCS).toBe('G55')
      expect(state.offsets.G54).toEqual({ x: 10, y: 20, z: 30 })
      expect(state.offsets.G55).toEqual({ x: 40, y: 50, z: 60 })
    })

    test('should notify listeners on state changes', () => {
      const listener = jest.fn()
      const unsubscribe = wcsManager.subscribe(listener)

      wcsManager.setActive('G55')

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          activeWCS: 'G55',
          offsets: expect.any(Object)
        })
      )

      unsubscribe()

      // After unsubscribe, listener should not be called
      wcsManager.setActive('G56')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('should not notify listeners if state does not change', () => {
      const listener = jest.fn()
      wcsManager.subscribe(listener)

      wcsManager.setActive('G54') // Already active
      expect(listener).not.toHaveBeenCalled()

      wcsManager.setOffset('G54', { x: 0, y: 0, z: 0 }) // Already zero
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Profile Management', () => {
    test('should create profile from current state', () => {
      wcsManager.setActive('G55')
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })

      const profile = wcsManager.createProfile('Test Profile', 'Test description')

      expect(profile.name).toBe('Test Profile')
      expect(profile.description).toBe('Test description')
      expect(profile.offsets.G54).toEqual({ x: 10, y: 20, z: 30 })
      expect(profile.offsets.G55).toEqual({ x: 40, y: 50, z: 60 })
      expect(profile.createdAt).toBeInstanceOf(Date)
      expect(profile.updatedAt).toBeInstanceOf(Date)
    })

    test('should load profile and update state', () => {
      const profile = {
        name: 'Test Profile',
        offsets: {
          G54: { x: 111, y: 222, z: 333 },
          G55: { x: 444, y: 555, z: 666 },
          G56: { x: 777, y: 888, z: 999 },
          G57: { x: 0, y: 0, z: 0 },
          G58: { x: 0, y: 0, z: 0 },
          G59: { x: 0, y: 0, z: 0 }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      wcsManager.loadProfile(profile)

      expect(wcsManager.getOffset('G54')).toEqual({ x: 111, y: 222, z: 333 })
      expect(wcsManager.getOffset('G55')).toEqual({ x: 444, y: 555, z: 666 })
      expect(wcsManager.getOffset('G56')).toEqual({ x: 777, y: 888, z: 999 })
    })
  })

  describe('Configuration Import/Export', () => {
    test('should export current configuration', () => {
      wcsManager.setActive('G55')
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })

      const config = wcsManager.exportConfiguration()

      expect(config.activeWCS).toBe('G55')
      expect(config.offsets.G54).toEqual({ x: 10, y: 20, z: 30 })
      expect(config.offsets.G55).toEqual({ x: 40, y: 50, z: 60 })
      expect(config.exportedAt).toBeInstanceOf(Date)
    })

    test('should import configuration', () => {
      const config = {
        activeWCS: 'G56' as WCSSystem,
        offsets: {
          G54: { x: 100, y: 200, z: 300 },
          G55: { x: 400, y: 500, z: 600 },
          G56: { x: 700, y: 800, z: 900 },
          G57: { x: 0, y: 0, z: 0 },
          G58: { x: 0, y: 0, z: 0 },
          G59: { x: 0, y: 0, z: 0 }
        }
      }

      wcsManager.importConfiguration(config)

      expect(wcsManager.getActiveWCS()).toBe('G56')
      expect(wcsManager.getOffset('G54')).toEqual({ x: 100, y: 200, z: 300 })
      expect(wcsManager.getOffset('G55')).toEqual({ x: 400, y: 500, z: 600 })
      expect(wcsManager.getOffset('G56')).toEqual({ x: 700, y: 800, z: 900 })
    })

    test('should handle partial configuration import', () => {
      const config = {
        offsets: {
          G54: { x: 100, y: 200, z: 300 },
          G55: { x: 400, y: 500, z: 600 },
          G56: { x: 0, y: 0, z: 0 },
          G57: { x: 0, y: 0, z: 0 },
          G58: { x: 0, y: 0, z: 0 },
          G59: { x: 0, y: 0, z: 0 }
        }
      }

      const originalActiveWCS = wcsManager.getActiveWCS()
      wcsManager.importConfiguration(config)

      // Active WCS should remain unchanged if not specified
      expect(wcsManager.getActiveWCS()).toBe(originalActiveWCS)
      expect(wcsManager.getOffset('G54')).toEqual({ x: 100, y: 200, z: 300 })
    })
  })

  describe('Validation', () => {
    test('should validate valid configuration', () => {
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })

      const validation = wcsManager.validateConfiguration()

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should reject invalid positions', () => {
      expect(() => {
        wcsManager.setOffset('G54', { x: NaN, y: 20, z: 30 })
      }).toThrow('Invalid position')

      expect(() => {
        wcsManager.zeroActiveWCS({ x: Infinity, y: 20, z: 30 })
      }).toThrow('Invalid machine position')
    })

    test('should reject invalid import configuration', () => {
      const invalidConfig = {
        offsets: {
          G54: { x: NaN, y: 200, z: 300 },
          G55: { x: 400, y: 500, z: 600 },
          G56: { x: 0, y: 0, z: 0 },
          G57: { x: 0, y: 0, z: 0 },
          G58: { x: 0, y: 0, z: 0 },
          G59: { x: 0, y: 0, z: 0 }
        }
      }

      expect(() => {
        wcsManager.importConfiguration(invalidConfig)
      }).toThrow('Invalid offset for WCS G54')
    })
  })

  describe('Utility Methods', () => {
    test('should detect non-zero offsets', () => {
      expect(wcsManager.hasNonZeroOffsets()).toBe(false)

      wcsManager.setOffset('G54', { x: 10, y: 0, z: 0 })
      expect(wcsManager.hasNonZeroOffsets()).toBe(true)
    })

    test('should list active WCS systems', () => {
      expect(wcsManager.getActiveWCSList()).toHaveLength(0)

      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 0, y: 50, z: 0 })
      wcsManager.setOffset('G56', { x: 0, y: 0, z: 0 })

      const activeList = wcsManager.getActiveWCSList()
      expect(activeList).toHaveLength(2)
      expect(activeList).toContain('G54')
      expect(activeList).toContain('G55')
      expect(activeList).not.toContain('G56')
    })

    test('should provide configuration summary', () => {
      wcsManager.setActive('G55')
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })
      wcsManager.setOffset('G55', { x: 40, y: 50, z: 60 })

      const summary = wcsManager.getSummary()

      expect(summary.activeWCS).toBe('G55')
      expect(summary.totalWCS).toBe(6)
      expect(summary.activeWCSCount).toBe(2)
      expect(summary.hasOffsets).toBe(true)
    })
  })

  describe('Operation Execution', () => {
    test('should execute set-active operation', () => {
      wcsManager.executeOperation({
        type: 'set-active',
        wcs: 'G55'
      })

      expect(wcsManager.getActiveWCS()).toBe('G55')
    })

    test('should execute set-offset operation', () => {
      wcsManager.executeOperation({
        type: 'set-offset',
        wcs: 'G54',
        data: {
          position: { x: 100, y: 200, z: 300 }
        }
      })

      expect(wcsManager.getOffset('G54')).toEqual({ x: 100, y: 200, z: 300 })
    })

    test('should execute zero-current operation', () => {
      wcsManager.executeOperation({
        type: 'zero-current',
        wcs: 'G54',
        data: {
          position: { x: 50, y: 75, z: 100 }
        }
      })

      expect(wcsManager.getOffset('G54')).toEqual({ x: 50, y: 75, z: 100 })
    })

    test('should execute copy-offset operation', () => {
      wcsManager.setOffset('G54', { x: 10, y: 20, z: 30 })

      wcsManager.executeOperation({
        type: 'copy-offset',
        wcs: 'G55',
        data: {
          fromWCS: 'G54'
        }
      })

      expect(wcsManager.getOffset('G55')).toEqual({ x: 10, y: 20, z: 30 })
    })

    test('should execute reset operation', () => {
      wcsManager.setOffset('G54', { x: 100, y: 200, z: 300 })

      wcsManager.executeOperation({
        type: 'reset',
        wcs: 'G54'
      })

      expect(wcsManager.getOffset('G54')).toEqual({ x: 0, y: 0, z: 0 })
    })

    test('should handle invalid operations', () => {
      expect(() => {
        wcsManager.executeOperation({
          type: 'set-offset',
          wcs: 'G54'
          // Missing required position data
        })
      }).toThrow('Position required for set-offset operation')

      expect(() => {
        wcsManager.executeOperation({
          type: 'invalid-type' as any,
          wcs: 'G54'
        })
      }).toThrow('Unknown WCS operation type')
    })
  })
})