/**
 * Performance Store Types
 * Type definitions for performance monitoring and metrics
 */

import type { PerformanceMetrics, PerformanceAlert } from '../types';

export interface PerformanceStore {
  // Current Metrics
  currentMetrics: PerformanceMetrics;
  
  // Historical Data
  metricsHistory: Array<PerformanceMetrics & { timestamp: Date }>;
  
  // Alerts and Monitoring
  alerts: PerformanceAlert[];
  alertThresholds: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    network: { warning: number; critical: number };
    rendering: { warning: number; critical: number };
    machine: { warning: number; critical: number };
  };
  
  // Monitoring State
  isMonitoring: boolean;
  monitoringInterval: number;
  lastUpdate: Date | null;
  
  // Optimization Flags
  optimizations: {
    enableVirtualization: boolean;
    enableLazyLoading: boolean;
    enableCaching: boolean;
    enableCompression: boolean;
    enableBatching: boolean;
    lowPowerMode: boolean;
  };
  
  // Statistics
  statistics: {
    averageCpu: number;
    averageMemory: number;
    averageLatency: number;
    averageFps: number;
    uptimeSeconds: number;
    startTime: Date | null;
  };
  
  // Actions
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  startMonitoring: (interval?: number) => void;
  stopMonitoring: () => void;
  addAlert: (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  resolveAlert: (alertId: string) => void;
  clearAlerts: (type?: PerformanceAlert['type']) => void;
  updateThresholds: (thresholds: Partial<PerformanceStore['alertThresholds']>) => void;
  updateOptimizations: (optimizations: Partial<PerformanceStore['optimizations']>) => void;
  clearHistory: () => void;
  getMetricsSnapshot: () => PerformanceMetrics;
  calculateStatistics: () => void;
  exportMetrics: (timeRange?: { start: Date; end: Date }) => string;
  getPerformanceReport: () => {
    summary: any;
    recommendations: string[];
    alerts: PerformanceAlert[];
  };
  
  reset: () => void;
}

export interface SystemHealthStatus {
  overall: 'good' | 'warning' | 'critical';
  cpu: 'good' | 'warning' | 'critical';
  memory: 'good' | 'warning' | 'critical';
  network: 'good' | 'warning' | 'critical';
  rendering: 'good' | 'warning' | 'critical';
}