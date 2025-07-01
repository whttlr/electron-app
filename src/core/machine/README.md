# Core Machine Module

This module contains the core business logic for CNC machine control and state management.

## Responsibilities
- Machine connection state management
- Position tracking and coordinate system handling
- Machine status monitoring and reporting
- Safety system integration (limits, alarms, emergency stops)

## Components

### MachineController (Future)
- Main machine control interface
- Handles machine communication protocols
- Manages machine state transitions
- Provides safety checks and validation

## Usage

```typescript
import { MachineController } from '../core/machine';

// Machine control instance
const machine = new MachineController(config);
```

## Dependencies
- Configuration service for machine parameters
- State service for application-wide state management
- Safety validation utilities

## Testing
Tests focus on state management logic, safety systems, and control interfaces using mocked hardware dependencies.