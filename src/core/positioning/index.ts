// Public API exports for the positioning module
export { PositionController } from './PositionController';
export { JogController } from './JogController';
export * from './PositionTypes';

// Create singleton instances
import { PositionController } from './PositionController';
import { JogController } from './JogController';

export const positionController = new PositionController();
export const jogController = new JogController();