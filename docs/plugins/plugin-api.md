# Plugin API Documentation

The CNC Control Application provides a comprehensive API for plugins to access application configuration, state, and resources. This document describes the available APIs and how to use them in your plugins.

## Plugin API Overview

Plugins receive access to the application through the `PluginAPI` interface, which provides controlled access to various application resources while maintaining security and stability.

```typescript
interface PluginAPI {
  config: ConfigAPI;
  // Future: state, machine, ui, etc.
}
```

## Configuration API

Plugins can access the application's configuration system through the `config` property of the PluginAPI.

### Available Methods

#### `config.get<T>(path: string): T | null`
Retrieves a configuration value by dot-notation path.

```typescript
// Get specific configuration values
const jogSpeed = pluginAPI.config.get<number>('machine.jogSettings.defaultSpeed');
const workArea = pluginAPI.config.get('machine.defaultDimensions');
const theme = pluginAPI.config.get<string>('ui.theme.name');
```

#### `config.getSection(section: keyof CompleteConfig): any | null`
Retrieves an entire configuration section.

```typescript
// Get complete configuration sections
const machineConfig = pluginAPI.config.getSection('machine');
const uiConfig = pluginAPI.config.getSection('ui');
const apiConfig = pluginAPI.config.getSection('api');
```

#### `config.getWithFallback<T>(path: string, fallback: T): T`
Retrieves a configuration value with a fallback if not found.

```typescript
// Get configuration with fallback values
const speed = pluginAPI.config.getWithFallback('machine.jogSettings.defaultSpeed', 1000);
const dimensions = pluginAPI.config.getWithFallback('machine.defaultDimensions', { 
  width: 100, 
  height: 100, 
  depth: 50 
});
```

#### `config.isLoaded(): boolean`
Check if configuration has been loaded.

```typescript
if (pluginAPI.config.isLoaded()) {
  // Safe to access configuration
  const config = pluginAPI.config.getSection('machine');
}
```

#### `config.reload(): Promise<void>`
Reload configuration from files.

```typescript
// Refresh configuration (useful for development)
await pluginAPI.config.reload();
```

## Available Configuration Sections

### Machine Configuration (`machine`)
- `defaultDimensions`: Working area dimensions
- `defaultPosition`: Default machine position
- `jogSettings`: Jog control settings and increments
- `movement`: Movement parameters and limits
- `features`: Available machine features

### State Configuration (`state`)
- `defaultState`: Default application state
- `polling`: Update interval settings
- `persistence`: State persistence settings

### UI Configuration (`ui`)
- `theme`: Theme colors and styling
- `layout`: UI layout preferences
- `accessibility`: Accessibility settings

### API Configuration (`api`)
- `endpoints`: API endpoint configurations
- `timeouts`: Request timeout settings
- `retries`: Retry policies

## Usage in Plugin Components

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { usePlugins } from '../../services/plugin';

const MyPluginComponent: React.FC = () => {
  const { getPluginAPI } = usePlugins();
  const [pluginAPI] = useState(getPluginAPI());
  const [machineConfig, setMachineConfig] = useState(null);

  useEffect(() => {
    if (pluginAPI.config.isLoaded()) {
      const config = pluginAPI.config.getSection('machine');
      setMachineConfig(config);
    }
  }, [pluginAPI]);

  const handleConfigReload = async () => {
    await pluginAPI.config.reload();
    const config = pluginAPI.config.getSection('machine');
    setMachineConfig(config);
  };

  if (!machineConfig) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div>
      <h3>Machine Configuration</h3>
      <p>Work Area: {machineConfig.defaultDimensions.width} × {machineConfig.defaultDimensions.height}</p>
      <p>Default Speed: {machineConfig.jogSettings.defaultSpeed} mm/min</p>
      <button onClick={handleConfigReload}>Reload Config</button>
    </div>
  );
};
```

### Plugin Hook Pattern

```typescript
// Custom hook for accessing machine configuration
const useMachineConfigPlugin = () => {
  const { getPluginAPI } = usePlugins();
  const [pluginAPI] = useState(getPluginAPI());
  
  const getMachineConfig = useCallback(() => {
    return pluginAPI.config.getSection('machine');
  }, [pluginAPI]);
  
  const getJogSettings = useCallback(() => {
    return pluginAPI.config.get('machine.jogSettings');
  }, [pluginAPI]);
  
  const getWorkArea = useCallback(() => {
    return pluginAPI.config.getWithFallback('machine.defaultDimensions', {
      width: 100,
      height: 100,
      depth: 50
    });
  }, [pluginAPI]);
  
  return {
    pluginAPI,
    getMachineConfig,
    getJogSettings,
    getWorkArea,
    isConfigLoaded: pluginAPI.config.isLoaded()
  };
};
```

## Configuration Paths Reference

### Common Configuration Paths

```typescript
// Machine configuration
'machine.defaultDimensions.width'
'machine.defaultDimensions.height'
'machine.defaultDimensions.depth'
'machine.defaultPosition.x'
'machine.defaultPosition.y'
'machine.defaultPosition.z'
'machine.jogSettings.defaultSpeed'
'machine.jogSettings.maxSpeed'
'machine.jogSettings.metricIncrements'
'machine.jogSettings.imperialIncrements'

