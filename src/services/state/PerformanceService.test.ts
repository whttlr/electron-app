/**
 * Performance Testing and Benchmarks
 * 
 * Comprehensive performance tests for stores, caching,
 * memory management, and real-time operations.
 */

import { renderHook, act } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { useMachineStore } from '../machineStore';
import { useJobStore } from '../jobStore';
import { useUIStore } from '../uiStore';
import { usePerformanceStore } from '../performanceStore';
import { CacheManager, machineCache, jobCache } from '../cacheManager';
import { memoryManager, ObjectPool, RingBuffer } from '../memoryManager';
import { storeEventBus } from '../storeUtils';

// Performance test utilities
class PerformanceBenchmark {
  private measurements: { name: string; duration: number; memory?: number }[] = [];
  
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await fn();
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    this.measurements.push({
      name,
      duration: endTime - startTime,
      memory: endMemory - startMemory,
    });
    
    return result;
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
  
  getResults() {
    return [...this.measurements];
  }
  
  clear() {
    this.measurements = [];
  }
  
  getSummary() {
    if (this.measurements.length === 0) return null;
    
    const durations = this.measurements.map(m => m.duration);
    const memories = this.measurements.map(m => m.memory || 0);
    
    return {
      count: this.measurements.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalMemory: memories.reduce((a, b) => a + b, 0),
      avgMemory: memories.reduce((a, b) => a + b, 0) / memories.length,
    };
  }
}

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

