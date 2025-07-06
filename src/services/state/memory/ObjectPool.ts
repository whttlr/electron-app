/**
 * Object Pool for Memory Efficiency
 * Reusable object pool to reduce garbage collection pressure
 */

import type { ObjectPoolStats } from './types';

export class ObjectPool<T> {
  private pool: T[] = [];

  private factory: () => T;

  private reset: (obj: T) => void;

  private maxSize: number;

  private created = 0;

  private inUse = 0;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize: number = 100,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  /**
   * Get object from pool
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
      this.created++;
    }

    this.inUse++;
    return obj;
  }

  /**
   * Return object to pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }

    this.inUse--;
  }

  /**
   * Clear pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Get pool statistics
   */
  getStats(): ObjectPoolStats {
    return {
      poolSize: this.pool.length,
      created: this.created,
      inUse: this.inUse,
      maxSize: this.maxSize,
    };
  }
}
