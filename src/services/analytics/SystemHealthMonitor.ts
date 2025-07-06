/**
 * System Health Monitor - Comprehensive system health tracking
 * Monitors application health, CNC connectivity, plugin status, and system resources
 */

import { EventEmitter } from 'events';
import {
  SystemMetrics, Alert, AlertType, AlertSeverity,
} from './types';
import { systemHealthConfig } from './config';

export class SystemHealthMonitor extends EventEmitter {
  private metrics: SystemMetrics;

  private alerts: Alert[] = [];

  private isMonitoring = false;

  private intervalId?: NodeJS.Timeout;

  private startTime = Date.now();

  private lastResponseTime = 0;

  private errorCounts: Map<string, number> = new Map();

  private throughputCounter = 0;

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Start system health monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();

    // Start periodic health checks
    this.intervalId = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlerts();
    }, systemHealthConfig.checkInterval);

    // Initial metrics collection
    this.collectMetrics();

    this.emit('monitoring_started');
  }

  /**
   * Stop system health monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.emit('monitoring_stopped');
  }

  /**
   * Get current system metrics
   */
  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active alerts
   */
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Get health status summary
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: string[];
    uptime: number;
    lastCheck: number;
    } {
    const criticalAlerts = this.alerts.filter((a) => a.severity === 'critical' && a.status === 'active');
    const warningAlerts = this.alerts.filter((a) => a.severity === 'warning' && a.status === 'active');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (warningAlerts.length > 0) {
      status = 'warning';
    }

    // Calculate health score (0-100)
    let score = 100;
    score -= criticalAlerts.length * 30;
    score -= warningAlerts.length * 10;
    score = Math.max(0, score);

    const issues = this.alerts
      .filter((a) => a.status === 'active')
      .map((a) => a.title);

    return {
      status,
      score,
      issues,
      uptime: Date.now() - this.startTime,
      lastCheck: this.metrics.timestamp,
    };
  }

  /**
   * Record CNC connection status
   */
  updateCNCStatus(status: 'connected' | 'disconnected' | 'error', details?: any): void {
    this.metrics.cncConnectionStatus = status;

    if (status === 'disconnected' || status === 'error') {
      this.createAlert(
        'cnc_disconnection',
        status === 'error' ? 'critical' : 'warning',
        'CNC Connection Issue',
        `CNC machine is ${status}`,
        0,
        1,
      );
    } else {
      this.resolveAlerts('cnc_disconnection');
    }

    this.emit('cnc_status_updated', { status, details });
  }

  /**
   * Record job queue metrics
   */
  updateJobMetrics(activeJobs: number, queueSize: number): void {
    this.metrics.activeJobs = activeJobs;
    this.metrics.queueSize = queueSize;

    // Alert on large queue size
    if (queueSize > 50) {
      this.createAlert(
        'resource_exhaustion',
        'warning',
        'Large Job Queue',
        `Job queue has ${queueSize} pending jobs`,
        50,
        queueSize,
      );
    }

    this.emit('job_metrics_updated', { activeJobs, queueSize });
  }

  /**
   * Record plugin health
   */
  updatePluginHealth(loadedPlugins: number, failedPlugins: number, memoryUsage: number): void {
    this.metrics.loadedPlugins = loadedPlugins;
    this.metrics.failedPlugins = failedPlugins;
    this.metrics.pluginMemoryUsage = memoryUsage;

    // Alert on plugin failures
    if (failedPlugins > 0) {
      this.createAlert(
        'plugin_failure',
        'warning',
        'Plugin Failures',
        `${failedPlugins} plugins have failed to load`,
        0,
        failedPlugins,
      );
    }

    this.emit('plugin_health_updated', { loadedPlugins, failedPlugins, memoryUsage });
  }

  /**
   * Record response time
   */
  recordResponseTime(responseTime: number): void {
    this.lastResponseTime = responseTime;
    this.metrics.responseTime = responseTime;

    if (responseTime > systemHealthConfig.alertThresholds.responseTime) {
      this.createAlert(
        'performance_degradation',
        'warning',
        'Slow Response Time',
        `Response time (${responseTime}ms) exceeds threshold`,
        systemHealthConfig.alertThresholds.responseTime,
        responseTime,
      );
    }
  }

  /**
   * Record error occurrence
   */
  recordError(errorType: string): void {
    const count = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, count + 1);

    // Calculate error rate over the last minute
    const totalRequests = this.throughputCounter || 1;
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    this.metrics.errorRate = totalErrors / totalRequests;

    if (this.metrics.errorRate > systemHealthConfig.alertThresholds.errorRate) {
      this.createAlert(
        'error_spike',
        'critical',
        'High Error Rate',
        `Error rate (${(this.metrics.errorRate * 100).toFixed(1)}%) exceeds threshold`,
        systemHealthConfig.alertThresholds.errorRate,
        this.metrics.errorRate,
      );
    }
  }

  /**
   * Record throughput
   */
  recordThroughput(): void {
    this.throughputCounter++;
    this.metrics.throughput = this.throughputCounter;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, assignee?: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.assignee = assignee;
      this.emit('alert_acknowledged', alert);
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      this.emit('alert_resolved', alert);
    }
  }

  // Private methods

  private initializeMetrics(): SystemMetrics {
    return {
      timestamp: Date.now(),
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      cncConnectionStatus: 'disconnected',
      activeJobs: 0,
      queueSize: 0,
      machineUtilization: 0,
      loadedPlugins: 0,
      failedPlugins: 0,
      pluginMemoryUsage: 0,
      browserMemory: {
        used: 0,
        total: 0,
        percentage: 0,
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0,
        usedJSHeapSize: 0,
      },
      deviceBattery: undefined,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      activeSessions: 1,
      averageSessionDuration: 0,
      concurrentUsers: 1,
    };
  }

  private collectMetrics(): void {
    const now = Date.now();

    // Update basic metrics
    this.metrics.timestamp = now;
    this.metrics.uptime = now - this.startTime;

    // Collect browser memory
    this.metrics.browserMemory = this.getBrowserMemory();

    // Update network status
    this.metrics.networkStatus = navigator.onLine ? 'online' : 'offline';

    // Get battery info if available
    this.getBatteryInfo().then((level) => {
      if (level !== null) {
        this.metrics.deviceBattery = level;
      }
    });

    // Reset throughput counter periodically
    if (now % 60000 < systemHealthConfig.checkInterval) { // Every minute
      this.throughputCounter = 0;
      this.errorCounts.clear();
    }

    this.emit('metrics_updated', this.metrics);
  }

  private getBrowserMemory() {
    if ('memory' in performance) {
      const { memory } = (performance as any);
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      };
    }

    return this.metrics.browserMemory;
  }

  private async getBatteryInfo(): Promise<number | null> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private evaluateAlerts(): void {
    // Check memory usage
    if (this.metrics.browserMemory.percentage > systemHealthConfig.alertThresholds.memoryUsage) {
      this.createAlert(
        'resource_exhaustion',
        'critical',
        'High Memory Usage',
        `Memory usage (${(this.metrics.browserMemory.percentage * 100).toFixed(1)}%) exceeds threshold`,
        systemHealthConfig.alertThresholds.memoryUsage,
        this.metrics.browserMemory.percentage,
      );
    }

    // Check response time
    if (this.lastResponseTime > systemHealthConfig.alertThresholds.responseTime) {
      this.createAlert(
        'performance_degradation',
        'warning',
        'Slow Response Time',
        `Response time (${this.lastResponseTime}ms) exceeds threshold`,
        systemHealthConfig.alertThresholds.responseTime,
        this.lastResponseTime,
      );
    }

    // Check network status
    if (this.metrics.networkStatus === 'offline') {
      this.createAlert(
        'system_outage',
        'critical',
        'Network Offline',
        'Application is offline',
        0,
        1,
      );
    } else {
      this.resolveAlerts('system_outage');
    }

    // Auto-resolve old alerts
    this.autoResolveAlerts();
  }

  private createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    description: string,
    threshold: number,
    currentValue: number,
  ): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find((a) => a.type === type
      && a.status === 'active'
      && a.title === title);

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = currentValue;
      existingAlert.timestamp = Date.now();
      return;
    }

    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: Date.now(),
      type,
      severity,
      title,
      description,
      threshold,
      currentValue,
      status: 'active',
    };

    this.alerts.push(alert);
    this.emit('alert_created', alert);

    // Limit number of stored alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50); // Keep last 50 alerts
    }
  }

  private resolveAlerts(type: AlertType): void {
    const alertsToResolve = this.alerts.filter((a) => a.type === type && a.status === 'active');

    alertsToResolve.forEach((alert) => {
      alert.status = 'resolved';
      this.emit('alert_resolved', alert);
    });
  }

  private autoResolveAlerts(): void {
    const now = Date.now();
    const autoResolveTime = 10 * 60 * 1000; // 10 minutes

    this.alerts
      .filter((a) => a.status === 'active' && (now - a.timestamp) > autoResolveTime)
      .forEach((alert) => {
        alert.status = 'resolved';
        this.emit('alert_auto_resolved', alert);
      });
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
