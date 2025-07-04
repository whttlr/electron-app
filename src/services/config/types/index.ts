// Configuration Types Module - Public API
// Re-exports all configuration type definitions from shared package for consistency

// Import and re-export specific types from the shared package
export type {
  // Configuration types
  CompleteConfig,
  ConfigLoadingState,
  ConfigEventType,
  ConfigEvent,
  ConfigFileName,

  // Machine types
  MachineConfig,
  MachineState,

  // State types
  StateConfig,

  // App types
  AppConfig,

  // UI types
  UIConfig,
  VisualizationConfig,

  // API types
  APIConfig,

  // Defaults types
  DefaultsConfig,

  // Plugin types
  PluginConfig,
  PluginManifest,
  PluginRegistry,

  // API types
  ConfigAPI,
  PluginAPI,
} from '@whttlr/plugin-types';

// Export constants (not types) separately
export { CONFIG_FILES } from '@whttlr/plugin-types';
