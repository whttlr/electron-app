/**
 * Error Tracker - Comprehensive error monitoring and reporting
 * Captures and analyzes JavaScript errors, promise rejections, and CNC-specific errors
 */

import { EventEmitter } from 'events';
import {
  ErrorEvent,
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  Breadcrumb,
} from './types';
import { errorSeverityLevels } from './config';

export class ErrorTracker extends EventEmitter {
  private breadcrumbs: Breadcrumb[] = [];

  private errorCounts: Map<string, number> = new Map();

  private isTracking = false;

  private maxBreadcrumbs = 100;

  private sessionId: string;

  constructor(sessionId: string) {
    super();
    this.sessionId = sessionId;
    this.setupErrorHandlers();
  }

  /**
   * Start error tracking
   */
  start(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.addBreadcrumb('system', 'Error tracking started', 'info');
    this.emit('tracking_started');
  }

  /**
   * Stop error tracking
   */
  stop(): void {
    if (!this.isTracking) return;

    this.isTracking = false;
    this.addBreadcrumb('system', 'Error tracking stopped', 'info');
    this.emit('tracking_stopped');
  }

  /**
   * Manually track an error
   */
  trackError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
    severity: ErrorSeverity = 'medium',
    type: ErrorType = 'javascript',
  ): void {
    if (!this.isTracking) return;

    const errorEvent = this.createErrorEvent(error, context, severity, type);
    this.processError(errorEvent);
  }

  /**
   * Track CNC-specific errors
   */
  trackCNCError(
    message: string,
    cncState: any,
    severity: ErrorSeverity = 'high',
  ): void {
    this.trackError(new Error(message), {
      cncState,
      component: 'cnc_controller',
    }, severity, 'cnc_communication');
  }

  /**
   * Track plugin errors
   */
  trackPluginError(
    error: Error,
    pluginId: string,
    pluginContext: any,
    severity: ErrorSeverity = 'medium',
  ): void {
    this.trackError(error, {
      component: 'plugin_system',
      pluginContext: {
        pluginId,
        ...pluginContext,
      },
    }, severity, 'plugin_error');
  }

  /**
   * Track UI errors
   */
  trackUIError(
    error: Error,
    component: string,
    userAction: string,
    severity: ErrorSeverity = 'low',
  ): void {
    this.trackError(error, {
      component,
      userAction,
    }, severity, 'ui_error');
  }

  /**
   * Track network errors
   */
  trackNetworkError(
    url: string,
    status: number,
    response: string,
    severity: ErrorSeverity = 'medium',
  ): void {
    this.trackError(new Error(`Network error: ${status} - ${response}`), {
      component: 'network',
      action: 'request_failed',
      networkDetails: { url, status, response },
    }, severity, 'network');
  }

  /**
   * Track validation errors
   */
  trackValidationError(
    field: string,
    value: any,
    validationRule: string,
    severity: ErrorSeverity = 'low',
  ): void {
    this.trackError(new Error(`Validation failed: ${field} - ${validationRule}`), {
      component: 'validation',
      validationDetails: { field, value, rule: validationRule },
    }, severity, 'validation');
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(
    category: string,
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>,
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      category,
      message,
      level,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    this.emit('breadcrumb_added', breadcrumb);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    topErrors: Array<{ fingerprint: string; count: number; lastSeen: number }>;
    errorRate: number;
    } {
    const totalErrors = Array.from(this.errorCounts.values())
      .reduce((sum, count) => sum + count, 0);

    const errorsByType: Record<ErrorType, number> = {
      javascript: 0,
      promise_rejection: 0,
      network: 0,
      cnc_communication: 0,
      plugin_error: 0,
      ui_error: 0,
      validation: 0,
      security: 0,
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    // This would be populated from actual error events
    // For now, return basic structure

    const topErrors = Array.from(this.errorCounts.entries())
      .map(([fingerprint, count]) => ({
        fingerprint,
        count,
        lastSeen: Date.now(), // This would be actual last seen time
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      topErrors,
      errorRate: totalErrors / (Date.now() - parseInt(this.sessionId.split('_')[1])) * 60000, // errors per minute
    };
  }

  /**
   * Get recent breadcrumbs
   */
  getBreadcrumbs(limit: number = 50): Breadcrumb[] {
    return this.breadcrumbs.slice(-limit);
  }

  /**
   * Clear error tracking data
   */
  clear(): void {
    this.breadcrumbs = [];
    this.errorCounts.clear();
    this.emit('data_cleared');
  }

  // Private methods

  private setupErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', this.handleJavaScriptError);

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);

    // Console errors (optional)
    this.interceptConsoleError();
  }

  private handleJavaScriptError = (event: ErrorEvent): void => {
    if (!this.isTracking) return;

    const error = event.error || new Error(event.message);
    const context: ErrorContext = {
      component: 'javascript',
      action: 'script_error',
    };

    this.trackError(error, context, 'high', 'javascript');
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent): void => {
    if (!this.isTracking) return;

    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    const context: ErrorContext = {
      component: 'promise',
      action: 'unhandled_rejection',
    };

    this.trackError(error, context, 'high', 'promise_rejection');
  };

  private interceptConsoleError(): void {
    const originalError = console.error;

    console.error = (...args: any[]) => {
      if (this.isTracking) {
        const message = args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');

        this.addBreadcrumb('console', `Console error: ${message}`, 'error');
      }

      originalError.apply(console, args);
    };
  }

  private createErrorEvent(
    error: Error | string,
    context: Partial<ErrorContext>,
    severity: ErrorSeverity,
    type: ErrorType,
  ): ErrorEvent {
    const errorObj = error instanceof Error ? error : new Error(error);
    const fingerprint = this.generateFingerprint(errorObj, type);

    return {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      type,
      severity,
      message: errorObj.message,
      stack: errorObj.stack,
      source: window.location.href,
      line: undefined, // Would be extracted from stack trace
      column: undefined, // Would be extracted from stack trace
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      context: {
        component: context.component,
        action: context.action,
        cncState: context.cncState,
        pluginContext: context.pluginContext,
        userAction: context.userAction,
        deviceState: this.getDeviceState(),
        ...context,
      },
      breadcrumbs: [...this.breadcrumbs],
      tags: this.generateTags(type, severity, context),
      fingerprint,
    };
  }

  private processError(errorEvent: ErrorEvent): void {
    // Update error counts
    const count = this.errorCounts.get(errorEvent.fingerprint) || 0;
    this.errorCounts.set(errorEvent.fingerprint, count + 1);

    // Add breadcrumb for the error
    this.addBreadcrumb(
      'error',
      `${errorEvent.type}: ${errorEvent.message}`,
      'error',
      {
        severity: errorEvent.severity,
        fingerprint: errorEvent.fingerprint,
      },
    );

    // Check if error should trigger immediate alert
    if (this.shouldAlert(errorEvent)) {
      this.emit('error_alert', errorEvent);
    }

    // Emit the error event
    this.emit('error_tracked', errorEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracker] Error tracked:', errorEvent);
    }
  }

  private generateFingerprint(error: Error, type: ErrorType): string {
    // Create a unique fingerprint for the error
    const components = [
      type,
      error.name,
      error.message,
      this.getStackTraceSignature(error.stack || ''),
    ];

    return btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private getStackTraceSignature(stack: string): string {
    // Extract meaningful parts of stack trace for fingerprinting
    const lines = stack.split('\n').slice(0, 3); // Top 3 stack frames
    return lines
      .map((line) => line.replace(/:\d+:\d+/g, '')) // Remove line numbers
      .join('|');
  }

  private generateTags(
    type: ErrorType,
    severity: ErrorSeverity,
    context: Partial<ErrorContext>,
  ): Record<string, string> {
    return {
      type,
      severity,
      component: context.component || 'unknown',
      browser: this.getBrowserName(),
      platform: navigator.platform,
      environment: process.env.NODE_ENV || 'production',
    };
  }

  private getBrowserName(): string {
    const { userAgent } = navigator;

    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';

    return 'unknown';
  }

  private getDeviceState(): any {
    return {
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      languages: navigator.languages,
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : undefined,
    };
  }

  private shouldAlert(errorEvent: ErrorEvent): boolean {
    const severityConfig = errorSeverityLevels[errorEvent.severity];
    const count = this.errorCounts.get(errorEvent.fingerprint) || 1;

    return count >= severityConfig.threshold;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
