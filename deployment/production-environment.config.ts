/**
 * Production Environment Configuration
 * Comprehensive configuration for production deployment of CNC Control Application
 */

export interface ProductionEnvironmentConfig {
  // Application settings
  application: {
    name: string;
    version: string;
    environment: 'production';
    debug: boolean;
    port: number;
    baseUrl: string;
    apiUrl: string;
    wsUrl: string;
  };

  // Security configuration
  security: {
    enableHttps: boolean;
    forceHttps: boolean;
    enableHsts: boolean;
    enableCSP: boolean;
    enableCORS: boolean;
    corsOrigins: string[];
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    authentication: {
      enabled: boolean;
      jwtSecret: string;
      jwtExpiresIn: string;
      sessionTimeout: number;
    };
  };

  // Database configuration
  database: {
    enabled: boolean;
    type: 'postgresql' | 'mysql' | 'sqlite';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    connectionPoolSize: number;
    connectionTimeout: number;
    queryTimeout: number;
  };

  // Caching configuration
  cache: {
    enabled: boolean;
    type: 'redis' | 'memory';
    host?: string;
    port?: number;
    password?: string;
    ttl: number;
    maxSize: number;
  };

  // Logging configuration
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
    destination: 'console' | 'file' | 'both';
    file?: {
      path: string;
      maxSize: string;
      maxFiles: number;
      compress: boolean;
    };
    structured: boolean;
    includeTimestamp: boolean;
    includeLevel: boolean;
  };

  // Monitoring and analytics
  monitoring: {
    enabled: boolean;
    apm: {
      enabled: boolean;
      serviceName: string;
      serverUrl: string;
      apiKey: string;
    };
    metrics: {
      enabled: boolean;
      endpoint: string;
      interval: number;
      includeCpuMetrics: boolean;
      includeMemoryMetrics: boolean;
      includeSystemMetrics: boolean;
    };
    healthCheck: {
      enabled: boolean;
      endpoint: string;
      interval: number;
      timeout: number;
    };
  };

  // Analytics configuration
  analytics: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
    sampling: {
      performance: number;
      errors: number;
      userEvents: number;
    };
    privacy: {
      anonymizeIP: boolean;
      respectDoNotTrack: boolean;
      dataRetentionDays: number;
    };
  };

  // Storage configuration
  storage: {
    uploads: {
      enabled: boolean;
      provider: 'local' | 's3' | 'gcs';
      maxFileSize: number;
      allowedTypes: string[];
      path?: string;
      bucket?: string;
      region?: string;
      accessKey?: string;
      secretKey?: string;
    };
    static: {
      provider: 'local' | 'cdn';
      path: string;
      cdnUrl?: string;
      cacheControl: string;
    };
  };

  // Email configuration
  email: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'ses';
    from: string;
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
    apiKey?: string;
    templates: {
      path: string;
      cache: boolean;
    };
  };

  // Backup configuration
  backup: {
    enabled: boolean;
    schedule: string;
    retention: {
      days: number;
      maxBackups: number;
    };
    storage: {
      provider: 'local' | 's3' | 'gcs';
      path: string;
      bucket?: string;
      encryption: boolean;
    };
  };

  // Performance optimization
  performance: {
    compression: {
      enabled: boolean;
      level: number;
      threshold: number;
    };
    caching: {
      staticAssets: {
        enabled: boolean;
        maxAge: number;
      };
      apiResponses: {
        enabled: boolean;
        maxAge: number;
      };
    };
    minification: {
      enabled: boolean;
      removeComments: boolean;
      removeWhitespace: boolean;
    };
  };

  // Feature flags
  features: {
    maintenanceMode: boolean;
    beta: {
      enabled: boolean;
      allowedUsers: string[];
    };
    experimental: {
      enabled: boolean;
      features: string[];
    };
    deprecatedFeatures: {
      enabled: boolean;
      features: string[];
      warningMessage: string;
    };
  };

  // Resource limits
  limits: {
    maxRequestSize: string;
    maxConcurrentConnections: number;
    maxQueueSize: number;
    requestTimeout: number;
    uploadTimeout: number;
    memory: {
      maxHeapSize: string;
      gcThreshold: number;
    };
  };

  // Container configuration
  container: {
    resources: {
      requests: {
        memory: string;
        cpu: string;
      };
      limits: {
        memory: string;
        cpu: string;
      };
    };
    replicas: {
      min: number;
      max: number;
      target: number;
    };
    autoscaling: {
      enabled: boolean;
      cpuThreshold: number;
      memoryThreshold: number;
      scaleUpCooldown: number;
      scaleDownCooldown: number;
    };
    probes: {
      liveness: {
        enabled: boolean;
        path: string;
        initialDelaySeconds: number;
        periodSeconds: number;
        timeoutSeconds: number;
        failureThreshold: number;
      };
      readiness: {
        enabled: boolean;
        path: string;
        initialDelaySeconds: number;
        periodSeconds: number;
        timeoutSeconds: number;
        failureThreshold: number;
      };
    };
  };
}

