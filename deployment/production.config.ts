/**
 * Production Deployment Configuration
 * 
 * Comprehensive production configuration for CNC control application
 * deployment across different platforms and environments.
 */

export interface DeploymentConfig {
  environment: 'production' | 'staging' | 'development';
  platform: 'electron' | 'web' | 'pwa';
  build: BuildConfig;
  runtime: RuntimeConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  optimization: OptimizationConfig;
  features: FeatureFlags;
}

export interface BuildConfig {
  mode: 'production';
  sourceMap: boolean;
  minify: boolean;
  compression: CompressionConfig;
  bundleAnalyzer: boolean;
  publicPath: string;
  outputPath: string;
  assetManifest: boolean;
  integrityHashes: boolean;
  caching: CachingConfig;
}

export interface RuntimeConfig {
  apiUrl: string;
  websocketUrl: string;
  offlineMode: boolean;
  serviceWorkerEnabled: boolean;
  updateStrategy: 'auto' | 'manual' | 'background';
  errorReporting: ErrorReportingConfig;
  performance: PerformanceConfig;
}

export interface SecurityConfig {
  csp: ContentSecurityPolicy;
  cors: CorsConfig;
  https: HttpsConfig;
  authentication: AuthConfig;
  encryption: EncryptionConfig;
  auditLogging: boolean;
}

export interface MonitoringConfig {
  analytics: AnalyticsConfig;
  apm: APMConfig;
  logging: LoggingConfig;
  healthChecks: HealthCheckConfig;
  metrics: MetricsConfig;
}

export interface OptimizationConfig {
  cdn: CDNConfig;
  caching: CachingStrategy;
  preloading: PreloadingConfig;
  lazyLoading: LazyLoadingConfig;
  imageOptimization: ImageOptConfig;
  bundleSplitting: BundleSplitConfig;
}

export interface FeatureFlags {
  debugMode: boolean;
  experimentalFeatures: boolean;
  betaFeatures: boolean;
  maintenanceMode: boolean;
  offlineSupport: boolean;
  pwaFeatures: boolean;
  webSerialSupport: boolean;
  webUSBSupport: boolean;
  thirdPartyPlugins: boolean;
  telemetry: boolean;
}

// Detailed sub-configurations
export interface CompressionConfig {
  gzip: boolean;
  brotli: boolean;
  threshold: number;
  level: number;
}

export interface CachingConfig {
  strategy: 'contenthash' | 'chunkhash' | 'query';
  maxAge: number;
  immutable: boolean;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  service: 'sentry' | 'rollbar' | 'custom';
  endpoint: string;
  sampleRate: number;
  ignoreErrors: string[];
}

export interface PerformanceConfig {
  budgets: {
    javascript: number;
    css: number;
    images: number;
    fonts: number;
    total: number;
  };
  monitoring: boolean;
  reportingThreshold: number;
}

export interface ContentSecurityPolicy {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  frameSrc: string[];
  workerSrc: string[];
  reportUri?: string;
}

export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
  exposedHeaders: string[];
  maxAge: number;
}

export interface HttpsConfig {
  enabled: boolean;
  cert?: string;
  key?: string;
  forceRedirect: boolean;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
}

export interface AuthConfig {
  provider: 'jwt' | 'oauth2' | 'saml' | 'custom';
  sessionTimeout: number;
  refreshTokens: boolean;
  mfa: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyRotation: boolean;
  dataAtRest: boolean;
  dataInTransit: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider: 'google' | 'matomo' | 'plausible' | 'custom';
  trackingId: string;
  anonymizeIp: boolean;
  cookieless: boolean;
  respectDNT: boolean;
}

export interface APMConfig {
  enabled: boolean;
  service: 'newrelic' | 'datadog' | 'elastic' | 'custom';
  endpoint: string;
  sampleRate: number;
  traceIdInjection: boolean;
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'text';
  transports: Array<'console' | 'file' | 'remote'>;
  rotation: {
    enabled: boolean;
    maxSize: string;
    maxFiles: number;
    compress: boolean;
  };
}

export interface HealthCheckConfig {
  endpoint: string;
  interval: number;
  timeout: number;
  checks: Array<'api' | 'database' | 'cache' | 'storage'>;
}

export interface MetricsConfig {
  enabled: boolean;
  interval: number;
  retention: number;
  exporters: Array<'prometheus' | 'statsd' | 'cloudwatch'>;
}

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'cloudfront' | 'fastly' | 'custom';
  url: string;
  assets: string[];
  preconnect: boolean;
}

