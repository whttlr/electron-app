// Machine Configuration Types
// Type definitions for machine-specific configuration schemas

import { Position, Dimensions, AxisLimitsSet } from './CommonTypes';

// Jog and Movement Types
export interface JogSettings {
  defaultSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  metricIncrements: number[];
  imperialIncrements: number[];
}

export interface MachineScaling {
  machineScaleFactor: number;
  visualScale: number;
}

export interface MovementSettings {
  minSpeed: number;
  maxSpeed: number;
  defaultSpeed: number;
  acceleration: number;
}

// Machine Feature Types
export interface WorkCoordinateSystems {
  enabled: boolean;
  supportedSystems: string[];
  defaultSystem: string;
  maxSystems: number;
}

export interface ToolDirection {
  enabled: boolean;
  defaultDirection: string;
  supportedDirections: string[];
  commandCodes: {
    clockwise: string;
    counterclockwise: string;
    stop: string;
  };
}

export interface CoolantControl {
  enabled: boolean;
  floodCoolant: string;
  mistCoolant: string;
  coolantOff: string;
}

export interface SpindleControl {
  enabled: boolean;
  minRPM: number;
  maxRPM: number;
  defaultRPM: number;
  stepSize: number;
  hasVariableSpeed: boolean;
  coolantControl: CoolantControl;
}

export interface Probing {
  enabled: boolean;
  probeCommands: {
    straightProbe: string;
    probeTowardWorkpiece: string;
    probeAwayFromWorkpiece: string;
    probeAwayNoError: string;
  };
  defaultFeedRate: number;
  retractDistance: number;
}

export interface CoordinateDisplay {
  showMachineCoordinates: boolean;
  showWorkCoordinates: boolean;
  defaultCoordinateDisplay: string;
  precision: number;
}

export interface SafetyFeatures {
  softLimits: boolean;
  hardLimits: boolean;
  emergencyStop: boolean;
  feedHold: boolean;
  cycleStart: boolean;
  doorSafety: boolean;
}

export interface MachineFeatures {
  workCoordinateSystems: WorkCoordinateSystems;
  toolDirection: ToolDirection;
  spindleControl: SpindleControl;
  probing: Probing;
  coordinateDisplay: CoordinateDisplay;
  safetyFeatures: SafetyFeatures;
}

// G-Code Configuration Types
export interface ModalGroups {
  motionModes: string[];
  coordinateSystems: string[];
  planeSelection: string[];
  units: string[];
  distanceMode: string[];
  feedRateMode: string[];
}

export interface GCodeDefaultSettings {
  motionMode: string;
  coordinateSystem: string;
  planeSelection: string;
  units: string;
  distanceMode: string;
  feedRateMode: string;
}

export interface GCodeSettings {
  modalGroups: ModalGroups;
  defaultSettings: GCodeDefaultSettings;
}

// Machine Capabilities Types
export interface Interpolation {
  linear: boolean;
  circular: boolean;
  helical: boolean;
}

export interface FeedRates {
  rapid: number;
  maxFeed: number;
  minFeed: number;
}

export interface Resolution {
  X: number;
  Y: number;
  Z: number;
}

export interface MachineCapabilities {
  axes: string[];
  simultaneousAxes: number;
  interpolation: Interpolation;
  feedRates: FeedRates;
  resolution: Resolution;
}

// Connection and Limits Types
export interface ConnectionConfig {
  defaultPort: string;
  baudRate: number;
  timeout: number;
  autoReconnect: boolean;
  reconnectDelay: number;
}

export interface LimitsConfig {
  soft: AxisLimitsSet;
  hard: AxisLimitsSet;
}

export interface HomingConfig {
  sequence: string[];
  speed: number;
  enabled: boolean;
}

export interface MachineDefaults {
  connection: ConnectionConfig;
  limits: LimitsConfig;
  homing: HomingConfig;
}

// Main Machine Configuration
export interface MachineConfig {
  defaultDimensions: Dimensions;
  defaultPosition: Position;
  jogSettings: JogSettings;
  scaling: MachineScaling;
  movement: MovementSettings;
  features: MachineFeatures;
  gCodeSettings: GCodeSettings;
  machineCapabilities: MachineCapabilities;
}