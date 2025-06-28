# Dimensions Module

Module for working area calculations, coordinate transformations, and display scaling.

## Overview

The dimensions module provides:
- Working area management and calculations
- Position validation within bounds  
- Display scaling and coordinate conversion
- Viewport-to-world coordinate transformations

## Usage

```typescript
import { dimensionsController } from '@/core/dimensions';

// Get working area info
const workingArea = dimensionsController.getWorkingArea();
console.log('Area:', dimensionsController.calculateArea());

// Update dimensions
dimensionsController.setDimensions({ width: 200, height: 150, depth: 75 });

// Check if position is valid
const isValid = dimensionsController.isPositionInWorkingArea({ x: 50, y: 50, z: 25 });

// Calculate display scaling
const viewport = { width: 800, height: 600, aspectRatio: 4/3 };
const displayArea = dimensionsController.calculateDisplayArea(viewport);

// Convert coordinates
const screenPos = dimensionsController.worldToScreen(worldPos, displayArea);
const worldPos = dimensionsController.screenToWorld(screenPos, displayArea);
```

## API

### DimensionsController

#### Working Area Management
- `getWorkingArea(): WorkingArea` - Get current working area
- `setDimensions(dimensions: MachineDimensions): void` - Update dimensions
- `setOrigin(origin: Position): void` - Set coordinate origin

#### Calculations
- `calculateArea(): number` - Calculate 2D area
- `calculateVolume(): number` - Calculate 3D volume  
- `calculateDiagonal(): number` - Calculate space diagonal
- `calculatePerimeter(): number` - Calculate perimeter
- `getAllCalculations(): DimensionCalculation` - Get all calculations

#### Position Utilities
- `isPositionInWorkingArea(position: Position): boolean` - Validate position
- `clampToWorkingArea(position: Position): Position` - Clamp to bounds
- `getClosestEdgeDistance(position: Position): number` - Distance to nearest edge

#### Display Scaling
- `calculateViewportScale(viewport: ViewportDimensions): number` - Calculate scale factor
- `calculateDisplayArea(viewport: ViewportDimensions): DisplayArea` - Get display transform

#### Coordinate Conversion
- `worldToScreen(worldPos: Position, displayArea: DisplayArea): Position` - World to screen
- `screenToWorld(screenPos: Position, displayArea: DisplayArea): Position` - Screen to world

## Configuration

Module settings in `config.js`:
- Display margins and scaling limits
- Grid and axis display options
- Calculation precision settings

## Testing

```bash
npm test -- --testPathPatterns=dimensions
```