// UI configuration
'ui.theme.name'
'ui.theme.colors.primary'
'ui.theme.axisColors.x'
'ui.theme.axisColors.y'
'ui.theme.axisColors.z'

// State configuration
'state.defaultState.machine.units'
'state.defaultState.machine.isConnected'
'state.defaultState.ui.theme'
'state.polling.positionUpdateInterval'
'state.polling.statusUpdateInterval'

// API configuration
'api.timeouts.connection'
'api.timeouts.command'
'api.retries.maxAttempts'
```

## Best Practices

### 1. Check Configuration Loading State
Always verify configuration is loaded before accessing it:

```typescript
if (pluginAPI.config.isLoaded()) {
  // Safe to access configuration
}
```

### 2. Use Fallback Values
Provide reasonable fallback values for configuration that might not exist:

```typescript
const speed = pluginAPI.config.getWithFallback('machine.jogSettings.defaultSpeed', 1000);
```

### 3. Cache Configuration Data
Cache frequently accessed configuration to avoid repeated API calls:

```typescript
const [cachedConfig, setCachedConfig] = useState(null);

useEffect(() => {
  if (pluginAPI.config.isLoaded() && !cachedConfig) {
    setCachedConfig(pluginAPI.config.getSection('machine'));
  }
}, [pluginAPI, cachedConfig]);
```

### 4. Handle Configuration Updates
Listen for configuration changes if your plugin needs to react to updates:

```typescript
useEffect(() => {
  const handleConfigUpdate = () => {
    if (pluginAPI.config.isLoaded()) {
      const updatedConfig = pluginAPI.config.getSection('machine');
      setMachineConfig(updatedConfig);
    }
  };

  // In a future version, configuration change events will be available
  // pluginAPI.config.addEventListener('updated', handleConfigUpdate);
  
  return () => {
    // pluginAPI.config.removeEventListener('updated', handleConfigUpdate);
  };
}, [pluginAPI]);
```

## Future API Extensions

The Plugin API will be extended with additional capabilities:

- **State API**: Access to application state management
- **Machine API**: Direct machine control and status
- **UI API**: UI integration and theming
- **Event API**: Plugin-to-plugin communication
- **Storage API**: Plugin-specific data storage
- **Notification API**: User notifications and alerts

## Security Considerations

- Plugins can only read configuration, not modify it
- Configuration access is limited to defined sections
- Sensitive configuration values are filtered out
- Plugin API calls are rate-limited and monitored

## Troubleshooting

### Configuration Not Loading
```typescript
// Check if configuration service is initialized
if (!pluginAPI.config.isLoaded()) {
  console.log('Configuration not yet loaded');
  // Try reloading
  await pluginAPI.config.reload();
}
```

### Missing Configuration Values
```typescript
// Use fallbacks for missing values
const value = pluginAPI.config.getWithFallback('some.missing.path', 'default-value');
```

### Type Safety
```typescript
// Use TypeScript generics for type safety
interface MachineConfig {
  defaultDimensions: { width: number; height: number; depth: number };
  jogSettings: { defaultSpeed: number; maxSpeed: number };
}

const machineConfig = pluginAPI.config.getSection('machine') as MachineConfig;
```