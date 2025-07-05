/**
 * Analytics Service - Core analytics and telemetry service
 * Handles event collection, batching, and transmission to analytics endpoints
 */

import { EventEmitter } from 'events';
import {
  AnalyticsConfig,
  AnalyticsEvent,
  EventType,
  EventCategory,
  DeviceInfo
} from './types';
import { analyticsConfig } from './config';

export class AnalyticsService extends EventEmitter {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;
  private retryTimer?: NodeJS.Timeout;
  private isOnline = navigator.onLine;
  private sequenceCounter = 0;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    super();
    this.config = { ...analyticsConfig, ...config };
    this.sessionId = this.generateSessionId();
    
    this.setupEventListeners();
    this.startFlushTimer();
    
    if (this.config.debug) {
      console.log('[Analytics] Service initialized', {
        sessionId: this.sessionId,
        config: this.config
      });
    }
  }

  /**
   * Track a custom analytics event
   */
  track(
    type: EventType,
    category: EventCategory,
    action: string,
    properties: Record<string, any> = {},
    options: {
      label?: string;
      value?: number;
      immediate?: boolean;
    } = {}
  ): void {
    if (!this.config.enabled) return;

    // Apply sampling
    if (!this.shouldSample(type)) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type,
      category,
      action,
      label: options.label,
      value: options.value,
      properties: {
        ...properties,
        sequence: this.sequenceCounter++
      },
      sessionId: this.sessionId,
      userId: this.userId,
      deviceInfo: this.getDeviceInfo(),
      context: this.getEventContext()
    };

    this.addToQueue(event);

    if (options.immediate || this.shouldFlushImmediately(event)) {
      this.flush();
    }

    this.emit('event_tracked', event);

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties: Record<string, any> = {}): void {
    this.track('user_interaction', 'ui_interaction', 'page_view', {
      page,
      referrer: document.referrer,
      ...properties
    });
  }

  /**
   * Track CNC operation
   */
  trackCNCOperation(
    operation: string,
    properties: Record<string, any> = {}
  ): void {
    this.track('user_interaction', 'cnc_control', operation, {
      timestamp: Date.now(),
      ...properties
    });
  }

  /**
   * Track plugin usage
   */
  trackPluginUsage(
    pluginId: string,
    action: string,
    properties: Record<string, any> = {}
  ): void {
    this.track('user_interaction', 'plugin_system', action, {
      pluginId,
      ...properties
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    metric: string,
    value: number,
    properties: Record<string, any> = {}
  ): void {
    this.track('performance', 'system_performance', metric, {
      value,
      ...properties
    }, { value });
  }

  /**
   * Track error events
   */
  trackError(
    error: Error,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    this.track('error', 'error_tracking', 'error_occurred', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      severity,
      ...context
    }, { immediate: severity === 'critical' });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
    
    this.track('user_interaction', 'user_journey', 'user_identified', {
      userId,
      previousUserId: this.userId
    });
  }

  /**
   * Set custom properties for all events
   */
  setGlobalProperties(properties: Record<string, any>): void {
    // Store global properties that will be added to all events
    (this as any).globalProperties = {
      ...(this as any).globalProperties,
      ...properties
    };
  }

  /**
   * Manually flush the event queue
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
      this.emit('events_sent', events);
      
      if (this.config.debug) {
        console.log(`[Analytics] Flushed ${events.length} events`);
      }
    } catch (error) {
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
      this.scheduleRetry();
      
      this.emit('send_failed', error);
      console.error('[Analytics] Failed to send events:', error);
    }
  }

  /**
   * Clear all queued events
   */
  clear(): void {
    this.eventQueue = [];
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  /**
   * Destroy the analytics service
   */
  destroy(): void {
    this.clear();
    this.removeAllListeners();
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  /**
   * Get current session information
   */
  getSession(): { sessionId: string; userId?: string } {
    return {
      sessionId: this.sessionId,
      userId: this.userId
    };
  }

  /**
   * Generate a new session (useful for session renewal)
   */
  renewSession(): void {
    const oldSessionId = this.sessionId;
    this.sessionId = this.generateSessionId();
    
    this.track('user_interaction', 'user_journey', 'session_renewed', {
      oldSessionId,
      newSessionId: this.sessionId
    });
  }

  // Private methods

  private setupEventListeners(): void {
    // Network status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Page unload - flush remaining events
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Visibility change - pause/resume tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.flush(); // Send queued events when back online
  };

  private handleOffline = (): void => {
    this.isOnline = false;
  };

  private handleBeforeUnload = (): void => {
    // Use sendBeacon for reliable event sending on page unload
    if (this.eventQueue.length > 0 && navigator.sendBeacon) {
      try {
        const payload = JSON.stringify({
          events: this.eventQueue,
          meta: {
            sessionId: this.sessionId,
            timestamp: Date.now()
          }
        });
        
        navigator.sendBeacon(this.config.endpoint, payload);
      } catch (error) {
        console.error('[Analytics] Failed to send beacon:', error);
      }
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.track('user_interaction', 'ui_interaction', 'page_hidden');
    } else {
      this.track('user_interaction', 'ui_interaction', 'page_visible');
    }
  };

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private addToQueue(event: AnalyticsEvent): void {
    // Add global properties if they exist
    if ((this as any).globalProperties) {
      event.properties = {
        ...event.properties,
        ...(this as any).globalProperties
      };
    }

    this.eventQueue.push(event);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private shouldSample(type: EventType): boolean {
    const samplingRate = this.config.sampling[type as keyof typeof this.config.sampling];
    return Math.random() < (samplingRate || 1);
  }

  private shouldFlushImmediately(event: AnalyticsEvent): boolean {
    // Flush immediately for critical events
    return event.type === 'error' || 
           event.category === 'security_events' ||
           event.properties.severity === 'critical';
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.isOnline && !this.config.debug) {
      throw new Error('Offline - events queued for retry');
    }

    const payload = {
      events,
      meta: {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        version: '1.0.0'
      }
    };

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Analytics-Version': '1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimer) return;

    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.flush();
    }, 5000); // Retry after 5 seconds
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private getEventContext() {
    return {
      page: window.location.pathname,
      referrer: document.referrer,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
      previousEvents: this.eventQueue.slice(-5).map(e => e.action),
      cncState: this.getCNCState(),
      uiState: this.getUIState()
    };
  }

  private getCNCState() {
    // This would integrate with the actual CNC state management
    // For now, return placeholder data
    return {
      connected: false,
      position: { x: 0, y: 0, z: 0 },
      status: 'idle'
    };
  }

  private getUIState() {
    return {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      layout: window.innerWidth > 768 ? 'desktop' : 'mobile',
      activePlugins: [] // This would come from plugin service
    };
  }
}