// Production environment configuration
export const productionConfig: ProductionEnvironmentConfig = {
  application: {
    name: 'CNC Control',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: 'production',
    debug: false,
    port: parseInt(process.env.PORT || '8080'),
    baseUrl: process.env.VITE_BASE_URL || 'https://cnc-control.com',
    apiUrl: process.env.VITE_API_URL || 'https://api.cnc-control.com',
    wsUrl: process.env.VITE_WS_URL || 'wss://ws.cnc-control.com'
  },

  security: {
    enableHttps: true,
    forceHttps: true,
    enableHsts: true,
    enableCSP: true,
    enableCORS: true,
    corsOrigins: [
      'https://cnc-control.com',
      'https://app.cnc-control.com',
      'https://admin.cnc-control.com'
    ],
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000
    },
    authentication: {
      enabled: true,
      jwtSecret: process.env.JWT_SECRET || '',
      jwtExpiresIn: '24h',
      sessionTimeout: 8 * 60 * 60 * 1000 // 8 hours
    }
  },

  database: {
    enabled: process.env.DATABASE_ENABLED === 'true',
    type: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cnc_control_prod',
    username: process.env.DB_USER || 'cnc_control',
    password: process.env.DB_PASSWORD || '',
    ssl: true,
    connectionPoolSize: 20,
    connectionTimeout: 30000,
    queryTimeout: 60000
  },

  cache: {
    enabled: true,
    type: 'redis',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    ttl: 3600, // 1 hour
    maxSize: 100 * 1024 * 1024 // 100MB
  },

  logging: {
    level: 'info',
    format: 'json',
    destination: 'both',
    file: {
      path: '/var/log/cnc-control',
      maxSize: '100MB',
      maxFiles: 10,
      compress: true
    },
    structured: true,
    includeTimestamp: true,
    includeLevel: true
  },

  monitoring: {
    enabled: true,
    apm: {
      enabled: true,
      serviceName: 'cnc-control-production',
      serverUrl: process.env.APM_SERVER_URL || '',
      apiKey: process.env.APM_API_KEY || ''
    },
    metrics: {
      enabled: true,
      endpoint: process.env.METRICS_ENDPOINT || '',
      interval: 60000, // 1 minute
      includeCpuMetrics: true,
      includeMemoryMetrics: true,
      includeSystemMetrics: true
    },
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000, // 30 seconds
      timeout: 5000
    }
  },

  analytics: {
    enabled: true,
    endpoint: process.env.VITE_ANALYTICS_ENDPOINT || 'https://analytics.cnc-control.com/events',
    apiKey: process.env.VITE_ANALYTICS_API_KEY || '',
    sampling: {
      performance: 0.05, // 5%
      errors: 1.0, // 100%
      userEvents: 0.2 // 20%
    },
    privacy: {
      anonymizeIP: true,
      respectDoNotTrack: true,
      dataRetentionDays: 90
    }
  },

  storage: {
    uploads: {
      enabled: true,
      provider: 's3',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['.gcode', '.nc', '.tap', '.txt', '.json'],
      bucket: process.env.S3_BUCKET || 'cnc-control-uploads',
      region: process.env.S3_REGION || 'us-west-2',
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || ''
    },
    static: {
      provider: 'cdn',
      path: '/static',
      cdnUrl: process.env.CDN_URL || 'https://cdn.cnc-control.com',
      cacheControl: 'public, max-age=31536000' // 1 year
    }
  },

  email: {
    enabled: true,
    provider: 'sendgrid',
    from: 'noreply@cnc-control.com',
    apiKey: process.env.SENDGRID_API_KEY || '',
    templates: {
      path: '/templates/email',
      cache: true
    }
  },

  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: {
      days: 30,
      maxBackups: 50
    },
    storage: {
      provider: 's3',
      path: 'backups',
      bucket: process.env.BACKUP_BUCKET || 'cnc-control-backups',
      encryption: true
    }
  },

  performance: {
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024 // 1KB
    },
    caching: {
      staticAssets: {
        enabled: true,
        maxAge: 31536000 // 1 year
      },
      apiResponses: {
        enabled: true,
        maxAge: 300 // 5 minutes
      }
    },
    minification: {
      enabled: true,
      removeComments: true,
      removeWhitespace: true
    }
  },

  features: {
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    beta: {
      enabled: process.env.BETA_FEATURES === 'true',
      allowedUsers: process.env.BETA_USERS?.split(',') || []
    },
    experimental: {
      enabled: false,
      features: []
    },
    deprecatedFeatures: {
      enabled: true,
      features: ['legacy-file-format'],
      warningMessage: 'This feature is deprecated and will be removed in a future version.'
    }
  },

  limits: {
    maxRequestSize: '10MB',
    maxConcurrentConnections: 1000,
    maxQueueSize: 10000,
    requestTimeout: 30000, // 30 seconds
    uploadTimeout: 300000, // 5 minutes
    memory: {
      maxHeapSize: '2GB',
      gcThreshold: 0.8
    }
  },

  container: {
    resources: {
      requests: {
        memory: '512Mi',
        cpu: '250m'
      },
      limits: {
        memory: '2Gi',
        cpu: '1000m'
      }
    },
    replicas: {
      min: 2,
      max: 10,
      target: 3
    },
    autoscaling: {
      enabled: true,
      cpuThreshold: 70,
      memoryThreshold: 80,
      scaleUpCooldown: 300, // 5 minutes
      scaleDownCooldown: 600 // 10 minutes
    },
    probes: {
      liveness: {
        enabled: true,
        path: '/health',
        initialDelaySeconds: 30,
        periodSeconds: 30,
        timeoutSeconds: 5,
        failureThreshold: 3
      },
      readiness: {
        enabled: true,
        path: '/ready',
        initialDelaySeconds: 10,
        periodSeconds: 10,
        timeoutSeconds: 5,
        failureThreshold: 3
      }
    }
  }
};

