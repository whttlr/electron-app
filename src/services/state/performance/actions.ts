/**
 * Performance Store Actions
 * Store actions and helper methods for performance monitoring
 */

import type { PerformanceMetrics, PerformanceAlert } from '../types';
import type { PerformanceStore } from './types';
import { performanceMonitor } from './PerformanceMonitor';

export const createPerformanceActions = (set: any, get: () => PerformanceStore) => ({
  updateMetrics: (metricsUpdate: Partial<PerformanceMetrics>) => set((state: PerformanceStore) => {
    // Update current metrics
    Object.assign(state.currentMetrics, metricsUpdate);
    
    // Update history arrays for trending
    if (metricsUpdate.cpu?.usage !== undefined) {
      state.currentMetrics.cpu.history.push(metricsUpdate.cpu.usage);
      if (state.currentMetrics.cpu.history.length > 100) {
        state.currentMetrics.cpu.history = state.currentMetrics.cpu.history.slice(-100);
      }
    }
    
    if (metricsUpdate.memory?.used !== undefined) {
      const percentage = (metricsUpdate.memory.used / state.currentMetrics.memory.total) * 100;
      state.currentMetrics.memory.history.push(percentage);
      if (state.currentMetrics.memory.history.length > 100) {
        state.currentMetrics.memory.history = state.currentMetrics.memory.history.slice(-100);
      }
    }
    
    // Add to metrics history
    state.metricsHistory.push({
      ...state.currentMetrics,
      timestamp: new Date(),
    });
    
    // Keep only last 1000 entries
    if (state.metricsHistory.length > 1000) {
      state.metricsHistory = state.metricsHistory.slice(-1000);
    }
    
    state.lastUpdate = new Date();
    
    // Check for threshold violations
    get().checkThresholds(state.currentMetrics);
  }),
  
  startMonitoring: (interval = 1000) => set((state: PerformanceStore) => {
    if (state.isMonitoring) return;
    
    state.isMonitoring = true;
    state.monitoringInterval = interval;
    state.statistics.startTime = new Date();
    
    performanceMonitor.start((metrics) => {
      get().updateMetrics(metrics);
    }, interval);
  }),
  
  stopMonitoring: () => set((state: PerformanceStore) => {
    state.isMonitoring = false;
    performanceMonitor.stop();
  }),
  
  addAlert: (alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>) => set((state: PerformanceStore) => {
    const alert: PerformanceAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
    };
    
    state.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (state.alerts.length > 50) {
      state.alerts = state.alerts.slice(-50);
    }
  }),
  
  resolveAlert: (alertId: string) => set((state: PerformanceStore) => {
    const alert = state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }),
  
  clearAlerts: (type?: PerformanceAlert['type']) => set((state: PerformanceStore) => {
    if (type) {
      state.alerts = state.alerts.filter(a => a.type !== type);
    } else {
      state.alerts = [];
    }
  }),
  
  updateThresholds: (thresholds: Partial<PerformanceStore['alertThresholds']>) => set((state: PerformanceStore) => {
    Object.assign(state.alertThresholds, thresholds);
  }),
  
  updateOptimizations: (optimizations: Partial<PerformanceStore['optimizations']>) => set((state: PerformanceStore) => {
    Object.assign(state.optimizations, optimizations);
    
    // Apply optimizations immediately
    get().applyOptimizations(optimizations);
  }),
  
  clearHistory: () => set((state: PerformanceStore) => {
    state.metricsHistory = [];
    state.currentMetrics.cpu.history = [];
    state.currentMetrics.memory.history = [];
  }),
  
  getMetricsSnapshot: () => {
    return JSON.parse(JSON.stringify(get().currentMetrics));
  },
  
  calculateStatistics: () => set((state: PerformanceStore) => {
    if (state.metricsHistory.length === 0) return;
    
    const cpuValues = state.metricsHistory.map(m => m.cpu.usage);
    const memoryValues = state.metricsHistory.map(m => 
      (m.memory.used / m.memory.total) * 100
    );
    const latencyValues = state.metricsHistory.map(m => m.network.latency);
    const fpsValues = state.metricsHistory.map(m => m.rendering.fps);
    
    state.statistics.averageCpu = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    state.statistics.averageMemory = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    state.statistics.averageLatency = latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length;
    state.statistics.averageFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    
    if (state.statistics.startTime) {
      state.statistics.uptimeSeconds = Math.floor(
        (Date.now() - state.statistics.startTime.getTime()) / 1000
      );
    }
  }),
  
  exportMetrics: (timeRange?: { start: Date; end: Date }) => {
    const state = get();
    let data = state.metricsHistory;
    
    if (timeRange) {
      data = data.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      timeRange,
      statistics: state.statistics,
      metrics: data,
      alerts: state.alerts,
      thresholds: state.alertThresholds,
    }, null, 2);
  },
  
  getPerformanceReport: () => {
    const state = get();
    const metrics = state.currentMetrics;
    const stats = state.statistics;
    
    const summary = {
      cpu: {
        current: metrics.cpu.usage,
        average: Math.round(stats.averageCpu),
        status: metrics.cpu.usage > state.alertThresholds.cpu.critical ? 'critical' :
               metrics.cpu.usage > state.alertThresholds.cpu.warning ? 'warning' : 'good',
      },
      memory: {
        current: Math.round((metrics.memory.used / metrics.memory.total) * 100),
        average: Math.round(stats.averageMemory),
        status: (metrics.memory.used / metrics.memory.total) * 100 > state.alertThresholds.memory.critical ? 'critical' :
               (metrics.memory.used / metrics.memory.total) * 100 > state.alertThresholds.memory.warning ? 'warning' : 'good',
      },
      network: {
        latency: Math.round(metrics.network.latency),
        averageLatency: Math.round(stats.averageLatency),
        status: metrics.network.latency > state.alertThresholds.network.critical ? 'critical' :
               metrics.network.latency > state.alertThresholds.network.warning ? 'warning' : 'good',
      },
      rendering: {
        fps: metrics.rendering.fps,
        averageFps: Math.round(stats.averageFps),
        status: metrics.rendering.fps < state.alertThresholds.rendering.critical ? 'critical' :
               metrics.rendering.fps < state.alertThresholds.rendering.warning ? 'warning' : 'good',
      },
    };
    
    const recommendations: string[] = [];
    
    if (summary.cpu.status === 'critical') {
      recommendations.push('High CPU usage detected. Consider enabling low power mode or reducing update frequencies.');
    }
    
    if (summary.memory.status === 'critical') {
      recommendations.push('High memory usage detected. Consider clearing history or enabling memory optimizations.');
    }
    
    if (summary.network.status === 'warning') {
      recommendations.push('Network latency is elevated. Check connection quality.');
    }
    
    if (summary.rendering.status === 'warning') {
      recommendations.push('Low FPS detected. Consider enabling rendering optimizations or reducing visual effects.');
    }
    
    const unresolvedAlerts = state.alerts.filter(a => !a.resolved);
    
    return {
      summary,
      recommendations,
      alerts: unresolvedAlerts,
    };
  },
});