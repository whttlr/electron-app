/**
 * Performance Monitor - Real-time performance tracking and optimization
 * Monitors Core Web Vitals, CNC operation performance, and system metrics
 */

import { EventEmitter } from 'events';
import { PerformanceMetrics, MemoryUsage, NetworkQuality } from './types';
import { performanceThresholds } from './config';

export class PerformanceMonitor extends EventEmitter {
  private observer?: PerformanceObserver;
  private metrics: Partial<PerformanceMetrics> = {};
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;
  private measurementBuffer: Map<string, number[]> = new Map();

  constructor() {
    super();
    this.setupPerformanceObserver();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.observer?.observe({ entryTypes: ['navigation', 'measure', 'paint', 'largest-contentful-paint'] });
    
    // Start periodic system metrics collection
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
    }, 5000); // Every 5 seconds

    // Measure initial Core Web Vitals
    this.measureCoreWebVitals();
    
    this.emit('monitoring_started');
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observer?.disconnect();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.emit('monitoring_stopped');
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      fcp: this.metrics.fcp || 0,
      ttfb: this.metrics.ttfb || 0,
      jogResponseTime: this.metrics.jogResponseTime || 0,
      positionUpdateLatency: this.metrics.positionUpdateLatency || 0,
      fileLoadTime: this.metrics.fileLoadTime || 0,
      pluginInitTime: this.metrics.pluginInitTime || 0,
      renderTime: this.metrics.renderTime || 0,
      memoryUsage: this.metrics.memoryUsage || this.getMemoryUsage(),
      cpuUsage: this.metrics.cpuUsage || 0,
      networkQuality: this.metrics.networkQuality || this.getNetworkQuality(),
      batteryLevel: this.metrics.batteryLevel,
      taskCompletionTime: this.metrics.taskCompletionTime || 0,
      errorRate: this.metrics.errorRate || 0,
      sessionDuration: this.metrics.sessionDuration || 0,
      bounceRate: this.metrics.bounceRate || 0
    };
  }

  /**
   * Measure CNC jog response time
   */
  measureJogResponse(): () => void {
    const startTime = performance.now();
    
    return () => {
      const responseTime = performance.now() - startTime;
      this.updateMetric('jogResponseTime', responseTime);
      
      if (responseTime > performanceThresholds.jogResponseTime) {
        this.emit('performance_alert', {
          metric: 'jogResponseTime',
          value: responseTime,
          threshold: performanceThresholds.jogResponseTime
        });
      }
    };
  }

  /**
   * Measure position update latency
   */
  measurePositionUpdate(): () => void {
    const startTime = performance.now();
    
    return () => {
      const latency = performance.now() - startTime;
      this.updateMetric('positionUpdateLatency', latency);
      
      if (latency > performanceThresholds.positionUpdateLatency) {
        this.emit('performance_alert', {
          metric: 'positionUpdateLatency',
          value: latency,
          threshold: performanceThresholds.positionUpdateLatency
        });
      }
    };
  }

  /**
   * Measure file load time
   */
  measureFileLoad(fileSize?: number): () => void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      this.updateMetric('fileLoadTime', loadTime);
      
      this.emit('file_load_measured', {
        loadTime,
        fileSize,
        throughput: fileSize ? fileSize / (loadTime / 1000) : undefined
      });
      
      if (loadTime > performanceThresholds.fileLoadTime) {
        this.emit('performance_alert', {
          metric: 'fileLoadTime',
          value: loadTime,
          threshold: performanceThresholds.fileLoadTime
        });
      }
    };
  }

  /**
   * Measure plugin initialization time
   */
  measurePluginInit(pluginId: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const initTime = performance.now() - startTime;
      this.updateMetric('pluginInitTime', initTime);
      
      this.emit('plugin_init_measured', {
        pluginId,
        initTime
      });
      
      if (initTime > performanceThresholds.pluginInitTime) {
        this.emit('performance_alert', {
          metric: 'pluginInitTime',
          value: initTime,
          threshold: performanceThresholds.pluginInitTime,
          context: { pluginId }
        });
      }
    };
  }

  /**
   * Measure render time for a frame
   */
  measureRender(): () => void {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      this.updateMetric('renderTime', renderTime);
      
      if (renderTime > performanceThresholds.renderTime) {
        this.emit('performance_alert', {
          metric: 'renderTime',
          value: renderTime,
          threshold: performanceThresholds.renderTime
        });
      }
    };
  }

  /**
   * Measure task completion time
   */
  measureTaskCompletion(taskType: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const completionTime = performance.now() - startTime;
      this.updateMetric('taskCompletionTime', completionTime);
      
      this.emit('task_completion_measured', {
        taskType,
        completionTime
      });
    };
  }

  /**
   * Get performance summary report
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    alerts: Array<{ metric: string; severity: string; message: string }>;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const alerts = this.generateAlerts(metrics);
    const recommendations = this.generateRecommendations(metrics);
    
    return {
      metrics,
      alerts,
      recommendations
    };
  }

  // Private methods

  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('[PerformanceMonitor] PerformanceObserver not supported');
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.handlePerformanceEntry(entry);
      }
    });
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        break;
        
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;
        
      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;
        
      case 'measure':
        this.handleCustomMeasure(entry);
        break;
    }
    
    this.emit('metric_updated', {
      type: entry.entryType,
      name: entry.name,
      value: entry.startTime || entry.duration
    });
  }

  private handleCustomMeasure(entry: PerformanceEntry): void {
    // Handle custom performance marks
    if (entry.name.startsWith('cnc-')) {
      const metricName = entry.name.replace('cnc-', '');
      this.updateMetric(metricName as keyof PerformanceMetrics, entry.duration!);
    }
  }

  private measureCoreWebVitals(): void {
    // Measure FID (First Input Delay)
    if ('PerformanceEventTiming' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
          }
        }
      }).observe({ type: 'first-input', buffered: true });
    }

    // Measure CLS (Cumulative Layout Shift)
    if ('LayoutShiftAttribution' in window) {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        this.metrics.cls = cls;
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  private collectSystemMetrics(): void {
    // Memory usage
    this.metrics.memoryUsage = this.getMemoryUsage();
    
    // Network quality
    this.metrics.networkQuality = this.getNetworkQuality();
    
    // Battery level (if available)
    this.getBatteryLevel().then(level => {
      if (level !== null) {
        this.metrics.batteryLevel = level;
      }
    });
    
    // CPU usage estimation (approximate)
    this.estimateCPUUsage().then(usage => {
      this.metrics.cpuUsage = usage;
    });
    
    this.emit('system_metrics_updated', {
      memoryUsage: this.metrics.memoryUsage,
      networkQuality: this.metrics.networkQuality,
      batteryLevel: this.metrics.batteryLevel,
      cpuUsage: this.metrics.cpuUsage
    });
  }

  private getMemoryUsage(): MemoryUsage {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize
      };
    }
    
    return {
      used: 0,
      total: 0,
      percentage: 0,
      jsHeapSizeLimit: 0,
      totalJSHeapSize: 0,
      usedJSHeapSize: 0
    };
  }

  private getNetworkQuality(): NetworkQuality {
    const connection = (navigator as any).connection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }
    
    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  private async getBatteryLevel(): Promise<number | null> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      } catch (error) {
        // Battery API not available or permission denied
        return null;
      }
    }
    return null;
  }

  private async estimateCPUUsage(): Promise<number> {
    // Simple CPU usage estimation based on task execution time
    const start = performance.now();
    
    // Perform a small computational task
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    
    const duration = performance.now() - start;
    
    // Normalize to 0-1 range (this is a rough estimation)
    return Math.min(duration / 10, 1);
  }

  private updateMetric(metric: keyof PerformanceMetrics, value: number): void {
    // Add to buffer for averaging
    if (!this.measurementBuffer.has(metric)) {
      this.measurementBuffer.set(metric, []);
    }
    
    const buffer = this.measurementBuffer.get(metric)!;
    buffer.push(value);
    
    // Keep only last 10 measurements
    if (buffer.length > 10) {
      buffer.shift();
    }
    
    // Calculate average
    const average = buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    (this.metrics as any)[metric] = average;
    
    this.emit('metric_updated', { metric, value: average });
  }

  private generateAlerts(metrics: PerformanceMetrics): Array<{ metric: string; severity: string; message: string }> {
    const alerts = [];
    
    if (metrics.lcp > performanceThresholds.lcp) {
      alerts.push({
        metric: 'lcp',
        severity: 'warning',
        message: `LCP (${metrics.lcp}ms) exceeds threshold (${performanceThresholds.lcp}ms)`
      });
    }
    
    if (metrics.fid > performanceThresholds.fid) {
      alerts.push({
        metric: 'fid',
        severity: 'warning',
        message: `FID (${metrics.fid}ms) exceeds threshold (${performanceThresholds.fid}ms)`
      });
    }
    
    if (metrics.memoryUsage.percentage > performanceThresholds.memoryUsage) {
      alerts.push({
        metric: 'memory',
        severity: 'critical',
        message: `Memory usage (${(metrics.memoryUsage.percentage * 100).toFixed(1)}%) exceeds threshold (${performanceThresholds.memoryUsage * 100}%)`
      });
    }
    
    return alerts;
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations = [];
    
    if (metrics.lcp > performanceThresholds.lcp) {
      recommendations.push('Consider optimizing largest contentful paint by reducing image sizes or using lazy loading');
    }
    
    if (metrics.memoryUsage.percentage > 0.7) {
      recommendations.push('High memory usage detected. Consider closing unused plugins or refreshing the application');
    }
    
    if (metrics.jogResponseTime > performanceThresholds.jogResponseTime) {
      recommendations.push('CNC jog response time is slow. Check network connection and machine status');
    }
    
    if (metrics.networkQuality.effectiveType === 'slow-2g' || metrics.networkQuality.effectiveType === '2g') {
      recommendations.push('Slow network detected. Consider enabling offline mode or reducing update frequency');
    }
    
    return recommendations;
  }
}