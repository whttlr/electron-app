import { PluginRecord, PluginStateRecord, CompleteConfig } from '@whttlr/plugin-types';
import { configService } from '../config/ConfigService';
import { databaseService } from '../database/DatabaseService';
import {
  Plugin, PluginUpdate, RegistryConfig, PluginAPI,
} from './types';

export class PluginService {
  // Database operations
  static async loadPlugins(): Promise<Plugin[]> {
    try {
      const pluginRecords = await databaseService.getPlugins();
      const transformedPlugins: Plugin[] = pluginRecords.map((record) => ({
        id: record.pluginId,
        name: record.name,
        version: record.version,
        description: record.description || '',
        status: record.status,
        type: record.type,
        installedAt: typeof record.installedAt === 'string' ? record.installedAt : record.installedAt.toISOString(),
        updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : record.updatedAt.toISOString(),
        source: record.source,
        updateAvailable: record.updateAvailable,
        latestVersion: record.latestVersion,
        registryId: record.registryId,
        publisherId: record.publisherId,
        config: record.state ? {
          placement: record.state.placement,
          screen: record.state.screen,
          size: {
            width: record.state.width === 'auto' ? 'auto' : Number(record.state.width) || 'auto',
            height: record.state.height === 'auto' ? 'auto' : Number(record.state.height) || 'auto',
          },
          priority: record.state.priority,
          autoStart: record.state.autoStart,
          permissions: record.state.permissions,
          menuTitle: record.state.menuTitle,
          menuIcon: record.state.menuIcon,
          routePath: record.state.routePath,
        } : undefined,
      }));

      return transformedPlugins;
    } catch (err) {
      console.error('Failed to load plugins from database:', err);
      throw err;
    }
  }

  static async savePlugin(
    plugin: Plugin,
    updatePluginStateFn: (pluginId: string, state: Partial<PluginStateRecord>) => Promise<void>,
  ): Promise<void> {
    try {
      await databaseService.upsertPlugin({
        pluginId: plugin.id,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        type: plugin.type,
        source: plugin.source,
        status: plugin.status,
        updateAvailable: plugin.updateAvailable || false,
        latestVersion: plugin.latestVersion,
        registryId: plugin.registryId,
        publisherId: plugin.publisherId,
        lastCheckedAt: plugin.updatedAt ? new Date(plugin.updatedAt) : undefined,
      });

      // Save plugin state if it exists
      if (plugin.config) {
        await updatePluginStateFn(plugin.id, {
          enabled: plugin.status === 'active',
          placement: plugin.config.placement,
          screen: plugin.config.screen,
          width: typeof plugin.config.size?.width === 'number' ? plugin.config.size.width.toString() : plugin.config.size?.width,
          height: typeof plugin.config.size?.height === 'number' ? plugin.config.size.height.toString() : plugin.config.size?.height,
          priority: plugin.config.priority || 100,
          autoStart: plugin.config.autoStart || false,
          permissions: plugin.config.permissions,
          menuTitle: plugin.config.menuTitle,
          menuIcon: plugin.config.menuIcon,
          routePath: plugin.config.routePath,
        });
      }
    } catch (err) {
      console.error('Failed to save plugin:', err);
      throw err;
    }
  }

  static async deletePlugin(pluginId: string): Promise<void> {
    try {
      await databaseService.deletePlugin(pluginId);
    } catch (err) {
      console.error('Failed to delete plugin:', err);
      throw err;
    }
  }

  static async updatePluginState(pluginId: string, state: Partial<PluginStateRecord>): Promise<void> {
    try {
      await databaseService.updatePluginState(pluginId, state);
    } catch (err) {
      console.error('Failed to update plugin state:', err);
      throw err;
    }
  }

