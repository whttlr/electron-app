# Router Service Module

The Router Service provides comprehensive routing functionality for the CNC Jog Controls application, following the modular architecture principles with complete TypeScript support and extensive testing.

## Overview

This module handles:
- Application routing and navigation
- Route protection and access control
- Navigation state management
- Deep linking and URL synchronization
- Breadcrumb generation
- Route-based event handling

## Key Components

### Router Service (`Router.ts`)
Core router implementation that manages route definitions, navigation, and integrates with React Router DOM.

**Key Features:**
- Route definition management from configuration
- Navigation with parameter support
- Route guard integration
- Event-driven navigation
- Browser history integration

### Navigation Service (`NavigationService.ts`)
Manages navigation state including current route, parameters, breadcrumbs, and loading states.

**Key Features:**
- Centralized navigation state
- Subscription-based state updates
- Route parameter management
- Error state handling
- Breadcrumb management

### Route Guard Service (`RouteGuard.ts`)
Implements route protection with built-in and custom guards for access control.

**Built-in Guards:**
- `connectionRequiredGuard` - Requires machine connection
- `developmentOnlyGuard` - Development routes only
- `maintenanceModeGuard` - Maintenance mode handling
- `createFeatureFlagGuard` - Feature flag based access

## Configuration

### Route Configuration (`config.js`)
Centralized route definitions following the established pattern:

```javascript
const routeConfig = {
  defaultRoute: '/',
  routes: {
    dashboard: {
      path: '/',
      component: 'DashboardView',
      title: 'Dashboard',
      icon: 'DashboardOutlined',
      requiresConnection: false
    },
    controls: {
      path: '/controls',
      component: 'ControlsView',
      title: 'Jog Controls',
      icon: 'ControlOutlined',
      requiresConnection: true
    }
  }
};
```

## Usage

### Basic Navigation
```typescript
import { navigate, router } from '../services/router';

// Navigate to a route
await navigate('/controls');

// Navigate with parameters
await navigate('/machine/setup', { machineId: '123' });

// Use router directly
await router.navigate('/workspace/preview');
```

### Route Guards
```typescript
import { router, connectionRequiredGuard } from '../services/router';

// Add built-in guard
router.addRouteGuard(connectionRequiredGuard);

// Add custom guard
router.addRouteGuard(async (context) => {
  if (context.route.path.includes('/admin')) {
    return {
      allowed: false,
      redirectTo: '/',
      reason: 'Admin access required'
    };
  }
  return { allowed: true };
});
```

### Navigation State
```typescript
import { navigationService } from '../services/router';

// Subscribe to navigation changes
const subscription = navigationService.subscribe((state) => {
  console.log('Current route:', state.currentRoute);
  console.log('Breadcrumbs:', state.breadcrumbs);
  console.log('Is navigating:', state.isNavigating);
});

// Get current state
const state = navigationService.getState();
```

### Event Handling
```typescript
import { router } from '../services/router';

// Listen to route changes
router.on('route:after', (data) => {
  console.log('Navigated to:', data.route.fullPath);
});

// Listen to navigation errors
router.on('route:error', (data) => {
  console.error('Navigation error:', data.error);
});
```

## Integration

### State Manager Integration
The router integrates with the application's StateManager:
- Navigation state synchronized with app state
- Machine connection status used for route guards
- UI state updates for navigation indicators

### Event Bus Integration
Navigation events are broadcast through the EventBus:
- Route changes notify other modules
- Navigation lifecycle events
- Error propagation across modules

### Logger Integration
All navigation actions are logged:
- Route changes with parameters
- Guard decisions and redirects
- Navigation errors and warnings
- Performance metrics

## Route Structure

The application supports nested routing with the following structure:

```
/                     # Dashboard
/controls             # Jog Controls
/machine              # Machine Management
  /setup              # Machine Setup
  /diagnostics        # Diagnostics
  /settings           # Machine Settings
/workspace            # Workspace Management
  /setup              # Workspace Setup
  /preview            # Workspace Preview
/tools                # Tool Management
/programs             # Program Management
/settings             # Application Settings
/help                 # Help and Documentation
```

## Testing

The module includes comprehensive tests for:
- Router navigation functionality
- Route guard behavior
- Navigation state management
- Event handling
- Configuration validation

Run tests with:
```bash
npm test src/services/router/
```

## Type Safety

Full TypeScript support with interfaces for:
- Route definitions and configuration
- Navigation state and events
- Route guard context and results
- Service interfaces and implementations

## Security

Route guards provide multiple layers of protection:
- Connection requirement enforcement
- Feature flag based access control
- Development/production route separation
- Custom access control rules

## Performance

Optimizations include:
- Lazy route definition building
- Efficient route lookup with Maps
- Minimal re-renders through state management
- Route-based code splitting support