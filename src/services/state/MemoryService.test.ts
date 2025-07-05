/**
 * Memory Management Testing and Leak Detection
 * 
 * Tests for memory optimization, leak detection,
 * and efficient data structures.
 */

import {
  MemoryManager,
  memoryManager,
  ObjectPool,
  RingBuffer,
  WeakCache,
  memoryAwareDebounce,
  boundedMemoize,
  truncateLargeStrings,
} from '../memoryManager';

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB
  jsHeapSizeLimit: 2048 * 1024 * 1024, // 2GB
};

Object.defineProperty(performance, 'memory', {
  value: mockMemory,
  writable: true,
});

// Mock global.gc
(global as any).gc = jest.fn();

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('MemoryManager', () => {
  let manager: MemoryManager;
  
  beforeEach(() => {
    manager = new MemoryManager();
  });
  
  afterEach(() => {
    manager.stopMonitoring();
  });
  
  describe('Memory Metrics', () => {
    it('should get current memory metrics', () => {
      const metrics = manager.getMemoryMetrics();
      
      expect(metrics.used).toBe(50); // 50MB
      expect(metrics.total).toBe(100); // 100MB
      expect(metrics.limit).toBe(2048); // 2GB
      expect(metrics.usagePercent).toBe(2.44); // 50MB / 2048MB * 100
      expect(metrics.available).toBe(1998); // 2048MB - 50MB
      expect(metrics.pressure).toBe('low');
    });
    
    it('should detect memory pressure levels', () => {
      // Test different memory usage levels
      const testCases = [
        { used: 50, limit: 2048, expected: 'low' },
        { used: 1500, limit: 2048, expected: 'moderate' }, // ~73%
        { used: 1700, limit: 2048, expected: 'high' }, // ~83%
        { used: 1900, limit: 2048, expected: 'critical' }, // ~93%
      ];
      
      testCases.forEach(({ used, limit, expected }) => {
        mockMemory.usedJSHeapSize = used * 1024 * 1024;
        mockMemory.jsHeapSizeLimit = limit * 1024 * 1024;
        
        const metrics = manager.getMemoryMetrics();
        expect(metrics.pressure).toBe(expected);
      });
    });
  });
  
  describe('Memory Monitoring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should start and stop monitoring', () => {
      expect(manager.getMemoryMetrics()).toBeDefined();
      
      manager.startMonitoring(1000);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      manager.stopMonitoring();
      expect(clearInterval).toHaveBeenCalled();
    });
    
    it('should call subscribers with metrics', () => {
      const subscriber = jest.fn();
      const unsubscribe = manager.subscribe(subscriber);
      
      manager.startMonitoring(100);
      
      jest.advanceTimersByTime(100);
      expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
        used: expect.any(Number),
        total: expect.any(Number),
        pressure: expect.any(String),
      }));
      
      unsubscribe();
    });
    
    it('should trigger optimization on critical memory pressure', () => {
      const optimizeSpy = jest.spyOn(manager, 'optimizeMemory');
      
      // Set critical memory usage
      mockMemory.usedJSHeapSize = 1900 * 1024 * 1024; // 93%
      
      manager.startMonitoring(100);
      jest.advanceTimersByTime(100);
      
      expect(optimizeSpy).toHaveBeenCalled();
    });
  });
  
  describe('Memory Optimization', () => {
    it('should optimize memory usage', async () => {
      const beforeMemory = manager.getMemoryMetrics();
      
      const result = await manager.optimizeMemory();
      
      expect(result.before).toEqual(beforeMemory);
      expect(result.after).toBeDefined();
      expect(result.actions).toContain('Cleared all caches');
      expect(result.actions).toContain('Cleared large objects');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
    
    it('should force garbage collection if available', () => {
      const result = manager.forceGarbageCollection();
      
      expect(result).toBe(true);
      expect((global as any).gc).toHaveBeenCalled();
    });
  });
  
  describe('Memory Leak Detection', () => {
    it('should create and update leak detectors', () => {
      manager.createLeakDetector('test-component');
      
      // Simulate memory growth
      mockMemory.usedJSHeapSize = 70 * 1024 * 1024; // Increase to 70MB
      
      const detector = manager.updateLeakDetector('test-component');
      
      expect(detector).toBeDefined();
      expect(detector!.growth).toBe(20); // 70MB - 50MB
      expect(detector!.samples).toHaveLength(2);
    });
    
    it('should detect potential memory leaks', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      manager.createLeakDetector('leaky-component');
      
      // Simulate rapid memory growth (trigger leak detection)
      mockMemory.usedJSHeapSize = 400 * 1024 * 1024; // Large increase
      
      const detector = manager.updateLeakDetector('leaky-component');
      
      expect(detector!.growthRate).toBeGreaterThan(5); // More than 5MB/min
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Potential memory leak detected')
      );
      
      consoleSpy.mockRestore();
    });
    
    it('should remove leak detectors', () => {
      manager.createLeakDetector('temporary-component');
      manager.removeLeakDetector('temporary-component');
      
      const detector = manager.updateLeakDetector('temporary-component');
      expect(detector).toBeNull();
    });
  });
  
  describe('Memory Trends', () => {
    it('should analyze memory usage trends', () => {
      // Create trend by updating metrics multiple times
      const metrics = [
        { used: 50, total: 100 },
        { used: 55, total: 100 },
        { used: 60, total: 100 },
        { used: 65, total: 100 },
        { used: 70, total: 100 },
      ];
      
      // Simulate trend data (this would normally be collected over time)
      manager['metrics'] = metrics.map(m => ({
        ...m,
        limit: 2048,
        usagePercent: (m.used / 2048) * 100,
        available: 2048 - m.used,
        pressure: 'low' as const,
      }));
      
      const trend = manager.getMemoryTrend();
      
      expect(trend.trend).toBe('increasing');
      expect(trend.rate).toBeGreaterThan(0);
    });
  });
});

