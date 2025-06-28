/**
 * Navigation Service
 * 
 * Manages navigation state for the router service.
 * Provides centralized state management for current route, parameters, and navigation status.
 */

import { NavigationState, NavigationServiceInterface } from './RouterTypes';
import { logger } from '../logger';

class NavigationService implements NavigationServiceInterface {
  private state: NavigationState = {
    currentRoute: '/',
    routeParams: {},
    queryParams: {},
    breadcrumbs: [],
    isNavigating: false
  };

  private subscribers: Set<(state: NavigationState) => void> = new Set();

  /**
   * Get current navigation state
   */
  getState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Update navigation state
   */
  setState(updates: Partial<NavigationState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    logger.debug('Navigation state updated', {
      from: previousState,
      to: this.state,
      updates
    });

    this.notifySubscribers();
  }

  /**
   * Set current route with parameters and query
   */
  setCurrentRoute(
    route: string, 
    params: Record<string, string> = {}, 
    query: Record<string, string> = {}
  ): void {
    const previousRoute = this.state.currentRoute;
    
    this.setState({
      previousRoute,
      currentRoute: route,
      routeParams: params,
      queryParams: query,
      error: undefined
    });

    logger.info('Route changed', {
      from: previousRoute,
      to: route,
      params,
      query
    });
  }

  /**
   * Set navigation loading state
   */
  setNavigating(isNavigating: boolean): void {
    this.setState({ isNavigating });
  }

  /**
   * Set navigation error
   */
  setError(error?: string): void {
    this.setState({ error });
    
    if (error) {
      logger.error('Navigation error', { error });
    }
  }

  /**
   * Update breadcrumb trail
   */
  updateBreadcrumbs(breadcrumbs: string[]): void {
    this.setState({ breadcrumbs });
    
    logger.debug('Breadcrumbs updated', { breadcrumbs });
  }

  /**
   * Subscribe to navigation state changes
   */
  subscribe(callback: (state: NavigationState) => void): { unsubscribe: () => void } {
    this.subscribers.add(callback);
    
    // Immediately call with current state
    callback(this.getState());
    
    return {
      unsubscribe: () => {
        this.subscribers.delete(callback);
      }
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(callback => {
      try {
        callback(currentState);
      } catch (error) {
        logger.error('Error in navigation state subscriber', { error });
      }
    });
  }

  /**
   * Reset navigation state to initial values
   */
  reset(): void {
    this.setState({
      currentRoute: '/',
      previousRoute: undefined,
      routeParams: {},
      queryParams: {},
      breadcrumbs: [],
      isNavigating: false,
      error: undefined
    });

    logger.info('Navigation state reset');
  }

  /**
   * Get route parameters for current route
   */
  getRouteParams(): Record<string, string> {
    return { ...this.state.routeParams };
  }

  /**
   * Get query parameters for current route
   */
  getQueryParams(): Record<string, string> {
    return { ...this.state.queryParams };
  }

  /**
   * Check if currently navigating
   */
  isCurrentlyNavigating(): boolean {
    return this.state.isNavigating;
  }

  /**
   * Get current route path
   */
  getCurrentRoute(): string {
    return this.state.currentRoute;
  }

  /**
   * Get previous route path
   */
  getPreviousRoute(): string | undefined {
    return this.state.previousRoute;
  }

  /**
   * Get current breadcrumbs
   */
  getBreadcrumbs(): string[] {
    return [...this.state.breadcrumbs];
  }

  /**
   * Check if navigation has error
   */
  hasError(): boolean {
    return !!this.state.error;
  }

  /**
   * Get navigation error message
   */
  getError(): string | undefined {
    return this.state.error;
  }
}

// Export singleton instance
export const navigationService = new NavigationService();