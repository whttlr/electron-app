// Positioning module configuration
export default {
  // Position control settings
  position: {
    updateInterval: 100, // ms
    smoothing: true,
    interpolationSteps: 10
  },
  
  // Jog control settings  
  jog: {
    defaultIncrement: 1, // mm
    continuousJogDelay: 50, // ms
    accelerationTime: 200, // ms
    decelerationTime: 200 // ms
  },
  
  // Safety settings
  safety: {
    softStopDistance: 5, // mm from bounds
    emergencyStopDeceleration: 1000 // mm/s²
  },
  
  // Display settings
  display: {
    positionPrecision: 3,
    coordinateFormat: 'decimal' // or 'fractional' for imperial
  }
};