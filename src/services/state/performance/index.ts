/**
 * Performance Service Module
 *
 * Zustand store for performance metrics, monitoring, optimization,
 * and system resource tracking.
 */

import create from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
// import { immer } from 'zustand/middleware';
import type { PerformanceStore } from './types';
import {
  initialMetrics, defaultThresholds, defaultOptimizations, defaultStatistics,
} from './defaults';
import { createPerformanceActions } from './actions';
import { createPerformanceHelpers } from './helpers';
import { setupPerformanceSubscriptions } from './subscriptions';

export * from './types';
export { performanceSelectors } from './selectors';
export { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';

// Create the store
export const usePerformanceStore = create<PerformanceStore>()((
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        currentMetrics: initialMetrics,
        metricsHistory: [],
        alerts: [],
        alertThresholds: defaultThresholds,
        isMonitoring: false,
        monitoringInterval: 1000,
        lastUpdate: null,
        optimizations: defaultOptimizations,
        statistics: defaultStatistics,

        // Actions
        ...createPerformanceActions(set, get),

        // Helper Methods
        ...createPerformanceHelpers(get),

        // Reset method
        reset: createPerformanceHelpers(get).reset(set),
      }),
    ),
    {
      name: 'performance-store',
      storage: localStorage,
      partialize: (state) => ({
        alertThresholds: state.alertThresholds,
        optimizations: state.optimizations,
        alerts: state.alerts.filter((a) => !a.resolved), // Only persist unresolved alerts
      }),
      version: 1,
    },
  )
));

// Setup subscriptions
setupPerformanceSubscriptions(usePerformanceStore);

// Default export for backward compatibility
export default usePerformanceStore;
