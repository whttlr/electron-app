# State Service Module

This module provides centralized application state management beyond React's component state.

## Responsibilities
- Global application state management
- Cross-component state synchronization
- State persistence and hydration
- State change notifications and event handling

## Components

### StateService (Future)
- Manages global application state
- Provides state subscription and notification system
- Handles state persistence to localStorage
- Integrates with React Context for UI updates

## Usage

```typescript
import { StateService } from '../services/state';

// Global state management
const state = StateService.getInstance();
state.setState('machine.position', { x: 0, y: 0, z: 0 });
const position = state.getState('machine.position');
```

## State Domains
- **Machine State**: Position, connection status, machine parameters
- **UI State**: Theme, layout preferences, debug settings
- **Plugin State**: Plugin configurations and runtime state
- **Workspace State**: Working area, coordinate systems, fixtures

## Dependencies
- Configuration service for default state values
- localStorage for state persistence
- Event system for state change notifications

## Testing
Tests verify state management operations, persistence, event handling, and integration with React Context using isolated state scenarios.