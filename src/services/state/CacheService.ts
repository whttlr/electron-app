/**
 * Cache Manager
 *
 * Advanced caching system with memory management, persistence,
 * and intelligent cache strategies for CNC application data.
 */

import type { CacheEntry, CacheConfig, CacheMetrics } from './types';

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  private config: CacheConfig;

  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    entryCount: 0,
    hitRate: 0,
  };

  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 50, // MB
      maxAge: config.maxAge || 3600000, // 1 hour
      maxEntries: config.maxEntries || 1000,
      evictionPolicy: config.evictionPolicy || 'lru',
    };

    this.startCleanupTimer();
  }

  /**
   * Get item from cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry is expired
    if (Date.now() > entry.expiry.getTime()) {
      this.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access info for LRU/LFU
    entry.lastAccess = new Date();
    entry.accessCount++;

    this.metrics.hits++;
    this.updateHitRate();

    return entry.data as T;
  }

  /**
   * Set item in cache
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const now = new Date();
    const expiry = new Date(now.getTime() + (ttl || this.config.maxAge));
    const size = this.calculateSize(data);

    // Check if we need to evict entries
    this.ensureCapacity(size);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry,
      accessCount: 1,
      lastAccess: now,
      size,
    };

    this.cache.set(key, entry);
    this.updateMetrics();
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateMetrics();
    }
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiry.getTime()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.updateMetrics();
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size in MB
   */
  getSize(): number {
    return this.metrics.size;
  }

  /**
   * Get number of entries
   */
  getEntryCount(): number {
    return this.cache.size;
  }

  /**
   * Manually trigger cleanup
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry.getTime()) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🗑️ Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Export cache data for persistence
   */
  export(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        expiry: entry.expiry.toISOString(),
        lastAccess: entry.lastAccess.toISOString(),
      })),
      metrics: this.metrics,
      config: this.config,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import cache data from persistence
   */
  import(data: string): void {
    try {
      const importData = JSON.parse(data);

      this.clear();

      if (importData.entries) {
        importData.entries.forEach((item: any) => {
          const entry: CacheEntry = {
            data: item.data,
            timestamp: new Date(item.timestamp),
            expiry: new Date(item.expiry),
            accessCount: item.accessCount || 1,
            lastAccess: new Date(item.lastAccess || item.timestamp),
            size: item.size || 0,
          };

          // Only import non-expired entries
          if (Date.now() < entry.expiry.getTime()) {
            this.cache.set(item.key, entry);
          }
        });
      }

      this.updateMetrics();
      console.log(`💾 Cache import: loaded ${this.cache.size} entries`);
    } catch (error) {
      console.error('Failed to import cache data:', error);
    }
  }

  /**
   * Destroy cache manager
   */
  destroy(): void {
    this.clear();
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Private methods

  private calculateSize(data: any): number {
    // Rough estimate of object size in bytes
    const str = JSON.stringify(data);
    return new Blob([str]).size / (1024 * 1024); // Convert to MB
  }

  private updateMetrics(): void {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    this.metrics.size = totalSize;
    this.metrics.entryCount = this.cache.size;
    this.updateHitRate();
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private ensureCapacity(newEntrySize: number): void {
    // Check max entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictEntries(1);
    }

    // Check max size
    while (this.metrics.size + newEntrySize > this.config.maxSize && this.cache.size > 0) {
      this.evictEntries(1);
    }
  }

  private evictEntries(count: number): void {
    const entries = Array.from(this.cache.entries());
    let toEvict: string[] = [];

    switch (this.config.evictionPolicy) {
      case 'lru':
        // Least recently used
        toEvict = entries
          .sort(([, a], [, b]) => a.lastAccess.getTime() - b.lastAccess.getTime())
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'lfu':
        // Least frequently used
        toEvict = entries
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)
          .slice(0, count)
          .map(([key]) => key);
        break;

      case 'fifo':
        // First in, first out
        toEvict = entries
          .sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime())
          .slice(0, count)
          .map(([key]) => key);
        break;
    }

    toEvict.forEach((key) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });

    this.updateMetrics();
  }

  private startCleanupTimer(): void {
    // Run cleanup every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
}

// ============================================================================
// SPECIALIZED CACHE INSTANCES
// ============================================================================

