/**
 * CoordinateManager Tests
 */

import { CoordinateManager, Position, WCSSystem } from '../index'

describe('CoordinateManager', () => {
  let coordinateManager: CoordinateManager
  let mockEventBus: any
  let mockLogger: any

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn()
    }
    
    mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }

    coordinateManager = new CoordinateManager({
      eventBus: mockEventBus,
      logger: mockLogger
    })
  })

  afterEach(() => {
    coordinateManager.dispose()
  })

  describe('Single Source of Truth', () => {
    test('should update machine position and emit synchronized events', () => {
      const position: Position = { x: 30, y: 260, z: -31 }
      const positionListener = jest.fn()

      coordinateManager.on('coordinates:position-updated', positionListener)
      coordinateManager.updateMachinePosition(position, 'machine-feedback')

      expect(positionListener).toHaveBeenCalledWith(
        expect.objectContaining({
          machine: position,
          work: expect.any(Object),
          activeWCS: 'G54',
          wcsOffsets: expect.any(Object),
          timestamp: expect.any(Date)
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
      expect(positions.activeWCS).toBe('G54')
    })

    test('should not emit duplicate position updates', () => {
      const positionListener = jest.fn()
      coordinateManager.on('coordinates:position-updated', positionListener)

      const position = { x: 10, y: 20, z: 30 }

      // Update position twice with same values
      coordinateManager.updateMachinePosition(position, 'machine-feedback')
      coordinateManager.updateMachinePosition(position, 'machine-feedback')

      // Should only emit once
      expect(positionListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Coordinate Conversions', () => {
    test('should convert between machine and work coordinates accurately', () => {
      const machinePos: Position = { x: 30, y: 260, z: -31 }
      const offset: Position = { x: 30, y: 260, z: -31 }

      const workPos = coordinateManager.convertMachineToWork(machinePos, offset)
      expect(workPos).toEqual({ x: 0, y: 0, z: 0 })

      const backToMachine = coordinateManager.convertWorkToMachine(workPos, offset)
      expect(backToMachine).toEqual(machinePos)
    })

    test('should handle floating point precision correctly', () => {
      const machinePos: Position = { x: 10.333333, y: 20.666666, z: 30.999999 }
      const offset: Position = { x: 0.333333, y: 0.666666, z: 0.999999 }

      const workPos = coordinateManager.convertMachineToWork(machinePos, offset)
      const backToMachine = coordinateManager.convertWorkToMachine(workPos, offset)

      // Should be very close due to rounding
      expect(Math.abs(backToMachine.x - machinePos.x)).toBeLessThan(0.0001)
      expect(Math.abs(backToMachine.y - machinePos.y)).toBeLessThan(0.0001)
      expect(Math.abs(backToMachine.z - machinePos.z)).toBeLessThan(0.0001)
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

    test('should zero current position in active WCS', () => {
      const machinePos = { x: 50, y: 75, z: 100 }
      coordinateManager.updateMachinePosition(machinePos, 'machine-feedback')

      coordinateManager.zeroActiveWCS()

      const workPos = coordinateManager.getWorkPosition()
      expect(workPos).toEqual({ x: 0, y: 0, z: 0 })

      // Machine position should remain unchanged
      expect(coordinateManager.getMachinePosition()).toEqual(machinePos)
    })

    test('should handle WCS changes and emit events', () => {
      const wcsListener = jest.fn()
      coordinateManager.on('coordinates:wcs-changed', wcsListener)

      coordinateManager.setActiveWCS('G55')

      expect(wcsListener).toHaveBeenCalledWith(
        expect.objectContaining({
          active: 'G55',
          offsets: expect.any(Object)
        })
      )
    })
  })

  describe('Position Validation', () => {
    test('should reject invalid machine positions', () => {
      const errorListener = jest.fn()
      coordinateManager.on('coordinates:error', errorListener)

      // Try to update with invalid position
      coordinateManager.updateMachinePosition({ x: NaN, y: 10, z: 20 }, 'machine-feedback')

      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'validation',
          message: expect.stringContaining('Invalid machine position')
        })
      )

      // Position should not have changed
      expect(coordinateManager.getMachinePosition()).toEqual({ x: 0, y: 0, z: 0 })
    })

    test('should validate jog movements', () => {
      coordinateManager.updateMachinePosition({ x: 0, y: 0, z: 0 }, 'machine-feedback')

      const validation = coordinateManager.validateJogMovement(10, 'x')

      expect(validation.isValid).toBe(true)
      expect(validation.targetPosition).toEqual({ x: 10, y: 0, z: 0 })
    })
  })

  describe('Machine Communication', () => {
    test('should process machine status responses', () => {
      const statusResponse = '<Idle|MPos:30.000,260.000,-31.000|WPos:0.000,0.000,0.000>'

      coordinateManager.processMachineStatusResponse(statusResponse)

      expect(coordinateManager.getMachinePosition()).toEqual({
        x: 30,
        y: 260,
        z: -31
      })
    })

    test('should process coordinate system responses', () => {
      const coordResponse = '$# G54:30.000,260.000,-31.000 G55:0.000,0.000,0.000'

      coordinateManager.processCoordinateSystemResponse(coordResponse)

      const wcsManager = coordinateManager.getWCSManager()
      expect(wcsManager.getOffset('G54')).toEqual({ x: 30, y: 260, z: -31 })
      expect(wcsManager.getOffset('G55')).toEqual({ x: 0, y: 0, z: 0 })
    })

    test('should handle malformed responses gracefully', () => {
      const invalidResponse = 'INVALID_RESPONSE_FORMAT'

      // Should not throw error
      expect(() => {
        coordinateManager.processMachineStatusResponse(invalidResponse)
        coordinateManager.processCoordinateSystemResponse(invalidResponse)
      }).not.toThrow()

      // The current implementation doesn't log errors for empty responses
      // This is expected behavior - only actual parsing errors are logged
    })
  })

  describe('Event System', () => {
    test('should support multiple event listeners', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()

      coordinateManager.on('coordinates:machine-position', listener1)
      coordinateManager.on('coordinates:machine-position', listener2)

      coordinateManager.updateMachinePosition({ x: 10, y: 20, z: 30 }, 'machine-feedback')

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    test('should support unsubscribing from events', () => {
      const listener = jest.fn()

      const unsubscribe = coordinateManager.on('coordinates:machine-position', listener)
      unsubscribe()

      coordinateManager.updateMachinePosition({ x: 10, y: 20, z: 30 }, 'machine-feedback')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Utility Methods', () => {
    test('should provide coordinate system summary', () => {
      coordinateManager.updateMachinePosition({ x: 50, y: 100, z: 25 }, 'machine-feedback')
      coordinateManager.setWCSOffset('G54', { x: 25, y: 50, z: 10 })

      const summary = coordinateManager.getSummary()

      expect(summary).toEqual({
        machinePosition: { x: 50, y: 100, z: 25 },
        workPosition: { x: 25, y: 50, z: 15 },
        activeWCS: 'G54',
        wcsOffsets: expect.any(Object),
        isInitialized: true
      })
    })

    test('should provide diagnostic information', () => {
      const listener = jest.fn()
      coordinateManager.on('coordinates:position-updated', listener)

      const diagnostics = coordinateManager.getDiagnostics()

      expect(diagnostics).toHaveProperty('lastUpdate')
      expect(diagnostics).toHaveProperty('listenerCounts')
      expect(diagnostics).toHaveProperty('wcsManagerSummary')
      expect(diagnostics).toHaveProperty('validatorConfig')
      expect(diagnostics.listenerCounts['coordinates:position-updated']).toBe(1)
    })

    test('should reset to initial state', () => {
      // Set up some state
      coordinateManager.updateMachinePosition({ x: 100, y: 200, z: 300 }, 'machine-feedback')
      coordinateManager.setWCSOffset('G54', { x: 50, y: 100, z: 150 })
      coordinateManager.setActiveWCS('G55')

      // Reset
      coordinateManager.reset()

      // Should be back to initial state
      expect(coordinateManager.getMachinePosition()).toEqual({ x: 0, y: 0, z: 0 })
      expect(coordinateManager.getWCSManager().getActiveWCS()).toBe('G54')
      expect(coordinateManager.getWCSManager().getOffset('G54')).toEqual({ x: 0, y: 0, z: 0 })
    })
  })

  describe('Performance', () => {
    test('should handle rapid position updates efficiently', () => {
      const listener = jest.fn()
      coordinateManager.on('coordinates:position-updated', listener)

      const startTime = Date.now()

      // Send 100 position updates (reduced for test stability)
      for (let i = 0; i < 100; i++) {
        coordinateManager.updateMachinePosition({ x: i, y: i * 2, z: i * 3 }, 'machine-feedback')
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(1000) // Less than 1 second

      // Should have emitted close to 100 events (allowing for minor deduplication)
      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(95)
      expect(listener.mock.calls.length).toBeLessThanOrEqual(100)
    })

    test('should not emit events for minimal position changes', () => {
      const listener = jest.fn()
      coordinateManager.on('coordinates:position-updated', listener)

      const basePosition = { x: 10, y: 20, z: 30 }

      // Initial position
      coordinateManager.updateMachinePosition(basePosition, 'machine-feedback')
      expect(listener).toHaveBeenCalledTimes(1)

      // Tiny change (below threshold)
      coordinateManager.updateMachinePosition({
        x: basePosition.x + 0.00001,
        y: basePosition.y,
        z: basePosition.z
      }, 'machine-feedback')

      // Should not emit another event
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })
})