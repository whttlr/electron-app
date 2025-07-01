# UI Controls Module

This module contains React components for CNC machine jog controls and manual positioning.

## Responsibilities
- Manual jog control interface (X/Y/Z axes)
- Position display and coordinate readouts
- Jog settings (speed, increment, units)
- Emergency stop and safety controls

## Components

### JogControls (Future)
- Main jog control interface with directional buttons
- Configurable jog distances and speeds
- Emergency stop integration
- Position display with multiple coordinate systems

### AxisControls (Future)
- Individual axis control components
- Axis-specific settings and limits
- Visual feedback for axis movement
- Coordinate system selection

## Usage

```typescript
import { JogControls, AxisControls } from '../ui/controls';

// Jog control interface
<JogControls 
  position={{ x: 0, y: 0, z: 0 }}
  onJog={(axis, distance) => handleJog(axis, distance)}
  settings={jogSettings}
/>

// Individual axis control
<AxisControls 
  axis="x"
  position={0}
  onMove={(distance) => handleMove('x', distance)}
/>
```

## Dependencies
- Ant Design components for consistent UI
- Core positioning module for jog logic
- Core machine module for hardware communication
- Configuration service for jog settings

## Testing
Tests verify user interactions, jog command generation, safety checks, and UI state management using React Testing Library with mocked core modules.