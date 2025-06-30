/**
 * Coordinate system configuration
 */

const coordinateConfig = {
  // Default precision for position calculations
  defaultPrecision: 3,
  
  // Tolerance for position equality comparisons (mm)
  positionTolerance: 0.001,
  
  // Maximum reasonable coordinate values (mm)
  maxCoordinateValue: 100000, // 100 meters
  
  // Maximum reasonable WCS offset (mm)
  maxWCSOffset: 50000, // 50 meters
  
  // Maximum single jog distance (mm)
  maxJogDistance: 1000, // 1 meter
  
  // Default machine bounds (can be overridden)
  defaultMachineBounds: {
    min: { x: -1000, y: -1000, z: -200 },
    max: { x: 1000, y: 1000, z: 200 }
  },
  
  // Default safety limits (smaller than machine bounds)
  defaultSafetyLimits: {
    min: { x: -900, y: -900, z: -180 },
    max: { x: 900, y: 900, z: 180 }
  },
  
  // Position update throttling (ms)
  positionUpdateThrottle: 50,
  
  // Default WCS system
  defaultWCS: 'G54',
  
  // WCS systems in order of preference
  wcsSystemOrder: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'],
  
  // Display formatting defaults
  displayFormat: {
    precision: 3,
    unit: 'mm',
    showUnit: true,
    showSign: false
  },
  
  // Validation settings
  validation: {
    enforcePositiveBounds: false,
    warnOnLargeOffsets: true,
    warnOnLargeJogDistance: true,
    validateConversions: true
  },
  
  // Event settings
  events: {
    emitOnMinimalChange: false,
    minChangeThreshold: 0.001
  }
}

export { coordinateConfig }