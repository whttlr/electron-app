// Defaults Configuration Types
// Type definitions for default values and fallback configuration schemas

import { IncrementConfig, SpeedConfig } from './CommonTypes';
import { MachineDefaults } from './MachineTypes';
import { UIDefaults, VisualizationDefaults } from './UITypes';

// Jog Defaults Types
export interface JogIncrements {
  metric: IncrementConfig;
  imperial: IncrementConfig;
}

export interface SafetyConfig {
  maxDistancePerJog: number;
  requireConfirmation: boolean;
  enableSoftLimits: boolean;
}

export interface JogDefaults {
  increments: JogIncrements;
  speed: SpeedConfig;
  safety: SafetyConfig;
}

// Main Defaults Configuration
export interface DefaultsConfig {
  machine: MachineDefaults;
  jog: JogDefaults;
  visualization: VisualizationDefaults;
  ui: UIDefaults;
}
