# Core Positioning Module

This module handles position tracking, coordinate system management, and jog control logic.

## Responsibilities
- Position tracking and coordinate calculations
- Jog movement planning and execution
- Coordinate system transformations (machine, work, display coordinates)
- Movement validation and safety checks

## Components

### PositionController (Future)
- Tracks current machine position
- Handles coordinate system transformations
- Validates movement commands for safety

### JogController (Future)
- Manages manual jog operations
- Implements incremental and continuous jogging
- Provides speed and acceleration control

## Usage

```typescript
import { PositionController, JogController } from '../core/positioning';

// Position tracking
const position = new PositionController();
const currentPos = position.getCurrentPosition();

// Jog operations
const jogger = new JogController(position);
jogger.moveRelative({ x: 10, y: 0, z: 0 });
```

## Dependencies
- Machine module for hardware communication
- Configuration service for movement parameters
- Validation utilities for safety checks

## Testing
Tests verify position calculations, coordinate transformations, and movement validation using mathematical test cases and mocked hardware.