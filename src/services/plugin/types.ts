import { CompleteConfig } from '../config/types';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  // Version management
  availableVersions?: string[];
  latestVersion?: string;
  updateAvailable?: boolean;
  // Dependencies
  dependencies?: {
    [key: string]: string; // plugin-id: version-requirement
  };
  // Installation metadata
  installedAt?: string;
  updatedAt?: string;
  source?: 'local' | 'marketplace' | 'registry';
  checksum?: string;
  // Registry sync
  registryId?: string;
  publisherId?: string;
  // Configuration
  config?: {
    placement?: 'dashboard' | 'standalone' | 'modal' | 'sidebar';
    screen?: 'main' | 'new' | 'controls' | 'settings';
    size?: { width: number | 'auto', height: number | 'auto' };
    priority?: number;
    autoStart?: boolean;
    permissions?: string[];
    menuTitle?: string;
    menuIcon?: string;
    routePath?: string;
  };
}

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

// Plugin API interface for access to application resources
export interface PluginAPI {
  config: {
    get: <T>(path: string) => T | null;
    getSection: (section: keyof CompleteConfig) => any | null;
    getWithFallback: <T>(path: string, fallback: T) => T;
    isLoaded: () => boolean;
    reload: () => Promise<void>;
  };
  // Future: add more APIs like state, machine control, etc.
}

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