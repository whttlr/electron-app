/**
 * Performance Store Defaults
 * Default values and initial state for performance monitoring
 */

import type { PerformanceMetrics } from '../types';

export const initialMetrics: PerformanceMetrics = {
  cpu: {
    usage: 0,
    history: [],
  },
  memory: {
    used: 0,
    total: 8192, // 8GB default
    history: [],
  },
  network: {
    latency: 0,
    bandwidth: 0,
    packetsLost: 0,
  },
  rendering: {
    fps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
  },
  machine: {
    commandQueue: 0,
    responseTime: 0,
    errorRate: 0,
  },
};

export const defaultThresholds = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 80, critical: 95 },
  network: { warning: 200, critical: 500 },
  rendering: { warning: 30, critical: 15 },
  machine: { warning: 100, critical: 500 },
};

export const defaultOptimizations = {
  enableVirtualization: true,
  enableLazyLoading: true,
  enableCaching: true,
  enableCompression: false,
  enableBatching: true,
  lowPowerMode: false,
};

export const defaultStatistics = {
  averageCpu: 0,
  averageMemory: 0,
  averageLatency: 0,
  averageFps: 60,
  uptimeSeconds: 0,
  startTime: null,
};