describe('ObjectPool', () => {
  interface TestObject {
    id: number;
    data: string;
    inUse: boolean;
  }
  
  let pool: ObjectPool<TestObject>;
  
  beforeEach(() => {
    pool = new ObjectPool<TestObject>(
      () => ({ id: 0, data: '', inUse: false }),
      (obj) => { obj.id = 0; obj.data = ''; obj.inUse = false; },
      10
    );
  });
  
  it('should create and reuse objects', () => {
    const obj1 = pool.acquire();
    expect(obj1).toBeDefined();
    expect(pool.getStats().inUse).toBe(1);
    
    obj1.id = 123;
    obj1.data = 'test';
    
    pool.release(obj1);
    expect(pool.getStats().inUse).toBe(0);
    expect(pool.getStats().poolSize).toBe(1);
    
    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1); // Should reuse the same object
    expect(obj2.id).toBe(0); // Should be reset
    expect(obj2.data).toBe('');
  });
  
  it('should respect pool size limits', () => {
    const objects = [];
    
    // Acquire more objects than pool capacity
    for (let i = 0; i < 15; i++) {
      objects.push(pool.acquire());
    }
    
    // Release all objects
    objects.forEach(obj => pool.release(obj));
    
    const stats = pool.getStats();
    expect(stats.poolSize).toBeLessThanOrEqual(10); // Should not exceed max size
    expect(stats.created).toBe(15); // Should track total created
  });
  
  it('should provide accurate statistics', () => {
    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    
    let stats = pool.getStats();
    expect(stats.inUse).toBe(2);
    expect(stats.created).toBe(2);
    expect(stats.poolSize).toBe(0);
    
    pool.release(obj1);
    
    stats = pool.getStats();
    expect(stats.inUse).toBe(1);
    expect(stats.poolSize).toBe(1);
  });
  
  it('should clear pool', () => {
    const obj = pool.acquire();
    pool.release(obj);
    
    expect(pool.getStats().poolSize).toBe(1);
    
    pool.clear();
    
    expect(pool.getStats().poolSize).toBe(0);
  });
});

describe('RingBuffer', () => {
  let buffer: RingBuffer<number>;
  
  beforeEach(() => {
    buffer = new RingBuffer<number>(5);
  });
  
  it('should handle basic operations', () => {
    expect(buffer.getSize()).toBe(0);
    expect(buffer.isFull()).toBe(false);
    
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    
    expect(buffer.getSize()).toBe(3);
    expect(buffer.get(0)).toBe(1);
    expect(buffer.get(1)).toBe(2);
    expect(buffer.get(2)).toBe(3);
  });
  
  it('should handle overflow with wraparound', () => {
    // Fill buffer to capacity
    for (let i = 1; i <= 5; i++) {
      buffer.push(i);
    }
    
    expect(buffer.isFull()).toBe(true);
    expect(buffer.getSize()).toBe(5);
    
    // Add more items (should overwrite oldest)
    buffer.push(6);
    buffer.push(7);
    
    expect(buffer.getSize()).toBe(5); // Size should remain 5
    expect(buffer.get(0)).toBe(3); // First item should now be 3
    expect(buffer.get(4)).toBe(7); // Last item should be 7
  });
  
  it('should convert to array correctly', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    
    const array = buffer.toArray();
    expect(array).toEqual([1, 2, 3]);
  });
  
  it('should handle pop operations', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    
    expect(buffer.pop()).toBe(1);
    expect(buffer.getSize()).toBe(2);
    expect(buffer.pop()).toBe(2);
    expect(buffer.pop()).toBe(3);
    expect(buffer.pop()).toBeUndefined();
  });
  
  it('should clear buffer', () => {
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    
    expect(buffer.getSize()).toBe(3);
    
    buffer.clear();
    
    expect(buffer.getSize()).toBe(0);
    expect(buffer.get(0)).toBeUndefined();
  });
});

