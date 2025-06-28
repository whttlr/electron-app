/**
 * Route Guard Service
 * 
 * Implements route protection and validation logic.
 * Checks permissions, connection requirements, and other access controls.
 */

import { RouteGuard, RouteGuardContext, RouteGuardResult, RouteDefinition } from './RouterTypes';
import { stateManager } from '../state';
import { logger } from '../logger';

class RouteGuardService {
  private guards: Set<RouteGuard> = new Set();

  /**
   * Add a route guard
   */
  addGuard(guard: RouteGuard): void {
    this.guards.add(guard);
    logger.debug('Route guard added', { guardCount: this.guards.size });
  }

  /**
   * Remove a route guard
   */
  removeGuard(guard: RouteGuard): void {
    this.guards.delete(guard);
    logger.debug('Route guard removed', { guardCount: this.guards.size });
  }

  /**
   * Check if route access is allowed
   */
  async checkAccess(context: RouteGuardContext): Promise<RouteGuardResult> {
    logger.debug('Checking route access', {
      route: context.route.fullPath,
      from: context.from?.fullPath
    });

    // Run built-in guards first
    const builtInResult = await this.runBuiltInGuards(context);
    if (!builtInResult.allowed) {
      return builtInResult;
    }

    // Run custom guards
    for (const guard of this.guards) {
      try {
        const result = await guard(context);
        if (!result.allowed) {
          logger.warn('Route access denied by guard', {
            route: context.route.fullPath,
            reason: result.reason,
            redirectTo: result.redirectTo
          });
          return result;
        }
      } catch (error) {
        logger.error('Route guard error', { error, route: context.route.fullPath });
        return {
          allowed: false,
          reason: 'Route guard error occurred'
        };
      }
    }

    logger.debug('Route access granted', { route: context.route.fullPath });
    return { allowed: true };
  }

  /**
   * Run built-in route guards
   */
  private async runBuiltInGuards(context: RouteGuardContext): Promise<RouteGuardResult> {
    // Check connection requirement
    if (context.route.requiresConnection) {
      const appState = stateManager.getState();
      if (!appState.machine.isConnected) {
        return {
          allowed: false,
          redirectTo: '/',
          reason: 'Machine connection required'
        };
      }
    }

    // Check route validity
    if (!this.isValidRoute(context.route)) {
      return {
        allowed: false,
        redirectTo: '/',
        reason: 'Invalid route'
      };
    }

    return { allowed: true };
  }

  /**
   * Validate route definition
   */
  private isValidRoute(route: RouteDefinition): boolean {
    return !!(route && route.path && route.component && route.title);
  }

  /**
   * Clear all guards
   */
  clearGuards(): void {
    this.guards.clear();
    logger.debug('All route guards cleared');
  }

  /**
   * Get guard count
   */
  getGuardCount(): number {
    return this.guards.size;
  }
}

// Built-in guard functions that can be used independently

/**
 * Connection requirement guard
 */
export const connectionRequiredGuard: RouteGuard = (context) => {
  if (context.route.requiresConnection) {
    const appState = stateManager.getState();
    if (!appState.machine.isConnected) {
      return {
        allowed: false,
        redirectTo: '/',
        reason: 'Machine connection required for this feature'
      };
    }
  }
  return { allowed: true };
};

/**
 * Development mode guard
 */
export const developmentOnlyGuard: RouteGuard = (context) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDevRoute = context.route.path.includes('/dev/') || context.route.path.includes('/debug/');
  
  if (isDevRoute && !isDevelopment) {
    return {
      allowed: false,
      redirectTo: '/',
      reason: 'Development route not available in production'
    };
  }
  return { allowed: true };
};

/**
 * Maintenance mode guard
 */
export const maintenanceModeGuard: RouteGuard = (context) => {
  const appState = stateManager.getState();
  const isMaintenanceMode = appState.system.maintenanceMode;
  const isMaintenanceRoute = context.route.path === '/maintenance';
  
  if (isMaintenanceMode && !isMaintenanceRoute) {
    return {
      allowed: false,
      redirectTo: '/maintenance',
      reason: 'Application is in maintenance mode'
    };
  }
  return { allowed: true };
};

/**
 * Feature flag guard factory
 */
export const createFeatureFlagGuard = (flagName: string): RouteGuard => {
  return (context) => {
    // This would integrate with a feature flag service
    // For now, check if route has feature flag requirement
    const routeFlags = (context.route as any).featureFlags;
    if (routeFlags && routeFlags.includes(flagName)) {
      // In a real implementation, check feature flag service
      const isEnabled = true; // placeholder
      if (!isEnabled) {
        return {
          allowed: false,
          redirectTo: '/',
          reason: `Feature '${flagName}' is not enabled`
        };
      }
    }
    return { allowed: true };
  };
};

// Export singleton instance
export const routeGuardService = new RouteGuardService();