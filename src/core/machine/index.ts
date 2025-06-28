// Public API exports for the machine module
export { MachineController } from './MachineController';
export { MachineState } from './MachineState';
export * from './MachineTypes';

// Create singleton instance for convenience
import { MachineController } from './MachineController';
export const machineController = new MachineController();