describe('WeakCache', () => {
  let cache: WeakCache<object, string>;
  
  beforeEach(() => {
    cache = new WeakCache<object, string>(1000); // 1 second TTL
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should store and retrieve values', () => {
    const key = {};
    const value = 'test-value';
    
    cache.set(key, value);
    expect(cache.get(key)).toBe(value);
    expect(cache.has(key)).toBe(true);
  });
  
  it('should handle TTL expiration', () => {
    const key = {};
    const value = 'expiring-value';
    
    cache.set(key, value);
    expect(cache.get(key)).toBe(value);
    
    // Fast forward past TTL
    jest.advanceTimersByTime(1500);
    
    expect(cache.get(key)).toBeUndefined();
    expect(cache.has(key)).toBe(false);
  });
  
  it('should delete entries', () => {
    const key = {};
    const value = 'deletable-value';
    
    cache.set(key, value);
    expect(cache.has(key)).toBe(true);
    
    cache.delete(key);
    expect(cache.has(key)).toBe(false);
  });
});

describe('Memory Utilities', () => {
  describe('memoryAwareDebounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = memoryAwareDebounce(mockFn, 500);
      
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(500);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
    
    it('should provide cancel functionality', () => {
      const mockFn = jest.fn();
      const debouncedFn = memoryAwareDebounce(mockFn, 500);
      
      debouncedFn('test');
      debouncedFn.cancel();
      
      jest.advanceTimersByTime(500);
      
      expect(mockFn).not.toHaveBeenCalled();
    });
  });
  
  describe('boundedMemoize', () => {
    it('should memoize function results', () => {
      const mockFn = jest.fn((x: number) => x * 2);
      const memoizedFn = boundedMemoize(mockFn, 3);
      
      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(5)).toBe(10); // Should use cached result
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should respect cache size limit', () => {
      const mockFn = jest.fn((x: number) => x * 2);
      const memoizedFn = boundedMemoize(mockFn, 2); // Limit to 2 entries
      
      memoizedFn(1); // Cache: [1]
      memoizedFn(2); // Cache: [1, 2]
      memoizedFn(3); // Cache: [2, 3] (1 is evicted)
      
      expect(mockFn).toHaveBeenCalledTimes(3);
      
      memoizedFn(1); // Should call function again (not cached)
      expect(mockFn).toHaveBeenCalledTimes(4);
      
      memoizedFn(2); // Should use cache
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
  });
  
  describe('truncateLargeStrings', () => {
    it('should truncate long strings', () => {
      const longString = 'a'.repeat(2000);
      const result = truncateLargeStrings(longString, 100);
      
      expect(result.length).toBe(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });
    
    it('should handle nested objects', () => {
      const obj = {
        short: 'short string',
        long: 'a'.repeat(2000),
        nested: {
          veryLong: 'b'.repeat(1500),
          normal: 'normal',
        },
        array: ['short', 'c'.repeat(1200), 'another short'],
      };
      
      const result = truncateLargeStrings(obj, 100);
      
      expect(result.short).toBe('short string');
      expect(result.long.length).toBe(103);
      expect(result.nested.veryLong.length).toBe(103);
      expect(result.nested.normal).toBe('normal');
      expect(result.array[0]).toBe('short');
      expect(result.array[1].length).toBe(103);
    });
    
    it('should handle non-string values', () => {
      const obj = {
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
        date: new Date(),
      };
      
      const result = truncateLargeStrings(obj);
      
      expect(result.number).toBe(123);
      expect(result.boolean).toBe(true);
      expect(result.null).toBe(null);
      expect(result.undefined).toBe(undefined);
      expect(result.date).toBeInstanceOf(Date);
    });
  });
});

describe('Memory Manager Integration', () => {
  it('should work with global memory manager instance', () => {
    expect(memoryManager).toBeInstanceOf(MemoryManager);
    
    const metrics = memoryManager.getMemoryMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.used).toBeGreaterThan(0);
  });
  
  it('should handle memory pressure scenarios', async () => {
    // Simulate high memory usage
    mockMemory.usedJSHeapSize = 1800 * 1024 * 1024; // 88% usage
    
    const metrics = memoryManager.getMemoryMetrics();
    expect(metrics.pressure).toBe('high');
    
    // Should trigger optimization
    const result = await memoryManager.optimizeMemory();
    expect(result.actions.length).toBeGreaterThan(0);
  });
});

describe('Performance Tests', () => {
  it('should handle large object pools efficiently', () => {
    const startTime = performance.now();
    
    const pool = new ObjectPool(
      () => ({ id: 0, data: new Array(1000).fill(0) }),
      (obj) => { obj.id = 0; obj.data.fill(0); },
      1000
    );
    
    const objects = [];
    
    // Acquire 2000 objects (more than pool size)
    for (let i = 0; i < 2000; i++) {
      objects.push(pool.acquire());
    }
    
    // Release all objects
    objects.forEach(obj => pool.release(obj));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(pool.getStats().poolSize).toBeLessThanOrEqual(1000);
  });
  
  it('should handle ring buffer operations efficiently', () => {
    const startTime = performance.now();
    
    const buffer = new RingBuffer<number>(10000);
    
    // Add 50000 items (5x buffer capacity)
    for (let i = 0; i < 50000; i++) {
      buffer.push(i);
    }
    
    // Read all items
    for (let i = 0; i < buffer.getSize(); i++) {
      buffer.get(i);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(500); // Should complete within 500ms
    expect(buffer.getSize()).toBe(10000);
  });
});
