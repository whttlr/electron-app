/**
 * Performance Store Subscriptions
 * Auto-subscriptions and side effects for performance store
 */

import type { PerformanceStore } from './types';
import { performanceSelectors } from './selectors';

export const setupPerformanceSubscriptions = (usePerformanceStore: any) => {
  // Auto-calculate statistics when metrics update
  usePerformanceStore.subscribe(
    (state: PerformanceStore) => state.metricsHistory.length,
    () => {
      usePerformanceStore.getState().calculateStatistics();
    },
  );

  // Auto-apply optimizations when performance degrades
  usePerformanceStore.subscribe(
    (state: PerformanceStore) => performanceSelectors.systemHealth(state).overall,
    (health: 'good' | 'warning' | 'critical') => {
      const store = usePerformanceStore.getState();

      if (health === 'critical' && !store.optimizations.lowPowerMode) {
        // Auto-enable low power mode in critical situations
        store.updateOptimizations({ lowPowerMode: true });
      }
    },
  );

  // Start monitoring on store initialization
  if (typeof window !== 'undefined') {
    // Auto-start monitoring with a small delay
    setTimeout(() => {
      usePerformanceStore.getState().startMonitoring();
    }, 2000);
  }
};
