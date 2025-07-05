/**
 * Memory Manager Class
 * Main memory monitoring and optimization system
 */

import { clearAllCaches } from '../cacheManager';
import { storeEventBus } from '../storeUtils';
import type { 
  MemoryMetrics, 
  MemoryLeakDetector, 
  MemoryOptimizationResult, 
  MemoryThresholds,
  MemoryTrend 
} from './types';

export class MemoryManager {
  private monitoring = false;
  private monitorInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private leakDetectors: Map<string, MemoryLeakDetector> = new Map();
  private metrics: MemoryMetrics[] = [];
  private thresholds: MemoryThresholds = {
    warning: 70,
    high: 80,
    critical: 90,
  };
  private callbacks: Set<(metrics: MemoryMetrics) => void> = new Set();
  
  /**
   * Get current memory metrics
   */
  getMemoryMetrics(): MemoryMetrics {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      const used = mem.usedJSHeapSize;
      const total = mem.totalJSHeapSize;
      const limit = mem.jsHeapSizeLimit;
      const usagePercent = (used / limit) * 100;
      const available = limit - used;
      
      let pressure: MemoryMetrics['pressure'] = 'low';
      if (usagePercent >= this.thresholds.critical) {
        pressure = 'critical';
      } else if (usagePercent >= this.thresholds.high) {
        pressure = 'high';
      } else if (usagePercent >= this.thresholds.warning) {
        pressure = 'moderate';
      }
      
      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        limit: Math.round(limit / 1024 / 1024), // MB
        usagePercent: Math.round(usagePercent * 100) / 100,
        available: Math.round(available / 1024 / 1024), // MB
        pressure,
      };
    }
    
    // Fallback for environments without performance.memory
    return {
      used: 0,
      total: 0,
      limit: 0,
      usagePercent: 0,
      available: 0,
      pressure: 'low',
    };
  }
  
  /**
   * Start memory monitoring
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoring) return;
    
    console.log('🧠 Starting memory monitoring...');
    this.monitoring = true;
    
    this.monitorInterval = setInterval(() => {
      const metrics = this.getMemoryMetrics();
      
      // Store metrics history
      this.metrics.push(metrics);
      if (this.metrics.length > 60) {
        this.metrics = this.metrics.slice(-60); // Keep last 60 samples
      }
      
      // Notify callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in memory callback:', error);
        }
      });
      
      // Check for memory pressure
      this.checkMemoryPressure(metrics);
      
      // Emit metrics event
      storeEventBus.emit('memory:metrics', metrics);
      
    }, interval);
    
    // Start automatic cleanup
    this.startAutomaticCleanup();
  }
  
  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (!this.monitoring) return;
    
    console.log('🛑 Stopping memory monitoring');
    this.monitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }
  
  /**
   * Subscribe to memory metrics updates
   */
  subscribe(callback: (metrics: MemoryMetrics) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
  
  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): boolean {
    if (typeof (global as any).gc === 'function') {
      console.log('🗑️ Forcing garbage collection...');
      (global as any).gc();
      return true;
    }
    return false;
  }
  
  /**
   * Optimize memory usage
   */
  async optimizeMemory(): Promise<MemoryOptimizationResult> {
    console.log('🚀 Starting memory optimization...');
    
    const before = this.getMemoryMetrics();
    const actions: string[] = [];
    
    // 1. Clear caches
    clearAllCaches();
    actions.push('Cleared all caches');
    
    // 2. Clear large arrays and objects
    this.clearLargeObjects();
    actions.push('Cleared large objects');
    
    // 3. Cancel pending operations
    this.cancelPendingOperations();
    actions.push('Cancelled pending operations');
    
    // 4. Remove event listeners
    this.cleanupEventListeners();
    actions.push('Cleaned up event listeners');
    
    // 5. Force garbage collection if available
    if (this.forceGarbageCollection()) {
      actions.push('Forced garbage collection');
    }
    
    // Wait a bit for cleanup to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const after = this.getMemoryMetrics();
    const freed = before.used - after.used;
    
    const result: MemoryOptimizationResult = {
      before,
      after,
      freed: Math.max(0, freed),
      actions,
      timestamp: new Date(),
    };
    
    console.log(`✅ Memory optimization complete. Freed ${result.freed}MB`);
    storeEventBus.emit('memory:optimized', result);
    
    return result;
  }
  
  /**
   * Create a memory leak detector
   */
  createLeakDetector(id: string): void {
    const baseline = this.getMemoryMetrics().used;
    
    this.leakDetectors.set(id, {
      id,
      baseline,
      current: baseline,
      growth: 0,
      growthRate: 0,
      samples: [baseline],
      timestamp: new Date(),
    });
  }
  
  /**
   * Update leak detector
   */
  updateLeakDetector(id: string): MemoryLeakDetector | null {
    const detector = this.leakDetectors.get(id);
    if (!detector) return null;
    
    const current = this.getMemoryMetrics().used;
    detector.current = current;
    detector.samples.push(current);
    
    // Keep last 10 samples
    if (detector.samples.length > 10) {
      detector.samples = detector.samples.slice(-10);
    }
    
    // Calculate growth
    detector.growth = current - detector.baseline;
    
    // Calculate growth rate (MB per minute)
    const timeElapsed = (Date.now() - detector.timestamp.getTime()) / 1000 / 60; // minutes
    detector.growthRate = detector.growth / timeElapsed;
    
    // Check for potential leak
    if (detector.growthRate > 5) {
      // Growing more than 5MB per minute
      console.warn(`⚠️ Potential memory leak detected in ${id}: ${detector.growthRate.toFixed(2)}MB/min`);
      storeEventBus.emit('memory:leak-detected', detector);
    }
    
    return detector;
  }
  
  /**
   * Remove leak detector
   */
  removeLeakDetector(id: string): void {
    this.leakDetectors.delete(id);
  }
  
  /**
   * Get memory usage trend
   */
  getMemoryTrend(): MemoryTrend {
    if (this.metrics.length < 2) {
      return { trend: 'stable', rate: 0 };
    }
    
    const recent = this.metrics.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiff = 10 * 5; // 10 samples * 5 seconds
    const memDiff = last.used - first.used;
    const rate = (memDiff / timeDiff) * 60; // MB per minute
    
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (rate > 1) {
      trend = 'increasing';
    } else if (rate < -1) {
      trend = 'decreasing';
    }
    
    return { trend, rate };
  }
  
  /**
   * Set memory thresholds
   */
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    Object.assign(this.thresholds, thresholds);
  }
  
  // Private methods
  
  private checkMemoryPressure(metrics: MemoryMetrics): void {
    if (metrics.pressure === 'critical') {
      console.error('🚨 Critical memory pressure detected!');
      // Automatically optimize memory
      this.optimizeMemory().catch(console.error);
    } else if (metrics.pressure === 'high') {
      console.warn('⚠️ High memory pressure detected');
      // Clear caches only
      clearAllCaches();
    }
  }
  
  private startAutomaticCleanup(): void {
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => {
      const metrics = this.getMemoryMetrics();
      
      if (metrics.pressure === 'high' || metrics.pressure === 'critical') {
        console.log('🧹 Running automatic memory cleanup...');
        this.optimizeMemory().catch(console.error);
      }
    }, 30000);
  }
  
  private clearLargeObjects(): void {
    // Clear large arrays and objects from stores
    storeEventBus.emit('memory:clear-large-objects');
  }
  
  private cancelPendingOperations(): void {
    // Cancel any pending async operations
    storeEventBus.emit('memory:cancel-pending');
  }
  
  private cleanupEventListeners(): void {
    // Remove unused event listeners
    storeEventBus.emit('memory:cleanup-listeners');
  }
}