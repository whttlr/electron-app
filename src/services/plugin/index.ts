// Plugin Service Module - Public API
export { PluginProvider, usePlugins } from './PluginContext';
export { PluginService } from './PluginService';

// Re-export types
export type {
  Plugin,
  PluginAPI,
  PluginUpdate,
  RegistryConfig,
  PluginContextType,
} from './types';
