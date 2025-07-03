/**
 * Positioning Module Configuration
 */

export const positioningConfig = {
  // Coordinate system settings
  coordinates: {
    // Default coordinate system
    defaultSystem: 'G54',
    // Available coordinate systems
    availableSystems: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'],
    // Decimal places for position display
    decimalPlaces: 3,
    // Units (mm or inch)
    defaultUnits: 'mm',
  },

  // Jogging settings
  jogging: {
    // Default jog distances (mm)
    defaultDistances: [0.1, 1, 10, 100],
    // Default jog feed rate (mm/min)
    defaultFeedRate: 1000,
    // Continuous jogging feed rate (mm/min)
    continuousFeedRate: 2000,
    // Enable incremental jogging
    enableIncremental: true,
    // Enable continuous jogging
    enableContinuous: true,
  },

  // Homing settings
  homing: {
    // Auto-home on startup
    autoHomeOnStartup: false,
    // Homing sequence order
    homingOrder: ['Z', 'X', 'Y'],
    // Homing feed rates (mm/min)
    homingFeedRate: {
      fast: 2000,
      slow: 200,
    },
    // Post-homing move distance (mm)
    postHomingMove: 5,
  },

  // Position tracking
  tracking: {
    // Update frequency (Hz)
    updateFrequency: 10,
    // Position change threshold for updates (mm)
    changeThreshold: 0.001,
    // Enable position history
    enableHistory: true,
    // Position history length
    historyLength: 1000,
  },
} as const;

export type PositioningConfig = typeof positioningConfig;