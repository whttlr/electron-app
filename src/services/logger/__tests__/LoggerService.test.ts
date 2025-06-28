import { logger } from '../LoggerService';
import { LogLevel } from '../LoggerTypes';

describe('LoggerService', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger.clear();
    logger.updateConfig({ level: 'debug', enableConsole: false, enableStorage: true });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('logging methods', () => {
    test('should log debug messages', () => {
      logger.debug('Test debug message', { test: 'data' });
      const entries = logger.getEntries();
      
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('debug');
      expect(entries[0].message).toBe('Test debug message');
      expect(entries[0].data).toEqual({ test: 'data' });
    });

    test('should log info messages', () => {
      logger.info('Test info message');
      const entries = logger.getEntries();
      
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('info');
      expect(entries[0].message).toBe('Test info message');
    });

    test('should log error messages', () => {
      logger.error('Test error message');
      const entries = logger.getEntries();
      
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
      expect(entries[0].message).toBe('Test error message');
    });
  });

  describe('log filtering', () => {
    test('should filter logs based on level', () => {
      logger.updateConfig({ level: 'warn', enableConsole: false, enableStorage: true });
      logger.clear();
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      const entries = logger.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].level).toBe('warn');
      expect(entries[1].level).toBe('error');
    });
  });

  describe('storage management', () => {
    test('should clear entries', () => {
      logger.info('Test message');
      expect(logger.getEntries()).toHaveLength(1);
      
      logger.clear();
      expect(logger.getEntries()).toHaveLength(0);
    });

    test('should maintain max entries limit', () => {
      logger.updateConfig({ maxEntries: 2, enableConsole: false, enableStorage: true });
      logger.clear();
      
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      
      const entries = logger.getEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0].message).toBe('Message 2');
      expect(entries[1].message).toBe('Message 3');
    });
  });
});