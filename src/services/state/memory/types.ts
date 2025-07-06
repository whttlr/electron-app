/**
 * Memory Management Types
 * Type definitions for memory monitoring and optimization
 */

export interface MemoryMetrics {
  used: number;
  total: number;
  limit: number;
  usagePercent: number;
  available: number;
  pressure: 'low' | 'moderate' | 'high' | 'critical';
}

export interface MemoryLeakDetector {
  id: string;
  baseline: number;
  current: number;
  growth: number;
  growthRate: number;
  samples: number[];
  timestamp: Date;
}

export interface MemoryOptimizationResult {
  before: MemoryMetrics;
  after: MemoryMetrics;
  freed: number;
  actions: string[];
  timestamp: Date;
}

export interface MemoryThresholds {
  warning: number;
  high: number;
  critical: number;
}

export interface MemoryTrend {
  trend: 'increasing' | 'stable' | 'decreasing';
  rate: number; // MB per minute
}

export interface ObjectPoolStats {
  poolSize: number;
  created: number;
  inUse: number;
  maxSize: number;
}
