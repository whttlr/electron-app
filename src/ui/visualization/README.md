# UI Visualization Module

This module contains React components responsible for visualizing the CNC machine's working area and position tracking.

## Components

### WorkingAreaPreview
- 3D visualization of the machine working area using React Three Fiber
- Real-time tool position tracking
- Interactive camera controls with OrbitControls
- Coordinate system display (X/Y/Z axes)
- Working area boundaries visualization

### MachineDisplay2D  
- 2D top-down view of the working area
- Canvas-based rendering for precise coordinate display
- Grid overlay for position reference
- Tool position indicator
- Coordinate readouts

## Usage

```typescript
import { WorkingAreaPreview, MachineDisplay2D } from '../ui/visualization';

// 3D Preview
<WorkingAreaPreview 
  currentPosition={{ x: 0, y: 0, z: 0 }}
  workArea={{ x: 300, y: 200, z: 50 }}
/>

// 2D Display
<MachineDisplay2D
  position={{ x: 0, y: 0 }}
  workArea={{ x: 300, y: 200 }}
  showGrid={true}
/>
```

## Dependencies
- React Three Fiber (@react-three/fiber)
- Three.js helpers (@react-three/drei)
- HTML5 Canvas API
- React hooks for state management

## Testing
Tests are located in `__tests__/` and use React Testing Library with Canvas mocking for 2D components and Three.js mocking for 3D components.