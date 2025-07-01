// Configuration Type Definitions
// TypeScript interfaces for all configuration schemas

// Position and Dimension Types
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface AxisLimits {
  min: number;
  max: number;
}

export interface AxisLimitsSet {
  x: AxisLimits;
  y: AxisLimits;
  z: AxisLimits;
}

// Machine Configuration Types
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

// State Configuration Types
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

export interface PollingConfig {
  positionUpdateInterval: number;
  statusUpdateInterval: number;
  connectionCheckInterval: number;
  enablePolling: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface StateConfig {
  defaultState: DefaultState;
  polling: PollingConfig;
}

// App Configuration Types
export interface AppFeatures {
  debugPanel: boolean;
  advancedControls: boolean;
  '3dVisualization': boolean;
}

export interface PerformanceConfig {
  renderInterval: number;
  maxFPS: number;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: string;
  features: AppFeatures;
  performance: PerformanceConfig;
}

// UI Configuration Types
export interface AxisColors {
  x: string;
  y: string;
  z: string;
}

export interface ThemeConfig {
  primaryColor: string;
  axisColors: AxisColors;
}

export interface LayoutConfig {
  defaultCardSize: string;
  defaultGutter: [number, number];
  containerPadding: string;
  maxWidth: string;
}

export interface AnimationConfig {
  transitionDuration: string;
  easingFunction: string;
}

export interface UIConfig {
  theme: ThemeConfig;
  layout: LayoutConfig;
  animations: AnimationConfig;
}

// API Configuration Types
export interface MachineEndpoints {
  status: string;
  position: string;
  connect: string;
  disconnect: string;
  home: string;
  jog: string;
  settings: string;
}

export interface WorkspaceEndpoints {
  dimensions: string;
  bounds: string;
  settings: string;
}

export interface SystemEndpoints {
  health: string;
  version: string;
  diagnostics: string;
}

export interface APIEndpoints {
  base: string;
  machine: MachineEndpoints;
  workspace: WorkspaceEndpoints;
  system: SystemEndpoints;
}

export interface TimeoutConfig {
  default: number;
  position: number;
  status: number;
  connection: number;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
}

export interface LatencyRange {
  min: number;
  max: number;
}

export interface MockConfig {
  enabled: boolean;
  simulateLatency: boolean;
  latencyRange: LatencyRange;
  errorRate: number;
}

export interface APIConfig {
  endpoints: APIEndpoints;
  timeouts: TimeoutConfig;
  retries: RetryConfig;
  mock: MockConfig;
}

// Defaults Configuration Types
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

export interface IncrementConfig {
  values: number[];
  default: number;
  unit: string;
  labels?: string[];
}

export interface JogIncrements {
  metric: IncrementConfig;
  imperial: IncrementConfig;
}

export interface SpeedConfig {
  default: number;
  min: number;
  max: number;
  step: number;
  unit: string;
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

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface LightingConfig {
  ambient: number;
  directional: number;
}

export interface Preview2DDefaults {
  backgroundColor: string;
  gridColor: string;
  axisColors: AxisColors;
  toolColor: string;
  refreshRate: number;
}

export interface Preview3DDefaults {
  backgroundColor: string;
  cameraPosition: CameraPosition;
  lighting: LightingConfig;
  refreshRate: number;
}

export interface VisualizationDefaults {
  preview2D: Preview2DDefaults;
  preview3D: Preview3DDefaults;
}

export interface UIThemeDefaults {
  primaryColor: string;
  borderRadius: number;
  spacing: number;
}

export interface AnimationDefaults {
  enabled: boolean;
  duration: number;
  easing: string;
}

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ResponsivenessConfig {
  breakpoints: Breakpoints;
}

export interface UIDefaults {
  theme: UIThemeDefaults;
  animations: AnimationDefaults;
  responsiveness: ResponsivenessConfig;
}

export interface DefaultsConfig {
  machine: MachineDefaults;
  jog: JogDefaults;
  visualization: VisualizationDefaults;
  ui: UIDefaults;
}

// Visualization Configuration Types
export interface CanvasSize {
  width: number;
  height: number;
}

export interface Preview2DConfig {
  canvasSize: CanvasSize;
  gridLines: boolean;
  showAxes: boolean;
  backgroundColor: string;
}

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
}

export interface LightingVisualizationConfig {
  ambientIntensity: number;
  directionalIntensity: number;
}

export interface MaterialsConfig {
  machineColor: string;
  toolColor: string;
  gridColor: string;
}

export interface Preview3DConfig {
  camera: CameraConfig;
  lighting: LightingVisualizationConfig;
  materials: MaterialsConfig;
}

export interface VisualizationConfig {
  preview2D: Preview2DConfig;
  preview3D: Preview3DConfig;
}

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