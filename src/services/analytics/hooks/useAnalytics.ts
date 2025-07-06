/**
 * Analytics Hook - React hook for analytics integration
 * Provides easy-to-use analytics tracking for React components
 */

import { useContext, useEffect, useCallback } from 'react';
import { AnalyticsContext } from '../providers/AnalyticsProvider';
import { EventType, EventCategory } from '../types';

export interface UseAnalyticsReturn {
  track: (
    type: EventType,
    category: EventCategory,
    action: string,
    properties?: Record<string, any>,
    options?: { label?: string; value?: number; immediate?: boolean }
  ) => void;
  trackPageView: (page: string, properties?: Record<string, any>) => void;
  trackCNCOperation: (operation: string, properties?: Record<string, any>) => void;
  trackPluginUsage: (pluginId: string, action: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void;
  setUserId: (userId: string) => void;
  setGlobalProperties: (properties: Record<string, any>) => void;
  getSession: () => { sessionId: string; userId?: string };
  isEnabled: boolean;
}

/**
 * Hook for accessing analytics functionality
 */
export const useAnalytics = (): UseAnalyticsReturn => {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  const { analytics, performanceMonitor, errorTracker } = context;

  // Track component mount/unmount
  useEffect(() => {
    analytics.track('user_interaction', 'ui_interaction', 'component_mounted', {
      component: 'unknown', // This could be enhanced to detect component name
      timestamp: Date.now(),
    });

    return () => {
      analytics.track('user_interaction', 'ui_interaction', 'component_unmounted', {
        component: 'unknown',
        timestamp: Date.now(),
      });
    };
  }, [analytics]);

  const track = useCallback((
    type: EventType,
    category: EventCategory,
    action: string,
    properties: Record<string, any> = {},
    options: { label?: string; value?: number; immediate?: boolean } = {},
  ) => {
    analytics.track(type, category, action, properties, options);
  }, [analytics]);

  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    analytics.trackPageView(page, properties);
  }, [analytics]);

  const trackCNCOperation = useCallback((operation: string, properties: Record<string, any> = {}) => {
    analytics.trackCNCOperation(operation, properties);
  }, [analytics]);

  const trackPluginUsage = useCallback((
    pluginId: string,
    action: string,
    properties: Record<string, any> = {},
  ) => {
    analytics.trackPluginUsage(pluginId, action, properties);
  }, [analytics]);

  const trackError = useCallback((
    error: Error,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ) => {
    analytics.trackError(error, context, severity);
    errorTracker.trackError(error, context, severity);
  }, [analytics, errorTracker]);

  const trackPerformance = useCallback((
    metric: string,
    value: number,
    properties: Record<string, any> = {},
  ) => {
    analytics.trackPerformance(metric, value, properties);
  }, [analytics]);

  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId);
  }, [analytics]);

  const setGlobalProperties = useCallback((properties: Record<string, any>) => {
    analytics.setGlobalProperties(properties);
  }, [analytics]);

  const getSession = useCallback(() => analytics.getSession(), [analytics]);

  return {
    track,
    trackPageView,
    trackCNCOperation,
    trackPluginUsage,
    trackError,
    trackPerformance,
    setUserId,
    setGlobalProperties,
    getSession,
    isEnabled: true, // This would come from analytics config
  };
};

/**
 * Hook for tracking page views automatically
 */
export const usePageTracking = (pageName: string, properties: Record<string, any> = {}) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName, {
      ...properties,
      entryTime: Date.now(),
    });

    const startTime = Date.now();

    return () => {
      const timeOnPage = Date.now() - startTime;
      trackPageView(`${pageName}_exit`, {
        ...properties,
        timeOnPage,
        exitTime: Date.now(),
      });
    };
  }, [pageName, trackPageView, properties]);
};

/**
 * Hook for tracking user interactions with automatic cleanup
 */
export const useInteractionTracking = () => {
  const { track } = useAnalytics();

  const trackClick = useCallback((elementId: string, properties: Record<string, any> = {}) => {
    track('user_interaction', 'ui_interaction', 'click', {
      elementId,
      ...properties,
    });
  }, [track]);

  const trackFormSubmission = useCallback((formId: string, properties: Record<string, any> = {}) => {
    track('user_interaction', 'ui_interaction', 'form_submit', {
      formId,
      ...properties,
    });
  }, [track]);

  const trackFormError = useCallback((formId: string, errors: Record<string, string>) => {
    track('user_interaction', 'ui_interaction', 'form_error', {
      formId,
      errors,
      errorCount: Object.keys(errors).length,
    });
  }, [track]);

  const trackNavigation = useCallback((from: string, to: string, method: 'click' | 'back' | 'forward' = 'click') => {
    track('user_interaction', 'ui_interaction', 'navigation', {
      from,
      to,
      method,
    });
  }, [track]);

  const trackSearch = useCallback((query: string, results: number, properties: Record<string, any> = {}) => {
    track('user_interaction', 'ui_interaction', 'search', {
      query,
      results,
      ...properties,
    });
  }, [track]);

  return {
    trackClick,
    trackFormSubmission,
    trackFormError,
    trackNavigation,
    trackSearch,
  };
};

/**
 * Hook for tracking CNC-specific operations
 */
export const useCNCTracking = () => {
  const { trackCNCOperation } = useAnalytics();

  const trackJogOperation = useCallback((axis: 'X' | 'Y' | 'Z', direction: number, distance: number) => {
    trackCNCOperation('jog', {
      axis,
      direction,
      distance,
      timestamp: Date.now(),
    });
  }, [trackCNCOperation]);

  const trackHomeOperation = useCallback((axes: string[]) => {
    trackCNCOperation('home', {
      axes,
      timestamp: Date.now(),
    });
  }, [trackCNCOperation]);

  const trackFileOperation = useCallback((operation: 'upload' | 'download' | 'delete' | 'execute', filename: string) => {
    trackCNCOperation(`file_${operation}`, {
      filename,
      timestamp: Date.now(),
    });
  }, [trackCNCOperation]);

  const trackConnectionChange = useCallback((status: 'connected' | 'disconnected' | 'error', details?: any) => {
    trackCNCOperation('connection_change', {
      status,
      details,
      timestamp: Date.now(),
    });
  }, [trackCNCOperation]);

  const trackEmergencyStop = useCallback((reason: string) => {
    trackCNCOperation('emergency_stop', {
      reason,
      timestamp: Date.now(),
    }, { immediate: true });
  }, [trackCNCOperation]);

  return {
    trackJogOperation,
    trackHomeOperation,
    trackFileOperation,
    trackConnectionChange,
    trackEmergencyStop,
  };
};

/**
 * Hook for performance tracking
 */
export const usePerformanceTracking = () => {
  const { trackPerformance } = useAnalytics();

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFunction: () => Promise<T>,
    properties: Record<string, any> = {},
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await asyncFunction();
      const duration = performance.now() - startTime;

      trackPerformance(operation, duration, {
        ...properties,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      trackPerformance(operation, duration, {
        ...properties,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }, [trackPerformance]);

  const measureSync = useCallback(<T>(
    operation: string,
    syncFunction: () => T,
    properties: Record<string, any> = {},
  ): T => {
    const startTime = performance.now();

    try {
      const result = syncFunction();
      const duration = performance.now() - startTime;

      trackPerformance(operation, duration, {
        ...properties,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      trackPerformance(operation, duration, {
        ...properties,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }, [trackPerformance]);

  return {
    measureAsync,
    measureSync,
  };
};
