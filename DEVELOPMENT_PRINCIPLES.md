# Development Principles & Core Ideas

## Overview

This document outlines the fundamental principles, architectural philosophies, and development methodologies that drive the CNC Jog Controls application. Understanding these core ideas is essential for contributing to the project and maintaining consistency across the codebase.

## Table of Contents

1. [Architectural Philosophy](#architectural-philosophy)
2. [Self-Contained Module Design](#self-contained-module-design)
3. [Component-First Development](#component-first-development)
4. [Plugin-Driven Architecture](#plugin-driven-architecture)
5. [Type Safety & Developer Experience](#type-safety--developer-experience)
6. [Testing Philosophy](#testing-philosophy)
7. [Performance & Scalability](#performance--scalability)
8. [User Experience Principles](#user-experience-principles)
9. [Code Organization & Maintainability](#code-organization--maintainability)
10. [Development Workflow](#development-workflow)

---

## Architectural Philosophy

### Domain-Driven Design (DDD)

The application is organized around **business domains** rather than technical layers:

```
✅ Good: Organized by domain
src/
├── core/machine/          # Machine control domain
├── core/positioning/      # Positioning domain  
├── core/workspace/        # Workspace domain
└── services/plugin/       # Plugin management domain

❌ Bad: Organized by technical layer
src/
├── controllers/           # All controllers mixed together
├── services/              # All services mixed together
└── components/            # All UI components mixed together
```

**Why this matters:**
- **Related functionality stays together** - easier to find and modify
- **Clear boundaries** between different business concerns
- **Easier testing** - each domain can be tested independently
- **Better scalability** - domains can evolve independently

### Dependency Inversion Principle

Higher-level modules should not depend on lower-level modules. Both should depend on abstractions.

```typescript
// ✅ Good: Depends on abstraction
interface MachineControllerInterface {
  connect(): Promise<void>;
  jog(axis: Axis, distance: number): Promise<void>;
}

class JogService {
  constructor(private machineController: MachineControllerInterface) {}
}

// ❌ Bad: Depends on concrete implementation
import { ConcreteMachineController } from './ConcreteMachineController';

class JogService {
  private controller = new ConcreteMachineController(); // Tight coupling
}
```

**Benefits:**
- **Easier testing** with mock implementations
- **Flexible architecture** - swap implementations without changing dependents
- **Reduced coupling** between modules

### Separation of Concerns

Each module has a **single, well-defined responsibility**:

- **Core modules**: Business logic and domain rules
- **Services**: Cross-cutting concerns (state, API, configuration)
- **UI modules**: User interface and interaction logic
- **Views**: Page-level components and routing
- **Utils**: Pure functions without side effects

---

## Self-Contained Module Design

### Module Autonomy

Each module is a **complete, self-contained unit** with everything it needs:

```
src/core/machine/
├── __tests__/              # All tests for this module
├── __mocks__/              # Mock data and implementations
├── controllers/            # Internal controllers
├── utils/                  # Module-specific utilities
├── types/                  # TypeScript type definitions
├── README.md               # Module documentation
├── config.ts               # Module configuration
├── index.ts                # Public API (what others can import)
└── MachineController.ts    # Main implementation
```

### Clear Public APIs

Each module exports a **clean, documented interface** via `index.ts`:

```typescript
// src/core/machine/index.ts
export type { MachineState, MachineConfig } from './types';
export { MachineController } from './MachineController';
export { createMachineController } from './factory';

// Internal implementations are NOT exported
// This prevents other modules from depending on internal details
```

### Configuration-Driven Design

All module behavior is controlled through configuration rather than hardcoded values:

```typescript
// config.ts
export const machineConfig = {
  maxJogSpeed: 1000,
  safetyTimeouts: {
    connection: 5000,
    emergencyStop: 100
  },
  axes: ['X', 'Y', 'Z'] as const
};

// Usage in component
const controller = new MachineController(machineConfig);
```

**Advantages:**
- **Easy testing** with different configurations
- **Environment-specific settings** (dev/staging/prod)
- **Runtime configuration** changes without code deployment

---

## Component-First Development

### UI Library Priority System

We follow a strict hierarchy for UI component selection:

1. **UI Library** (Primary) - Custom design system
2. **Ant Design** (Fallback) - Complex components only
3. **Custom Components** (Last resort) - Plan to add to UI Library

```typescript
// ✅ Preferred: Use UI Library
import { Button, Card, Modal } from 'ui-library';

// ⚠️ Acceptable: Ant Design for complex components
import { DatePicker, Table } from 'antd';

// ❌ Avoid: Custom components (unless adding to UI Library)
import { CustomButton } from './CustomButton';
```

### Design System Consistency

All UI components follow **consistent design tokens**:

- **Typography**: Standardized font sizes, weights, line heights
- **Colors**: Consistent color palette with semantic meanings
- **Spacing**: Standardized spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- **Shadows**: Consistent elevation system
- **Animations**: Standardized timing and easing functions

### Component Composition Over Inheritance

Build complex components by **composing simpler ones**:

```typescript
// ✅ Good: Composition
const JogControls = () => (
  <Card>
    <JogButton axis="X" direction="positive" />
    <JogButton axis="X" direction="negative" />
    <SpeedSelector />
    <EmergencyStop />
  </Card>
);

// ❌ Bad: Large monolithic component
const JogControls = () => {
  // 200+ lines of mixed concerns
};
```

---

## Plugin-Driven Architecture

### Extensibility by Design

The application is built to be **extended without modification**:

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  placement: 'dashboard' | 'standalone' | 'modal' | 'sidebar';
  component: React.ComponentType;
  config?: PluginConfig;
}
```

### Plugin Isolation

Each plugin operates in its own **isolated environment**:

- **Sandboxed execution** - plugins cannot interfere with each other
- **Defined APIs** - plugins interact through well-defined interfaces
- **Resource management** - plugins have controlled access to system resources
- **Error boundaries** - plugin failures don't crash the main application

### Dynamic Loading

Plugins are loaded **at runtime** without requiring application rebuilds:

```typescript
const pluginService = new PluginService();

// Load plugin from ZIP file
const plugin = await pluginService.loadFromFile('./my-plugin.zip');

// Install and activate
await pluginService.install(plugin);
await pluginService.activate(plugin.id);
```

---

## Type Safety & Developer Experience

### TypeScript-First Development

Everything is **typed from the ground up**:

```typescript
// Strict type definitions
interface MachinePosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly timestamp: Date;
}

// Branded types for safety
type MillimeterDistance = number & { readonly brand: unique symbol };
type InchDistance = number & { readonly brand: unique symbol };

// Generic interfaces for flexibility
interface Controller<TState, TConfig> {
  getState(): TState;
  configure(config: TConfig): Promise<void>;
}
```

### Developer Experience Optimization

Every tool and process is optimized for **developer productivity**:

- **Hot reload** - instant feedback during development
- **Type checking** - catch errors at compile time
- **Auto-completion** - intelligent code suggestions
- **Integrated testing** - run tests alongside development
- **Linting** - consistent code style enforcement

### Error Handling Strategy

Comprehensive error handling with **clear error boundaries**:

```typescript
// Domain-specific error types
class MachineConnectionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean
  ) {
    super(message);
  }
}

// Error boundaries for UI
class PluginErrorBoundary extends React.Component {
  // Isolate plugin errors from main app
}
```

---

## Testing Philosophy

### Test Pyramid Strategy

Different types of tests serve **different purposes**:

```
        🔺 E2E Tests (Few)
       🔺🔺 Integration Tests (Some)  
    🔺🔺🔺🔺 Unit Tests (Many)
```

- **Unit Tests**: Fast, isolated, test individual functions/components
- **Integration Tests**: Test module interactions and data flow
- **E2E Tests**: Test complete user workflows and critical paths

### Test-Driven Development (TDD)

Write tests **before implementation** to drive design:

```typescript
// 1. Write failing test
describe('MachineController', () => {
  it('should connect to machine and return status', async () => {
    const controller = new MachineController(mockConfig);
    const status = await controller.connect();
    expect(status.connected).toBe(true);
  });
});

// 2. Write minimal implementation to pass test
// 3. Refactor while keeping tests green
```

### Testing Standards

- **95%+ code coverage** for critical business logic
- **100% type coverage** with strict TypeScript
- **Accessibility testing** for all UI components
- **Performance testing** for critical paths
- **Visual regression testing** with Storybook

---

## Performance & Scalability

### Lazy Loading Strategy

Load code **only when needed**:

```typescript
// Lazy load views
const PluginsView = lazy(() => import('./views/Plugins/PluginsView'));

// Lazy load plugins
const pluginComponent = lazy(() => loadPlugin(pluginId));

// Code splitting by route
const router = createBrowserRouter([
  {
    path: '/plugins',
    element: <Suspense><PluginsView /></Suspense>
  }
]);
```

### Memory Management

Careful management of **memory usage**:

- **Cleanup event listeners** in useEffect cleanup functions
- **Dispose of 3D resources** when components unmount
- **Limit plugin memory usage** with resource quotas
- **Garbage collection friendly** object creation patterns

### Bundle Optimization

Optimize application bundle size:

- **Tree shaking** - eliminate unused code
- **Code splitting** - split into smaller chunks
- **Dynamic imports** - load modules on demand
- **Asset optimization** - compress images and resources

---

## User Experience Principles

### Progressive Enhancement

Build experiences that **work for everyone**:

1. **Core functionality** works without JavaScript
2. **Enhanced features** with JavaScript enabled
3. **Rich interactions** with full browser capabilities
4. **Offline functionality** with service workers

### Accessibility First

Design for **all users** from the beginning:

- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Color contrast** meeting WCAG 2.1 AA standards
- **Focus management** for single-page app navigation
- **Reduced motion** options for users with vestibular disorders

### Performance Budget

Maintain **fast loading times**:

- **Initial bundle**: < 200KB gzipped
- **Time to Interactive**: < 3 seconds on 3G
- **Lighthouse score**: > 90 across all metrics
- **Memory usage**: < 100MB for typical workflows

---

## Code Organization & Maintainability

### File Size Limits

Keep files **focused and manageable**:

- **Maximum 500 lines** per file
- **Single responsibility** per file
- **Clear naming conventions** that indicate purpose
- **Logical grouping** of related functionality

### Import Discipline

Maintain **clear dependency boundaries**:

```typescript
// ✅ Good: Clear, specific imports
import { MachineController } from '../core/machine';
import { Button } from 'ui-library';

// ❌ Bad: Barrel imports that hide dependencies
import * as Machine from '../core/machine';
import * as UI from 'ui-library';
```

### Documentation Standards

Every module includes **comprehensive documentation**:

- **README.md** explaining purpose and usage
- **API documentation** for all public interfaces
- **Code comments** for complex business logic
- **Architecture Decision Records** for major decisions

---

## Development Workflow

### Git Workflow

Structured approach to **code collaboration**:

```
main branch (production-ready)
  ↳ develop branch (integration)
    ↳ feature/new-jog-controls
    ↳ bugfix/position-calculation
    ↳ hotfix/emergency-stop
```

### Code Review Process

Every change goes through **peer review**:

1. **Automated checks** (tests, linting, type checking)
2. **Architecture review** (follows principles?)
3. **Code quality review** (maintainable, readable?)
4. **Testing review** (adequate coverage?)
5. **Documentation review** (updated docs?)

### Continuous Integration

Automated quality gates:

- **Unit tests** must pass (95%+ coverage)
- **Integration tests** must pass
- **E2E tests** must pass for critical paths
- **Bundle size** must stay within budget
- **Performance benchmarks** must not regress

### Release Process

Structured approach to **deployments**:

1. **Feature freeze** on develop branch
2. **Create release branch** (release/v1.2.3)
3. **Final testing** and bug fixes
4. **Merge to main** with version tag
5. **Deploy to production**
6. **Create release notes**

---

## Conclusion

These principles guide every decision in the CNC Jog Controls application. They ensure:

- **Maintainable codebase** that scales with the team
- **Consistent user experience** across all features
- **Reliable software** with comprehensive testing
- **Developer productivity** with great tooling
- **Extensible architecture** for future needs

When in doubt, refer back to these principles. They represent the collective wisdom of the team and the lessons learned from building complex, maintainable software.

Remember: **Principles over practices**. While specific tools and techniques may change, these core ideas will guide us toward building better software.