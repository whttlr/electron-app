/**
 * Store Manager
 * 
 * Centralized store management for initialization, reset,
 * and cross-store coordination.
 */

import { useMachineStore } from './MachineService';
import { useJobStore } from './JobService';
import { useUIStore } from './UIService';
import { useSettingsStore } from './SettingsService';
import { usePerformanceStore } from './PerformanceService';
import { storeEventBus, debugStore } from './storeUtils';

// ============================================================================
// STORE REGISTRY
// ============================================================================

const stores = {
  machine: useMachineStore,
  job: useJobStore,
  ui: useUIStore,
  settings: useSettingsStore,
  performance: usePerformanceStore,
} as const;

type StoreNames = keyof typeof stores;

// ============================================================================
// STORE INITIALIZATION
// ============================================================================

/**
 * Initialize all stores with proper order and dependencies
 */
export async function initializeStores() {
  console.log('🚀 Initializing application stores...');
  
  try {
    // 1. Initialize settings store first (other stores may depend on settings)
    console.log('⚙️  Loading settings...');
    await useSettingsStore.getState().loadSettings();
    
    // 2. Initialize performance monitoring
    console.log('📊 Starting performance monitoring...');
    usePerformanceStore.getState().startMonitoring();
    
    // 3. Apply UI settings
    console.log('🎨 Applying UI settings...');
    const uiSettings = useSettingsStore.getState().settings.ui;
    useUIStore.getState().setTheme(uiSettings.theme);
    
    // 4. Set up cross-store subscriptions
    setupCrossStoreSubscriptions();
    
    // 5. Set up debugging in development
    if (process.env.NODE_ENV === 'development') {
      setupDebugging();
    }
    
    console.log('✅ All stores initialized successfully');
    
    // Emit initialization complete event
    storeEventBus.emit('stores:initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    throw error;
  }
}

/**
 * Reset all stores to their initial state
 */
export function resetAllStores() {
  console.log('🔄 Resetting all stores...');
  
  Object.entries(stores).forEach(([name, store]) => {
    try {
      store.getState().reset();
      console.log(`✅ Reset ${name} store`);
    } catch (error) {
      console.error(`❌ Failed to reset ${name} store:`, error);
    }
  });
  
  storeEventBus.emit('stores:reset');
  console.log('🔄 All stores reset complete');
}

/**
 * Get the current state of a specific store
 */
export function getStoreState<T extends StoreNames>(storeName: T) {
  return stores[storeName].getState();
}

/**
 * Subscribe to a specific store
 */
export function subscribeToStore<T extends StoreNames>(
  storeName: T,
  listener: (state: ReturnType<typeof stores[T]['getState']>) => void
) {
  return stores[storeName].subscribe(listener);
}

// ============================================================================
// CROSS-STORE SUBSCRIPTIONS
// ============================================================================

function setupCrossStoreSubscriptions() {
  console.log('🔗 Setting up cross-store subscriptions...');
  
  // 1. Machine connection status affects UI loading states
  useMachineStore.subscribe(
    (state) => state.isConnected,
    (isConnected) => {
      useUIStore.getState().setLoading('machine-connection', !isConnected);
    }
  );
  
  // 2. Settings changes affect machine configuration
  useSettingsStore.subscribe(
    (state) => state.settings.machine,
    (machineSettings) => {
      const machineStore = useMachineStore.getState();
      machineStore.setWorkingArea(machineSettings.workingArea);
      machineStore.setConnection(machineSettings.connection);
    }
  );
  
  // 3. Job progress affects UI notifications
  useJobStore.subscribe(
    (state) => state.currentJob,
    (currentJob, prevJob) => {
      const uiStore = useUIStore.getState();
      
      if (currentJob && !prevJob) {
        // Job started
        uiStore.showToast('info', 'Job Started', `${currentJob.name} is now running`);
      } else if (!currentJob && prevJob) {
        // Job completed or stopped
        if (prevJob.status === 'completed') {
          uiStore.showToast('success', 'Job Completed', `${prevJob.name} finished successfully`);
        } else if (prevJob.status === 'failed') {
          uiStore.showToast('error', 'Job Failed', `${prevJob.name} encountered an error`);
        } else if (prevJob.status === 'cancelled') {
          uiStore.showToast('warning', 'Job Cancelled', `${prevJob.name} was cancelled`);
        }
      }
    }
  );
  
  // 4. Machine errors trigger UI alerts
  useMachineStore.subscribe(
    (state) => state.errors,
    (errors) => {
      const criticalErrors = errors.filter(e => e.severity === 'critical');
      const uiStore = useUIStore.getState();
      
      criticalErrors.forEach(error => {
        uiStore.showToast('error', 'Critical Machine Error', error.message, 0); // Persistent toast
      });
    }
  );
  
  // 5. Performance alerts trigger UI notifications
  usePerformanceStore.subscribe(
    (state) => state.alerts,
    (alerts) => {
      const uiStore = useUIStore.getState();
      const newCriticalAlerts = alerts.filter(
        alert => alert.severity === 'critical' && !alert.resolved
      );
      
      newCriticalAlerts.forEach(alert => {
        uiStore.showToast('error', 'Performance Alert', alert.message);
      });
    }
  );
  
  // 6. UI theme changes affect settings
  useUIStore.subscribe(
    (state) => state.ui.theme,
    (theme) => {
      const settingsStore = useSettingsStore.getState();
      if (settingsStore.settings.ui.theme !== theme) {
        settingsStore.updateUISettings({ theme });
      }
    }
  );
  
  // 7. Machine status changes affect job queue
  useMachineStore.subscribe(
    (state) => state.status,
    (status, prevStatus) => {
      const jobStore = useJobStore.getState();
      
      if (status === 'emergency' || status === 'error') {
        // Stop current job if machine is in error state
        if (jobStore.currentJob) {
          jobStore.stopJob(jobStore.currentJob.id);
        }
      }
    }
  );
  
  // 8. Settings auto-save affects UI unsaved changes indicator
  useSettingsStore.subscribe(
    (state) => state.hasUnsavedChanges,
    (hasChanges) => {
      useUIStore.getState().setLoading('settings-save', hasChanges);
    }
  );
  
  console.log('✅ Cross-store subscriptions established');
}

// ============================================================================
// DEBUGGING SETUP
// ============================================================================

function setupDebugging() {
  console.log('🐛 Setting up store debugging...');
  
  // Set up debugging for each store
  Object.entries(stores).forEach(([name, store]) => {
    debugStore(store, name);
  });
  
  // Set up global store debugging commands
  if (typeof window !== 'undefined') {
    (window as any).stores = {
      machine: useMachineStore,
      job: useJobStore,
      ui: useUIStore,
      settings: useSettingsStore,
      performance: usePerformanceStore,
      
      // Utility functions
      getState: (storeName: StoreNames) => getStoreState(storeName),
      reset: resetAllStores,
      eventBus: storeEventBus,
      
      // Debugging helpers
      logAllStates: () => {
        console.group('📊 All Store States');
        Object.entries(stores).forEach(([name, store]) => {
          console.log(`${name}:`, store.getState());
        });
        console.groupEnd();
      },
      
      simulateError: () => {
        useMachineStore.getState().addError({
          type: 'system',
          severity: 'critical',
          message: 'Simulated error for testing',
        });
      },
      
      simulateJobComplete: () => {
        const jobStore = useJobStore.getState();
        if (jobStore.currentJob) {
          jobStore.completeJob(jobStore.currentJob.id);
        } else {
          const jobId = jobStore.addJob({
            name: 'Test Job',
            gcodeFile: 'test.gcode',
            material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
            toolSettings: { toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100 },
            workOrigin: { x: 0, y: 0, z: 0 },
            totalLines: 100,
            currentLine: 0,
            estimatedDuration: 60,
          });
          jobStore.startJob(jobId);
        }
      },
    };
    
    console.log('🎮 Debug commands available on window.stores');
  }
}

// ============================================================================
// STORE HEALTH MONITORING
// ============================================================================

/**
 * Monitor store health and performance
 */
export function monitorStoreHealth() {
  const healthCheck = () => {
    const results = {
      machine: checkMachineStoreHealth(),
      job: checkJobStoreHealth(),
      ui: checkUIStoreHealth(),
      settings: checkSettingsStoreHealth(),
      performance: checkPerformanceStoreHealth(),
    };
    
    const overallHealth = Object.values(results).every(health => health.status === 'healthy')
      ? 'healthy'
      : Object.values(results).some(health => health.status === 'critical')
      ? 'critical'
      : 'warning';
    
    storeEventBus.emit('store:health-check', {
      overall: overallHealth,
      stores: results,
      timestamp: new Date(),
    });
    
    return { overall: overallHealth, stores: results };
  };
  
  // Run health check every 30 seconds
  const intervalId = setInterval(healthCheck, 30000);
  
  // Run initial health check
  setTimeout(healthCheck, 5000);
  
  return () => clearInterval(intervalId);
}

function checkMachineStoreHealth() {
  const state = useMachineStore.getState();
  
  if (state.errors.some(e => e.severity === 'critical')) {
    return { status: 'critical' as const, message: 'Critical machine errors detected' };
  }
  
  if (!state.isConnected) {
    return { status: 'warning' as const, message: 'Machine not connected' };
  }
  
  return { status: 'healthy' as const, message: 'Machine operating normally' };
}

function checkJobStoreHealth() {
  const state = useJobStore.getState();
  
  if (state.failedJobs.length > state.completedJobs.length) {
    return { status: 'warning' as const, message: 'High job failure rate' };
  }
  
  return { status: 'healthy' as const, message: 'Job system operating normally' };
}

function checkUIStoreHealth() {
  const state = useUIStore.getState();
  
  if (Object.keys(state.loading).length > 10) {
    return { status: 'warning' as const, message: 'Many UI loading states active' };
  }
  
  return { status: 'healthy' as const, message: 'UI system operating normally' };
}

function checkSettingsStoreHealth() {
  const state = useSettingsStore.getState();
  
  if (!state.isLoaded) {
    return { status: 'critical' as const, message: 'Settings not loaded' };
  }
  
  if (Object.keys(state.validationErrors).length > 0) {
    return { status: 'warning' as const, message: 'Settings validation errors' };
  }
  
  return { status: 'healthy' as const, message: 'Settings system operating normally' };
}

function checkPerformanceStoreHealth() {
  const state = usePerformanceStore.getState();
  
  const criticalAlerts = state.alerts.filter(
    alert => alert.severity === 'critical' && !alert.resolved
  );
  
  if (criticalAlerts.length > 0) {
    return { status: 'critical' as const, message: `${criticalAlerts.length} critical performance alerts` };
  }
  
  if (state.currentMetrics.cpu.usage > 90) {
    return { status: 'warning' as const, message: 'High CPU usage detected' };
  }
  
  return { status: 'healthy' as const, message: 'Performance monitoring normal' };
}

// ============================================================================
// STORE PERSISTENCE MANAGER
// ============================================================================

/**
 * Manage store persistence and hydration
 */
export class StorePersistenceManager {
  private static instance: StorePersistenceManager;
  
  private constructor() {}
  
  static getInstance(): StorePersistenceManager {
    if (!StorePersistenceManager.instance) {
      StorePersistenceManager.instance = new StorePersistenceManager();
    }
    return StorePersistenceManager.instance;
  }
  
  /**
   * Export all store states to a JSON string
   */
  exportAllStores(): string {
    const allStates = {
      machine: useMachineStore.getState(),
      job: useJobStore.getState(),
      ui: useUIStore.getState(),
      settings: useSettingsStore.getState(),
      performance: usePerformanceStore.getState(),
      exportTimestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    return JSON.stringify(allStates, null, 2);
  }
  
  /**
   * Import and restore store states from JSON
   */
  async importAllStores(statesJson: string): Promise<void> {
    try {
      const allStates = JSON.parse(statesJson);
      
      // Validate the import data
      if (!allStates.version || !allStates.exportTimestamp) {
        throw new Error('Invalid export format');
      }
      
      // Reset all stores first
      resetAllStores();
      
      // Import each store's state
      if (allStates.settings) {
        await useSettingsStore.getState().importSettings(JSON.stringify(allStates.settings.settings));
      }
      
      // Re-initialize stores with new settings
      await initializeStores();
      
      storeEventBus.emit('stores:imported', allStates);
      
    } catch (error) {
      throw new Error(`Failed to import stores: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Create a backup of all store states
   */
  createBackup(): void {
    const backup = this.exportAllStores();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cnc-app-backup-${timestamp}.json`;
    
    if (typeof window !== 'undefined') {
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  }
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

// Auto-initialize stores when module is imported
if (typeof window !== 'undefined') {
  // Delay initialization to allow app to set up
  setTimeout(() => {
    initializeStores().catch(console.error);
    
    // Start health monitoring
    monitorStoreHealth();
  }, 1000);
}

// Export singleton instance
export const persistenceManager = StorePersistenceManager.getInstance();