// Environment-specific overrides
export const environmentOverrides = {
  staging: {
    application: {
      baseUrl: 'https://staging.cnc-control.com',
      apiUrl: 'https://api-staging.cnc-control.com',
      debug: true
    },
    analytics: {
      sampling: {
        performance: 1.0,
        errors: 1.0,
        userEvents: 1.0
      }
    },
    container: {
      replicas: {
        min: 1,
        max: 3,
        target: 1
      },
      resources: {
        requests: {
          memory: '256Mi',
          cpu: '100m'
        },
        limits: {
          memory: '1Gi',
          cpu: '500m'
        }
      }
    }
  },

  development: {
    application: {
      baseUrl: 'http://localhost:5173',
      apiUrl: 'http://localhost:3000',
      debug: true
    },
    security: {
      enableHttps: false,
      forceHttps: false,
      corsOrigins: ['http://localhost:5173', 'http://localhost:3000']
    },
    logging: {
      level: 'debug' as const,
      format: 'text' as const,
      destination: 'console' as const
    },
    analytics: {
      enabled: false
    },
    monitoring: {
      enabled: false
    }
  }
};

// Configuration validation
export function validateConfig(config: ProductionEnvironmentConfig): string[] {
  const errors: string[] = [];

  // Required environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_PASSWORD',
    'VITE_ANALYTICS_API_KEY'
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Validate database configuration
  if (config.database.enabled) {
    if (!config.database.host || !config.database.username) {
      errors.push('Database configuration incomplete');
    }
  }

  // Validate security configuration
  if (config.security.enableHttps && !config.security.forceHttps) {
    errors.push('HTTPS should be forced in production');
  }

  // Validate resource limits
  if (config.container.replicas.min > config.container.replicas.max) {
    errors.push('Minimum replicas cannot be greater than maximum replicas');
  }

  return errors;
}

// Export merged configuration based on environment
export function getProductionConfig(): ProductionEnvironmentConfig {
  const env = process.env.NODE_ENV || 'production';
  let config = { ...productionConfig };

  if (env === 'staging' && environmentOverrides.staging) {
    config = mergeConfig(config, environmentOverrides.staging);
  } else if (env === 'development' && environmentOverrides.development) {
    config = mergeConfig(config, environmentOverrides.development);
  }

  // Validate configuration
  const validationErrors = validateConfig(config);
  if (validationErrors.length > 0) {
    console.error('Configuration validation errors:', validationErrors);
    if (env === 'production') {
      throw new Error(`Invalid production configuration: ${validationErrors.join(', ')}`);
    }
  }

  return config;
}

// Deep merge utility for configuration
function mergeConfig(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeConfig(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

export default productionConfig;