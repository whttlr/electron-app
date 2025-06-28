/**
 * Navigation UI Types
 * 
 * TypeScript type definitions for navigation UI components.
 */

import { RouteDefinition } from '../../services/router/RouterTypes';

export interface MainNavigationProps {
  routes: RouteDefinition[];
  currentRoute: string;
  isConnected: boolean;
  onNavigate: (path: string) => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface BreadcrumbsProps {
  breadcrumbs: string[];
  currentRoute: string;
  onNavigate: (path: string) => void;
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface RouteViewProps {
  route: RouteDefinition;
  params: Record<string, string>;
  query: Record<string, string>;
  isLoading?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface NavigationMenuProps {
  routes: RouteDefinition[];
  currentRoute: string;
  level?: number;
  onNavigate: (path: string) => void;
  isConnected: boolean;
}

export interface RouteGuardDisplayProps {
  route: RouteDefinition;
  reason: string;
  redirectTo?: string;
  onRetry: () => void;
  onGoHome: () => void;
}

export interface NavigationContextType {
  currentRoute: string;
  isNavigating: boolean;
  breadcrumbs: string[];
  navigate: (path: string, params?: Record<string, string>) => Promise<void>;
  goBack: () => void;
  goForward: () => void;
  isConnected: boolean;
}