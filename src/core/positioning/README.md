# Positioning Module

Module for position tracking, jog control, and coordinate management.

## Overview

The positioning module provides comprehensive position management including:
- Position validation and bounds checking
- Coordinate scaling between machine and display units
- Jog command generation and execution
- Metric/Imperial unit support

## Components

### PositionController
Handles position validation, scaling, and calculations.

```typescript
import { positionController } from '@/core/positioning';

// Scale positions
const displayPos = positionController.scaleForDisplay(machinePos);
const machinePos = positionController.scaleForMachine(displayPos);

// Validate position
const validation = positionController.validatePosition({ x: 50, y: 50, z: 10 });
if (!validation.isValid) {
  console.error(validation.errors);
}

// Calculate distance
const distance = positionController.calculateDistance(from, to);
```

### JogController
Manages jog operations and settings.

```typescript
import { jogController } from '@/core/positioning';

// Execute jog
const newPosition = await jogController.executeJog(currentPos, {
  axis: 'x',
  distance: 10,
  speed: 1000
});

// Get step jog command
const jogCommand = jogController.calculateStepJog('y', 1);

// Update settings
jogController.updateSettings({
  increment: 0.1,
  speed: 500
});

// Switch units
jogController.setMetricMode(false); // Switch to imperial
```

## Configuration

Module settings in `config.js`:
- Position update intervals
- Jog acceleration/deceleration  
- Safety distances
- Display formatting

## Testing

```bash
npm test -- --testPathPatterns=positioning
```