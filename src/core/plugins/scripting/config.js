/**
 * Scripting Engine Configuration
 */

const scriptingConfig = {
  // Default execution settings
  execution: {
    maxExecutionTime: 30000, // 30 seconds
    maxMemory: 64 * 1024 * 1024, // 64MB
    maxOutputLines: 1000,
    timeoutWarning: 20000 // 20 seconds
  },

  // Security settings
  security: {
    sandboxing: true,
    strictMode: true,
    allowEval: false,
    allowRequire: false,
    blockedGlobals: [
      'process',
      'global',
      'Buffer',
      'require',
      'module',
      'exports',
      '__dirname',
      '__filename'
    ]
  },

  // Allowed modules for scripts
  allowedModules: [
    'lodash',
    'moment',
    'uuid',
    'crypto'
  ],

  // Built-in script categories
  categories: [
    'utility',
    'cnc',
    'automation',
    'integration',
    'testing',
    'debug'
  ],

  // Script validation rules
  validation: {
    maxSourceLength: 100000, // 100KB
    maxParameters: 20,
    maxDependencies: 10,
    requiredFields: ['id', 'name', 'source', 'category'],
    reservedIds: ['system', 'builtin', 'reserved']
  },

  // Performance monitoring
  monitoring: {
    enableMetrics: true,
    historyLimit: 100,
    slowExecutionThreshold: 5000, // 5 seconds
    memoryWarningThreshold: 32 * 1024 * 1024 // 32MB
  }
}

export default scriptingConfig