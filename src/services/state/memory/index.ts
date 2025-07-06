/**
 * Memory Management Module
 *
 * Advanced memory management system with monitoring, optimization,
 * and automatic cleanup for the CNC application.
 */

import { MemoryManager } from './MemoryManager';

export * from './types';
export { MemoryManager } from './MemoryManager';
export { ObjectPool } from './ObjectPool';
export { RingBuffer, WeakCache } from './dataStructures';
export { memoryAwareDebounce, boundedMemoize, truncateLargeStrings } from './utils';

// Singleton instance
export const memoryManager = new MemoryManager();

// Auto-start monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  memoryManager.startMonitoring();

  // Add to window for debugging
  (window as any).memoryManager = memoryManager;
}

// Default export for backward compatibility
export default {
  MemoryManager,
  memoryManager,
  ObjectPool: require('./ObjectPool').ObjectPool,
  RingBuffer: require('./dataStructures').RingBuffer,
  WeakCache: require('./dataStructures').WeakCache,
  memoryAwareDebounce: require('./utils').memoryAwareDebounce,
  boundedMemoize: require('./utils').boundedMemoize,
  truncateLargeStrings: require('./utils').truncateLargeStrings,
};
