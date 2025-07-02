// Common Configuration Types
// Basic geometric and positional type definitions used across configuration schemas

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

// Common color and styling types
export interface AxisColors {
  x: string;
  y: string;
  z: string;
}

// Common camera and positioning types
export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

// Common size configuration
export interface CanvasSize {
  width: number;
  height: number;
}

// Common increment configuration
export interface IncrementConfig {
  values: number[];
  default: number;
  unit: string;
  labels?: string[];
}

// Common speed configuration
export interface SpeedConfig {
  default: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// Common range types
export interface LatencyRange {
  min: number;
  max: number;
}

// Common breakpoints for responsive design
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}