/**
 * Integration Framework Configuration
 */

const integrationConfig = {
  // Default integration settings
  integration: {
    timeout: 30000, // 30 seconds
    retries: 3,
    batchSize: 100,
    concurrency: 5
  },

  // Connection pooling
  connectionPooling: {
    enabled: true,
    maxConnections: 10,
    idleTimeout: 300000, // 5 minutes
    acquireTimeout: 60000, // 1 minute
    retryDelayOnFailover: 100,
    retryDelayOnClusterDown: 300
  },

  // Rate limiting defaults
  rateLimit: {
    requests: 100,
    window: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Caching configuration
  caching: {
    enabled: true,
    defaultTtl: 300, // 5 minutes
    maxSize: 1000, // Max cached items
    checkPeriod: 600 // Cleanup interval in seconds
  },

  // Monitoring and health checks
  monitoring: {
    enabled: true,
    healthCheckInterval: 30000, // 30 seconds
    metricsRetention: 3600000, // 1 hour
    alertThresholds: {
      errorRate: 0.1, // 10%
      latency: 5000, // 5 seconds
      availability: 0.95 // 95%
    }
  },

  // Security settings
  security: {
    encryptCredentials: true,
    allowedDomains: [],
    blockedDomains: [],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileExtensions: ['.txt', '.json', '.csv', '.xml', '.log'],
    pathTraversalProtection: true
  },

  // Adapter-specific configurations
  adapters: {
    database: {
      connectionTimeout: 10000,
      queryTimeout: 30000,
      maxRetries: 3,
      poolSize: 5
    },
    
    http_api: {
      timeout: 15000,
      maxRetries: 3,
      followRedirects: true,
      maxRedirects: 5,
      userAgent: 'CNC-Plugin-Integration/1.0'
    },
    
    file_system: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['.txt', '.json', '.csv', '.xml', '.log', '.gcode'],
      watchPollingInterval: 1000,
      watchDebounce: 500
    },
    
    messaging: {
      queueSize: 1000,
      messageTimeout: 30000,
      deliveryMode: 'persistent',
      acknowledgeMode: 'auto'
    },
    
    cloud_storage: {
      uploadTimeout: 300000, // 5 minutes
      downloadTimeout: 300000,
      chunkSize: 1024 * 1024, // 1MB
      multipartThreshold: 10 * 1024 * 1024 // 10MB
    }
  },

  // Data transformation settings
  transformation: {
    maxScriptLength: 10000,
    scriptTimeout: 5000,
    allowedFunctions: [
      'map', 'filter', 'reduce', 'forEach',
      'substring', 'replace', 'split', 'join',
      'parseInt', 'parseFloat', 'toString',
      'toUpperCase', 'toLowerCase', 'trim'
    ],
    blockedFunctions: [
      'eval', 'Function', 'require', 'import',
      'process', 'global', '__dirname', '__filename'
    ]
  },

  // Trigger configuration
  triggers: {
    webhook: {
      timeout: 30000,
      maxPayloadSize: 1024 * 1024, // 1MB
      allowedMethods: ['POST', 'PUT', 'PATCH'],
      rateLimitPerEndpoint: 100
    },
    
    polling: {
      minInterval: 1000, // 1 second
      maxInterval: 3600000, // 1 hour
      defaultInterval: 60000, // 1 minute
      jitter: true
    },
    
    schedule: {
      maxConcurrentJobs: 10,
      missedJobsStrategy: 'run_once',
      timezone: 'UTC'
    },
    
    event: {
      maxListeners: 100,
      wildcardSupport: true,
      namespaceSupport: true
    }
  },

  // Error handling
  errorHandling: {
    retryStrategies: {
      exponential: {
        initialDelay: 1000,
        maxDelay: 30000,
        multiplier: 2,
        maxRetries: 5
      },
      linear: {
        delay: 5000,
        maxRetries: 3
      },
      immediate: {
        maxRetries: 1
      }
    },
    
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 10000
    }
  },

  // Validation rules
  validation: {
    maxIntegrations: 100,
    maxAdapters: 20,
    maxTriggersPerIntegration: 10,
    maxMappingsPerIntegration: 50,
    maxParametersPerOperation: 20,
    
    requiredFields: {
      integration: ['id', 'name', 'adapterId'],
      adapter: ['id', 'name', 'type'],
      trigger: ['id', 'type', 'config'],
      mapping: ['id', 'source', 'target']
    }
  }
}

export default integrationConfig