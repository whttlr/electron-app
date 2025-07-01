# UI Plugin Module

This module contains React components responsible for rendering and managing plugin UI integration across the application.

## Components

### PluginRenderer
- Dynamically renders plugins based on screen and placement configuration
- Handles different plugin placement types (dashboard, modal, sidebar, standalone)
- Manages plugin lifecycle and error boundaries
- Provides consistent styling and layout for plugin integration

## Usage

```typescript
import { PluginRenderer } from '../ui/plugin';

// Render plugins for specific screen and placement
<PluginRenderer 
  screen="main" 
  placement="dashboard" 
/>

// Render all plugins for a screen
<PluginRenderer 
  screen="controls" 
/>
```

## Plugin Placement Types
- **dashboard**: Cards integrated into dashboard grid
- **modal**: Popup dialogs for focused tasks  
- **sidebar**: Compact side-mounted panels
- **standalone**: Full-screen applications (handled by routing)

## Dependencies
- React Context API for plugin state
- Ant Design components for consistent UI
- Dynamic script loading for plugin code
- localStorage for plugin persistence

## Testing
Tests use React Testing Library with mocked plugin contexts and localStorage to verify rendering behavior across different configurations.