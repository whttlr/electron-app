/**
 * Machine Store Unit Tests
 *
 * Comprehensive tests for machine state management,
 * connection handling, and position tracking.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMachineStore, machineSelectors } from '../machineStore';
import type { Position3D, MachineStatus } from '../types';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('MachineStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useMachineStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useMachineStore());
      const state = result.current;

      expect(state.isConnected).toBe(false);
      expect(state.status).toBe('disconnected');
      expect(state.machine.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(state.errors).toEqual([]);
      expect(state.warnings).toEqual([]);
      expect(state.connectionAttempts).toBe(0);
    });
  });

  describe('Position Updates', () => {
    it('should update machine position', () => {
      const { result } = renderHook(() => useMachineStore());
      const newPosition: Position3D = { x: 100, y: 50, z: 25 };

      act(() => {
        result.current.updatePosition(newPosition);
      });

      expect(result.current.machine.position).toEqual(newPosition);
      expect(result.current.positionHistory).toHaveLength(1);
      expect(result.current.positionHistory[0].position).toEqual(newPosition);
    });

    it('should maintain position history with limit', () => {
      const { result } = renderHook(() => useMachineStore());

      // Add 105 positions to test the 100-entry limit
      act(() => {
        for (let i = 0; i < 105; i++) {
          result.current.updatePosition({ x: i, y: i, z: i });
        }
      });

      expect(result.current.positionHistory).toHaveLength(100);
      expect(result.current.positionHistory[0].position).toEqual({ x: 5, y: 5, z: 5 });
      expect(result.current.positionHistory[99].position).toEqual({ x: 104, y: 104, z: 104 });
    });
  });

  describe('Connection Management', () => {
    it('should handle connection attempt', async () => {
      const { result } = renderHook(() => useMachineStore());

      // Mock successful connection
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.8); // > 0.3, so connection succeeds

      let connectionResult: boolean;
      await act(async () => {
        connectionResult = await result.current.connect();
      });

      expect(connectionResult!).toBe(true);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.status).toBe('connected');
      expect(result.current.machine.status).toBe('idle');
      expect(result.current.connectionAttempts).toBe(0);

      Math.random = originalRandom;
    });

    it('should handle failed connection', async () => {
      const { result } = renderHook(() => useMachineStore());

      // Mock failed connection
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // < 0.3, so connection fails

      let connectionResult: boolean;
      await act(async () => {
        connectionResult = await result.current.connect();
      });

      expect(connectionResult!).toBe(false);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.status).toBe('disconnected');
      expect(result.current.connectionAttempts).toBe(1);

      Math.random = originalRandom;
    });

    it('should disconnect properly', () => {
      const { result } = renderHook(() => useMachineStore());

      // First connect
      act(() => {
        result.current.setConnection({ isConnected: true });
        result.current.updateStatus('connected');
      });

      // Then disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.status).toBe('disconnected');
      expect(result.current.machine.status).toBe('disconnected');
    });
  });

  describe('Error Management', () => {
    it('should add errors correctly', () => {
      const { result } = renderHook(() => useMachineStore());

      act(() => {
        result.current.addError({
          type: 'machine',
          severity: 'high',
          message: 'Test error',
        });
      });

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0].message).toBe('Test error');
      expect(result.current.errors[0].severity).toBe('high');
      expect(result.current.errors[0].type).toBe('machine');
      expect(result.current.errors[0].resolved).toBe(false);
      expect(result.current.machine.errors).toContain('Test error');
    });

    it('should remove errors by ID', () => {
      const { result } = renderHook(() => useMachineStore());

      let errorId: string;
      act(() => {
        result.current.addError({
          type: 'machine',
          severity: 'high',
          message: 'Test error',
        });
        errorId = result.current.errors[0].id;
      });

      act(() => {
        result.current.removeError(errorId!);
      });

      expect(result.current.errors).toHaveLength(0);
      expect(result.current.machine.errors).toHaveLength(0);
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useMachineStore());

      act(() => {
        result.current.addError({ type: 'machine', severity: 'high', message: 'Error 1' });
        result.current.addError({ type: 'network', severity: 'medium', message: 'Error 2' });
      });

      expect(result.current.errors).toHaveLength(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toHaveLength(0);
      expect(result.current.machine.errors).toHaveLength(0);
    });
  });

  describe('Machine Operations', () => {
    it('should handle jog operation', async () => {
      const { result } = renderHook(() => useMachineStore());
      const targetPosition: Position3D = { x: 10, y: 20, z: 5 };

      // Set up connected and idle state
      act(() => {
        result.current.setConnection({ isConnected: true });
        result.current.updateStatus('idle');
      });

      await act(async () => {
        await result.current.jogTo(targetPosition);
      });

      expect(result.current.machine.position).toEqual(targetPosition);
      expect(result.current.status).toBe('idle');
    });

    it('should reject jog when not connected', async () => {
      const { result } = renderHook(() => useMachineStore());
      const targetPosition: Position3D = { x: 10, y: 20, z: 5 };

      await expect(async () => {
        await act(async () => {
          await result.current.jogTo(targetPosition);
        });
      }).rejects.toThrow('Machine not connected');
    });

    it('should handle homing operation', async () => {
      const { result } = renderHook(() => useMachineStore());

      // Set up connected state
      act(() => {
        result.current.setConnection({ isConnected: true });
        result.current.updateStatus('idle');
        result.current.setHomePosition({ x: 0, y: 0, z: 0 });
        result.current.updatePosition({ x: 100, y: 100, z: 50 });
      });

      await act(async () => {
        await result.current.homeAxis(['X', 'Y', 'Z']);
      });

      expect(result.current.machine.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(result.current.status).toBe('idle');
    });

    it('should handle emergency stop', async () => {
      const { result } = renderHook(() => useMachineStore());

      await act(async () => {
        await result.current.emergencyStop();
      });

      expect(result.current.status).toBe('emergency');
      expect(result.current.machine.status).toBe('emergency');
      expect(result.current.machine.spindleSpeed).toBe(0);
      expect(result.current.machine.feedRate).toBe(0);
      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0].message).toBe('Emergency stop activated');
    });
  });

  describe('Selectors', () => {
    it('should select connection status correctly', () => {
      const { result } = renderHook(() => {
        const store = useMachineStore();
        return machineSelectors.isConnected(store);
      });

      expect(result.current).toBe(false);
    });

    it('should select position correctly', () => {
      const { result } = renderHook(() => {
        const store = useMachineStore();
        return machineSelectors.position(store);
      });

      expect(result.current).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should determine if machine can jog', () => {
      const { result } = renderHook(() => useMachineStore());

      // Initially can't jog (not connected)
      expect(machineSelectors.canJog(result.current)).toBe(false);

      // Connect and set to idle
      act(() => {
        result.current.setConnection({ isConnected: true });
        result.current.updateStatus('idle');
      });

      expect(machineSelectors.canJog(result.current)).toBe(true);

      // Set to running - can't jog
      act(() => {
        result.current.updateStatus('running');
      });

      expect(machineSelectors.canJog(result.current)).toBe(false);
    });

    it('should detect critical errors', () => {
      const { result } = renderHook(() => useMachineStore());

      act(() => {
        result.current.addError({ type: 'machine', severity: 'critical', message: 'Critical error' });
        result.current.addError({ type: 'network', severity: 'medium', message: 'Medium error' });
      });

      const criticalErrors = machineSelectors.criticalErrors(result.current);
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].severity).toBe('critical');
    });
  });

  describe('Working Area Management', () => {
    it('should update working area', () => {
      const { result } = renderHook(() => useMachineStore());
      const newArea = {
        width: 500,
        height: 400,
        depth: 150,
        units: 'mm' as const,
      };

      act(() => {
        result.current.setWorkingArea(newArea);
      });

      expect(result.current.workingArea).toEqual(newArea);
    });

    it('should update work origin', () => {
      const { result } = renderHook(() => useMachineStore());
      const newOrigin: Position3D = { x: 50, y: 75, z: 10 };

      act(() => {
        result.current.setWorkOrigin(newOrigin);
      });

      expect(result.current.workOrigin).toEqual(newOrigin);
      expect(result.current.machine.workOrigin).toEqual(newOrigin);
    });
  });

  describe('State Persistence', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useMachineStore());

      // Make some changes
      act(() => {
        result.current.updatePosition({ x: 100, y: 200, z: 50 });
        result.current.addError({ type: 'machine', severity: 'high', message: 'Test error' });
        result.current.setConnection({ isConnected: true });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.machine.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(result.current.errors).toHaveLength(0);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.status).toBe('disconnected');
    });
  });

  describe('Real-time Updates', () => {
    it('should update last update timestamp', () => {
      const { result } = renderHook(() => useMachineStore());
      const initialTime = result.current.lastUpdate;

      act(() => {
        result.current.updateMachineState({ feedRate: 1500 });
      });

      expect(result.current.lastUpdate).not.toBe(initialTime);
      expect(result.current.lastUpdate).toBeInstanceOf(Date);
    });

    it('should handle machine state updates', () => {
      const { result } = renderHook(() => useMachineStore());

      act(() => {
        result.current.updateMachineState({
          feedRate: 2000,
          spindleSpeed: 12000,
          temperature: 45,
        });
      });

      expect(result.current.machine.feedRate).toBe(2000);
      expect(result.current.machine.spindleSpeed).toBe(12000);
      expect(result.current.machine.temperature).toBe(45);
    });
  });
});
