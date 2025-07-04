/**
 * API Service Configuration
 */

export const apiConfig = {
  // Connection settings
  connection: {
    // Timeout for API initialization (ms)
    initTimeout: 10000,
    // Timeout for individual requests (ms)
    requestTimeout: 5000,
    // Number of retry attempts for initialization
    maxRetries: 3,
    // Delay between retry attempts (ms)
    retryDelay: 1000,
  },

  // Health check settings
  healthCheck: {
    // Interval for periodic health checks (ms)
    interval: 30000,
    // Timeout for health check requests (ms)
    timeout: 2000,
    // Enable automatic health monitoring
    enabled: true,
  },

  // Request settings
  requests: {
    // Default headers for all requests
    defaultHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // Default timeout for requests (ms)
    timeout: 5000,
  },

  // Error handling
  errors: {
    // Enable detailed error logging
    enableLogging: true,
    // Include stack traces in error responses
    includeStackTrace: false,
  },
} as const;

export type ApiConfig = typeof apiConfig;
