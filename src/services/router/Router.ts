/**
 * Router Service
 * 
 * Core router implementation providing navigation, route management, and event handling.
 * Integrates with React Router DOM and manages application routing state.
 */

import { 
  RouterService, 
  RouterConfig, 
  RouteDefinition, 
  NavigationState, 
  RouterEvents,
  RouteGuardContext
} from './RouterTypes';
import { navigationService } from './NavigationService';
import { routeGuardService } from './RouteGuard';
import { eventBus } from '../events';
import { logger } from '../logger';

class Router implements RouterService {
  private config: RouterConfig | null = null;
  private routes: Map<string, RouteDefinition> = new Map();
  private routesByPath: Map<string, RouteDefinition> = new Map();
  private isInitialized = false;

  /**
   * Initialize router with configuration
   */
  initialize(config: RouterConfig): void {
    if (this.isInitialized) {
      logger.warn('Router already initialized');
      return;
    }

    this.config = config;
    this.buildRouteDefinitions();
    this.setupEventHandlers();
    this.isInitialized = true;

    // Navigate to default route if we're at root
    if (window.location.pathname === '/') {
      setTimeout(() => {
        this.navigate(config.defaultRoute).catch(error => {
          logger.error('Failed to navigate to default route', { error });
        });
      }, 0);
    }

    logger.info('Router initialized', {
      routeCount: this.routes.size,
      defaultRoute: config.defaultRoute
    });
  }

  /**
   * Navigate to a specific route
   */
  async navigate(path: string, params: Record<string, string> = {}): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Router not initialized');
    }

    navigationService.setNavigating(true);
    
    try {
      const route = this.findRouteByPath(path);
      if (!route) {
        throw new Error(`Route not found: ${path}`);
      }

      const from = this.getCurrentRoute();
      const context: RouteGuardContext = {
        route,
        from: from || undefined,
        params,
        query: this.parseQuery(window.location.search)
      };

      // Emit before navigation event
      this.emit('route:before', {
        route,
        from: from || undefined,
        params,
        query: context.query
      });

      // Check route guards
      const guardResult = await routeGuardService.checkAccess(context);
      if (!guardResult.allowed) {
        if (guardResult.redirectTo) {
          // Redirect to alternate route
          await this.navigate(guardResult.redirectTo);
          return;
        } else {
          throw new Error(guardResult.reason || 'Route access denied');
        }
      }

      // Update navigation state
      navigationService.setCurrentRoute(path, params, context.query);
      
      // Update breadcrumbs
      const breadcrumbs = this.buildBreadcrumbs(route);
      navigationService.updateBreadcrumbs(breadcrumbs);

      // Emit after navigation event
      this.emit('route:after', {
        route,
        from: from || undefined,
        params,
        query: context.query
      });

      logger.info('Navigation completed', {
        to: path,
        from: from?.fullPath,
        params
      });

    } catch (error) {
      navigationService.setError(error instanceof Error ? error.message : 'Navigation failed');
      
      this.emit('route:error', {
        error: error instanceof Error ? error : new Error('Navigation failed'),
        route: this.findRouteByPath(path) || undefined
      });

      logger.error('Navigation failed', { path, params, error });
      throw error;
    } finally {
      navigationService.setNavigating(false);
    }
  }

  /**
   * Go back in history
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate(this.config?.defaultRoute || '/');
    }
  }

  /**
   * Go forward in history
   */
  goForward(): void {
    window.history.forward();
  }

  /**
   * Get current route definition
   */
  getCurrentRoute(): RouteDefinition | null {
    const currentPath = navigationService.getCurrentRoute();
    return this.findRouteByPath(currentPath);
  }

  /**
   * Get current navigation state
   */
  getNavigationState(): NavigationState {
    return navigationService.getState();
  }

  /**
   * Add route guard
   */
  addRouteGuard(guard: any): void {
    routeGuardService.addGuard(guard);
  }

  /**
   * Remove route guard
   */
  removeRouteGuard(guard: any): void {
    routeGuardService.removeGuard(guard);
  }

  /**
   * Event handling
   */
  on<K extends keyof RouterEvents>(event: K, handler: (data: RouterEvents[K]) => void): void {
    eventBus.on(`router:${event}`, handler);
  }

  off<K extends keyof RouterEvents>(event: K, handler: (data: RouterEvents[K]) => void): void {
    eventBus.off(`router:${event}`, handler);
  }

  /**
   * Build route definitions from config
   */
  private buildRouteDefinitions(): void {
    if (!this.config) return;

    this.routes.clear();
    this.routesByPath.clear();

    Object.entries(this.config.routes).forEach(([id, routeConfig]) => {
      const route = this.createRouteDefinition(id, routeConfig);
      this.routes.set(id, route);
      this.routesByPath.set(route.fullPath, route);

      // Process children
      if (routeConfig.children) {
        Object.entries(routeConfig.children).forEach(([childId, childConfig]) => {
          const childRoute = this.createRouteDefinition(
            `${id}.${childId}`,
            childConfig,
            id,
            route.fullPath
          );
          this.routes.set(childRoute.id, childRoute);
          this.routesByPath.set(childRoute.fullPath, childRoute);
        });
      }
    });
  }

  /**
   * Create route definition from config
   */
  private createRouteDefinition(
    id: string,
    config: any,
    parentId?: string,
    parentPath?: string
  ): RouteDefinition {
    const fullPath = parentPath ? `${parentPath}${config.path}` : config.path;
    const breadcrumbs = this.buildBreadcrumbsFromPath(fullPath);

    return {
      id,
      parentId,
      fullPath,
      breadcrumbs,
      ...config
    };
  }

  /**
   * Find route by path
   */
  private findRouteByPath(path: string): RouteDefinition | null {
    return this.routesByPath.get(path) || null;
  }

  /**
   * Build breadcrumbs for route
   */
  private buildBreadcrumbs(route: RouteDefinition): string[] {
    const breadcrumbs: string[] = [];
    let currentRoute: RouteDefinition | null = route;

    while (currentRoute) {
      breadcrumbs.unshift(currentRoute.title);
      currentRoute = currentRoute.parentId ? this.routes.get(currentRoute.parentId) || null : null;
    }

    return breadcrumbs;
  }

  /**
   * Build breadcrumbs from path
   */
  private buildBreadcrumbsFromPath(path: string): string[] {
    const segments = path.split('/').filter(Boolean);
    return segments.map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    );
  }

  /**
   * Parse query string
   */
  private parseQuery(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const query: Record<string, string> = {};
    
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
    
    return query;
  }

  /**
   * Emit router event
   */
  private emit<K extends keyof RouterEvents>(event: K, data: RouterEvents[K]): void {
    eventBus.emit(`router:${event}`, data);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // Handle navigation start/end
    this.on('route:before', () => this.emit('navigation:start', undefined));
    this.on('route:after', () => this.emit('navigation:end', undefined));
  }

  /**
   * Handle browser back/forward navigation
   */
  private handlePopState(event: PopStateEvent): void {
    const path = window.location.pathname;
    const route = this.findRouteByPath(path);
    
    if (route) {
      navigationService.setCurrentRoute(path);
      const breadcrumbs = this.buildBreadcrumbs(route);
      navigationService.updateBreadcrumbs(breadcrumbs);
    }
  }

  /**
   * Get all routes
   */
  getRoutes(): RouteDefinition[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get route by ID
   */
  getRoute(id: string): RouteDefinition | null {
    return this.routes.get(id) || null;
  }

  /**
   * Check if router is initialized
   */
  isRouterInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const router = new Router();