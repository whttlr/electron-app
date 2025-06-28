// Units module configuration
export default {
  // Default settings
  defaults: {
    system: 'metric',
    precision: 3,
    showFractions: true // For imperial display
  },
  
  // Imperial fraction settings
  fractions: {
    maxDenominator: 64,
    minDenominator: 2,
    threshold: 0.001 // Below this, show as decimal
  },
  
  // Display preferences
  display: {
    alwaysShowUnits: true,
    useShortUnits: true, // "mm" vs "millimeter"
    spaceBetweenValueAndUnit: true
  }
};