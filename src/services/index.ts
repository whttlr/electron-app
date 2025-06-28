// Initialize and export all services
import { StateManager } from './state/StateManager';
import { EventBus } from './events/EventBus';
import { logger as loggerInstance } from './logger/LoggerService';
import { router, routerConfig } from './router';
import { configService, getDefaultState } from './config';

// Create singleton instances
export const eventBus = new EventBus();
export const logger = loggerInstance;
export const stateManager = new StateManager({
  enableDevtools: true,
  enableTimeTravel: true,
  maxHistorySize: 50,
  initialState: getDefaultState()
});

// Initialize router
router.initialize(routerConfig);

// Export router services for external use
export { router, navigationService, routeGuardService } from './router';

// Export config service
export { configService } from './config';

// Initialize connections between services
logger.info('Services initialized', {
  stateManager: !!stateManager,
  eventBus: !!eventBus,
  logger: !!logger,
  router: router.isRouterInitialized(),
  configService: !!configService
});