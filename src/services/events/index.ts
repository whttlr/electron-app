// Public API exports for the events module
export { EventBus } from './EventBus';
export * from './EventTypes';

// Create singleton instance
import { EventBus } from './EventBus';
export const eventBus = new EventBus({
  enableLogging: false,
  enableMetrics: true,
  maxListeners: 50
});