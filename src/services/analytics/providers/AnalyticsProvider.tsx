/**
 * Analytics Provider - React context provider for analytics services
 * Provides analytics, performance monitoring, and error tracking to the entire app
 */

import React, {
  createContext, useEffect, useState, ReactNode,
} from 'react';
import { AnalyticsService } from '../AnalyticsService';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { ErrorTracker } from '../ErrorTracker';
import { AnalyticsConfig } from '../types';
import { analyticsConfig, developmentConfig, productionConfig } from '../config';

export interface AnalyticsContextType {
  analytics: AnalyticsService;
  performanceMonitor: PerformanceMonitor;
  errorTracker: ErrorTracker;
  isInitialized: boolean;
  config: AnalyticsConfig;
}

export const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
  autoStart?: boolean;
}

/**
 * Provider component that initializes and provides analytics services
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config: customConfig = {},
  autoStart = true,
}) => {
  const [services, setServices] = useState<{
    analytics: AnalyticsService;
    performanceMonitor: PerformanceMonitor;
    errorTracker: ErrorTracker;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Determine configuration based on environment
        const envConfig = process.env.NODE_ENV === 'development'
          ? developmentConfig
          : productionConfig;

        const finalConfig = {
          ...analyticsConfig,
          ...envConfig,
          ...customConfig,
        };

        // Check privacy settings
        if (finalConfig.privacy.respectDoNotTrack && navigator.doNotTrack === '1') {
          finalConfig.enabled = false;
        }

        // Initialize services
        const analytics = new AnalyticsService(finalConfig);
        const performanceMonitor = new PerformanceMonitor();
        const errorTracker = new ErrorTracker(analytics.getSession().sessionId);

        // Set up inter-service communication
        setupServiceIntegration(analytics, performanceMonitor, errorTracker);

        // Auto-start services if enabled
        if (autoStart && finalConfig.enabled) {
          performanceMonitor.start();
          errorTracker.start();

          // Track application start
          analytics.track('system_health', 'system_performance', 'application_started', {
            environment: process.env.NODE_ENV,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          });
        }

        setServices({ analytics, performanceMonitor, errorTracker });
        setIsInitialized(true);

        if (finalConfig.debug) {
          console.log('[Analytics] Services initialized', {
            config: finalConfig,
            services: { analytics, performanceMonitor, errorTracker },
          });
        }
      } catch (error) {
        console.error('[Analytics] Failed to initialize services:', error);
        setIsInitialized(false);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      if (services) {
        services.analytics.destroy();
        services.performanceMonitor.stop();
        services.errorTracker.stop();
      }
    };
  }, [customConfig, autoStart]);

  // Handle page visibility changes
  useEffect(() => {
    if (!services) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        services.analytics.track('user_interaction', 'ui_interaction', 'app_backgrounded');
      } else {
        services.analytics.track('user_interaction', 'ui_interaction', 'app_foregrounded');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [services]);

  // Track unhandled promise rejections
  useEffect(() => {
    if (!services) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      services.errorTracker.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandled_promise_rejection' },
        'high',
        'promise_rejection',
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [services]);

  if (!isInitialized || !services) {
    return (
      <div style={{ display: 'none' }}>
        {/* Render children even when not initialized to prevent blocking */}
        {children}
      </div>
    );
  }

  const contextValue: AnalyticsContextType = {
    analytics: services.analytics,
    performanceMonitor: services.performanceMonitor,
    errorTracker: services.errorTracker,
    isInitialized,
    config: {
      ...analyticsConfig,
      ...(process.env.NODE_ENV === 'development' ? developmentConfig : productionConfig),
      ...customConfig,
    },
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Set up communication between analytics services
 */
function setupServiceIntegration(
  analytics: AnalyticsService,
  performanceMonitor: PerformanceMonitor,
  errorTracker: ErrorTracker,
): void {
  // Performance alerts trigger analytics events
  performanceMonitor.on('performance_alert', (alert) => {
    analytics.track('performance', 'system_performance', 'performance_alert', {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      severity: 'warning',
    }, { immediate: true });
  });

  // System metrics updates
  performanceMonitor.on('system_metrics_updated', (metrics) => {
    analytics.track('performance', 'system_performance', 'metrics_updated', {
      ...metrics,
      timestamp: Date.now(),
    });
  });

  // Error events trigger analytics
  errorTracker.on('error_tracked', (error) => {
    analytics.track('error', 'error_tracking', 'error_occurred', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      fingerprint: error.fingerprint,
      component: error.context.component,
    }, { immediate: error.severity === 'critical' });
  });

  // Error alerts
  errorTracker.on('error_alert', (error) => {
    analytics.track('error', 'error_tracking', 'error_alert', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      fingerprint: error.fingerprint,
    }, { immediate: true });
  });

  // Analytics events trigger breadcrumbs
  analytics.on('event_tracked', (event) => {
    errorTracker.addBreadcrumb(
      'analytics',
      `${event.category}:${event.action}`,
      'info',
      {
        type: event.type,
        properties: event.properties,
      },
    );
  });

  // Performance measurements trigger breadcrumbs
  performanceMonitor.on('metric_updated', (metric) => {
    errorTracker.addBreadcrumb(
      'performance',
      `Metric updated: ${metric.metric} = ${metric.value}`,
      'info',
      metric,
    );
  });
}

/**
 * Factory function to create analytics provider with specific configuration
 */
export const createAnalyticsProvider = (config: Partial<AnalyticsConfig>) => ({ children }: { children: ReactNode }) => (
    <AnalyticsProvider config={config}>
      {children}
    </AnalyticsProvider>
);
