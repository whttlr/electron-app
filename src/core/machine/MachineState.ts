import { Position, MachineDimensions, MachineState as IMachineState } from './MachineTypes';
import machineConfig from '@config/machine.json';

export class MachineState {
  private state: IMachineState;

  constructor(initialState?: Partial<IMachineState>) {
    this.state = {
      isConnected: false,
      position: { ...machineConfig.defaultPosition },
      dimensions: { ...machineConfig.defaultDimensions },
      isHoming: false,
      isMoving: false,
      ...initialState
    };
  }

  get(): IMachineState {
    return {
      ...this.state,
      position: { ...this.state.position },
      dimensions: { ...this.state.dimensions }
    };
  }

  getPosition(): Position {
    return { ...this.state.position };
  }

  getDimensions(): MachineDimensions {
    return { ...this.state.dimensions };
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  isMoving(): boolean {
    return this.state.isMoving;
  }

  isHoming(): boolean {
    return this.state.isHoming;
  }

  setConnected(connected: boolean): void {
    this.state.isConnected = connected;
  }

  setPosition(position: Partial<Position>): void {
    this.state.position = {
      ...this.state.position,
      ...position
    };
  }

  setDimensions(dimensions: Partial<MachineDimensions>): void {
    this.state.dimensions = {
      ...this.state.dimensions,
      ...dimensions
    };
  }

  setMoving(moving: boolean): void {
    this.state.isMoving = moving;
  }

  setHoming(homing: boolean): void {
    this.state.isHoming = homing;
  }

  setError(error?: string): void {
    this.state.lastError = error;
  }

  reset(): void {
    this.state = {
      isConnected: this.state.isConnected,
      position: { ...machineConfig.defaultPosition },
      dimensions: { ...machineConfig.defaultDimensions },
      isHoming: false,
      isMoving: false,
      lastError: undefined
    };
  }
}