  // Version management
  static async checkForUpdates(plugins: Plugin[]): Promise<PluginUpdate[]> {
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
            releaseDate: new Date().toISOString(),
          });
        }
      }
    }

    return updates;
  }

  static async updatePlugin(pluginId: string, version?: string): Promise<void> {
    // Simulate plugin update
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  static async updateAllPlugins(updates: PluginUpdate[]): Promise<void> {
    for (const update of updates) {
      await PluginService.updatePlugin(update.pluginId, update.latestVersion);
    }
  }

  // Registry operations
  static async syncWithRegistry(registryConfig: RegistryConfig): Promise<Plugin[]> {
    try {
      const response = await fetch(registryConfig.url);
      if (!response.ok) {
        throw new Error(`Registry fetch failed: ${response.status}`);
      }

      const registryData = await response.json();

      // Convert registry plugins to local plugin format
      const registryPlugins: Plugin[] = registryData.plugins.map((regPlugin: any) => ({
        id: regPlugin.id,
        name: regPlugin.name,
        version: regPlugin.version,
        description: regPlugin.description,
        status: 'inactive' as const,
        type: (regPlugin.category || 'utility') as Plugin['type'],
        source: 'registry' as const,
        registryId: regPlugin.id,
        latestVersion: regPlugin.version,
        installedAt: new Date().toISOString(),
        config: {
          placement: 'dashboard' as const,
          priority: 50,
        },
      }));

      console.log('Registry sync completed:', registryPlugins.length, 'plugins found');

      return registryPlugins;
    } catch (error) {
      console.error('Failed to sync with registry:', error);
      throw error;
    }
  }

  static async fetchMarketplacePlugins(registryConfig?: RegistryConfig): Promise<Plugin[]> {
    if (!registryConfig) {
      // Use registry URL from configuration
      const apiConfig = configService.getConfigValue<any>('api.pluginRegistry');
      const registryUrl = apiConfig?.url || 'https://raw.githubusercontent.com/whttlr/plugin-registry/main/registry.json';
      const timeout = apiConfig?.timeout || 10000;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(registryUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Registry fetch failed: ${response.status}`);
        }

        const registryData = await response.json();

        const mappedPlugins = registryData.plugins.map((regPlugin: any) => ({
          id: regPlugin.id,
          name: regPlugin.name,
          version: regPlugin.version,
          description: regPlugin.description,
          status: 'inactive' as const,
          type: (regPlugin.category || 'utility') as Plugin['type'],
          source: 'registry' as const,
          registryId: regPlugin.id,
          latestVersion: regPlugin.version,
        }));

        return mappedPlugins;
      } catch (error) {
        console.error('Failed to fetch marketplace plugins:', error);
        return [];
      }
    } else {
      // Use configured registry
      return await PluginService.syncWithRegistry(registryConfig);
    }
  }

  static async publishToRegistry(pluginId: string, registryConfig: RegistryConfig): Promise<void> {
    if (!registryConfig) throw new Error('Registry not configured');

    // Simulate publishing
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Dependency management
  static async checkDependencies(plugin: Plugin, plugins: Plugin[]): Promise<boolean> {
    if (!plugin.dependencies) return true;

    for (const [depId, depVersion] of Object.entries(plugin.dependencies)) {
      const installedDep = plugins.find((p) => p.id === depId);
      if (!installedDep) return false;

      // Simple version check (in reality would use semver)
      if (installedDep.version < depVersion) return false;
    }

    return true;
  }

  static async installDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return;

    for (const [depId, depVersion] of Object.entries(plugin.dependencies)) {
      // Simulate installing dependency
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Installing dependency: ${depId}@${depVersion}`);
    }
  }

  // Export/Import
  static async exportPlugins(plugins: Plugin[]): Promise<string> {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      plugins: plugins.map((p) => ({
        ...p,
        // Exclude runtime state
        status: undefined,
        updateAvailable: undefined,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async importPlugins(data: string): Promise<Plugin[]> {
    try {
      const importData = JSON.parse(data);

      if (!importData.version || !importData.plugins) {
        throw new Error('Invalid import format');
      }

      // Merge imported plugins with existing ones
      const importedPlugins = importData.plugins.map((p: any) => ({
        ...p,
        status: 'inactive', // Start imported plugins as inactive
        importedAt: new Date().toISOString(),
      }));

      return importedPlugins;
    } catch (error) {
      throw new Error(`Failed to import plugins: ${error}`);
    }
  }

  // Plugin API
  static getPluginAPI(): PluginAPI {
    return {
      config: {
        get: <T, >(path: string) => configService.getConfigValue<T>(path),
        getSection: (section: keyof CompleteConfig) => {
          const config = configService.getConfig();
          return config ? config[section] : null;
        },
        getWithFallback: <T, >(path: string, fallback: T) => configService.getConfigValueWithFallback<T>(path, fallback),
        isLoaded: () => configService.isLoaded(),
        reload: () => configService.reload(),
      },
    };
  }

  // Utility functions
  static getStandalonePlugins(plugins: Plugin[]): Plugin[] {
    return plugins.filter((plugin) => plugin.status === 'active'
      && plugin.config?.placement === 'standalone');
  }
}
