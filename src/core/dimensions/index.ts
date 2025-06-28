// Public API exports for the dimensions module
export { DimensionsController } from './DimensionsController';
export * from './DimensionTypes';

// Create singleton instance
import { DimensionsController } from './DimensionsController';
export const dimensionsController = new DimensionsController();