/**
 * Router Service Types
 * 
 * TypeScript type definitions for the router service module.
 * Defines interfaces for routes, navigation state, and router configuration.
 */

export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  icon?: string;
  requiresConnection?: boolean;
  hidden?: boolean;
  children?: Record<string, RouteConfig>;
}

export interface RouteDefinition extends RouteConfig {
  id: string;
  parentId?: string;
  fullPath: string;
  breadcrumbs: string[];
}

export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  routeParams: Record<string, string>;
  queryParams: Record<string, string>;
  breadcrumbs: string[];
  isNavigating: boolean;
  error?: string;
}

export interface RouterConfig {
  defaultRoute: string;
  routes: Record<string, RouteConfig>;
  baseUrl?: string;
  enableBreadcrumbs: boolean;
  enableDeepLinking: boolean;
}

export interface RouteGuardContext {
  route: RouteDefinition;
  from?: RouteDefinition;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface RouteGuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

export type RouteGuard = (context: RouteGuardContext) => Promise<RouteGuardResult> | RouteGuardResult;

export interface RouterEventData {
  route: RouteDefinition;
  from?: RouteDefinition;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface RouterEvents {
  'route:before': RouterEventData;
  'route:after': RouterEventData;
  'route:error': { error: Error; route?: RouteDefinition };
  'navigation:start': void;
  'navigation:end': void;
}

export interface RouterService {
  initialize(config: RouterConfig): void;
  navigate(path: string, params?: Record<string, string>): Promise<void>;
  goBack(): void;
  goForward(): void;
  getCurrentRoute(): RouteDefinition | null;
  getNavigationState(): NavigationState;
  addRouteGuard(guard: RouteGuard): void;
  removeRouteGuard(guard: RouteGuard): void;
  on<K extends keyof RouterEvents>(event: K, handler: (data: RouterEvents[K]) => void): void;
  off<K extends keyof RouterEvents>(event: K, handler: (data: RouterEvents[K]) => void): void;
}

export interface NavigationServiceInterface {
  getState(): NavigationState;
  setState(state: Partial<NavigationState>): void;
  setCurrentRoute(route: string, params?: Record<string, string>, query?: Record<string, string>): void;
  setNavigating(isNavigating: boolean): void;
  setError(error?: string): void;
  updateBreadcrumbs(breadcrumbs: string[]): void;
  subscribe(callback: (state: NavigationState) => void): { unsubscribe: () => void };
}