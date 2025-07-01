# Plugin Service Module

This module provides centralized plugin management services including state management, plugin loading, and configuration handling.

## Services

### PluginContext
- React Context provider for global plugin state
- Manages plugin registry, configurations, and lifecycle
- Provides hooks for plugin access throughout the application
- Handles plugin installation, activation, and removal

## Core Functionality
- **Plugin Registration**: Add and remove plugins from the system
- **State Management**: Centralized plugin state with React Context
- **Configuration Management**: Plugin settings and placement configuration
- **Lifecycle Management**: Plugin activation, deactivation, and cleanup

## Usage

```typescript
import { PluginProvider, usePlugins } from '../services/plugin';

// Wrap application with provider
<PluginProvider>
  <App />
</PluginProvider>

// Use in components
const { plugins, addPlugin, removePlugin } = usePlugins();
```

## Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  config?: PluginConfig;
}
```

## Dependencies
- React Context API
- localStorage for persistence
- JSZip for plugin package handling
- TypeScript for type safety

## Testing
Tests verify plugin state management, context provider behavior, and localStorage integration using Jest with mocked dependencies.