import { MachineController } from '../MachineController';
import { MachineEvent } from '../MachineTypes';
import { logger } from '@/services/logger';

// Mock the logger
jest.mock('@/services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('MachineController', () => {
  let controller: MachineController;
  let mockListener: jest.Mock;

  beforeEach(() => {
    controller = new MachineController();
    mockListener = jest.fn();
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    test('should connect successfully', async () => {
      controller.on('connected', mockListener);
      
      await controller.connect();
      
      expect(controller.isConnected()).toBe(true);
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'connected',
          timestamp: expect.any(Date)
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Machine connected successfully');
    });

    test('should disconnect successfully', async () => {
      await controller.connect();
      controller.on('disconnected', mockListener);
      
      await controller.disconnect();
      
      expect(controller.isConnected()).toBe(false);
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'disconnected'
        })
      );
    });

    test('should reset state on disconnect', async () => {
      await controller.connect();
      await controller.moveToPosition({ x: 50, y: 50 });
      
      await controller.disconnect();
      
      const position = controller.getPosition();
      expect(position).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('Position Management', () => {
    beforeEach(async () => {
      await controller.connect();
    });

    test('should move to position', async () => {
      controller.on('positionChanged', mockListener);
      
      await controller.moveToPosition({ x: 25, y: 30 });
      
      const position = controller.getPosition();
      expect(position).toEqual({ x: 25, y: 30, z: 0 });
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'positionChanged',
          data: { x: 25, y: 30, z: 0 }
        })
      );
    });

    test('should throw error when not connected', async () => {
      await controller.disconnect();
      
      await expect(controller.moveToPosition({ x: 10 }))
        .rejects.toThrow('Machine not connected');
    });

    test('should validate position bounds', async () => {
      await expect(controller.moveToPosition({ x: 200 }))
        .rejects.toThrow('X position 200 is out of bounds');
      
      await expect(controller.moveToPosition({ y: -10 }))
        .rejects.toThrow('Y position -10 is out of bounds');
    });

    test('should prevent concurrent movements', async () => {
      const move1 = controller.moveToPosition({ x: 10 });
      const move2 = controller.moveToPosition({ x: 20 });
      
      await expect(move2).rejects.toThrow('Machine is already moving');
      await move1; // Let first movement complete
    });
  });

  describe('Jog Operations', () => {
    beforeEach(async () => {
      await controller.connect();
    });

    test('should jog positive distance', async () => {
      await controller.jog('x', 10);
      
      const position = controller.getPosition();
      expect(position.x).toBe(10);
    });

    test('should jog negative distance', async () => {
      await controller.moveToPosition({ y: 50 });
      await controller.jog('y', -20);
      
      const position = controller.getPosition();
      expect(position.y).toBe(30);
    });

    test('should respect bounds during jog', async () => {
      await controller.moveToPosition({ z: 40 });
      
      await expect(controller.jog('z', 20))
        .rejects.toThrow('Z position 60 is out of bounds');
    });
  });

  describe('Homing', () => {
    beforeEach(async () => {
      await controller.connect();
    });

    test('should home successfully', async () => {
      await controller.moveToPosition({ x: 50, y: 50, z: 25 });
      
      const startListener = jest.fn();
      const completeListener = jest.fn();
      controller.on('homingStarted', startListener);
      controller.on('homingCompleted', completeListener);
      
      await controller.home();
      
      const position = controller.getPosition();
      expect(position).toEqual({ x: 0, y: 0, z: 0 });
      expect(startListener).toHaveBeenCalled();
      expect(completeListener).toHaveBeenCalled();
    });

    test('should throw error when not connected', async () => {
      await controller.disconnect();
      
      await expect(controller.home())
        .rejects.toThrow('Machine not connected');
    });

    test('should prevent concurrent homing', async () => {
      const home1 = controller.home();
      const home2 = controller.home();
      
      await expect(home2).rejects.toThrow('Machine is already homing');
      await home1;
    });
  });

  describe('Event Management', () => {
    test('should add and remove listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      controller.on('connected', listener1);
      controller.on('connected', listener2);
      
      await controller.connect();
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      
      controller.off('connected', listener1);
      await controller.disconnect();
      await controller.connect();
      
      expect(listener1).toHaveBeenCalledTimes(1); // Not called again
      expect(listener2).toHaveBeenCalledTimes(2); // Called again
    });
  });

  describe('State Management', () => {
    test('should return complete state', async () => {
      await controller.connect();
      
      const state = controller.getState();
      
      expect(state).toMatchObject({
        isConnected: true,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width: 100, height: 100, depth: 50 },
        isHoming: false,
        isMoving: false
      });
    });

    test('should return dimensions', () => {
      const dimensions = controller.getDimensions();
      
      expect(dimensions).toEqual({
        width: 100,
        height: 100,
        depth: 50
      });
    });
  });
});