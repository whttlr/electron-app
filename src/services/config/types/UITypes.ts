// UI Configuration Types
// Type definitions for UI theme, layout, and visualization configuration schemas

import { AxisColors, CameraPosition, CanvasSize, Breakpoints } from './CommonTypes';

// Theme Configuration Types
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

// Visualization Configuration Types
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

// UI Defaults Types
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

export interface ResponsivenessConfig {
  breakpoints: Breakpoints;
}

export interface UIDefaults {
  theme: UIThemeDefaults;
  animations: AnimationDefaults;
  responsiveness: ResponsivenessConfig;
}

// Preview Defaults Types
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