/**
 * Machine Module Configuration
 */

export const machineConfig = {
  // Connection settings
  connection: {
    // Default serial port settings
    defaultBaudRate: 115200,
    // Connection timeout (ms)
    timeout: 5000,
    // Auto-reconnect settings
    autoReconnect: true,
    autoReconnectDelay: 3000,
    maxReconnectAttempts: 5,
  },

  // Machine limits and constraints
  limits: {
    // Working area dimensions (mm)
    workingArea: {
      x: { min: 0, max: 300 },
      y: { min: 0, max: 300 },
      z: { min: 0, max: 100 },
    },
    // Feed rate limits (mm/min)
    feedRate: {
      min: 1,
      max: 3000,
      default: 1000,
    },
    // Spindle speed limits (RPM)
    spindleSpeed: {
      min: 0,
      max: 24000,
      default: 12000,
    },
  },

  // Machine state monitoring
  monitoring: {
    // Status polling interval (ms)
    statusPollInterval: 250,
    // Position update interval (ms)
    positionUpdateInterval: 100,
    // Enable real-time position tracking
    enableRealTimeTracking: true,
  },

  // Safety settings
  safety: {
    // Enable soft limits
    enableSoftLimits: true,
    // Emergency stop behavior
    emergencyStopAction: 'immediate',
    // Confirm dangerous operations
    confirmDangerousOperations: true,
  },
} as const;

export type MachineConfig = typeof machineConfig;
