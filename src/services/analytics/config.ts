/**
 * Analytics Configuration
 * Default configuration for analytics and monitoring services
 */

import { AnalyticsConfig } from './types';

export const analyticsConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  endpoint: process.env.VITE_ANALYTICS_ENDPOINT || 'https://analytics.cnc-control.com/events',
  apiKey: process.env.VITE_ANALYTICS_API_KEY || '',
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  retryAttempts: 3,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableUserBehaviorTracking: true,
  enableSecurityMonitoring: true,
  enableSystemHealthMonitoring: true,

  sampling: {
    performance: 0.1, // 10% sampling for performance events
    errors: 1.0, // 100% sampling for errors
    userEvents: 0.5, // 50% sampling for user events
  },

  privacy: {
    anonymizeIP: true,
    respectDoNotTrack: true,
    enableDataCollection: true,
  },
};

// Environment-specific overrides
export const developmentConfig: Partial<AnalyticsConfig> = {
  enabled: true,
  debug: true,
  endpoint: 'http://localhost:3001/analytics',
  sampling: {
    performance: 1.0,
    errors: 1.0,
    userEvents: 1.0,
  },
};

export const productionConfig: Partial<AnalyticsConfig> = {
  enabled: true,
  debug: false,
  batchSize: 100,
  flushInterval: 60000, // 1 minute
  sampling: {
    performance: 0.05, // 5% sampling in production
    errors: 1.0,
    userEvents: 0.2, // 20% sampling in production
  },
};

// Feature flags for different monitoring aspects
export const monitoringFeatures = {
  realTimePerformance: true,
  errorAggregation: true,
  userJourneyTracking: true,
  securityEventMonitoring: true,
  systemHealthDashboard: true,
  alertingSystem: true,
  customMetrics: true,
  apmIntegration: true,
};

// Performance monitoring thresholds
export const performanceThresholds = {
  // Core Web Vitals
  lcp: 2500, // Largest Contentful Paint (ms)
  fid: 100, // First Input Delay (ms)
  cls: 0.1, // Cumulative Layout Shift
  fcp: 1800, // First Contentful Paint (ms)
  ttfb: 600, // Time to First Byte (ms)

  // CNC-specific thresholds
  jogResponseTime: 100, // Jog command response (ms)
  positionUpdateLatency: 50, // Position update latency (ms)
  fileLoadTime: 5000, // File load time (ms)
  pluginInitTime: 2000, // Plugin initialization (ms)
  renderTime: 16, // Frame render time (ms)

  // System thresholds
  memoryUsage: 0.8, // 80% memory usage
  cpuUsage: 0.7, // 70% CPU usage
  errorRate: 0.05, // 5% error rate
  responseTime: 1000, // 1 second response time
};

// Error severity mapping
export const errorSeverityLevels = {
  low: {
    threshold: 1,
    autoResolve: true,
    notificationChannels: ['console'],
  },
  medium: {
    threshold: 5,
    autoResolve: false,
    notificationChannels: ['console', 'browser'],
  },
  high: {
    threshold: 1,
    autoResolve: false,
    notificationChannels: ['console', 'browser', 'webhook'],
  },
  critical: {
    threshold: 1,
    autoResolve: false,
    notificationChannels: ['console', 'browser', 'webhook', 'email'],
  },
};

// User behavior tracking configuration
export const behaviorTrackingConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  trackClicks: true,
  trackScrolls: true,
  trackFormInteractions: true,
  trackNavigations: true,
  trackCNCOperations: true,
  trackPluginUsage: true,
  trackFileOperations: true,
  trackErrorRecovery: true,
};

// Security monitoring configuration
export const securityMonitoringConfig = {
  detectSuspiciousActivity: true,
  monitorCSPViolations: true,
  trackFailedAuthentications: true,
  detectXSSAttempts: true,
  monitorFileUploads: true,
  trackPrivilegeEscalation: true,
  rateLimitMonitoring: true,
  ipGeolocationTracking: false, // Disabled for privacy
};

// System health monitoring configuration
export const systemHealthConfig = {
  checkInterval: 60000, // 1 minute
  metrics: {
    uptime: true,
    responseTime: true,
    errorRate: true,
    throughput: true,
    memoryUsage: true,
    cpuUsage: true,
    diskUsage: true,
    networkLatency: true,
    cncConnectionStatus: true,
    pluginHealth: true,
  },
  alertThresholds: {
    responseTime: 2000,
    errorRate: 0.1,
    memoryUsage: 0.9,
    cpuUsage: 0.8,
    diskUsage: 0.9,
  },
};