export interface CachingStrategy {
  static: {
    maxAge: number;
    swr: boolean;
  };
  api: {
    maxAge: number;
    staleWhileRevalidate: number;
    vary: string[];
  };
  images: {
    maxAge: number;
    immutable: boolean;
  };
}

export interface PreloadingConfig {
  fonts: boolean;
  criticalCSS: boolean;
  modulePreload: boolean;
  prefetchLinks: boolean;
  dnsPrefetch: string[];
}

export interface LazyLoadingConfig {
  images: boolean;
  routes: boolean;
  components: boolean;
  threshold: number;
  rootMargin: string;
}

export interface ImageOptConfig {
  formats: Array<'webp' | 'avif' | 'jpeg' | 'png'>;
  sizes: number[];
  quality: number;
  lazy: boolean;
  placeholder: 'blur' | 'lqip' | 'solid';
}

export interface BundleSplitConfig {
  chunks: 'all' | 'async' | 'initial';
  vendors: boolean;
  commons: boolean;
  runtime: 'single' | 'multiple';
  maxAsyncRequests: number;
  maxInitialRequests: number;
  minSize: number;
}

// Production configuration presets
export const productionConfig: DeploymentConfig = {
  environment: 'production',
  platform: 'pwa',
  
  build: {
    mode: 'production',
    sourceMap: false,
    minify: true,
    compression: {
      gzip: true,
      brotli: true,
      threshold: 10240,
      level: 9,
    },
    bundleAnalyzer: false,
    publicPath: '/',
    outputPath: 'dist',
    assetManifest: true,
    integrityHashes: true,
    caching: {
      strategy: 'contenthash',
      maxAge: 31536000,
      immutable: true,
    },
  },

  runtime: {
    apiUrl: process.env.VITE_API_URL || 'https://api.cnc-control.com',
    websocketUrl: process.env.VITE_WS_URL || 'wss://ws.cnc-control.com',
    offlineMode: true,
    serviceWorkerEnabled: true,
    updateStrategy: 'background',
    errorReporting: {
      enabled: true,
      service: 'sentry',
      endpoint: process.env.VITE_SENTRY_DSN || '',
      sampleRate: 0.1,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    },
    performance: {
      budgets: {
        javascript: 500 * 1024, // 500KB
        css: 100 * 1024, // 100KB
        images: 2000 * 1024, // 2MB
        fonts: 200 * 1024, // 200KB
        total: 3000 * 1024, // 3MB
      },
      monitoring: true,
      reportingThreshold: 3000, // 3 seconds
    },
  },

  security: {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.cnc-control.com', 'wss://ws.cnc-control.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", 'blob:'],
      reportUri: 'https://cnc-control.report-uri.com/r/d/csp/enforce',
    },
    cors: {
      origin: ['https://cnc-control.com', 'https://app.cnc-control.com'],
      credentials: true,
      exposedHeaders: ['X-Request-ID', 'X-Version'],
      maxAge: 86400,
    },
    https: {
      enabled: true,
      forceRedirect: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
    authentication: {
      provider: 'jwt',
      sessionTimeout: 3600, // 1 hour
      refreshTokens: true,
      mfa: true,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
      },
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: true,
      dataAtRest: true,
      dataInTransit: true,
    },
    auditLogging: true,
  },

  monitoring: {
    analytics: {
      enabled: true,
      provider: 'plausible',
      trackingId: process.env.VITE_ANALYTICS_ID || '',
      anonymizeIp: true,
      cookieless: true,
      respectDNT: true,
    },
    apm: {
      enabled: true,
      service: 'elastic',
      endpoint: process.env.VITE_APM_ENDPOINT || '',
      sampleRate: 0.1,
      traceIdInjection: true,
    },
    logging: {
      level: 'warn',
      format: 'json',
      transports: ['console', 'remote'],
      rotation: {
        enabled: true,
        maxSize: '100m',
        maxFiles: 7,
        compress: true,
      },
    },
    healthChecks: {
      endpoint: '/health',
      interval: 60000, // 1 minute
      timeout: 5000,
      checks: ['api', 'database', 'cache', 'storage'],
    },
    metrics: {
      enabled: true,
      interval: 60000,
      retention: 7 * 24 * 60 * 60, // 7 days
      exporters: ['prometheus'],
    },
  },

  optimization: {
    cdn: {
      enabled: true,
      provider: 'cloudflare',
      url: 'https://cdn.cnc-control.com',
      assets: ['*.js', '*.css', '*.woff2', '*.jpg', '*.png', '*.webp'],
      preconnect: true,
    },
    caching: {
      static: {
        maxAge: 31536000, // 1 year
        swr: true,
      },
      api: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 86400, // 24 hours
        vary: ['Accept', 'Authorization'],
      },
      images: {
        maxAge: 2592000, // 30 days
        immutable: true,
      },
    },
    preloading: {
      fonts: true,
      criticalCSS: true,
      modulePreload: true,
      prefetchLinks: true,
      dnsPrefetch: ['https://api.cnc-control.com', 'https://cdn.cnc-control.com'],
    },
    lazyLoading: {
      images: true,
      routes: true,
      components: true,
      threshold: 0.1,
      rootMargin: '50px',
    },
    imageOptimization: {
      formats: ['webp', 'avif', 'jpeg'],
      sizes: [320, 640, 768, 1024, 1440, 2048],
      quality: 85,
      lazy: true,
      placeholder: 'blur',
    },
    bundleSplitting: {
      chunks: 'all',
      vendors: true,
      commons: true,
      runtime: 'single',
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      minSize: 20000,
    },
  },

  features: {
    debugMode: false,
    experimentalFeatures: false,
    betaFeatures: false,
    maintenanceMode: false,
    offlineSupport: true,
    pwaFeatures: true,
    webSerialSupport: true,
    webUSBSupport: true,
    thirdPartyPlugins: true,
    telemetry: true,
  },
};

