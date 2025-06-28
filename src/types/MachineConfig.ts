/**
 * Machine Configuration Types
 * 
 * TypeScript interfaces for machine.json configuration structure.
 * Provides type safety for accessing machine features and capabilities.
 */

export interface MachineConfig {
  defaultDimensions: {
    width: number;
    height: number;
    depth: number;
  };
  defaultPosition: {
    x: number;
    y: number;
    z: number;
  };
  jogSettings: {
    defaultSpeed: number;
    maxSpeed: number;
    minSpeed: number;
    metricIncrements: number[];
    imperialIncrements: number[];
  };
  scaling: {
    machineScaleFactor: number;
    visualScale: number;
  };
  movement: {
    minSpeed: number;
    maxSpeed: number;
    defaultSpeed: number;
    acceleration: number;
  };
  features: MachineFeatures;
  gCodeSettings: GCodeSettings;
  machineCapabilities: MachineCapabilities;
}

export interface MachineFeatures {
  workCoordinateSystems: {
    enabled: boolean;
    supportedSystems: WorkCoordinateSystem[];
    defaultSystem: WorkCoordinateSystem;
    maxSystems: number;
  };
  toolDirection: {
    enabled: boolean;
    defaultDirection: ToolDirection;
    supportedDirections: ToolDirection[];
    commandCodes: {
      clockwise: string;
      counterclockwise: string;
      stop: string;
    };
  };
  spindleControl: {
    enabled: boolean;
    minRPM: number;
    maxRPM: number;
    defaultRPM: number;
    stepSize: number;
    hasVariableSpeed: boolean;
    coolantControl: {
      enabled: boolean;
      floodCoolant: string;
      mistCoolant: string;
      coolantOff: string;
    };
  };
  probing: {
    enabled: boolean;
    probeCommands: {
      straightProbe: string;
      probeTowardWorkpiece: string;
      probeAwayFromWorkpiece: string;
      probeAwayNoError: string;
    };
    defaultFeedRate: number;
    retractDistance: number;
  };
  coordinateDisplay: {
    showMachineCoordinates: boolean;
    showWorkCoordinates: boolean;
    defaultCoordinateDisplay: CoordinateDisplayMode;
    precision: number;
  };
  safetyFeatures: {
    softLimits: boolean;
    hardLimits: boolean;
    emergencyStop: boolean;
    feedHold: boolean;
    cycleStart: boolean;
    doorSafety: boolean;
  };
}

export interface GCodeSettings {
  modalGroups: {
    motionModes: string[];
    coordinateSystems: string[];
    planeSelection: string[];
    units: string[];
    distanceMode: string[];
    feedRateMode: string[];
  };
  defaultSettings: {
    motionMode: string;
    coordinateSystem: string;
    planeSelection: string;
    units: string;
    distanceMode: string;
    feedRateMode: string;
  };
}

export interface MachineCapabilities {
  axes: string[];
  simultaneousAxes: number;
  interpolation: {
    linear: boolean;
    circular: boolean;
    helical: boolean;
  };
  feedRates: {
    rapid: number;
    maxFeed: number;
    minFeed: number;
  };
  resolution: {
    X: number;
    Y: number;
    Z: number;
  };
}

// Enums and Union Types
export type WorkCoordinateSystem = 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59';
export type ToolDirection = 'clockwise' | 'counterclockwise';
export type CoordinateDisplayMode = 'work' | 'machine' | 'both';

// Helper types for specific features
export interface SpindleSettings {
  enabled: boolean;
  direction: ToolDirection;
  rpm: number;
  coolantEnabled: boolean;
  coolantType?: 'flood' | 'mist';
}

export interface WorkCoordinateOffset {
  system: WorkCoordinateSystem;
  x: number;
  y: number;
  z: number;
}

export interface ProbeResult {
  success: boolean;
  position: {
    x: number;
    y: number;
    z: number;
  };
  command: string;
  feedRate: number;
}

// Configuration access helpers
export interface MachineConfigService {
  getFeature<T extends keyof MachineFeatures>(feature: T): MachineFeatures[T];
  isFeatureEnabled(feature: keyof MachineFeatures): boolean;
  getWorkCoordinateSystems(): WorkCoordinateSystem[];
  getDefaultWorkCoordinateSystem(): WorkCoordinateSystem;
  getToolDirections(): ToolDirection[];
  getDefaultToolDirection(): ToolDirection;
  getSpindleRange(): { min: number; max: number; default: number };
  getGCodeDefault(setting: keyof GCodeSettings['defaultSettings']): string;
  getMachineCapability<T extends keyof MachineCapabilities>(capability: T): MachineCapabilities[T];
}