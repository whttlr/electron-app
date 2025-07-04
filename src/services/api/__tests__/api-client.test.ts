/**
 * API Client Tests
 */

import apiClient from '../api-client';

// Mock the window.electronAPI
const mockElectronAPI = {
  getApiConfig: jest.fn(),
  apiHealthCheck: jest.fn(),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton state
    (apiClient as any).baseUrl = null;
    (apiClient as any).ready = false;
    (apiClient as any).initPromise = null;
  });

  describe('initialization', () => {
    test('should initialize successfully with valid config', async () => {
      mockElectronAPI.getApiConfig.mockResolvedValue({
        baseUrl: 'http://localhost:3000',
        ready: true,
      });

      await apiClient.initialize();

      expect(apiClient.isReady()).toBe(true);
      expect(apiClient.getBaseUrl()).toBe('http://localhost:3000');
    });

    test('should fail initialization when API not ready', async () => {
      mockElectronAPI.getApiConfig.mockResolvedValue({
        baseUrl: null,
        ready: false,
      });

      await expect(apiClient.initialize()).rejects.toThrow('API server not ready');
    });

    test('should reuse initialization promise on concurrent calls', async () => {
      mockElectronAPI.getApiConfig.mockResolvedValue({
        baseUrl: 'http://localhost:3000',
        ready: true,
      });

      const promise1 = apiClient.initialize();
      const promise2 = apiClient.initialize();

      expect(promise1).toBe(promise2);

      await promise1;
      expect(mockElectronAPI.getApiConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('request method', () => {
    beforeEach(async () => {
      mockElectronAPI.getApiConfig.mockResolvedValue({
        baseUrl: 'http://localhost:3000',
        ready: true,
      });
      await apiClient.initialize();
    });

    test('should make successful request', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: {} }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiClient.request('/test');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual({ success: true, data: {} });
    });

    test('should handle failed request', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not Found'),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiClient.request('/test')).rejects.toThrow('API Error 404: Not Found');
    });
  });

  describe('CNC-specific methods', () => {
    beforeEach(async () => {
      mockElectronAPI.getApiConfig.mockResolvedValue({
        baseUrl: 'http://localhost:3000',
        ready: true,
      });
      await apiClient.initialize();

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: {} }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    });

    test('should get connection status', async () => {
      await apiClient.getConnectionStatus();
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/connection/status', expect.any(Object));
    });

    test('should connect to machine', async () => {
      await apiClient.connect('/dev/ttyUSB0');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/connection/connect',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ port: '/dev/ttyUSB0' }),
        }),
      );
    });

    test('should send G-code commands', async () => {
      await apiClient.sendGcode(['G0 X10', 'G1 Y20']);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/gcode/execute',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ commands: ['G0 X10', 'G1 Y20'] }),
        }),
      );
    });
  });

  describe('health check', () => {
    test('should perform health check through electron API', async () => {
      mockElectronAPI.apiHealthCheck.mockResolvedValue({ healthy: true });

      const result = await apiClient.healthCheck();

      expect(mockElectronAPI.apiHealthCheck).toHaveBeenCalled();
      expect(result).toEqual({ healthy: true });
    });

    test('should handle health check errors', async () => {
      mockElectronAPI.apiHealthCheck.mockRejectedValue(new Error('Connection failed'));

      const result = await apiClient.healthCheck();

      expect(result).toEqual({ healthy: false, error: 'Connection failed' });
    });
  });
});
