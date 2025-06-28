# Configuration Service

The Configuration Service provides centralized management of all application configuration values. It supports multiple configuration files, environment-specific overrides, and type-safe access to configuration values.

## Configuration Files

Located in `/config/` directory:

- **`app.json`** - Application-level settings (version, features, performance)
- **`machine.json`** - Machine hardware configuration (dimensions, movement, scaling)
- **`ui.json`** - UI theme and layout settings
- **`visualization.json`** - 2D/3D rendering configuration
- **`state.json`** - Default application state and polling settings
- **`api.json`** - API endpoints, timeouts, and mock settings
- **`defaults.json`** - Default values for machine, jog, and UI settings

## Usage

```typescript
import { configService, getDefaultState, getMachineConfig } from '@/services/config';

// Get entire configuration section
const machineConfig = configService.get('machine');
const apiConfig = configService.get('api');

// Get specific values using dot notation
const maxSpeed = configService.getValue('machine.jogSettings.maxSpeed', 1000);
const isDebugEnabled = configService.getValue('app.features.debugPanel', false);

// Use convenience functions
const defaultState = getDefaultState();
const jogDefaults = getJogDefaults();

// Feature flags
if (configService.isFeatureEnabled('debugPanel')) {
  // Show debug panel
}

// Environment checks
if (configService.isDevelopment()) {
  // Development-only features
}
```

## Configuration Override

Support for runtime configuration overrides:

```typescript
// Set override
configService.setOverride('api.mock.enabled', false);

// Remove override
configService.removeOverride('api.mock.enabled');

// URL parameter overrides (automatic)
// ?debug=true&mock=false
```

## Configuration Structure

### Default State (`state.json`)
- Machine state (position, connection, dimensions)
- Jog settings (speed, increment, units)
- UI state (debug panel, highlighted axis, theme)
- System state (initialization, errors)
- Workspace configuration
- Polling intervals and retry settings

### Machine Config (`machine.json`)
- Default dimensions and position
- Jog speed and increment settings
- Scaling factors for visualization
- Movement parameters
- **CNC Features**: Work coordinate systems (WCS), tool direction, spindle control
- **G-Code Settings**: Modal groups, default codes, coordinate systems
- **Machine Capabilities**: Axes, interpolation, feed rates, resolution
- **Safety Features**: Soft/hard limits, emergency stop, door safety

### API Config (`api.json`)
- Endpoint URLs for all API calls
- Timeout values
- Retry configuration
- Mock mode settings

### Defaults (`defaults.json`)
- Machine connection and limits
- Detailed jog increment values
- Safety settings
- Visualization preferences
- UI theme and animation settings

## Integration with State Manager

The StateManager is initialized with default values from the configuration:

```typescript
// StateManager initialization
const defaultState = configService.getDefaultState();
this.state = defaultState;
```

## Migration Path to API

The configuration structure is designed to support easy migration to API-based configuration:

1. **Current**: Load from JSON files
2. **Future**: Replace with API calls using the same structure
3. **Hybrid**: Use JSON as fallback when API unavailable

```typescript
// Future API integration
async loadConfiguration() {
  try {
    const apiConfig = await fetch('/api/config/machine');
    return apiConfig.json();
  } catch (error) {
    // Fallback to local config
    return configService.get('machine');
  }
}
```

## Validation

Built-in configuration validation:

```typescript
const validation = configService.validateConfig();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Development Features

- URL parameter overrides for testing
- Mock mode configuration
- Debug feature toggles
- Environment-specific settings
- Configuration hot-reloading (future)

This service centralizes all configuration management and provides a clean migration path from static files to dynamic API-based configuration.