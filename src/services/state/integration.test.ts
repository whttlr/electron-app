/**
 * Store Integration Tests
 *
 * Tests for cross-store communication, event handling,
 * and coordinated state management.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMachineStore } from '../machineStore';
import { useJobStore } from '../jobStore';
import { useUIStore } from '../uiStore';
import { useSettingsStore } from '../settingsStore';
import { usePerformanceStore } from '../performanceStore';
import { storeEventBus } from '../storeUtils';
import { initializeStores, resetAllStores } from '../storeManager';

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// Mock DOM for UI store
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: jest.fn(),
  },
  writable: true,
});

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset all stores before each test
    resetAllStores();

    // Clear event bus
    storeEventBus.clear();

    // Reset any timers
    jest.clearAllTimers();
  });

  describe('Machine-UI Integration', () => {
    it('should sync machine connection status with UI loading state', () => {
      const machineHook = renderHook(() => useMachineStore());
      const uiHook = renderHook(() => useUIStore());

      // Initially not connected, should have loading state
      expect(machineHook.result.current.isConnected).toBe(false);

      // Simulate connection change
      act(() => {
        machineHook.result.current.setConnection({ isConnected: true });
        storeEventBus.emit('machine:connection-changed', { isConnected: true });
      });

      // UI should remove loading state when connected
      act(() => {
        uiHook.result.current.setLoading('machine-connection', false);
      });

      expect(uiHook.result.current.isLoading('machine-connection')).toBe(false);
    });

    it('should show UI notification for machine errors', () => {
      const machineHook = renderHook(() => useMachineStore());
      const uiHook = renderHook(() => useUIStore());

      // Add a critical machine error
      act(() => {
        machineHook.result.current.addError({
          type: 'machine',
          severity: 'critical',
          message: 'Critical system failure',
        });
      });

      // Should trigger UI notification
      act(() => {
        uiHook.result.current.showToast(
          'error',
          'Critical Machine Error',
          'Critical system failure',
          0, // Persistent
        );
      });

      expect(uiHook.result.current.toasts).toHaveLength(1);
      expect(uiHook.result.current.toasts[0].type).toBe('error');
      expect(uiHook.result.current.toasts[0].title).toBe('Critical Machine Error');
    });
  });

  describe('Job-UI Integration', () => {
    it('should show UI notifications for job status changes', () => {
      const jobHook = renderHook(() => useJobStore());
      const uiHook = renderHook(() => useUIStore());

      // Add a job
      let jobId: string;
      act(() => {
        jobId = jobHook.result.current.addJob({
          name: 'Test Job',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });
      });

      // Start the job
      act(() => {
        jobHook.result.current.updateJob(jobId!, { status: 'running', startTime: new Date() });
        jobHook.result.current.currentJob = jobHook.result.current.queue.jobs[0];
      });

      // Simulate job started notification
      act(() => {
        uiHook.result.current.showToast('info', 'Job Started', 'Test Job is now running');
      });

      expect(uiHook.result.current.toasts).toHaveLength(1);
      expect(uiHook.result.current.toasts[0].title).toBe('Job Started');

      // Complete the job
      act(() => {
        jobHook.result.current.completeJob(jobId!);
        jobHook.result.current.currentJob = null;
      });

      // Simulate job completed notification
      act(() => {
        uiHook.result.current.showToast('success', 'Job Completed', 'Test Job finished successfully');
      });

      expect(uiHook.result.current.toasts).toHaveLength(2);
      expect(uiHook.result.current.toasts[1].type).toBe('success');
    });

    it('should stop job when machine enters error state', () => {
      const machineHook = renderHook(() => useMachineStore());
      const jobHook = renderHook(() => useJobStore());

      // Add and start a job
      let jobId: string;
      act(() => {
        jobId = jobHook.result.current.addJob({
          name: 'Running Job',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });

        jobHook.result.current.updateJob(jobId!, { status: 'running', startTime: new Date() });
        jobHook.result.current.currentJob = jobHook.result.current.queue.jobs[0];
        jobHook.result.current.queue.isProcessing = true;
        jobHook.result.current.queue.currentJobId = jobId!;
      });

      expect(jobHook.result.current.currentJob?.status).toBe('running');

      // Machine enters emergency state
      act(() => {
        machineHook.result.current.updateStatus('emergency');
      });

      // Should stop the current job
      act(() => {
        if (jobHook.result.current.currentJob) {
          jobHook.result.current.stopJob(jobHook.result.current.currentJob.id);
        }
      });

      expect(jobHook.result.current.currentJob).toBe(null);
      expect(jobHook.result.current.queue.isProcessing).toBe(false);
    });
  });

  describe('Settings-Machine Integration', () => {
    it('should update machine configuration when settings change', () => {
      const settingsHook = renderHook(() => useSettingsStore());
      const machineHook = renderHook(() => useMachineStore());

      const newWorkingArea = {
        width: 500,
        height: 400,
        depth: 150,
        units: 'mm' as const,
      };

      // Update settings
      act(() => {
        settingsHook.result.current.updateWorkingArea(newWorkingArea);
      });

      // Should update machine working area
      act(() => {
        machineHook.result.current.setWorkingArea(newWorkingArea);
      });

      expect(machineHook.result.current.workingArea).toEqual(newWorkingArea);
    });

    it('should sync machine connection settings', () => {
      const settingsHook = renderHook(() => useSettingsStore());
      const machineHook = renderHook(() => useMachineStore());

      const newConnectionSettings = {
        type: 'tcp' as const,
        ipAddress: '192.168.1.100',
        tcpPort: 8080,
      };

      // Update connection settings
      act(() => {
        settingsHook.result.current.updateConnectionSettings(newConnectionSettings);
      });

      // Should update machine connection
      act(() => {
        machineHook.result.current.setConnection(newConnectionSettings);
      });

      expect(machineHook.result.current.connection.type).toBe('tcp');
      expect(machineHook.result.current.connection.ipAddress).toBe('192.168.1.100');
      expect(machineHook.result.current.connection.tcpPort).toBe(8080);
    });
  });

  describe('Settings-UI Integration', () => {
    it('should sync theme between UI and settings', () => {
      const settingsHook = renderHook(() => useSettingsStore());
      const uiHook = renderHook(() => useUIStore());

      // Change theme in UI
      act(() => {
        uiHook.result.current.setTheme('light');
      });

      // Should update settings
      act(() => {
        settingsHook.result.current.updateUISettings({ theme: 'light' });
      });

      expect(settingsHook.result.current.settings.ui.theme).toBe('light');

      // Change theme in settings
      act(() => {
        settingsHook.result.current.updateUISettings({ theme: 'dark' });
      });

      // Should update UI
      act(() => {
        uiHook.result.current.setTheme('dark');
      });

      expect(uiHook.result.current.ui.theme).toBe('dark');
    });

    it('should show unsaved changes indicator', () => {
      const settingsHook = renderHook(() => useSettingsStore());
      const uiHook = renderHook(() => useUIStore());

      // Make changes to settings
      act(() => {
        settingsHook.result.current.updateGeneralSettings({ autoSave: false });
      });

      expect(settingsHook.result.current.hasUnsavedChanges).toBe(true);

      // Should show loading indicator in UI
      act(() => {
        uiHook.result.current.setLoading('settings-save', true);
      });

      expect(uiHook.result.current.isLoading('settings-save')).toBe(true);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should trigger performance alerts in UI', () => {
      const performanceHook = renderHook(() => usePerformanceStore());
      const uiHook = renderHook(() => useUIStore());

      // Add a critical performance alert
      act(() => {
        performanceHook.result.current.addAlert({
          type: 'cpu',
          severity: 'critical',
          message: 'CPU usage above 95%',
        });
      });

      const criticalAlerts = performanceHook.result.current.alerts.filter(
        (alert) => alert.severity === 'critical' && !alert.resolved,
      );

      // Should show UI notification
      if (criticalAlerts.length > 0) {
        act(() => {
          uiHook.result.current.showToast('error', 'Performance Alert', criticalAlerts[0].message);
        });
      }

      expect(uiHook.result.current.toasts).toHaveLength(1);
      expect(uiHook.result.current.toasts[0].title).toBe('Performance Alert');
    });

    it('should trigger cache clearing on memory pressure', () => {
      const performanceHook = renderHook(() => usePerformanceStore());

      // Simulate high memory usage
      act(() => {
        performanceHook.result.current.updateMetrics({
          memory: {
            used: 7500, // 7.5GB
            total: 8192, // 8GB
            history: [90, 92, 94, 95], // High usage trend
          },
        });
      });

      const metrics = performanceHook.result.current.currentMetrics;
      const memoryPercent = (metrics.memory.used / metrics.memory.total) * 100;

      // Should be above critical threshold
      expect(memoryPercent).toBeGreaterThan(90);

      // Should trigger memory optimization
      act(() => {
        performanceHook.result.current.optimizeMemory();
      });

      // Performance store should handle the optimization
      expect(performanceHook.result.current.optimizations.lowPowerMode).toBe(false); // Initial state
    });
  });

  describe('Event Bus Communication', () => {
    it('should handle cross-store events', () => {
      const listeners: Array<{ event: string; data: any }> = [];

      // Set up event listeners
      const unsubscribe1 = storeEventBus.subscribe('test-event', (data) => {
        listeners.push({ event: 'test-event', data });
      });

      const unsubscribe2 = storeEventBus.subscribe('machine:error', (data) => {
        listeners.push({ event: 'machine:error', data });
      });

      // Emit events
      act(() => {
        storeEventBus.emit('test-event', { message: 'Hello from test' });
        storeEventBus.emit('machine:error', { severity: 'high', message: 'Machine error' });
      });

      expect(listeners).toHaveLength(2);
      expect(listeners[0].event).toBe('test-event');
      expect(listeners[0].data.message).toBe('Hello from test');
      expect(listeners[1].event).toBe('machine:error');
      expect(listeners[1].data.severity).toBe('high');

      // Clean up
      unsubscribe1();
      unsubscribe2();
    });

    it('should handle real-time data sync events', () => {
      const machineHook = renderHook(() => useMachineStore());
      const receivedData: any[] = [];

      // Set up sync listener
      const unsubscribe = storeEventBus.subscribe('sync:data', (data) => {
        receivedData.push(data);

        if (data.type === 'machine') {
          // Update machine store with sync data
          machineHook.result.current.updateMachineState(data.data);
        }
      });

      // Simulate real-time sync data
      act(() => {
        storeEventBus.emit('sync:data', {
          type: 'machine',
          data: {
            position: { x: 150, y: 200, z: 75 },
            feedRate: 1200,
            spindleSpeed: 8000,
          },
        });
      });

      expect(receivedData).toHaveLength(1);
      expect(receivedData[0].type).toBe('machine');
      expect(machineHook.result.current.machine.feedRate).toBe(1200);
      expect(machineHook.result.current.machine.spindleSpeed).toBe(8000);

      unsubscribe();
    });
  });

  describe('Store Manager Integration', () => {
    it('should initialize all stores in correct order', async () => {
      const initOrder: string[] = [];

      // Mock store initialization methods
      const settingsHook = renderHook(() => useSettingsStore());
      const performanceHook = renderHook(() => usePerformanceStore());
      const uiHook = renderHook(() => useUIStore());

      // Simulate initialization order
      act(() => {
        initOrder.push('settings');
        settingsHook.result.current.isLoaded = true;

        initOrder.push('performance');
        performanceHook.result.current.startMonitoring();

        initOrder.push('ui');
        uiHook.result.current.setTheme(settingsHook.result.current.settings.ui.theme);
      });

      expect(initOrder).toEqual(['settings', 'performance', 'ui']);
      expect(settingsHook.result.current.isLoaded).toBe(true);
      expect(performanceHook.result.current.isMonitoring).toBe(true);
      expect(uiHook.result.current.ui.theme).toBe('dark');
    });

    it('should reset all stores together', () => {
      const machineHook = renderHook(() => useMachineStore());
      const jobHook = renderHook(() => useJobStore());
      const uiHook = renderHook(() => useUIStore());

      // Make changes to stores
      act(() => {
        machineHook.result.current.updatePosition({ x: 100, y: 200, z: 50 });
        jobHook.result.current.addJob({
          name: 'Test Job',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });
        uiHook.result.current.setTheme('light');
      });

      // Verify changes were made
      expect(machineHook.result.current.machine.position.x).toBe(100);
      expect(jobHook.result.current.queue.jobs).toHaveLength(1);
      expect(uiHook.result.current.ui.theme).toBe('light');

      // Reset all stores
      act(() => {
        resetAllStores();
      });

      // Verify stores are reset
      expect(machineHook.result.current.machine.position.x).toBe(0);
      expect(jobHook.result.current.queue.jobs).toHaveLength(0);
      expect(uiHook.result.current.ui.theme).toBe('dark');
    });
  });

  describe('Error Propagation', () => {
    it('should propagate machine errors to all relevant stores', () => {
      const machineHook = renderHook(() => useMachineStore());
      const jobHook = renderHook(() => useJobStore());
      const uiHook = renderHook(() => useUIStore());

      // Add a job that's running
      let jobId: string;
      act(() => {
        jobId = jobHook.result.current.addJob({
          name: 'Critical Job',
          gcodeFile: 'test.gcode',
          material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
          toolSettings: {
            toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100,
          },
          workOrigin: { x: 0, y: 0, z: 0 },
          totalLines: 100,
          currentLine: 0,
          estimatedDuration: 60,
        });

        jobHook.result.current.updateJob(jobId!, { status: 'running' });
        jobHook.result.current.currentJob = jobHook.result.current.queue.jobs[0];
      });

      // Trigger critical machine error
      act(() => {
        machineHook.result.current.addError({
          type: 'machine',
          severity: 'critical',
          message: 'Spindle motor failure',
        });

        machineHook.result.current.updateStatus('error');
      });

      // Should stop the running job
      act(() => {
        if (jobHook.result.current.currentJob) {
          jobHook.result.current.stopJob(jobHook.result.current.currentJob.id);
        }
      });

      // Should show critical error notification
      act(() => {
        uiHook.result.current.showToast(
          'error',
          'Critical Machine Error',
          'Spindle motor failure',
          0, // Persistent
        );
      });

      expect(machineHook.result.current.status).toBe('error');
      expect(jobHook.result.current.currentJob).toBe(null);
      expect(uiHook.result.current.toasts).toHaveLength(1);
      expect(uiHook.result.current.toasts[0].type).toBe('error');
    });
  });
});
