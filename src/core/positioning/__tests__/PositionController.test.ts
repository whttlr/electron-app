import { PositionController } from '../PositionController';
import { Position } from '../../machine/MachineTypes';

describe('PositionController', () => {
  let controller: PositionController;

  beforeEach(() => {
    controller = new PositionController();
  });

  describe('Position Scaling', () => {
    test('should scale position for display', () => {
      const machinePos: Position = { x: 50, y: 100, z: 25 };
      const displayPos = controller.scaleForDisplay(machinePos);
      
      expect(displayPos).toEqual({
        x: 1,  // 50 / 50
        y: 2,  // 100 / 50
        z: 0.5 // 25 / 50
      });
    });

    test('should scale position for machine', () => {
      const displayPos: Position = { x: 1, y: 2, z: 0.5 };
      const machinePos = controller.scaleForMachine(displayPos);
      
      expect(machinePos).toEqual({
        x: 50,
        y: 100,
        z: 25
      });
    });

    test('should return scaled positions object', () => {
      const machinePos: Position = { x: 100, y: 50, z: 0 };
      const scaled = controller.getScaledPositions(machinePos);
      
      expect(scaled.machine).toEqual(machinePos);
      expect(scaled.display).toEqual({ x: 2, y: 1, z: 0 });
    });
  });

  describe('Position Validation', () => {
    test('should validate valid position', () => {
      const validation = controller.validatePosition({ x: 50, y: 50, z: 25 });
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    test('should validate position at bounds', () => {
      const validation = controller.validatePosition({ x: 0, y: 100, z: 50 });
      
      expect(validation.isValid).toBe(true);
    });

    test('should reject position outside bounds', () => {
      const validation = controller.validatePosition({ x: -10, y: 150, z: 60 });
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
      expect(validation.errors).toContain('X position -10 is out of bounds (0-100)');
      expect(validation.errors).toContain('Y position 150 is out of bounds (0-100)');
      expect(validation.errors).toContain('Z position 60 is out of bounds (0-50)');
    });

    test('should check if position is within bounds', () => {
      expect(controller.isWithinBounds({ x: 50, y: 50, z: 25 })).toBe(true);
      expect(controller.isWithinBounds({ x: 200, y: 50, z: 25 })).toBe(false);
    });
  });

  describe('Position Calculations', () => {
    test('should calculate distance between positions', () => {
      const from: Position = { x: 0, y: 0, z: 0 };
      const to: Position = { x: 3, y: 4, z: 0 };
      
      const distance = controller.calculateDistance(from, to);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should calculate 3D distance', () => {
      const from: Position = { x: 0, y: 0, z: 0 };
      const to: Position = { x: 2, y: 2, z: 2 };
      
      const distance = controller.calculateDistance(from, to);
      expect(distance).toBeCloseTo(3.464, 3); // sqrt(12)
    });

    test('should calculate jog target', () => {
      const current: Position = { x: 10, y: 20, z: 5 };
      const target = controller.calculateJogTarget(current, 'x', 15);
      
      expect(target).toEqual({ x: 25, y: 20, z: 5 });
    });

    test('should clamp position to bounds', () => {
      const position: Position = { x: -10, y: 150, z: 25 };
      const clamped = controller.clampToBounds(position);
      
      expect(clamped).toEqual({ x: 0, y: 100, z: 25 });
    });
  });

  describe('Bounds Management', () => {
    test('should update bounds', () => {
      const newBounds = {
        min: { x: -50, y: -50, z: -10 },
        max: { x: 50, y: 50, z: 10 }
      };
      
      controller.setBounds(newBounds);
      const bounds = controller.getBounds();
      
      expect(bounds).toEqual(newBounds);
    });

    test('should return bounds copy', () => {
      const bounds = controller.getBounds();
      bounds.max.x = 1000;
      
      const newBounds = controller.getBounds();
      expect(newBounds.max.x).toBe(100);
    });
  });

  describe('Utility Methods', () => {
    test('should interpolate positions', () => {
      const from: Position = { x: 0, y: 0, z: 0 };
      const to: Position = { x: 100, y: 50, z: 25 };
      
      const mid = controller.interpolatePosition(from, to, 0.5);
      expect(mid).toEqual({ x: 50, y: 25, z: 12.5 });
      
      const start = controller.interpolatePosition(from, to, 0);
      expect(start).toEqual(from);
      
      const end = controller.interpolatePosition(from, to, 1);
      expect(end).toEqual(to);
    });

    test('should clamp interpolation progress', () => {
      const from: Position = { x: 0, y: 0, z: 0 };
      const to: Position = { x: 100, y: 100, z: 100 };
      
      const result1 = controller.interpolatePosition(from, to, -0.5);
      expect(result1).toEqual(from);
      
      const result2 = controller.interpolatePosition(from, to, 1.5);
      expect(result2).toEqual(to);
    });

    test('should format position', () => {
      const position: Position = { x: 12.3456, y: 78.9012, z: 0.1234 };
      
      const formatted = controller.formatPosition(position);
      expect(formatted).toBe('X:12.346 Y:78.901 Z:0.123');
      
      const formatted2 = controller.formatPosition(position, 1);
      expect(formatted2).toBe('X:12.3 Y:78.9 Z:0.1');
    });
  });
});