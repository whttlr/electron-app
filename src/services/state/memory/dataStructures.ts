/**
 * Memory-Efficient Data Structures
 * Specialized data structures optimized for memory usage
 */

/**
 * Ring buffer for fixed-size collections
 */
export class RingBuffer<T> {
  private buffer: (T | undefined)[];

  private head = 0;

  private tail = 0;

  private size = 0;

  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  pop(): T | undefined {
    if (this.size === 0) return undefined;

    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.size--;

    return item;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined;

    const actualIndex = (this.head + index) % this.capacity;
    return this.buffer[actualIndex];
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const item = this.get(i);
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  getSize(): number {
    return this.size;
  }

  isFull(): boolean {
    return this.size === this.capacity;
  }
}

/**
 * Weak reference map for memory-friendly caching
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, { value: V; timestamp: number }>();

  private ttl: number;

  constructor(ttl: number = 300000) {
    // 5 minutes default
    this.ttl = ttl;
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}
