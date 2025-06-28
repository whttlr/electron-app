import { MachineState } from '../MachineState';
import { Position, MachineDimensions } from '../MachineTypes';

describe('MachineState', () => {
  let state: MachineState;

  beforeEach(() => {
    state = new MachineState();
  });

  describe('initialization', () => {
    test('should initialize with default values', () => {
      const machineState = state.get();
      
      expect(machineState).toMatchObject({
        isConnected: false,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: 100, height: 100, depth: 50 },
        isHoming: false,
        isMoving: false
      });
    });

    test('should accept initial state', () => {
      const customState = new MachineState({
        isConnected: true,
        position: { x: 10, y: 20, z: 30 }
      });
      
      const result = customState.get();
      expect(result.isConnected).toBe(true);
      expect(result.position).toEqual({ x: 10, y: 20, z: 30 });
    });
  });

  describe('getters', () => {
    test('should return position copy', () => {
      const position = state.getPosition();
      position.x = 100;
      
      const newPosition = state.getPosition();
      expect(newPosition.x).toBe(0);
    });

    test('should return dimensions copy', () => {
      const dimensions = state.getDimensions();
      dimensions.width = 200;
      
      const newDimensions = state.getDimensions();
      expect(newDimensions.width).toBe(100);
    });

    test('should return connection status', () => {
      expect(state.isConnected()).toBe(false);
      state.setConnected(true);
      expect(state.isConnected()).toBe(true);
    });

    test('should return moving status', () => {
      expect(state.isMoving()).toBe(false);
      state.setMoving(true);
      expect(state.isMoving()).toBe(true);
    });

    test('should return homing status', () => {
      expect(state.isHoming()).toBe(false);
      state.setHoming(true);
      expect(state.isHoming()).toBe(true);
    });
  });

  describe('setters', () => {
    test('should update position partially', () => {
      state.setPosition({ x: 25 });
      
      const position = state.getPosition();
      expect(position).toEqual({ x: 25, y: 0, z: 0 });
    });

    test('should update dimensions partially', () => {
      state.setDimensions({ height: 150 });
      
      const dimensions = state.getDimensions();
      expect(dimensions).toEqual({ width: 100, height: 150, depth: 50 });
    });

    test('should set error', () => {
      state.setError('Test error');
      expect(state.get().lastError).toBe('Test error');
      
      state.setError(undefined);
      expect(state.get().lastError).toBeUndefined();
    });
  });

  describe('reset', () => {
    test('should reset to defaults but preserve connection', () => {
      state.setConnected(true);
      state.setPosition({ x: 50, y: 50, z: 25 });
      state.setMoving(true);
      state.setHoming(true);
      state.setError('Some error');
      
      state.reset();
      
      const result = state.get();
      expect(result.isConnected).toBe(true); // Preserved
      expect(result.position).toEqual({ x: 0, y: 0, z: 0 }); // Reset
      expect(result.isMoving).toBe(false); // Reset
      expect(result.isHoming).toBe(false); // Reset
      expect(result.lastError).toBeUndefined(); // Reset
    });
  });

  describe('state isolation', () => {
    test('should return immutable state', () => {
      const state1 = state.get();
      state1.position.x = 100;
      
      const state2 = state.get();
      expect(state2.position.x).toBe(0);
    });
  });
});