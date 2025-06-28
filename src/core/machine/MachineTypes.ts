export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface MachineDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface MachineConfig {
  defaultDimensions: MachineDimensions;
  defaultPosition: Position;
  scaling: {
    machineScaleFactor: number;
    visualScale: number;
  };
}

export interface MachineState {
  isConnected: boolean;
  position: Position;
  dimensions: MachineDimensions;
  isHoming: boolean;
  isMoving: boolean;
  lastError?: string;
}

export type MachineEventType = 
  | 'connected'
  | 'disconnected'
  | 'positionChanged'
  | 'homingStarted'
  | 'homingCompleted'
  | 'error';

export interface MachineEvent {
  type: MachineEventType;
  data?: any;
  timestamp: Date;
}

export type MachineEventListener = (event: MachineEvent) => void;