/**
 * Machine data cache - for real-time machine state and position history
 */
export const machineCache = new CacheManager({
  maxSize: 10, // 10MB
  maxAge: 600000, // 10 minutes
  maxEntries: 500,
  evictionPolicy: 'lru',
});

/**
 * Job data cache - for job files, gcode, and execution history
 */
export const jobCache = new CacheManager({
  maxSize: 25, // 25MB
  maxAge: 3600000, // 1 hour
  maxEntries: 100,
  evictionPolicy: 'lru',
});

/**
 * UI data cache - for component states, form data, and user preferences
 */
export const uiCache = new CacheManager({
  maxSize: 5, // 5MB
  maxAge: 1800000, // 30 minutes
  maxEntries: 200,
  evictionPolicy: 'lfu',
});

/**
 * API response cache - for external API calls and responses
 */
export const apiCache = new CacheManager({
  maxSize: 15, // 15MB
  maxAge: 900000, // 15 minutes
  maxEntries: 300,
  evictionPolicy: 'lru',
});

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Create a cached version of an async function
 */
export function createCachedFunction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  cacheInstance: CacheManager,
  keyGenerator?: (...args: TArgs) => string,
  ttl?: number,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    // Try to get from cache first
    const cached = cacheInstance.get<TReturn>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cacheInstance.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

/**
 * Cache decorator for class methods
 */
export function Cached(
  cacheInstance: CacheManager,
  keyPrefix?: string,
  ttl?: number,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${keyPrefix || target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      const cached = cacheInstance.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cacheInstance.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(cacheInstance: CacheManager, pattern: string | RegExp): number {
  const keys = cacheInstance.keys();
  let deletedCount = 0;

  keys.forEach((key) => {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        cacheInstance.delete(key);
        deletedCount++;
      }
    } else if (pattern.test(key)) {
      cacheInstance.delete(key);
      deletedCount++;
    }
  });

  return deletedCount;
}

/**
 * Cache warming utility
 */
export async function warmCache<T>(
  cacheInstance: CacheManager,
  dataSources: Array<{ key: string; loader: () => Promise<T>; ttl?: number }>,
): Promise<void> {
  console.log(`🔥 Warming cache with ${dataSources.length} entries...`);

  const promises = dataSources.map(async ({ key, loader, ttl }) => {
    try {
      const data = await loader();
      cacheInstance.set(key, data, ttl);
    } catch (error) {
      console.warn(`Failed to warm cache for key ${key}:`, error);
    }
  });

  await Promise.all(promises);
  console.log('✅ Cache warming complete');
}

/**
 * Global cache statistics
 */
export function getCacheStatistics() {
  return {
    machine: machineCache.getMetrics(),
    job: jobCache.getMetrics(),
    ui: uiCache.getMetrics(),
    api: apiCache.getMetrics(),
    total: {
      size: machineCache.getSize() + jobCache.getSize() + uiCache.getSize() + apiCache.getSize(),
      entries: machineCache.getEntryCount() + jobCache.getEntryCount() + uiCache.getEntryCount() + apiCache.getEntryCount(),
    },
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  machineCache.clear();
  jobCache.clear();
  uiCache.clear();
  apiCache.clear();
  console.log('🗑️ All caches cleared');
}

// ============================================================================
// AUTO-CLEANUP AND MONITORING
// ============================================================================

// Monitor cache health
if (typeof window !== 'undefined') {
  setInterval(() => {
    const stats = getCacheStatistics();

    // Log statistics periodically
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Cache Statistics:', stats);
    }

    // Warn if cache size is getting large
    if (stats.total.size > 80) {
      console.warn('⚠️ Cache size is getting large:', stats.total.size, 'MB');
    }

    // Clean up caches if memory is low
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      const memoryUsagePercent = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;

      if (memoryUsagePercent > 85) {
        console.warn('⚠️ High memory usage detected, clearing caches');
        clearAllCaches();
      }
    }
  }, 60000); // Every minute
}

// Export singleton instances and utilities
export default {
  machineCache,
  jobCache,
  uiCache,
  apiCache,
  CacheManager,
  createCachedFunction,
  Cached,
  invalidateCache,
  warmCache,
  getCacheStatistics,
  clearAllCaches,
};
