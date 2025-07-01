// Plugin Service Module - Public API
export { PluginProvider, usePlugins } from './PluginContext';

// Re-export types
export type { 
  Plugin, 
  PluginAPI,
  PluginUpdate,
  RegistryConfig
} from './PluginContext';