describe('Performance Tests', () => {
  let benchmark: PerformanceBenchmark;
  
  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });
  
  afterEach(() => {
    benchmark.clear();
  });
  
  describe('Store Performance', () => {
    it('should handle rapid state updates efficiently', async () => {
      const { result } = renderHook(() => useMachineStore());
      
      const iterations = 1000;
      
      await benchmark.measure('rapid-position-updates', async () => {
        for (let i = 0; i < iterations; i++) {
          act(() => {
            result.current.updatePosition({ x: i, y: i * 2, z: i / 2 });
          });
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(100); // Should complete in less than 100ms
      
      // Verify final state
      expect(result.current.machine.position.x).toBe(iterations - 1);
      expect(result.current.positionHistory).toHaveLength(100); // Should be limited to 100
    });
    
    it('should handle large job queues efficiently', async () => {
      const { result } = renderHook(() => useJobStore());
      
      const jobCount = 500;
      const jobs = Array.from({ length: jobCount }, (_, i) => ({
        name: `Job ${i}`,
        gcodeFile: `job${i}.gcode`,
        material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
        toolSettings: { toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100 },
        workOrigin: { x: 0, y: 0, z: 0 },
        totalLines: 100,
        currentLine: 0,
        estimatedDuration: 60,
      }));
      
      await benchmark.measure('bulk-job-creation', async () => {
        jobs.forEach(job => {
          act(() => {
            result.current.addJob(job);
          });
        });
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(200); // Should complete in less than 200ms
      expect(result.current.queue.jobs).toHaveLength(jobCount);
    });
    
    it('should handle frequent UI state changes', async () => {
      const { result } = renderHook(() => useUIStore());
      
      const operations = [
        () => result.current.openModal('modal1', {}),
        () => result.current.openModal('modal2', {}),
        () => result.current.closeModal('modal1'),
        () => result.current.setLoading('test1', true),
        () => result.current.setLoading('test2', true),
        () => result.current.setLoading('test1', false),
        () => result.current.showToast('info', 'Test', 'Message', 0),
        () => result.current.toggleSidebar(),
        () => result.current.setActiveView('controls'),
      ];
      
      await benchmark.measure('ui-state-changes', async () => {
        for (let i = 0; i < 100; i++) {
          const operation = operations[i % operations.length];
          act(() => {
            operation();
          });
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(50); // Should be very fast
    });
  });
  
  describe('Cache Performance', () => {
    it('should have fast cache operations', async () => {
      const cache = new CacheManager({ maxSize: 10, maxEntries: 1000 });
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `test-data-${i}`,
        value: Math.random(),
      }));
      
      // Test cache writes
      await benchmark.measure('cache-writes', async () => {
        testData.forEach((item, index) => {
          cache.set(`key-${index}`, item);
        });
      });
      
      // Test cache reads
      await benchmark.measure('cache-reads', async () => {
        for (let i = 0; i < 1000; i++) {
          cache.get(`key-${i % testData.length}`);
        }
      });
      
      const results = benchmark.getResults();
      const writeTime = results.find(r => r.name === 'cache-writes')?.duration || 0;
      const readTime = results.find(r => r.name === 'cache-reads')?.duration || 0;
      
      expect(writeTime).toBeLessThan(100); // Writes should be fast
      expect(readTime).toBeLessThan(50); // Reads should be very fast
      
      // Verify cache hit rate
      const metrics = cache.getMetrics();
      expect(metrics.hitRate).toBeGreaterThan(0); // Should have some hits
    });
    
    it('should handle cache eviction efficiently', async () => {
      const cache = new CacheManager({ maxSize: 1, maxEntries: 100 }); // Small cache
      
      await benchmark.measure('cache-eviction', async () => {
        // Add more data than cache can hold
        for (let i = 0; i < 200; i++) {
          cache.set(`key-${i}`, {
            data: new Array(1000).fill(`item-${i}`).join(''), // Large data
          });
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(200);
      
      const metrics = cache.getMetrics();
      expect(metrics.evictions).toBeGreaterThan(0); // Should have evicted items
      expect(metrics.entryCount).toBeLessThanOrEqual(100); // Should respect entry limit
    });
  });
  
  describe('Memory Management Performance', () => {
    it('should efficiently manage object pools', async () => {
      const pool = new ObjectPool(
        () => ({ id: 0, data: '', used: false }),
        (obj) => { obj.id = 0; obj.data = ''; obj.used = false; },
        100
      );
      
      await benchmark.measure('object-pool-operations', async () => {
        const objects = [];
        
        // Acquire objects
        for (let i = 0; i < 500; i++) {
          const obj = pool.acquire();
          obj.id = i;
          obj.data = `test-${i}`;
          objects.push(obj);
        }
        
        // Release objects
        objects.forEach(obj => pool.release(obj));
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(50);
      
      const stats = pool.getStats();
      expect(stats.poolSize).toBeGreaterThan(0); // Should have reusable objects
    });
    
    it('should handle ring buffer efficiently', async () => {
      const buffer = new RingBuffer<number>(1000);
      
      await benchmark.measure('ring-buffer-operations', async () => {
        // Fill buffer beyond capacity
        for (let i = 0; i < 2000; i++) {
          buffer.push(i);
        }
        
        // Read all items
        for (let i = 0; i < buffer.getSize(); i++) {
          buffer.get(i);
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(100);
      expect(buffer.getSize()).toBe(1000); // Should maintain capacity
    });
  });
  
  describe('Event System Performance', () => {
    it('should handle high-frequency events', async () => {
      const eventCounts: Record<string, number> = {};
      
      // Set up listeners
      const listeners = [
        storeEventBus.subscribe('test-event', () => {
          eventCounts['test-event'] = (eventCounts['test-event'] || 0) + 1;
        }),
        storeEventBus.subscribe('machine:update', () => {
          eventCounts['machine:update'] = (eventCounts['machine:update'] || 0) + 1;
        }),
        storeEventBus.subscribe('job:progress', () => {
          eventCounts['job:progress'] = (eventCounts['job:progress'] || 0) + 1;
        }),
      ];
      
      await benchmark.measure('high-frequency-events', async () => {
        for (let i = 0; i < 1000; i++) {
          storeEventBus.emit('test-event', { iteration: i });
          
          if (i % 10 === 0) {
            storeEventBus.emit('machine:update', { position: { x: i, y: i, z: i } });
          }
          
          if (i % 5 === 0) {
            storeEventBus.emit('job:progress', { progress: i / 10 });
          }
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(200);
      
      expect(eventCounts['test-event']).toBe(1000);
      expect(eventCounts['machine:update']).toBe(100);
      expect(eventCounts['job:progress']).toBe(200);
      
      // Clean up
      listeners.forEach(unsubscribe => unsubscribe());
    });
  });
  
  describe('Store Selector Performance', () => {
    it('should have fast selector computations', async () => {
      const { result } = renderHook(() => useMachineStore());
      
      // Set up complex state
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addError({
            type: 'machine',
            severity: i % 3 === 0 ? 'critical' : 'medium',
            message: `Error ${i}`,
          });
        }
        
        for (let i = 0; i < 50; i++) {
          result.current.updatePosition({ x: i, y: i * 2, z: i / 2 });
        }
      });
      
      await benchmark.measure('selector-computations', async () => {
        for (let i = 0; i < 1000; i++) {
          // Run various selectors
          const isConnected = result.current.isConnected;
          const errors = result.current.errors;
          const position = result.current.machine.position;
          const criticalErrors = errors.filter(e => e.severity === 'critical');
          const canJog = isConnected && result.current.status === 'idle';
        }
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(100);
    });
  });
  
  describe('Real-time Data Performance', () => {
    it('should handle position updates at high frequency', async () => {
      const { result } = renderHook(() => useMachineStore());
      const updateFrequency = 100; // 100 Hz
      const duration = 1000; // 1 second
      const expectedUpdates = (duration / 1000) * updateFrequency;
      
      await benchmark.measure('realtime-position-updates', async () => {
        return new Promise<void>((resolve) => {
          let updateCount = 0;
          
          const interval = setInterval(() => {
            act(() => {
              result.current.updatePosition({
                x: Math.sin(updateCount * 0.1) * 100,
                y: Math.cos(updateCount * 0.1) * 100,
                z: updateCount * 0.1,
              });
            });
            
            updateCount++;
            
            if (updateCount >= expectedUpdates) {
              clearInterval(interval);
              resolve();
            }
          }, 1000 / updateFrequency);
        });
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(1200); // Should complete within reasonable time
      expect(result.current.positionHistory.length).toBeLessThanOrEqual(100); // Should maintain limit
    });
  });
  
  describe('Stress Tests', () => {
    it('should handle concurrent store operations', async () => {
      const machineHook = renderHook(() => useMachineStore());
      const jobHook = renderHook(() => useJobStore());
      const uiHook = renderHook(() => useUIStore());
      
      await benchmark.measure('concurrent-operations', async () => {
        const operations = Array.from({ length: 100 }, (_, i) => {
          return Promise.resolve().then(() => {
            act(() => {
              // Machine operations
              machineHook.result.current.updatePosition({
                x: Math.random() * 1000,
                y: Math.random() * 1000,
                z: Math.random() * 100,
              });
              
              // Job operations
              if (i % 10 === 0) {
                jobHook.result.current.addJob({
                  name: `Stress Job ${i}`,
                  gcodeFile: `stress${i}.gcode`,
                  material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
                  toolSettings: { toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100 },
                  workOrigin: { x: 0, y: 0, z: 0 },
                  totalLines: 100,
                  currentLine: 0,
                  estimatedDuration: 60,
                });
              }
              
              // UI operations
              if (i % 20 === 0) {
                uiHook.result.current.showToast('info', 'Stress Test', `Operation ${i}`, 0);
              }
            });
          });
        });
        
        await Promise.all(operations);
      });
      
      const summary = benchmark.getSummary();
      expect(summary?.avgDuration).toBeLessThan(500);
      
      // Verify state consistency
      expect(machineHook.result.current.positionHistory.length).toBeLessThanOrEqual(100);
      expect(jobHook.result.current.queue.jobs.length).toBe(10); // 100/10 = 10 jobs
      expect(uiHook.result.current.toasts.length).toBeLessThanOrEqual(10); // Toast limit
    });
  });
  
  describe('Memory Usage Benchmarks', () => {
    it('should maintain reasonable memory usage under load', async () => {
      const initialMemory = memoryManager.getMemoryMetrics();
      
      const { result: machineResult } = renderHook(() => useMachineStore());
      const { result: jobResult } = renderHook(() => useJobStore());
      
      await benchmark.measure('memory-usage-test', async () => {
        // Create significant amount of data
        for (let i = 0; i < 1000; i++) {
          act(() => {
            machineResult.current.updatePosition({
              x: Math.random() * 1000,
              y: Math.random() * 1000,
              z: Math.random() * 100,
            });
            
            if (i % 10 === 0) {
              jobResult.current.addJob({
                name: `Memory Test Job ${i}`,
                gcodeFile: `memory${i}.gcode`,
                material: { type: 'Wood', thickness: 10, dimensions: { width: 100, height: 100 } },
                toolSettings: { toolNumber: 1, spindleSpeed: 1000, feedRate: 500, plungeRate: 100 },
                workOrigin: { x: 0, y: 0, z: 0 },
                totalLines: 1000,
                currentLine: 0,
                estimatedDuration: 300,
              });
            }
          });
        }
      });
      
      const finalMemory = memoryManager.getMemoryMetrics();
      const memoryIncrease = finalMemory.used - initialMemory.used;
      
      // Memory increase should be reasonable (less than 50MB for this test)
      expect(memoryIncrease).toBeLessThan(50);
      
      // Should maintain data limits
      expect(machineResult.current.positionHistory.length).toBeLessThanOrEqual(100);
      expect(jobResult.current.queue.jobs.length).toBe(100); // 1000/10 = 100 jobs
    });
  });
  
  describe('Performance Benchmarks Summary', () => {
    it('should generate performance report', () => {
      const report = benchmark.getSummary();
      
      if (report) {
        console.log('Performance Test Summary:', {
          totalTests: report.count,
          averageDuration: `${report.avgDuration.toFixed(2)}ms`,
          maxDuration: `${report.maxDuration.toFixed(2)}ms`,
          minDuration: `${report.minDuration.toFixed(2)}ms`,
          memoryUsage: `${(report.totalMemory / 1024 / 1024).toFixed(2)}MB`,
        });
      }
      
      // All tests should pass if we reach this point
      expect(true).toBe(true);
    });
  });
});

// Performance thresholds for CI/CD
export const PERFORMANCE_THRESHOLDS = {
  storeUpdate: 10, // ms
  cacheOperation: 5, // ms
  eventEmission: 1, // ms
  selectorComputation: 0.1, // ms
  memoryIncrease: 100, // MB
  maxConcurrentOps: 1000,
};

// Performance test utilities for reuse
export { PerformanceBenchmark };
