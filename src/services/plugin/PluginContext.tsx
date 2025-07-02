import React, {
  createContext, useContext, useState, useEffect, ReactNode,
} from 'react';
import { PluginStateRecord } from '@whttlr/plugin-types';
import { databaseService } from '../database/DatabaseService';
import {
  Plugin, PluginUpdate, RegistryConfig, PluginContextType,
} from './types';
import { PluginService } from './PluginService';

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
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registryConfig, setRegistryConfig] = useState<RegistryConfig | null>(null);

  // Initialize database and load plugins on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await databaseService.initialize();
        await loadPlugins();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize database';
        setError(errorMessage);
        console.error('Database initialization failed:', err);

        // Fall back to default plugins if database fails
        setPlugins([
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
              routePath: '/machine-monitor',
            },
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
              permissions: ['file.read', 'file.write', 'machine.control'],
            },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();

    // Cleanup on unmount
    return () => {
      databaseService.cleanup().catch(console.error);
    };
  }, []);

  // Database operations
  const loadPlugins = async (): Promise<void> => {
    try {
      const loadedPlugins = await PluginService.loadPlugins();
      setPlugins(loadedPlugins);
    } catch (err) {
      console.error('Failed to load plugins from database:', err);
      throw err;
    }
  };

  const savePlugin = async (plugin: Plugin): Promise<void> => {
    try {
      await PluginService.savePlugin(plugin, updatePluginState);
      await loadPlugins(); // Reload plugins to reflect changes
    } catch (err) {
      console.error('Failed to save plugin:', err);
      throw err;
    }
  };

  const deletePlugin = async (pluginId: string): Promise<void> => {
    try {
      await PluginService.deletePlugin(pluginId);
      setPlugins((prev) => prev.filter((p) => p.id !== pluginId));
    } catch (err) {
      console.error('Failed to delete plugin:', err);
      throw err;
    }
  };

  const updatePluginState = async (pluginId: string, state: Partial<PluginStateRecord>): Promise<void> => {
    try {
      await PluginService.updatePluginState(pluginId, state);
      // Update local state
      setPlugins((prev) => prev.map((plugin) => {
        if (plugin.id === pluginId) {
          return {
            ...plugin,
            status: state.enabled !== undefined ? (state.enabled ? 'active' : 'inactive') : plugin.status,
            config: {
              ...plugin.config,
              placement: state.placement || plugin.config?.placement,
              screen: state.screen || plugin.config?.screen,
              size: {
                width: state.width || plugin.config?.size?.width || 'auto',
                height: state.height || plugin.config?.size?.height || 'auto',
              },
              priority: state.priority !== undefined ? state.priority : plugin.config?.priority,
              autoStart: state.autoStart !== undefined ? state.autoStart : plugin.config?.autoStart,
              permissions: state.permissions || plugin.config?.permissions,
              menuTitle: state.menuTitle || plugin.config?.menuTitle,
              menuIcon: state.menuIcon || plugin.config?.menuIcon,
              routePath: state.routePath || plugin.config?.routePath,
            },
          };
        }
        return plugin;
      }));
    } catch (err) {
      console.error('Failed to update plugin state:', err);
      throw err;
    }
  };

  // Version management
  const checkForUpdates = async (): Promise<PluginUpdate[]> => {
    const updates = await PluginService.checkForUpdates(plugins);

    // Update plugins with update availability
    setPlugins((prev) => prev.map((plugin) => {
      const update = updates.find((u) => u.pluginId === plugin.id);
      return update ? { ...plugin, updateAvailable: true, latestVersion: update.latestVersion } : plugin;
    }));

    return updates;
  };

  const updatePlugin = async (pluginId: string, version?: string): Promise<void> => {
    await PluginService.updatePlugin(pluginId, version);

    setPlugins((prev) => prev.map((plugin) => {
      if (plugin.id === pluginId) {
        return {
          ...plugin,
          version: version || plugin.latestVersion || plugin.version,
          updateAvailable: false,
          updatedAt: new Date().toISOString(),
        };
      }
      return plugin;
    }));
  };

  const updateAllPlugins = async (): Promise<void> => {
    const updates = await PluginService.checkForUpdates(plugins);
    await PluginService.updateAllPlugins(updates);

    // Update local state for all updated plugins
    setPlugins((prev) => prev.map((plugin) => {
      const update = updates.find((u) => u.pluginId === plugin.id);
      return update ? {
        ...plugin,
        version: update.latestVersion,
        updateAvailable: false,
        updatedAt: new Date().toISOString(),
      } : plugin;
    }));
  };

  // Registry operations
  const syncWithRegistry = async (): Promise<void> => {
    if (!registryConfig) throw new Error('Registry not configured');

    try {
      const registryPlugins = await PluginService.syncWithRegistry(registryConfig);

      // Store registry plugins for marketplace display
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('registryPluginsLoaded', {
          detail: { plugins: registryPlugins },
        }));
      }
    } catch (error) {
      console.error('Failed to sync with registry:', error);
      throw error;
    }
  };

  const fetchMarketplacePlugins = async (): Promise<Plugin[]> => await PluginService.fetchMarketplacePlugins(registryConfig || undefined);

  const publishToRegistry = async (pluginId: string): Promise<void> => {
    if (!registryConfig) throw new Error('Registry not configured');

    await PluginService.publishToRegistry(pluginId, registryConfig);

    setPlugins((prev) => prev.map((p) => (p.id === pluginId
      ? { ...p, source: 'registry', registryId: `reg-${pluginId}` }
      : p)));
  };

  // Dependency management
  const checkDependencies = async (plugin: Plugin): Promise<boolean> => await PluginService.checkDependencies(plugin, plugins);

  const installDependencies = async (plugin: Plugin): Promise<void> => {
    await PluginService.installDependencies(plugin);
  };

  // Export/Import
  const exportPlugins = async (): Promise<string> => await PluginService.exportPlugins(plugins);

  const importPlugins = async (data: string): Promise<void> => {
    const importedPlugins = await PluginService.importPlugins(data);
    setPlugins((prev) => [...prev, ...importedPlugins]);
  };

  // Utility functions
  const getStandalonePlugins = () => PluginService.getStandalonePlugins(plugins);

  const getPluginAPI = () => PluginService.getPluginAPI();

  return (
    <PluginContext.Provider value={{
      plugins,
      setPlugins,
      isLoading,
      error,
      getStandalonePlugins,
      getPluginAPI,
      loadPlugins,
      savePlugin,
      deletePlugin,
      updatePluginState,
      checkForUpdates,
      updatePlugin,
      updateAllPlugins,
      registryConfig,
      setRegistryConfig,
      syncWithRegistry,
      fetchMarketplacePlugins,
      publishToRegistry,
      checkDependencies,
      installDependencies,
      exportPlugins,
      importPlugins,
    }}>
      {children}
    </PluginContext.Provider>
  );
};
