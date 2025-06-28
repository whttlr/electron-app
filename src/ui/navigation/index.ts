/**
 * Navigation UI Module
 * 
 * Public API exports for navigation UI components.
 */

// Main navigation components
export { MainNavigation } from './MainNavigation';
export { Breadcrumbs } from './Breadcrumbs';
export { RouteView } from './RouteView';

// Configuration
export { navigationUIConfig } from './config';

// Types
export type {
  MainNavigationProps,
  BreadcrumbsProps,
  RouteViewProps,
  NavigationMenuProps,
  RouteGuardDisplayProps,
  NavigationContextType
} from './NavigationTypes';