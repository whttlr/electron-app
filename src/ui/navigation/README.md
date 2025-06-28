# Navigation UI Module

The Navigation UI module provides React components for application navigation, following the modular architecture with comprehensive TypeScript support and integration with the router service.

## Components

### MainNavigation
Primary sidebar navigation component with hierarchical menu structure.

**Features:**
- Ant Design Menu integration
- Icon support for all routes
- Connection status awareness
- Collapsible sidebar
- Route-based disabling
- Responsive design

**Usage:**
```typescript
import { MainNavigation } from '../ui/navigation';

<MainNavigation
  routes={routeDefinitions}
  currentRoute={currentRoute}
  isConnected={machineConnected}
  onNavigate={handleNavigate}
  collapsed={sidebarCollapsed}
  onCollapse={setSidebarCollapsed}
/>
```

### Breadcrumbs
Hierarchical breadcrumb navigation component.

**Features:**
- Automatic breadcrumb generation
- Home link integration
- Clickable navigation
- Customizable separator
- Route hierarchy awareness

**Usage:**
```typescript
import { Breadcrumbs } from '../ui/navigation';

<Breadcrumbs
  breadcrumbs={routeBreadcrumbs}
  currentRoute={currentRoute}
  onNavigate={handleNavigate}
  separator="/"
/>
```

### RouteView
Dynamic component rendering based on current route.

**Features:**
- Lazy loading with React Suspense
- Error boundary handling
- Loading states
- Component not found fallback
- Route parameter passing

**Usage:**
```typescript
import { RouteView } from '../ui/navigation';

<RouteView
  route={currentRouteDefinition}
  params={routeParams}
  query={queryParams}
  isLoading={isNavigating}
  error={navigationError}
/>
```

## Integration

### Router Service Integration
Components automatically integrate with the router service:
- Route definitions from router configuration
- Navigation state from NavigationService
- Event handling through router events

### State Management Integration
Navigation state synchronized with StateManager:
- Current route tracking
- Connection status awareness
- UI state for sidebar collapse

### Theming Integration
Consistent with application theme:
- Ant Design theme integration
- Responsive breakpoints
- Accessibility standards

## Component Mapping

The RouteView component uses dynamic imports for code splitting:

```typescript
const componentMap = {
  'DashboardView': lazy(() => import('../../views/Dashboard/DashboardView')),
  'ControlsView': lazy(() => import('../../views/Controls/ControlsView')),
  // ... other components
};
```

## Configuration

Navigation behavior configured in `config.js`:

```javascript
export const navigationUIConfig = {
  sidebar: {
    defaultCollapsed: false,
    width: 240,
    theme: 'light'
  },
  breadcrumbs: {
    enabled: true,
    showHome: true,
    separator: '/'
  },
  animations: {
    enabled: true,
    duration: 300
  }
};
```

## Accessibility

Built-in accessibility features:
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- High contrast support

## Responsive Design

Mobile-first responsive design:
- Collapsible sidebar on mobile
- Touch-friendly navigation
- Adaptive breadcrumbs
- Responsive breakpoints

## Error Handling

Comprehensive error handling:
- Component loading errors
- Route not found scenarios
- Navigation failures
- Retry mechanisms

## Performance

Optimized for performance:
- Lazy loading of route components
- Memoized menu generation
- Efficient re-rendering
- Code splitting by route