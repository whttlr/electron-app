// Core Visualization Module - Public API

// Visualization controller
export { VisualizationController, visualizationController } from './VisualizationController';

// Visualization types and interfaces
export type { 
  Camera3D, 
  Camera2D, 
  Light, 
  SceneObject, 
  ToolPath, 
  ViewportSettings,
  RenderQuality,
  VisualizationState,
  VisualizationEvent,
  VisualizationEventHandler 
} from './VisualizationController';

// Configuration
export { visualizationConfig, type VisualizationConfig } from './config';

// Module metadata
export const VisualizationModule = {
  version: '1.0.0',
  description: '3D/2D visualization calculations and scene management',
};
