# Monitoring and Analytics Documentation

## Overview

The CNC Control application includes a comprehensive monitoring and analytics system that provides real-time insights into application performance, user behavior, system health, and security events. This documentation covers the implementation, configuration, and usage of the monitoring infrastructure.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Analytics Service](#analytics-service)
3. [Performance Monitoring](#performance-monitoring)
4. [Error Tracking](#error-tracking)
5. [System Health Monitoring](#system-health-monitoring)
6. [Security Monitoring](#security-monitoring)
7. [Configuration](#configuration)
8. [React Integration](#react-integration)
9. [Monitoring Dashboard](#monitoring-dashboard)
10. [Deployment Considerations](#deployment-considerations)
11. [Privacy and Compliance](#privacy-and-compliance)

## Architecture Overview

### Core Components

The monitoring system consists of several interconnected services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Architecture                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Analytics       │  │ Performance     │  │ Error        │ │
│  │ Service         │  │ Monitor         │  │ Tracker      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ System Health   │  │ Security        │  │ User         │ │
│  │ Monitor         │  │ Monitor         │  │ Behavior     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐  │
│  │           Analytics Provider (React Context)        │  │
│  └─────────────────────────┼─────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐  │
│  │              Monitoring Dashboard UI              │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **Real-time Monitoring**: Live performance metrics and alerts
- **Error Tracking**: Comprehensive error capture and analysis
- **User Analytics**: Behavior tracking and journey analysis
- **Security Monitoring**: Threat detection and security events
- **System Health**: Resource monitoring and health checks
- **Privacy Compliant**: Respects user privacy settings and GDPR

## Analytics Service

### Core Functionality

The `AnalyticsService` is the central hub for all analytics activities:

```typescript
import { AnalyticsService } from '@/services/analytics';

const analytics = new AnalyticsService({
  enabled: true,
  endpoint: 'https://analytics.cnc-control.com/events',
  apiKey: 'your-api-key'
});

// Track events
analytics.track('user_interaction', 'cnc_control', 'jog_operation', {
  axis: 'X',
  distance: 10,
  speed: 100
});
```

### Event Types

| Type | Purpose | Examples |
|------|---------|----------|
| `performance` | System performance metrics | Response times, memory usage |
| `error` | Error occurrences | JavaScript errors, API failures |
| `user_interaction` | User behavior | Clicks, navigation, CNC operations |
| `system_health` | System status | Connection status, resource usage |
| `security` | Security events | Failed logins, suspicious activity |
| `business` | Business metrics | Job completions, machine utilization |
| `diagnostic` | Debug information | Debug logs, diagnostic data |

### Event Categories

Events are categorized for better organization and analysis:

- `cnc_control` - CNC machine operations
- `jog_operations` - Manual positioning commands
- `file_management` - File upload/download operations
- `plugin_system` - Plugin-related activities
- `ui_interaction` - User interface interactions
- `system_performance` - Performance-related events
- `error_tracking` - Error and exception events
- `security_events` - Security-related events
- `user_journey` - User flow and navigation

## Performance Monitoring

### Core Web Vitals

The system automatically tracks Core Web Vitals:

```typescript
import { PerformanceMonitor } from '@/services/analytics';

const monitor = new PerformanceMonitor();
monitor.start();

// Get current metrics
const metrics = monitor.getMetrics();
console.log({
  lcp: metrics.lcp, // Largest Contentful Paint
  fid: metrics.fid, // First Input Delay
  cls: metrics.cls, // Cumulative Layout Shift
  fcp: metrics.fcp, // First Contentful Paint
  ttfb: metrics.ttfb // Time to First Byte
});
```

### CNC-Specific Metrics

Industrial CNC applications have unique performance requirements:

```typescript
// Measure jog response time
const endMeasurement = monitor.measureJogResponse();
// ... perform jog operation
endMeasurement(); // Automatically records timing

// Measure file load performance
const endFileLoad = monitor.measureFileLoad(fileSize);
// ... load file
endFileLoad(); // Records load time and calculates throughput
```

### Performance Thresholds

Default performance thresholds can be configured:

```typescript
export const performanceThresholds = {
  lcp: 2500,    // Largest Contentful Paint (ms)
  fid: 100,     // First Input Delay (ms)
  cls: 0.1,     // Cumulative Layout Shift
  jogResponseTime: 100,       // Jog response (ms)
  positionUpdateLatency: 50,  // Position update (ms)
  fileLoadTime: 5000,         // File load (ms)
  memoryUsage: 0.8,           // 80% memory usage
  errorRate: 0.05             // 5% error rate
};
```

## Error Tracking

### Automatic Error Capture

The error tracker automatically captures various types of errors:

```typescript
import { ErrorTracker } from '@/services/analytics';

const errorTracker = new ErrorTracker(sessionId);
errorTracker.start();

// Automatically captures:
// - JavaScript errors
// - Unhandled promise rejections
// - Network failures
// - CNC communication errors
```

### Manual Error Tracking

You can also manually track specific errors:

```typescript
// Track CNC-specific errors
errorTracker.trackCNCError(
  'Failed to establish connection',
  { machineId: 'CNC-001', lastKnownState: 'idle' },
  'critical'
);

// Track plugin errors
errorTracker.trackPluginError(
  new Error('Plugin initialization failed'),
  'gcode-viewer',
  { version: '1.2.3', config: pluginConfig },
  'high'
);

// Track UI errors
errorTracker.trackUIError(
  new Error('Component render failed'),
  'JogControls',
  'button_click',
  'medium'
);
```

### Error Context and Breadcrumbs

Errors include rich context and breadcrumb trails:

```typescript
// Add breadcrumbs for debugging
errorTracker.addBreadcrumb(
  'user_action',
  'User clicked jog button',
  'info',
  { axis: 'X', direction: 1 }
);

// Errors automatically include:
// - Stack traces
// - Browser information
// - User actions leading to error
// - System state at time of error
// - Device and network information
```

## System Health Monitoring

### Health Metrics

The system health monitor tracks comprehensive metrics:

```typescript
import { SystemHealthMonitor } from '@/services/analytics';

const healthMonitor = new SystemHealthMonitor();
healthMonitor.start();

// Update CNC status
healthMonitor.updateCNCStatus('connected', {
  machineId: 'CNC-001',
  firmware: '2.1.3'
});

// Record job metrics
healthMonitor.updateJobMetrics(3, 12); // 3 active, 12 queued

// Get health status
const health = healthMonitor.getHealthStatus();
console.log({
  status: health.status,     // 'healthy', 'warning', 'critical'
  score: health.score,       // 0-100 health score
  uptime: health.uptime,     // Milliseconds since start
  issues: health.issues      // Array of current issues
});
```

### Alerts

The system generates alerts based on thresholds:

```typescript
// Alert types
type AlertType = 
  | 'performance_degradation'
  | 'error_spike'
  | 'security_threat'
  | 'system_outage'
  | 'cnc_disconnection'
  | 'plugin_failure'
  | 'resource_exhaustion';

// Listen for alerts
healthMonitor.on('alert_created', (alert) => {
  console.log(`Alert: ${alert.title} - ${alert.description}`);
  
  // Send notification based on severity
  if (alert.severity === 'critical') {
    notificationService.sendCriticalAlert(alert);
  }
});
```

## Security Monitoring

### Security Events

The security monitor tracks various security-related events:

```typescript
import { SecurityMonitor } from '@/services/analytics';

const securityMonitor = new SecurityMonitor();

// Automatically monitors:
// - CSP violations
// - Failed authentication attempts
// - Suspicious user behavior
// - File upload security
// - XSS and injection attempts

// Manual security event tracking
securityMonitor.trackSecurityEvent(
  'suspicious_activity',
  'Multiple failed login attempts',
  'warning',
  { attempts: 5, timeWindow: '5 minutes' }
);
```

## Configuration

### Environment Configuration

```typescript
// Development configuration
export const developmentConfig: Partial<AnalyticsConfig> = {
  enabled: true,
  debug: true,
  endpoint: 'http://localhost:3001/analytics',
  sampling: {
    performance: 1.0,  // 100% sampling in development
    errors: 1.0,
    userEvents: 1.0
  }
};

// Production configuration
export const productionConfig: Partial<AnalyticsConfig> = {
  enabled: true,
  debug: false,
  sampling: {
    performance: 0.05, // 5% sampling in production
    errors: 1.0,       // Always track errors
    userEvents: 0.2    // 20% user event sampling
  }
};
```

### Privacy Configuration

```typescript
export const analyticsConfig: AnalyticsConfig = {
  privacy: {
    anonymizeIP: true,           // Anonymize IP addresses
    respectDoNotTrack: true,     // Honor DNT headers
    enableDataCollection: true   // Master switch for data collection
  }
};
```

## React Integration

### Analytics Provider

Wrap your application with the analytics provider:

```tsx
import { AnalyticsProvider } from '@/services/analytics';

function App() {
  return (
    <AnalyticsProvider 
      config={{ 
        enabled: true,
        debug: process.env.NODE_ENV === 'development'
      }}
      autoStart={true}
    >
      <YourAppComponents />
    </AnalyticsProvider>
  );
}
```

### Analytics Hooks

Use the analytics hooks in your components:

```tsx
import { useAnalytics, useCNCTracking, usePageTracking } from '@/services/analytics';

function JogControls() {
  const { trackCNCOperation } = useAnalytics();
  const { trackJogOperation } = useCNCTracking();
  
  // Track page view
  usePageTracking('jog-controls', { section: 'cnc-control' });
  
  const handleJog = (axis: 'X' | 'Y' | 'Z', direction: number) => {
    trackJogOperation(axis, direction, jogDistance);
    // ... perform jog operation
  };
  
  return (
    <div>
      <button onClick={() => handleJog('X', 1)}>Jog X+</button>
      {/* ... other controls */}
    </div>
  );
}
```

### Performance Tracking

```tsx
import { usePerformanceTracking } from '@/services/analytics';

function FileUpload() {
  const { measureAsync } = usePerformanceTracking();
  
  const handleUpload = async (file: File) => {
    await measureAsync('file_upload', async () => {
      await uploadFile(file);
    }, { fileSize: file.size, fileType: file.type });
  };
  
  return <input type="file" onChange={handleUpload} />;
}
```

## Monitoring Dashboard

### Real-time Dashboard

The monitoring dashboard provides real-time insights:

```tsx
import { MonitoringDashboard } from '@/ui/components/MonitoringDashboard';

function AdminPanel() {
  return (
    <div>
      <MonitoringDashboard 
        refreshInterval={30000} // 30 seconds
        className="admin-dashboard"
      />
    </div>
  );
}
```

### Dashboard Features

- **Real-time Metrics**: Live performance indicators
- **Alert Management**: Active alert display and management
- **Performance Charts**: Historical performance trends
- **Error Analysis**: Error frequency and patterns
- **System Health**: Overall system status
- **CNC Status**: Machine connectivity and utilization

## Deployment Considerations

### Environment Variables

```bash
# Analytics configuration
VITE_ANALYTICS_ENDPOINT=https://analytics.cnc-control.com/events
VITE_ANALYTICS_API_KEY=your-analytics-api-key

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### CI/CD Integration

The monitoring system integrates with CI/CD pipelines:

```yaml
# .github/workflows/ci-cd.yml
- name: Performance Test
  run: |
    npm run build:production
    npm run test:performance
    npm run analyze:bundle
```

### Data Retention

Configure data retention policies:

```typescript
export const storageConfig = {
  retentionPeriod: 90,        // 90 days
  compressionEnabled: true,    // Compress old data
  localStorageLimit: 10,      // 10MB local storage
  cloudStorageEnabled: true   // Enable cloud backup
};
```

## Privacy and Compliance

### GDPR Compliance

The system includes GDPR compliance features:

- **Consent Management**: User consent tracking
- **Data Anonymization**: IP address anonymization
- **Right to be Forgotten**: Data deletion capabilities
- **Data Portability**: Export user data
- **Transparent Privacy**: Clear privacy policies

### Privacy Controls

```typescript
// Respect user privacy preferences
if (navigator.doNotTrack === '1') {
  analyticsConfig.enabled = false;
}

// Anonymous tracking mode
analytics.setAnonymousMode(true);

// Disable specific tracking
analytics.disableTracking(['user_behavior', 'location']);
```

### Data Security

- **Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Role-based access to analytics data
- **Audit Logging**: Full audit trail of data access
- **Data Minimization**: Collect only necessary data

## Best Practices

### Performance

1. **Use Sampling**: Implement appropriate sampling rates for production
2. **Batch Events**: Group events for efficient transmission
3. **Async Processing**: Process analytics asynchronously
4. **Local Storage**: Use local storage for offline scenarios

### Privacy

1. **Minimal Data**: Collect only necessary information
2. **User Consent**: Always obtain proper consent
3. **Anonymization**: Anonymize sensitive data
4. **Transparency**: Be clear about data collection

### Error Handling

1. **Graceful Degradation**: Analytics failures shouldn't break the app
2. **Error Context**: Include sufficient context for debugging
3. **Error Grouping**: Group similar errors to avoid noise
4. **Alert Fatigue**: Set appropriate alert thresholds

### Security

1. **API Security**: Secure analytics endpoints
2. **Data Validation**: Validate all incoming data
3. **Rate Limiting**: Implement rate limiting
4. **Audit Trail**: Maintain comprehensive audit logs

## Troubleshooting

### Common Issues

1. **Events Not Sending**
   - Check network connectivity
   - Verify API endpoint and key
   - Check browser console for errors

2. **High Memory Usage**
   - Reduce event batching size
   - Implement more aggressive sampling
   - Clear old data more frequently

3. **Performance Impact**
   - Enable sampling in production
   - Use async event processing
   - Optimize data payload size

### Debug Mode

Enable debug mode for troubleshooting:

```typescript
const analytics = new AnalyticsService({
  debug: true,
  enabled: true
});

// Debug output will appear in console
```

## API Reference

### AnalyticsService

```typescript
class AnalyticsService {
  track(type: EventType, category: EventCategory, action: string, properties?: Record<string, any>): void
  trackPageView(page: string, properties?: Record<string, any>): void
  trackCNCOperation(operation: string, properties?: Record<string, any>): void
  trackError(error: Error, context?: Record<string, any>, severity?: ErrorSeverity): void
  setUserId(userId: string): void
  flush(): Promise<void>
  destroy(): void
}
```

### PerformanceMonitor

```typescript
class PerformanceMonitor {
  start(): void
  stop(): void
  getMetrics(): PerformanceMetrics
  measureJogResponse(): () => void
  measureFileLoad(fileSize?: number): () => void
  getPerformanceReport(): PerformanceReport
}
```

### ErrorTracker

```typescript
class ErrorTracker {
  start(): void
  stop(): void
  trackError(error: Error | string, context?: ErrorContext, severity?: ErrorSeverity): void
  trackCNCError(message: string, cncState: any, severity?: ErrorSeverity): void
  addBreadcrumb(category: string, message: string, level?: 'info' | 'warning' | 'error'): void
  getErrorStats(): ErrorStats
}
```

---

For more detailed information, see the individual service documentation files or contact the development team.