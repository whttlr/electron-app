# Plugin Integration Framework

The Plugin Integration Framework provides a standardized way for plugins to connect and interact with external systems through configurable adapters.

## Features

- **Adapter System**: Pluggable adapters for different integration types
- **Unified Operations**: Standardized operations across all adapter types
- **Data Mapping**: Transform data between internal and external formats
- **Security Controls**: Permission-based access and credential management
- **Trigger System**: Event-driven and scheduled integrations
- **Connection Management**: Connection pooling and health monitoring
- **Error Handling**: Comprehensive error handling with retry strategies
- **Performance Monitoring**: Real-time metrics and diagnostics

## Core Components

### IntegrationFramework

Main framework that manages adapters and integrations.

```typescript
import { IntegrationFramework } from './IntegrationFramework'

const framework = new IntegrationFramework(logger)
await framework.initialize()

// Register adapters
await framework.registerAdapter(new DatabaseAdapter())
await framework.registerAdapter(new HttpApiAdapter())

// Create integration
await framework.createIntegration({
  id: 'cnc-database',
  name: 'CNC Data Logger',
  adapterId: 'database',
  config: { timeout: 30000, retries: 3 },
  credentials: { type: 'basic_auth', username: 'user', password: 'pass' }
})
```

### Integration Adapters

Standardized adapters for different external systems.

#### DatabaseAdapter

Provides database connectivity with SQL operations.

```typescript
import { DatabaseAdapter } from './adapters/DatabaseAdapter'

const adapter = new DatabaseAdapter(logger)
await adapter.initialize({
  host: 'localhost',
  port: 5432,
  database: 'cnc_data',
  ssl: true
})

// Execute operations
const result = await adapter.execute({
  type: 'query',
  parameters: {
    sql: 'SELECT * FROM machine_status WHERE timestamp > $1',
    params: [new Date(Date.now() - 3600000)]
  }
})
```

#### HttpApiAdapter

Provides HTTP REST API connectivity.

```typescript
import { HttpApiAdapter } from './adapters/HttpApiAdapter'

const adapter = new HttpApiAdapter(logger)
await adapter.initialize({
  baseUrl: 'https://api.example.com',
  timeout: 15000,
  defaultHeaders: { 'User-Agent': 'CNC-Plugin/1.0' }
})

// Execute operations
const result = await adapter.execute({
  type: 'post',
  parameters: {
    endpoint: '/machine/status',
    data: { status: 'running', position: { x: 10, y: 20, z: 5 } },
    headers: { 'Content-Type': 'application/json' }
  }
})
```

#### FileSystemAdapter

Provides secure file system operations.

```typescript
import { FileSystemAdapter } from './adapters/FileSystemAdapter'

const adapter = new FileSystemAdapter(logger)
await adapter.initialize({
  basePath: '/var/cnc/data',
  allowedExtensions: ['.gcode', '.json', '.txt'],
  maxFileSize: 10 * 1024 * 1024,
  permissions: { read: true, write: true, delete: false, create: true }
})

// Execute operations
const result = await adapter.execute({
  type: 'write',
  parameters: {
    filePath: 'jobs/part-001.gcode',
    content: 'G0 X0 Y0 Z0\nG1 X10 Y10 F1000\n...',
    encoding: 'utf8'
  }
})
```

## Integration Definition

Integrations define how plugins connect to external systems:

```typescript
const integration: IntegrationDefinition = {
  id: 'erp-integration',
  name: 'ERP System Integration',
  description: 'Sync machine data with ERP system',
  adapterId: 'http_api',
  
  config: {
    endpoint: 'https://erp.company.com/api',
    timeout: 30000,
    retries: 3,
    rateLimit: { requests: 100, window: 60000 }
  },
  
  credentials: {
    type: 'oauth2',
    data: {
      clientId: 'cnc-plugin',
      clientSecret: 'secret-key',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    },
    encrypted: true
  },
  
  mappings: [
    {
      id: 'machine-status',
      name: 'Machine Status Mapping',
      source: { path: 'machine.status', type: 'string', required: true },
      target: { path: 'equipment.state', type: 'string', required: true },
      transformation: {
        type: 'script',
        config: { 
          script: 'return value.toUpperCase()' 
        }
      }
    }
  ],
  
  triggers: [
    {
      id: 'status-sync',
      type: 'schedule',
      config: { 
        schedule: '*/5 * * * *', // Every 5 minutes
        timezone: 'UTC' 
      },
      enabled: true
    }
  ],
  
  metadata: {
    pluginId: 'cnc-monitor',
    created: new Date(),
    modified: new Date(),
    version: '1.0.0',
    tags: ['erp', 'sync', 'status']
  }
}
```

## Data Mapping

Transform data between internal and external formats:

### Field Mapping

```typescript
const mapping: DataMapping = {
  id: 'coordinate-mapping',
  name: 'Coordinate System Mapping',
  source: { 
    path: 'position', 
    type: 'object', 
    required: true 
  },
  target: { 
    path: 'coordinates', 
    type: 'object', 
    required: true 
  },
  transformation: {
    type: 'script',
    config: {
      script: `
        return {
          x: value.x * 1000, // Convert to micrometers
          y: value.y * 1000,
          z: value.z * 1000,
          timestamp: new Date().toISOString()
        }
      `
    }
  }
}
```

### Template Transformation

```typescript
const transformation: DataTransformation = {
  type: 'template',
  config: {
    template: {
      machine_id: '{{machine.id}}',
      status: '{{status | uppercase}}',
      position: {
        x: '{{position.x}}',
        y: '{{position.y}}',
        z: '{{position.z}}'
      },
      timestamp: '{{timestamp | iso}}'
    }
  }
}
```

