// State Configuration Types
// Type definitions for application state and polling configuration schemas

import { Position, Dimensions, Bounds } from './CommonTypes';

// Machine State Types
export interface MachineState {
  isConnected: boolean;
  position: Position;
  dimensions: Dimensions;
  units: string;
  status: string;
  temperature: {
    spindle: number;
    bed: number;
  };
}

export interface JogState {
  distance: number;
  speed: number;
  increment: number;
  isMetric: boolean;
  maxSpeed: number;
  minSpeed: number;
}

export interface UIState {
  showDebugPanel: boolean;
  highlightedAxis: string | null;
  sidebarCollapsed: boolean;
  theme: string;
  language: string;
}

export interface SystemState {
  initialized: boolean;
  connected: boolean;
  version: string;
  lastUpdate: string | null;
  errors: string[];
}

export interface WorkspaceState {
  origin: Position;
  bounds: Bounds;
}

export interface DefaultState {
  machine: MachineState;
  jog: JogState;
  ui: UIState;
  system: SystemState;
  workspace: WorkspaceState;
}

// Polling Configuration Types
export interface PollingConfig {
  positionUpdateInterval: number;
  statusUpdateInterval: number;
  connectionCheckInterval: number;
  enablePolling: boolean;
  retryAttempts: number;
  retryDelay: number;
}

// Main State Configuration
export interface StateConfig {
  defaultState: DefaultState;
  polling: PollingConfig;
}
