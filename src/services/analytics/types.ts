/**
 * Analytics Types and Interfaces
 * Comprehensive type definitions for monitoring and analytics system
 */

// Base analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint: string;
  apiKey: string;
  batchSize: number;
  flushInterval: number;
  retryAttempts: number;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserBehaviorTracking: boolean;
  enableSecurityMonitoring: boolean;
  enableSystemHealthMonitoring: boolean;
  sampling: {
    performance: number;
    errors: number;
    userEvents: number;
  };
  privacy: {
    anonymizeIP: boolean;
    respectDoNotTrack: boolean;
    enableDataCollection: boolean;
  };
}

// Analytics event structure
export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: EventType;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  sessionId: string;
  userId?: string;
  deviceInfo: DeviceInfo;
  context: EventContext;
}

export type EventType =
  | 'performance'
  | 'error'
  | 'user_interaction'
  | 'system_health'
  | 'security'
  | 'business'
  | 'diagnostic';

export type EventCategory =
  | 'cnc_control'
  | 'jog_operations'
  | 'file_management'
  | 'plugin_system'
  | 'ui_interaction'
  | 'system_performance'
  | 'error_tracking'
  | 'security_events'
  | 'user_journey';

// Performance monitoring
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte

  // Custom CNC metrics
  jogResponseTime: number;
  positionUpdateLatency: number;
  fileLoadTime: number;
  pluginInitTime: number;
  renderTime: number;

  // System metrics
  memoryUsage: MemoryUsage;
  cpuUsage: number;
  networkQuality: NetworkQuality;
  batteryLevel?: number;

  // User experience metrics
  taskCompletionTime: number;
  errorRate: number;
  sessionDuration: number;
  bounceRate: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export interface NetworkQuality {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// Error tracking
export interface ErrorEvent {
  id: string;
  timestamp: number;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  source: string;
  line?: number;
  column?: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
  tags: Record<string, string>;
  fingerprint: string;
}

export type ErrorType =
  | 'javascript'
  | 'promise_rejection'
  | 'network'
  | 'cnc_communication'
  | 'plugin_error'
  | 'ui_error'
  | 'validation'
  | 'security';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  cncState?: any;
  pluginContext?: any;
  userAction?: string;
  deviceState?: any;
}

export interface Breadcrumb {
  timestamp: number;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// User behavior tracking
export interface UserEvent {
  id: string;
  timestamp: number;
  type: UserEventType;
  action: string;
  target: string;
  properties: Record<string, any>;
  sessionId: string;
  userId?: string;
  screen: string;
  previousScreen?: string;
  duration?: number;
  sequence: number;
}

export type UserEventType =
  | 'click'
  | 'scroll'
  | 'touch'
  | 'gesture'
  | 'navigation'
  | 'form_interaction'
  | 'cnc_operation'
  | 'plugin_usage'
  | 'settings_change'
  | 'file_operation';

// Security monitoring
export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  description: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent: string;
  sessionId: string;
  userId?: string;
  blocked: boolean;
  riskScore: number;
}

export type SecurityEventType =
  | 'suspicious_activity'
  | 'failed_authentication'
  | 'csp_violation'
  | 'xss_attempt'
  | 'sql_injection'
  | 'file_upload_violation'
  | 'rate_limit_exceeded'
  | 'unusual_behavior'
  | 'privilege_escalation';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

// System health monitoring
export interface SystemMetrics {
  timestamp: number;

  // Application health
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;

  // CNC-specific metrics
  cncConnectionStatus: 'connected' | 'disconnected' | 'error';
  activeJobs: number;
  queueSize: number;
  machineUtilization: number;

  // Plugin system health
  loadedPlugins: number;
  failedPlugins: number;
  pluginMemoryUsage: number;

  // Browser/device metrics
  browserMemory: MemoryUsage;
  deviceBattery?: number;
  networkStatus: 'online' | 'offline' | 'slow';

  // User session metrics
  activeSessions: number;
  averageSessionDuration: number;
  concurrentUsers: number;
}

// Device and context information
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: string;
  isOnline: boolean;
  timezone: string;
}

export interface EventContext {
  page: string;
  referrer?: string;
  sessionDuration: number;
  previousEvents: string[];
  cncState?: {
    connected: boolean;
    position: { x: number; y: number; z: number };
    status: string;
  };
  uiState?: {
    theme: string;
    layout: string;
    activePlugins: string[];
  };
}

// Monitoring dashboard
export interface MonitoringDashboard {
  realTimeMetrics: RealTimeMetrics;
  alerts: Alert[];
  trends: TrendData[];
  reports: Report[];
}

export interface RealTimeMetrics {
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  cncMachinesOnline: number;
  systemLoad: number;
  memoryUsage: number;
  networkLatency: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  status: 'active' | 'resolved' | 'acknowledged';
  assignee?: string;
}

export type AlertType =
  | 'performance_degradation'
  | 'error_spike'
  | 'security_threat'
  | 'system_outage'
  | 'cnc_disconnection'
  | 'plugin_failure'
  | 'resource_exhaustion';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface TrendData {
  metric: string;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  data: Array<{
    timestamp: number;
    value: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  generatedAt: number;
  timeframe: {
    start: number;
    end: number;
  };
  data: any;
  charts: ChartConfig[];
}

export type ReportType =
  | 'performance_summary'
  | 'error_analysis'
  | 'user_behavior'
  | 'security_audit'
  | 'system_health'
  | 'cnc_utilization'
  | 'plugin_usage';

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  data: any[];
}

// Configuration options for different monitoring aspects
export interface MonitoringOptions {
  sampling: SamplingConfig;
  filters: FilterConfig;
  aggregation: AggregationConfig;
  storage: StorageConfig;
  alerting: AlertingConfig;
}

export interface SamplingConfig {
  performanceEvents: number;
  errorEvents: number;
  userEvents: number;
  securityEvents: number;
  adaptiveSampling: boolean;
}

export interface FilterConfig {
  excludePatterns: string[];
  includePatterns: string[];
  errorThreshold: ErrorSeverity;
  performanceThreshold: number;
}

export interface AggregationConfig {
  windowSize: number;
  aggregationFunctions: string[];
  realTimeUpdates: boolean;
}

export interface StorageConfig {
  retentionPeriod: number;
  compressionEnabled: boolean;
  localStorageLimit: number;
  cloudStorageEnabled: boolean;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: Record<string, number>;
  escalationRules: EscalationRule[];
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'browser';
  endpoint: string;
  enabled: boolean;
}

export interface EscalationRule {
  condition: string;
  delay: number;
  actions: string[];
}