## Trigger System

### Schedule Triggers

```typescript
const scheduleTrigger: IntegrationTrigger = {
  id: 'hourly-sync',
  type: 'schedule',
  config: {
    schedule: '0 * * * *', // Every hour
    timezone: 'America/New_York'
  },
  enabled: true
}
```

### Webhook Triggers

```typescript
const webhookTrigger: IntegrationTrigger = {
  id: 'status-webhook',
  type: 'webhook',
  config: {
    endpoint: '/api/webhooks/machine-status',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer webhook-token',
      'Content-Type': 'application/json'
    }
  },
  enabled: true
}
```

### Event Triggers

```typescript
const eventTrigger: IntegrationTrigger = {
  id: 'alarm-trigger',
  type: 'event',
  config: {
    eventName: 'machine.alarm',
    eventFilter: {
      severity: 'critical',
      machine_id: 'cnc-001'
    }
  },
  enabled: true
}
```

### Polling Triggers

```typescript
const pollingTrigger: IntegrationTrigger = {
  id: 'status-poll',
  type: 'polling',
  config: {
    interval: 30000, // 30 seconds
    query: {
      endpoint: '/api/status',
      method: 'GET'
    }
  },
  enabled: true
}
```

## Security Features

### Credential Management

```typescript
const credentials: IntegrationCredentials = {
  type: 'oauth2',
  data: {
    clientId: 'plugin-client',
    clientSecret: 'encrypted-secret',
    accessToken: 'encrypted-token',
    refreshToken: 'encrypted-refresh'
  },
  encrypted: true
}
```

### Permission Controls

```typescript
const permissions = {
  read: true,
  write: false,
  delete: false,
  create: true
}
```

### Path Security (File System)

```typescript
const fsConfig = {
  basePath: '/safe/plugin/directory',
  allowedExtensions: ['.json', '.txt', '.gcode'],
  maxFileSize: 10 * 1024 * 1024
}
```

## Error Handling

### Retry Strategies

```typescript
const retryConfig = {
  retries: 3,
  retryStrategy: 'exponential',
  retryDelay: 1000,
  maxRetryDelay: 30000
}
```

### Circuit Breaker

```typescript
const circuitBreaker = {
  enabled: true,
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 10000
}
```

### Error Classification

```typescript
const error: AdapterError = {
  code: 'CONNECTION_TIMEOUT',
  message: 'Request timed out after 30 seconds',
  details: { timeout: 30000, attempt: 2 },
  retryable: true
}
```

## Monitoring and Diagnostics

### Real-time Status

```typescript
const status = await adapter.getStatus()
console.log({
  connected: status.connected,
  lastActivity: status.lastActivity,
  latency: status.latency,
  errorCount: status.errorCount
})
```

### Framework Diagnostics

```typescript
const diagnostics = framework.getDiagnostics()
console.log({
  adapters: diagnostics.adapters,
  integrations: diagnostics.integrations,
  executions: diagnostics.executions
})
```

### Health Monitoring

```typescript
// Automatic health checks
framework.on('adapter-unhealthy', (adapterId) => {
  logger.warn(`Adapter ${adapterId} is unhealthy`)
  // Take corrective action
})

// Manual health check
const healthy = await adapter.isHealthy()
```

## Usage Examples

### Machine Data Logger

```typescript
// Create database integration for logging machine data
const dbIntegration = await framework.createIntegration({
  id: 'machine-logger',
  name: 'Machine Data Logger',
  adapterId: 'database',
  config: { timeout: 10000, retries: 2 },
  credentials: { type: 'basic_auth', username: 'logger', password: 'secret' },
  triggers: [{
    id: 'log-trigger',
    type: 'event',
    config: { eventName: 'machine.status_change' },
    enabled: true
  }]
})

// Execute logging operation
await framework.executeIntegration('machine-logger', {
  type: 'insert',
  parameters: {
    table: 'machine_log',
    data: {
      machine_id: 'cnc-001',
      status: 'running',
      position: { x: 10.5, y: 20.3, z: 5.0 },
      timestamp: new Date()
    }
  }
})
```

### Cloud Backup

```typescript
// Create file system integration for cloud backup
const backupIntegration = await framework.createIntegration({
  id: 'cloud-backup',
  name: 'Cloud Backup Service',
  adapterId: 'http_api',
  config: { 
    timeout: 300000, // 5 minutes for large files
    retries: 3 
  },
  credentials: { 
    type: 'bearer_token', 
    token: 'cloud-api-token' 
  },
  triggers: [{
    id: 'backup-schedule',
    type: 'schedule',
    config: { schedule: '0 2 * * *' }, // Daily at 2 AM
    enabled: true
  }]
})
```

### Real-time Alerts

```typescript
// Create messaging integration for alerts
const alertIntegration = await framework.createIntegration({
  id: 'alert-system',
  name: 'Real-time Alert System',
  adapterId: 'http_api',
  config: { timeout: 5000, retries: 1 },
  triggers: [{
    id: 'alarm-alert',
    type: 'event',
    config: { 
      eventName: 'machine.alarm',
      eventFilter: { severity: ['critical', 'error'] }
    },
    enabled: true
  }]
})

// Send alert
await framework.executeIntegration('alert-system', {
  type: 'post',
  parameters: {
    endpoint: '/api/alerts',
    data: {
      level: 'critical',
      message: 'Emergency stop activated',
      machine: 'cnc-001',
      timestamp: new Date()
    }
  }
})
```

This integration framework provides a powerful foundation for plugin connectivity and external system integration.