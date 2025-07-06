// Core Machine Module - Public API

// Machine controller
export { MachineController, machineController } from './MachineController';

// Machine types and interfaces
export type {
  MachineState,
  MachineCommand,
  CommandResponse,
  MachineEvent,
  MachineEventHandler,
} from './MachineController';

// Configuration
export { machineConfig, type MachineConfig } from './config';

// Module metadata
export const MachineModule = {
  version: '1.0.0',
  description: 'Core machine control and state management',
};
