// Public API exports for the units module
export { UnitConverter } from './UnitConverter';
export * from './UnitTypes';

// Create singleton instance
import { UnitConverter } from './UnitConverter';
export const unitConverter = new UnitConverter();