// Staging configuration (overrides)
export const stagingConfig: DeploymentConfig = {
  ...productionConfig,
  environment: 'staging',
  
  build: {
    ...productionConfig.build,
    sourceMap: true,
    bundleAnalyzer: true,
  },
  
  runtime: {
    ...productionConfig.runtime,
    apiUrl: process.env.VITE_STAGING_API_URL || 'https://staging-api.cnc-control.com',
    websocketUrl: process.env.VITE_STAGING_WS_URL || 'wss://staging-ws.cnc-control.com',
    errorReporting: {
      ...productionConfig.runtime.errorReporting,
      sampleRate: 1.0,
    },
  },
  
  features: {
    ...productionConfig.features,
    debugMode: true,
    experimentalFeatures: true,
    betaFeatures: true,
  },
};

// Development configuration (overrides)
export const developmentConfig: DeploymentConfig = {
  ...productionConfig,
  environment: 'development',
  
  build: {
    ...productionConfig.build,
    mode: 'production', // Use production mode for dev deployment testing
    sourceMap: true,
    minify: false,
    compression: {
      ...productionConfig.build.compression,
      gzip: false,
      brotli: false,
    },
    bundleAnalyzer: true,
    caching: {
      strategy: 'query',
      maxAge: 0,
      immutable: false,
    },
  },
  
  runtime: {
    ...productionConfig.runtime,
    apiUrl: process.env.VITE_DEV_API_URL || 'http://localhost:3000',
    websocketUrl: process.env.VITE_DEV_WS_URL || 'ws://localhost:3001',
    serviceWorkerEnabled: false,
    errorReporting: {
      ...productionConfig.runtime.errorReporting,
      enabled: false,
    },
  },
  
  security: {
    ...productionConfig.security,
    https: {
      ...productionConfig.security.https,
      enabled: false,
      forceRedirect: false,
    },
  },
  
  monitoring: {
    ...productionConfig.monitoring,
    analytics: {
      ...productionConfig.monitoring.analytics,
      enabled: false,
    },
    apm: {
      ...productionConfig.monitoring.apm,
      enabled: false,
    },
  },
  
  features: {
    ...productionConfig.features,
    debugMode: true,
    experimentalFeatures: true,
    betaFeatures: true,
    telemetry: false,
  },
};

// Configuration selector
export function getDeploymentConfig(environment: string = 'production'): DeploymentConfig {
  switch (environment) {
    case 'staging':
      return stagingConfig;
    case 'development':
      return developmentConfig;
    default:
      return productionConfig;
  }
}

// Validation function
export function validateDeploymentConfig(config: DeploymentConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!config.runtime.apiUrl) {
    errors.push('API URL is required');
  }

  if (config.security.https.enabled && (!config.security.https.cert || !config.security.https.key)) {
    errors.push('HTTPS cert and key are required when HTTPS is enabled');
  }

  if (config.runtime.errorReporting.enabled && !config.runtime.errorReporting.endpoint) {
    errors.push('Error reporting endpoint is required when error reporting is enabled');
  }

  if (config.monitoring.analytics.enabled && !config.monitoring.analytics.trackingId) {
    errors.push('Analytics tracking ID is required when analytics is enabled');
  }

  // Validate performance budgets
  const totalBudget = Object.values(config.runtime.performance.budgets).reduce((sum, val) => sum + val, 0);
  if (totalBudget < config.runtime.performance.budgets.total) {
    errors.push('Individual performance budgets exceed total budget');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default productionConfig;