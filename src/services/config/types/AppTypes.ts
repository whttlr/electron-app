// Application Configuration Types
// Type definitions for application metadata and feature configuration schemas

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
