/**
 * Performance Store Helpers
 * Helper methods for performance monitoring and optimization
 */

import type { PerformanceMetrics, PerformanceAlert } from '../types';
import type { PerformanceStore } from './types';

export const createPerformanceHelpers = (get: () => PerformanceStore) => ({
  checkThresholds: (metrics: PerformanceMetrics) => {
    const state = get();
    const thresholds = state.alertThresholds;

    // CPU threshold check
    if (metrics.cpu.usage > thresholds.cpu.critical) {
      get().addAlert({
        type: 'cpu',
        severity: 'critical',
        message: `Critical CPU usage: ${metrics.cpu.usage}%`,
      });
    } else if (metrics.cpu.usage > thresholds.cpu.warning) {
      get().addAlert({
        type: 'cpu',
        severity: 'medium',
        message: `High CPU usage: ${metrics.cpu.usage}%`,
      });
    }

    // Memory threshold check
    const memoryPercent = (metrics.memory.used / metrics.memory.total) * 100;
    if (memoryPercent > thresholds.memory.critical) {
      get().addAlert({
        type: 'memory',
        severity: 'critical',
        message: `Critical memory usage: ${Math.round(memoryPercent)}%`,
      });
    } else if (memoryPercent > thresholds.memory.warning) {
      get().addAlert({
        type: 'memory',
        severity: 'medium',
        message: `High memory usage: ${Math.round(memoryPercent)}%`,
      });
    }

    // Network threshold check
    if (metrics.network.latency > thresholds.network.critical) {
      get().addAlert({
        type: 'network',
        severity: 'high',
        message: `High network latency: ${Math.round(metrics.network.latency)}ms`,
      });
    }

    // Rendering threshold check
    if (metrics.rendering.fps < thresholds.rendering.critical) {
      get().addAlert({
        type: 'rendering',
        severity: 'high',
        message: `Low FPS detected: ${metrics.rendering.fps}`,
      });
    }
  },

  applyOptimizations: (optimizations: Partial<PerformanceStore['optimizations']>) => {
    // In a real implementation, these would apply actual optimizations
    if (optimizations.lowPowerMode) {
      // Reduce update frequencies, disable animations, etc.
    }

    if (optimizations.enableCaching) {
      // Enable component memoization, data caching, etc.
    }

    if (optimizations.enableVirtualization) {
      // Enable list virtualization for large datasets
    }
  },

  reset: (set: any) => () => {
    const { performanceMonitor } = require('./PerformanceMonitor');
    const {
      initialMetrics, defaultThresholds, defaultOptimizations, defaultStatistics,
    } = require('./defaults');

    set((state: PerformanceStore) => {
      state.currentMetrics = JSON.parse(JSON.stringify(initialMetrics));
      state.metricsHistory = [];
      state.alerts = [];
      state.alertThresholds = JSON.parse(JSON.stringify(defaultThresholds));
      state.isMonitoring = false;
      state.lastUpdate = null;
      state.optimizations = JSON.parse(JSON.stringify(defaultOptimizations));
      state.statistics = JSON.parse(JSON.stringify(defaultStatistics));

      performanceMonitor.stop();
    });
  },
});
