import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface PluginContextType {
  plugins: Plugin[];
  setPlugins: React.Dispatch<React.SetStateAction<Plugin[]>>;
  getStandalonePlugins: () => Plugin[];
  // Version management
  checkForUpdates: () => Promise<PluginUpdate[]>;
  updatePlugin: (pluginId: string, version?: string) => Promise<void>;
  updateAllPlugins: () => Promise<void>;
  // Registry operations
  registryConfig: RegistryConfig | null;
  setRegistryConfig: (config: RegistryConfig | null) => void;
  syncWithRegistry: () => Promise<void>;
  publishToRegistry: (pluginId: string) => Promise<void>;
  // Dependency management
  checkDependencies: (plugin: Plugin) => Promise<boolean>;
  installDependencies: (plugin: Plugin) => Promise<void>;
  // Export/Import
  exportPlugins: () => Promise<string>;
  importPlugins: (data: string) => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

interface PluginProviderProps {
  children: ReactNode;
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'machine-monitor',
      name: 'Machine Status Monitor',
      version: '1.0.0',
      description: 'Real-time machine status monitoring with performance charts',
      status: 'active',
      type: 'visualization',
      installedAt: '2024-01-01T00:00:00Z',
      source: 'local',
      config: {
        placement: 'standalone',
        screen: 'new',
        size: { width: 'auto', height: 'auto' },
        priority: 100,
        autoStart: true,
        permissions: ['machine.read', 'status.read'],
        menuTitle: 'Machine Monitor',
        menuIcon: 'monitor',
        routePath: '/machine-monitor'
      }
    },
    {
      id: 'gcode-snippets',
      name: 'G-code Snippets',
      version: '1.0.0',
      description: 'Manage and insert common G-code snippets',
      status: 'active',
      type: 'productivity',
      installedAt: '2024-01-01T00:00:00Z',
      source: 'local',
      config: {
        placement: 'modal',
        screen: 'main',
        size: { width: 600, height: 'auto' },
        priority: 150,
        autoStart: false,
        permissions: ['file.read', 'file.write', 'machine.control']
      }
    }
  ]);

  const [registryConfig, setRegistryConfig] = useState<RegistryConfig | null>(null);

  const getStandalonePlugins = () => {
    return plugins.filter(plugin => 
      plugin.status === 'active' && 
      plugin.config?.placement === 'standalone'
    );
  };

  // Version management
  const checkForUpdates = async (): Promise<PluginUpdate[]> => {
    // Simulate checking for updates
    const updates: PluginUpdate[] = [];
    
    for (const plugin of plugins) {
      if (plugin.source === 'marketplace' || plugin.source === 'registry') {
        // Simulate finding an update for some plugins
        if (Math.random() > 0.7) {
          updates.push({
            pluginId: plugin.id,
            currentVersion: plugin.version,
            latestVersion: `${parseInt(plugin.version.split('.')[0]) + 1}.0.0`,
            changelog: 'Bug fixes and performance improvements',
            size: '2.1 MB',
            releaseDate: new Date().toISOString()
          });
        }
      }
    }
    
    // Update plugins with update availability
    setPlugins(prev => prev.map(plugin => {
      const update = updates.find(u => u.pluginId === plugin.id);
      return update ? { ...plugin, updateAvailable: true, latestVersion: update.latestVersion } : plugin;
    }));
    
    return updates;
  };

  const updatePlugin = async (pluginId: string, version?: string): Promise<void> => {
    // Simulate plugin update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPlugins(prev => prev.map(plugin => {
      if (plugin.id === pluginId) {
        return {
          ...plugin,
          version: version || plugin.latestVersion || plugin.version,
          updateAvailable: false,
          updatedAt: new Date().toISOString()
        };
      }
      return plugin;
    }));
  };

  const updateAllPlugins = async (): Promise<void> => {
    const updates = await checkForUpdates();
    for (const update of updates) {
      await updatePlugin(update.pluginId, update.latestVersion);
    }
  };

  // Registry operations
  const syncWithRegistry = async (): Promise<void> => {
    if (!registryConfig) throw new Error('Registry not configured');
    
    // Simulate registry sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would fetch plugin list from registry
    console.log('Syncing with registry:', registryConfig.url);
  };

  const publishToRegistry = async (pluginId: string): Promise<void> => {
    if (!registryConfig) throw new Error('Registry not configured');
    
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) throw new Error('Plugin not found');
    
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPlugins(prev => prev.map(p => 
      p.id === pluginId 
        ? { ...p, source: 'registry', registryId: `reg-${pluginId}` }
        : p
    ));
  };

  // Dependency management
  const checkDependencies = async (plugin: Plugin): Promise<boolean> => {
    if (!plugin.dependencies) return true;
    
    for (const [depId, depVersion] of Object.entries(plugin.dependencies)) {
      const installedDep = plugins.find(p => p.id === depId);
      if (!installedDep) return false;
      
      // Simple version check (in reality would use semver)
      if (installedDep.version < depVersion) return false;
    }
    
    return true;
  };

  const installDependencies = async (plugin: Plugin): Promise<void> => {
    if (!plugin.dependencies) return;
    
    for (const [depId, depVersion] of Object.entries(plugin.dependencies)) {
      const existingDep = plugins.find(p => p.id === depId);
      if (!existingDep) {
        // Simulate installing dependency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In reality, would fetch and install from registry
        console.log(`Installing dependency: ${depId}@${depVersion}`);
      }
    }
  };

  // Export/Import
  const exportPlugins = async (): Promise<string> => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      plugins: plugins.map(p => ({
        ...p,
        // Exclude runtime state
        status: undefined,
        updateAvailable: undefined
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const importPlugins = async (data: string): Promise<void> => {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.version || !importData.plugins) {
        throw new Error('Invalid import format');
      }
      
      // Merge imported plugins with existing ones
      const importedPlugins = importData.plugins.map((p: any) => ({
        ...p,
        status: 'inactive', // Start imported plugins as inactive
        importedAt: new Date().toISOString()
      }));
      
      setPlugins(prev => [...prev, ...importedPlugins]);
    } catch (error) {
      throw new Error('Failed to import plugins: ' + error);
    }
  };

  return (
    <PluginContext.Provider value={{ 
      plugins, 
      setPlugins, 
      getStandalonePlugins,
      checkForUpdates,
      updatePlugin,
      updateAllPlugins,
      registryConfig,
      setRegistryConfig,
      syncWithRegistry,
      publishToRegistry,
      checkDependencies,
      installDependencies,
      exportPlugins,
      importPlugins
    }}>
      {children}
    </PluginContext.Provider>
  );
};