/**
 * Performance Store Selectors
 * State selectors and computed values for performance store
 */

import type { PerformanceStore, SystemHealthStatus } from './types';

export const performanceSelectors = {
  currentMetrics: (state: PerformanceStore) => state.currentMetrics,
  isMonitoring: (state: PerformanceStore) => state.isMonitoring,
  alerts: (state: PerformanceStore) => state.alerts,
  unresolvedAlerts: (state: PerformanceStore) => state.alerts.filter((a) => !a.resolved),
  criticalAlerts: (state: PerformanceStore) => state.alerts.filter((a) => a.severity === 'critical' && !a.resolved),
  statistics: (state: PerformanceStore) => state.statistics,
  optimizations: (state: PerformanceStore) => state.optimizations,
  thresholds: (state: PerformanceStore) => state.alertThresholds,
  metricsHistory: (state: PerformanceStore) => state.metricsHistory,
  lastUpdate: (state: PerformanceStore) => state.lastUpdate,
  cpuTrend: (state: PerformanceStore) => state.currentMetrics.cpu.history,
  memoryTrend: (state: PerformanceStore) => state.currentMetrics.memory.history,
  systemHealth: (state: PerformanceStore): SystemHealthStatus => {
    const metrics = state.currentMetrics;
    const thresholds = state.alertThresholds;

    const cpuStatus = metrics.cpu.usage > thresholds.cpu.critical ? 'critical'
      : metrics.cpu.usage > thresholds.cpu.warning ? 'warning' : 'good';

    const memoryPercent = (metrics.memory.used / metrics.memory.total) * 100;
    const memoryStatus = memoryPercent > thresholds.memory.critical ? 'critical'
      : memoryPercent > thresholds.memory.warning ? 'warning' : 'good';

    const networkStatus = metrics.network.latency > thresholds.network.critical ? 'critical'
      : metrics.network.latency > thresholds.network.warning ? 'warning' : 'good';

    const renderingStatus = metrics.rendering.fps < thresholds.rendering.critical ? 'critical'
      : metrics.rendering.fps < thresholds.rendering.warning ? 'warning' : 'good';

    const overallStatus = [cpuStatus, memoryStatus, networkStatus, renderingStatus].includes('critical') ? 'critical'
      : [cpuStatus, memoryStatus, networkStatus, renderingStatus].includes('warning') ? 'warning' : 'good';

    return {
      overall: overallStatus,
      cpu: cpuStatus,
      memory: memoryStatus,
      network: networkStatus,
      rendering: renderingStatus,
    };
  },
};
