# Machine Module

Core module for CNC machine control and state management.

## Overview

The machine module provides a clean API for controlling CNC machine operations including connection management, position control, and homing sequences. It maintains machine state and emits events for UI updates.

## Usage

```typescript
import { machineController } from '@/core/machine';

// Connect to machine
await machineController.connect();

// Move to position
await machineController.moveToPosition({ x: 50, y: 50, z: 10 });

// Jog single axis
await machineController.jog('x', 10);

// Home machine
await machineController.home();

// Listen to events
machineController.on('positionChanged', (event) => {
  console.log('New position:', event.data);
});
```

## API

### MachineController

#### Methods

- `connect(): Promise<void>` - Connect to the machine
- `disconnect(): Promise<void>` - Disconnect from the machine
- `moveToPosition(position: Partial<Position>): Promise<void>` - Move to absolute position
- `jog(axis: 'x'|'y'|'z', distance: number): Promise<void>` - Jog relative distance
- `home(): Promise<void>` - Execute homing sequence
- `getState(): MachineState` - Get current machine state
- `getPosition(): Position` - Get current position
- `isConnected(): boolean` - Check connection status

#### Events

- `connected` - Machine connected
- `disconnected` - Machine disconnected  
- `positionChanged` - Position updated
- `homingStarted` - Homing sequence started
- `homingCompleted` - Homing sequence completed
- `error` - Error occurred

## Configuration

Module configuration is stored in `config.js` and includes:
- Connection settings (timeout, retry)
- Movement settings (speed limits, acceleration)
- Safety settings (soft limits, validation)
- Simulation delays for mock mode

## Testing

Tests are located in `__tests__/` directory. Run with:
```bash
npm test -- --testPathPatterns=machine
```