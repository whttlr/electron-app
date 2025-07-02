// Main Configuration Types
// Central configuration interfaces and service-related types

import { MachineConfig } from './MachineTypes';
import { StateConfig } from './StateTypes';
import { AppConfig } from './AppTypes';
import { UIConfig, VisualizationConfig } from './UITypes';
import { APIConfig } from './APITypes';
import { DefaultsConfig } from './DefaultsTypes';

// Complete Configuration Interface
export interface CompleteConfig {
  machine: MachineConfig;
  state: StateConfig;
  app: AppConfig;
  ui: UIConfig;
  api: APIConfig;
  defaults: DefaultsConfig;
  visualization: VisualizationConfig;
}

// Configuration Loading State
export interface ConfigLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Configuration Service Events
export type ConfigEventType = 'loaded' | 'error' | 'updated' | 'reset';

export interface ConfigEvent {
  type: ConfigEventType;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// Configuration File Names
export const CONFIG_FILES = {
  MACHINE: 'machine.json',
  STATE: 'state.json',
  APP: 'app.json',
  UI: 'ui.json',
  API: 'api.json',
  DEFAULTS: 'defaults.json',
  VISUALIZATION: 'visualization.json',
} as const;

export type ConfigFileName = typeof CONFIG_FILES[keyof typeof CONFIG_FILES];