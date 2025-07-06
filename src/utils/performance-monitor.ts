/**
 * Performance Monitoring Utilities
 *
 * Comprehensive performance monitoring system for mobile CNC applications.
 * Tracks render times, memory usage, touch responsiveness, and provides
 * optimization recommendations for industrial tablet environments.
 */

export interface PerformanceMetrics {
  frameRate: number;
  renderTime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  touchLatency: number;
  networkLatency: number;
  batteryDrain: number;
  cpuUsage: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  frameRate: { warning: number; critical: number };
  renderTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  touchLatency: { warning: number; critical: number };
  networkLatency: { warning: number; critical: number };
  batteryDrain: { warning: number; critical: number };
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  suggestions: string[];
}

// Default performance thresholds for industrial applications
export const defaultThresholds: PerformanceThresholds = {
  frameRate: { warning: 30, critical: 20 },
  renderTime: { warning: 16, critical: 32 }, // 60fps = 16ms, 30fps = 32ms
  memoryUsage: { warning: 70, critical: 85 }, // Percentage
  touchLatency: { warning: 100, critical: 200 }, // milliseconds
  networkLatency: { warning: 500, critical: 1000 }, // milliseconds
  batteryDrain: { warning: 15, critical: 25 }, // percentage per hour
};

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  private observers: PerformanceObserver[] = [];

  private listeners: Set<(alert: PerformanceAlert) => void> = new Set();

  private isMonitoring = false;

  private rafId: number | null = null;

  private thresholds: PerformanceThresholds;

  private maxMetricsHistory = 100;

  private lastFrameTime = 0;

  private frameCount = 0;

  private lastFrameRateCheck = 0;

  constructor(thresholds: PerformanceThresholds = defaultThresholds) {
    this.thresholds = thresholds;
  }

  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.startFrameRateMonitoring();
    this.startMemoryMonitoring();
    this.startBatteryMonitoring();
  }

  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.cleanup();
  }

  private setupPerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Monitor paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.checkRenderTime(entry.startTime);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }

      // Monitor navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              const networkLatency = navEntry.responseEnd - navEntry.requestStart;
              this.checkNetworkLatency(networkLatency);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Monitor long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.emitAlert({
                type: 'warning',
                metric: 'renderTime',
                value: entry.duration,
                threshold: 50,
                message: 'Long task detected that may affect responsiveness',
                timestamp: Date.now(),
                suggestions: [
                  'Consider breaking up large operations',
                  'Use requestIdleCallback for non-critical work',
                  'Implement virtual scrolling for large lists',
                ],
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported:', error);
      }
    }
  }

  private startFrameRateMonitoring(): void {
    const measureFrameRate = (timestamp: number) => {
      if (!this.isMonitoring) return;

      this.frameCount++;

      if (timestamp - this.lastFrameRateCheck >= 1000) {
        const frameRate = (this.frameCount * 1000) / (timestamp - this.lastFrameRateCheck);
        this.checkFrameRate(frameRate);

        this.frameCount = 0;
        this.lastFrameRateCheck = timestamp;
      }

      this.rafId = requestAnimationFrame(measureFrameRate);
    };

    this.rafId = requestAnimationFrame(measureFrameRate);
  }

  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      if (!this.isMonitoring) return;

      if ('memory' in performance) {
        const { memory } = (performance as any);
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };

        this.checkMemoryUsage(memoryUsage);
      }

      setTimeout(checkMemory, 5000); // Check every 5 seconds
    };

    checkMemory();
  }

  private startBatteryMonitoring(): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const initialLevel = battery.level;
        const initialTime = Date.now();

        const checkBatteryDrain = () => {
          if (!this.isMonitoring) return;

          const currentLevel = battery.level;
          const currentTime = Date.now();
          const timeDiff = (currentTime - initialTime) / (1000 * 60 * 60); // hours
          const levelDiff = (initialLevel - currentLevel) * 100; // percentage
          const drainRate = timeDiff > 0 ? levelDiff / timeDiff : 0;

          this.checkBatteryDrain(drainRate);
          setTimeout(checkBatteryDrain, 60000); // Check every minute
        };

        checkBatteryDrain();
      }).catch(() => {
        console.warn('Battery API not available');
      });
    }
  }

  measureTouchLatency(touchStartTime: number): void {
    const currentTime = performance.now();
    const latency = currentTime - touchStartTime;
    this.checkTouchLatency(latency);
  }

  measureRenderTime<T>(operation: () => T): T {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    this.checkRenderTime(renderTime);
    return result;
  }

  async measureAsyncOperation<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.checkRenderTime(duration);
    return result;
  }

  private checkFrameRate(frameRate: number): void {
    if (frameRate < this.thresholds.frameRate.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'frameRate',
        value: frameRate,
        threshold: this.thresholds.frameRate.critical,
        message: 'Critical frame rate drop detected',
        timestamp: Date.now(),
        suggestions: [
          'Reduce visual complexity',
          'Optimize CSS animations',
          'Use transform and opacity for animations',
          'Consider reducing particle effects',
          'Check for memory leaks',
        ],
      });
    } else if (frameRate < this.thresholds.frameRate.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'frameRate',
        value: frameRate,
        threshold: this.thresholds.frameRate.warning,
        message: 'Frame rate below optimal threshold',
        timestamp: Date.now(),
        suggestions: [
          'Monitor component re-renders',
          'Use React.memo for expensive components',
          'Optimize image sizes and formats',
        ],
      });
    }

    this.addMetric({ frameRate });
  }

  private checkRenderTime(renderTime: number): void {
    if (renderTime > this.thresholds.renderTime.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'renderTime',
        value: renderTime,
        threshold: this.thresholds.renderTime.critical,
        message: 'Critical render time detected',
        timestamp: Date.now(),
        suggestions: [
          'Break up large render operations',
          'Use virtualization for large lists',
          'Implement progressive loading',
          'Optimize component structure',
        ],
      });
    } else if (renderTime > this.thresholds.renderTime.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'renderTime',
        value: renderTime,
        threshold: this.thresholds.renderTime.warning,
        message: 'Slow render time detected',
        timestamp: Date.now(),
        suggestions: [
          'Profile component render times',
          'Use React DevTools Profiler',
          'Consider code splitting',
        ],
      });
    }

    this.addMetric({ renderTime });
  }

  private checkMemoryUsage(memoryUsage: PerformanceMetrics['memoryUsage']): void {
    if (memoryUsage.percentage > this.thresholds.memoryUsage.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'memoryUsage',
        value: memoryUsage.percentage,
        threshold: this.thresholds.memoryUsage.critical,
        message: 'Critical memory usage detected',
        timestamp: Date.now(),
        suggestions: [
          'Clear unused data from state',
          'Implement data pagination',
          'Clean up event listeners',
          'Use weak references where appropriate',
          'Consider reloading the application',
        ],
      });
    } else if (memoryUsage.percentage > this.thresholds.memoryUsage.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'memoryUsage',
        value: memoryUsage.percentage,
        threshold: this.thresholds.memoryUsage.warning,
        message: 'High memory usage detected',
        timestamp: Date.now(),
        suggestions: [
          'Monitor for memory leaks',
          'Clear old cached data',
          'Optimize data structures',
        ],
      });
    }

    this.addMetric({ memoryUsage });
  }

  private checkTouchLatency(touchLatency: number): void {
    if (touchLatency > this.thresholds.touchLatency.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'touchLatency',
        value: touchLatency,
        threshold: this.thresholds.touchLatency.critical,
        message: 'Critical touch latency detected',
        timestamp: Date.now(),
        suggestions: [
          'Reduce touch event handler complexity',
          'Use passive event listeners',
          'Avoid synchronous operations in handlers',
          'Consider touch input debouncing',
        ],
      });
    } else if (touchLatency > this.thresholds.touchLatency.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'touchLatency',
        value: touchLatency,
        threshold: this.thresholds.touchLatency.warning,
        message: 'High touch latency detected',
        timestamp: Date.now(),
        suggestions: [
          'Optimize touch event handlers',
          'Use requestAnimationFrame for updates',
          'Profile touch interaction paths',
        ],
      });
    }

    this.addMetric({ touchLatency });
  }

  private checkNetworkLatency(networkLatency: number): void {
    if (networkLatency > this.thresholds.networkLatency.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'networkLatency',
        value: networkLatency,
        threshold: this.thresholds.networkLatency.critical,
        message: 'Critical network latency detected',
        timestamp: Date.now(),
        suggestions: [
          'Check network connection',
          'Enable offline mode',
          'Reduce API call frequency',
          'Implement request batching',
        ],
      });
    } else if (networkLatency > this.thresholds.networkLatency.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'networkLatency',
        value: networkLatency,
        threshold: this.thresholds.networkLatency.warning,
        message: 'High network latency detected',
        timestamp: Date.now(),
        suggestions: [
          'Implement request caching',
          'Use data compression',
          'Optimize API responses',
        ],
      });
    }

    this.addMetric({ networkLatency });
  }

  private checkBatteryDrain(batteryDrain: number): void {
    if (batteryDrain > this.thresholds.batteryDrain.critical) {
      this.emitAlert({
        type: 'critical',
        metric: 'batteryDrain',
        value: batteryDrain,
        threshold: this.thresholds.batteryDrain.critical,
        message: 'Critical battery drain detected',
        timestamp: Date.now(),
        suggestions: [
          'Reduce screen brightness',
          'Disable unnecessary features',
          'Lower refresh rate if possible',
          'Consider power saving mode',
        ],
      });
    } else if (batteryDrain > this.thresholds.batteryDrain.warning) {
      this.emitAlert({
        type: 'warning',
        metric: 'batteryDrain',
        value: batteryDrain,
        threshold: this.thresholds.batteryDrain.warning,
        message: 'High battery drain detected',
        timestamp: Date.now(),
        suggestions: [
          'Monitor background processes',
          'Optimize animation usage',
          'Reduce network polling frequency',
        ],
      });
    }

    this.addMetric({ batteryDrain });
  }

  private addMetric(partialMetric: Partial<PerformanceMetrics>): void {
    const metric: PerformanceMetrics = {
      frameRate: 0,
      renderTime: 0,
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      touchLatency: 0,
      networkLatency: 0,
      batteryDrain: 0,
      cpuUsage: 0,
      timestamp: Date.now(),
      ...partialMetric,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  private emitAlert(alert: PerformanceAlert): void {
    this.listeners.forEach((listener) => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in performance alert listener:', error);
      }
    });
  }

  private cleanup(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting performance observer:', error);
      }
    });
    this.observers = [];
  }

  // Public API
  onAlert(listener: (alert: PerformanceAlert) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(timeWindow = 30000): Partial<PerformanceMetrics> {
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) return {};

    const averages = recentMetrics.reduce(
      (acc, metric) => ({
        frameRate: acc.frameRate + metric.frameRate,
        renderTime: acc.renderTime + metric.renderTime,
        touchLatency: acc.touchLatency + metric.touchLatency,
        networkLatency: acc.networkLatency + metric.networkLatency,
        batteryDrain: acc.batteryDrain + metric.batteryDrain,
        memoryPercentage: acc.memoryPercentage + metric.memoryUsage.percentage,
      }),
      {
        frameRate: 0, renderTime: 0, touchLatency: 0, networkLatency: 0, batteryDrain: 0, memoryPercentage: 0,
      },
    );

    const count = recentMetrics.length;

    return {
      frameRate: averages.frameRate / count,
      renderTime: averages.renderTime / count,
      touchLatency: averages.touchLatency / count,
      networkLatency: averages.networkLatency / count,
      batteryDrain: averages.batteryDrain / count,
      memoryUsage: {
        used: 0,
        total: 0,
        percentage: averages.memoryPercentage / count,
      },
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for using performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = React.useState<PerformanceAlert[]>([]);

  React.useEffect(() => {
    performanceMonitor.start();

    const unsubscribeAlert = performanceMonitor.onAlert((alert) => {
      setAlerts((prev) => [...prev.slice(-9), alert]); // Keep last 10 alerts
    });

    const interval = setInterval(() => {
      const latest = performanceMonitor.getLatestMetrics();
      if (latest) {
        setMetrics(latest);
      }
    }, 1000);

    return () => {
      unsubscribeAlert();
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, []);

  return {
    metrics,
    alerts,
    averageMetrics: performanceMonitor.getAverageMetrics(),
    clearAlerts: () => setAlerts([]),
  };
};

export default performanceMonitor;
