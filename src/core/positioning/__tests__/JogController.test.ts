import { JogController } from '../JogController';
import { Position } from '../../machine/MachineTypes';
import { logger } from '@/services/logger';

// Mock logger
jest.mock('@/services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('JogController', () => {
  let controller: JogController;

  beforeEach(() => {
    controller = new JogController();
    jest.clearAllMocks();
  });

  describe('Jog Operations', () => {
    test('should execute valid jog command', async () => {
      const current: Position = { x: 50, y: 50, z: 25 };
      const command = { axis: 'x' as keyof Position, distance: 10 };
      
      const result = await controller.executeJog(current, command);
      
      expect(result).toEqual({ x: 60, y: 50, z: 25 });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Executing jog: x axis, distance: 10')
      );
    });

    test('should reject jog that exceeds bounds', async () => {
      const current: Position = { x: 95, y: 50, z: 25 };
      const command = { axis: 'x' as keyof Position, distance: 10 };
      
      await expect(controller.executeJog(current, command))
        .rejects.toThrow('Jog would exceed bounds');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should use custom speed if provided', async () => {
      const current: Position = { x: 50, y: 50, z: 25 };
      const command = { axis: 'y' as keyof Position, distance: -10, speed: 500 };
      
      const result = await controller.executeJog(current, command);
      
      expect(result).toEqual({ x: 50, y: 40, z: 25 });
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('speed: 500')
      );
    });

    test('should calculate step jog command', () => {
      const command = controller.calculateStepJog('z', -1);
      
      expect(command).toEqual({
        axis: 'z',
        distance: -1, // Default increment is 1
        speed: 1000 // Default speed
      });
    });
  });

  describe('Settings Management', () => {
    test('should update settings', () => {
      controller.updateSettings({ increment: 0.1, speed: 2000 });
      
      const settings = controller.getSettings();
      expect(settings.increment).toBe(0.1);
      expect(settings.speed).toBe(2000);
      expect(settings.isMetric).toBe(true); // Unchanged
    });

    test('should switch to imperial mode', () => {
      controller.setMetricMode(false);
      
      const settings = controller.getSettings();
      expect(settings.isMetric).toBe(false);
      expect(settings.increment).toBe(0.0625); // 1/16"
    });

    test('should switch to metric mode', () => {
      controller.setMetricMode(false);
      controller.updateSettings({ increment: 0.125 });
      controller.setMetricMode(true);
      
      const settings = controller.getSettings();
      expect(settings.isMetric).toBe(true);
      expect(settings.increment).toBe(1); // Reset to 1mm
    });
  });

  describe('Increment Management', () => {
    test('should return metric increments', () => {
      const increments = controller.getAvailableIncrements();
      
      expect(increments).toHaveLength(7);
      expect(increments[0]).toEqual({ value: 0.001, label: '0.001 mm' });
      expect(increments[3]).toEqual({ value: 1, label: '1 mm' });
      expect(increments[6]).toEqual({ value: 100, label: '100 mm' });
    });

    test('should return imperial increments', () => {
      controller.setMetricMode(false);
      const increments = controller.getAvailableIncrements();
      
      expect(increments).toHaveLength(7);
      expect(increments[0]).toEqual({ value: 0.396875, label: '1/64"' });
      expect(increments[3]).toEqual({ value: 3.175, label: '1/8"' });
      expect(increments[6]).toEqual({ value: 25.4, label: '1"' });
    });
  });

  describe('Speed Management', () => {
    test('should validate speed within limits', () => {
      expect(controller.validateSpeed(1000)).toBe(true);
      expect(controller.validateSpeed(1)).toBe(true);
      expect(controller.validateSpeed(5000)).toBe(true);
    });

    test('should reject invalid speeds', () => {
      expect(controller.validateSpeed(0)).toBe(false);
      expect(controller.validateSpeed(6000)).toBe(false);
      expect(controller.validateSpeed(-100)).toBe(false);
    });

    test('should return speed limits', () => {
      const limits = controller.getSpeedLimits();
      
      expect(limits).toEqual({
        min: 1,
        max: 5000
      });
    });
  });

  describe('History Management', () => {
    test('should track jog history', async () => {
      const position: Position = { x: 50, y: 50, z: 25 };
      
      await controller.executeJog(position, { axis: 'x', distance: 10 });
      await controller.executeJog(position, { axis: 'y', distance: -5 });
      
      const history = controller.getJogHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({ axis: 'x', distance: 10 });
      expect(history[1]).toEqual({ axis: 'y', distance: -5 });
    });

    test('should limit history size', async () => {
      const position: Position = { x: 50, y: 50, z: 25 };
      
      // Execute 105 jogs
      for (let i = 0; i < 105; i++) {
        await controller.executeJog(position, { axis: 'x', distance: 0.1 });
      }
      
      const history = controller.getJogHistory();
      expect(history).toHaveLength(100);
    });

    test('should get last jog', async () => {
      const position: Position = { x: 50, y: 50, z: 25 };
      
      expect(controller.getLastJog()).toBeUndefined();
      
      await controller.executeJog(position, { axis: 'z', distance: 5 });
      
      const lastJog = controller.getLastJog();
      expect(lastJog).toEqual({ axis: 'z', distance: 5 });
    });

    test('should clear history', async () => {
      const position: Position = { x: 50, y: 50, z: 25 };
      
      await controller.executeJog(position, { axis: 'x', distance: 10 });
      expect(controller.getJogHistory()).toHaveLength(1);
      
      controller.clearHistory();
      expect(controller.getJogHistory()).toHaveLength(0);
    });
  });
});