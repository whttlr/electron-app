import {
  CompleteConfig,
  PluginRecord,
  PluginAPI,
  PluginManifest,
} from '@whttlr/plugin-types';

// Use the shared PluginRecord type as the base for Plugin
export type Plugin = PluginRecord;

// Registry configuration
export interface RegistryConfig {
  url: string;
  token?: string;
  username?: string;
}

// Plugin update info
export interface PluginUpdate {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
  changelog?: string;
  size?: string;
  releaseDate?: string;
}

// PluginAPI is now imported from shared types - no need to redefine
// export { PluginAPI } from '@whttlr/plugin-types'; // Already imported above

export interface PluginContextType {
  plugins: Plugin[];
  setPlugins: React.Dispatch<React.SetStateAction<Plugin[]>>;
  isLoading: boolean;
  error: string | null;
  getStandalonePlugins: () => Plugin[];
  // Plugin API access
  getPluginAPI: () => PluginAPI;
  // Database operations
  loadPlugins: () => Promise<void>;
  savePlugin: (plugin: Plugin) => Promise<void>;
  deletePlugin: (pluginId: string) => Promise<void>;
  updatePluginState: (pluginId: string, state: Partial<any>) => Promise<void>;
  // Version management
  checkForUpdates: () => Promise<PluginUpdate[]>;
  updatePlugin: (pluginId: string, version?: string) => Promise<void>;
  updateAllPlugins: () => Promise<void>;
  // Registry operations
  registryConfig: RegistryConfig | null;
  setRegistryConfig: (config: RegistryConfig | null) => void;
  syncWithRegistry: () => Promise<void>;
  fetchMarketplacePlugins: () => Promise<Plugin[]>;
  publishToRegistry: (pluginId: string) => Promise<void>;
  // Dependency management
  checkDependencies: (plugin: Plugin) => Promise<boolean>;
  installDependencies: (plugin: Plugin) => Promise<void>;
  // Export/Import
  exportPlugins: () => Promise<string>;
  importPlugins: (data: string) => Promise<void>;
}
