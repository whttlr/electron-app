/**
 * Performance Monitor Class
 * Handles metrics collection and monitoring functionality
 */

import type { PerformanceMetrics } from '../types';

export class PerformanceMonitor {
  private intervalId: NodeJS.Timeout | null = null;

  private frameCount = 0;

  private lastFrameTime = performance.now();

  private startTime = Date.now();

  start(callback: (metrics: Partial<PerformanceMetrics>) => void, interval = 1000) {
    this.stop();

    this.intervalId = setInterval(() => {
      const metrics = this.collectMetrics();
      callback(metrics);
    }, interval);

    // Start FPS monitoring
    this.monitorFPS(callback);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private collectMetrics(): Partial<PerformanceMetrics> {
    const memory = this.getMemoryInfo();
    const cpu = this.getCPUInfo();
    const network = this.getNetworkInfo();

    return {
      cpu,
      memory,
      network,
    };
  }

  private getMemoryInfo() {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        used: Math.round(mem.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(mem.totalJSHeapSize / 1024 / 1024), // MB
        history: [], // Will be managed by store
      };
    }
    return { used: 0, total: 8192, history: [] };
  }

  private getCPUInfo() {
    // Estimate CPU usage based on frame timing
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const expectedFrameTime = 16.67; // 60fps
    const usage = Math.min(100, Math.max(0, (frameTime / expectedFrameTime - 1) * 100));

    return {
      usage: Math.round(usage),
      history: [], // Will be managed by store
    };
  }

  private getNetworkInfo() {
    // In a real implementation, this would measure actual network metrics
    return {
      latency: Math.random() * 50 + 10, // 10-60ms
      bandwidth: Math.random() * 100 + 50, // 50-150 Mbps
      packetsLost: Math.random() < 0.01 ? 1 : 0, // 1% packet loss chance
    };
  }

  private monitorFPS(callback: (metrics: Partial<PerformanceMetrics>) => void) {
    const measureFPS = () => {
      const now = performance.now();
      this.frameCount++;

      if (now - this.lastFrameTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        const frameTime = (now - this.lastFrameTime) / this.frameCount;

        callback({
          rendering: {
            fps,
            frameTime,
            droppedFrames: Math.max(0, 60 - fps),
          },
        });

        this.frameCount = 0;
        this.lastFrameTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }
}

export const performanceMonitor = new PerformanceMonitor();
