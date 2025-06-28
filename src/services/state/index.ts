// Public API exports for the state module
export { StateManager } from './StateManager';
export * from './StateTypes';

// Create singleton instance
import { StateManager } from './StateManager';
export const stateManager = new StateManager({
  enableDevtools: process.env.NODE_ENV === 'development',
  enableTimeTravel: process.env.NODE_ENV === 'development',
  maxHistorySize: 20
});