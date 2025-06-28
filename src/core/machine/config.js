// Machine module configuration
export default {
  // Connection settings
  connection: {
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Movement settings
  movement: {
    minSpeed: 1,
    maxSpeed: 5000,
    defaultSpeed: 1000,
    acceleration: 100
  },
  
  // Safety settings
  safety: {
    softLimitsEnabled: true,
    emergencyStopEnabled: true,
    positionValidation: true
  },
  
  // Simulation settings (for mock mode)
  simulation: {
    connectionDelay: 500,
    movementDelay: 1000,
    homingDelay: 2000
  }
};