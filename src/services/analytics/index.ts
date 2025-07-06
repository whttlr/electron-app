/**
 * Analytics Service - Real-time monitoring and telemetry for CNC Control
 * Provides comprehensive analytics, performance monitoring, and user behavior tracking
 */

export { AnalyticsService } from './AnalyticsService';
export { PerformanceMonitor } from './PerformanceMonitor';
export { ErrorTracker } from './ErrorTracker';
export { UserBehaviorTracker } from './UserBehaviorTracker';
export { SecurityMonitor } from './SecurityMonitor';
export { SystemHealthMonitor } from './SystemHealthMonitor';

// Types and interfaces
export type {
  AnalyticsConfig,
  AnalyticsEvent,
  PerformanceMetrics,
  ErrorEvent,
  UserEvent,
  SecurityEvent,
  SystemMetrics,
  MonitoringDashboard,
} from './types';

// Configuration
export { analyticsConfig } from './config';

// Utilities
export { createAnalyticsProvider } from './providers/AnalyticsProvider';
export { useAnalytics } from './hooks/useAnalytics';
export { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
export { useErrorTracking } from './hooks/useErrorTracking';
