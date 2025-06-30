/**
 * Global Event Bus Instance
 */

import { EventBus } from './events/EventBus'

// Create global event bus instance
export const globalEventBus = new EventBus()

// Export for convenience
export default globalEventBus