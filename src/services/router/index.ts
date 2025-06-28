/**
 * Router Service Module
 * 
 * Public API exports for the router service.
 * Provides centralized access to router functionality, navigation, and route management.
 */

// Import router first for convenience functions
import { router as routerInstance } from './Router';

// Core router service
export { router } from './Router';
export { navigationService } from './NavigationService';
export { routeGuardService } from './RouteGuard';

// Configuration
export { routerConfig, routeValidation, navigationConfig } from './config';

// Built-in guards
export {
  connectionRequiredGuard,
  developmentOnlyGuard,
  maintenanceModeGuard,
  createFeatureFlagGuard
} from './RouteGuard';

// Types
export type {
  RouteConfig,
  RouteDefinition,
  NavigationState,
  RouterConfig,
  RouteGuardContext,
  RouteGuardResult,
  RouteGuard,
  RouterEventData,
  RouterEvents,
  RouterService,
  NavigationServiceInterface
} from './RouterTypes';

// Convenience exports for common operations
export const navigate = (path: string, params?: Record<string, string>) => routerInstance.navigate(path, params);
export const goBack = () => routerInstance.goBack();
export const goForward = () => routerInstance.goForward();
export const getCurrentRoute = () => routerInstance.getCurrentRoute();
export const getNavigationState = () => routerInstance.getNavigationState();