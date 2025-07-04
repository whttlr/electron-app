/**
 * Database-Enhanced Plugin Service
 * Extends the existing plugin service with database-backed settings and analytics
 */

import { PluginStateRecord } from '@whttlr/plugin-types';
import { PluginService } from './PluginService';
import { configManagementService } from '../bundled-api-supabase/config-management';
import { Plugin, PluginUpdate } from './types';

export interface PluginSettings {
  [key: string]: any
}

export interface PluginAnalytics {
  downloads: number
  likes: number
  stars: number
  installs: number
  usage_count: number
  last_used: string
  average_session_time: number
}

export interface PluginDataAccess {
  settings: PluginSettings
  analytics: PluginAnalytics
  permissions: string[]
}

export class DatabasePluginService extends PluginService {
  private static instance: DatabasePluginService;

  private pluginDataCache: Map<string, PluginDataAccess> = new Map();

  static getInstance(): DatabasePluginService {
    if (!DatabasePluginService.instance) {
      DatabasePluginService.instance = new DatabasePluginService();
    }
    return DatabasePluginService.instance;
  }

  /**
   * Get plugin settings from database
   */
  async getPluginSettings(pluginId: string): Promise<PluginSettings> {
    try {
      // Check cache first
      const cached = this.pluginDataCache.get(pluginId);
      if (cached) {
        return cached.settings;
      }

      // Fetch from database
      const settings = await configManagementService.getPluginSettings(pluginId);

      // Update cache
      const dataAccess: PluginDataAccess = {
        settings: settings || {},
        analytics: await this.getPluginAnalytics(pluginId),
        permissions: await this.getPluginPermissions(pluginId),
      };
      this.pluginDataCache.set(pluginId, dataAccess);

      return settings || {};
    } catch (error) {
      console.error(`Failed to get plugin settings for ${pluginId}:`, error);
      return {};
    }
  }

  /**
   * Save plugin settings to database
   */
  async savePluginSettings(pluginId: string, settings: PluginSettings): Promise<void> {
    try {
      await configManagementService.savePluginSettings(pluginId, settings);

      // Update cache
      const cached = this.pluginDataCache.get(pluginId);
      if (cached) {
        cached.settings = settings;
        this.pluginDataCache.set(pluginId, cached);
      }

      console.log(`✅ Saved settings for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to save plugin settings for ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Get plugin analytics/stats
   */
  async getPluginAnalytics(pluginId: string): Promise<PluginAnalytics> {
    try {
      const stats = await configManagementService.getPluginStats(pluginId);

      if (!stats) {
        // Initialize stats if they don't exist
        await this.initializePluginStats(pluginId);
        return {
          downloads: 0,
          likes: 0,
          stars: 0,
          installs: 0,
          usage_count: 0,
          last_used: '',
          average_session_time: 0,
        };
      }

      return {
        downloads: stats.downloads,
        likes: stats.likes,
        stars: stats.stars,
        installs: stats.installs,
        usage_count: 0, // This would come from usage tracking
        last_used: '',
        average_session_time: 0,
      };
    } catch (error) {
      console.error(`Failed to get plugin analytics for ${pluginId}:`, error);
      return {
        downloads: 0,
        likes: 0,
        stars: 0,
        installs: 0,
        usage_count: 0,
        last_used: '',
        average_session_time: 0,
      };
    }
  }

  /**
   * Initialize plugin stats in database
   */
  private async initializePluginStats(pluginId: string): Promise<void> {
    try {
      // This would create the initial stats entry
      await configManagementService.incrementPluginStat(pluginId, 'installs');
    } catch (error) {
      console.error(`Failed to initialize plugin stats for ${pluginId}:`, error);
    }
  }

  /**
   * Increment plugin download count
   */
  async incrementDownload(pluginId: string): Promise<void> {
    try {
      await configManagementService.incrementPluginStat(pluginId, 'downloads');
      console.log(`📈 Incremented download count for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to increment download for ${pluginId}:`, error);
    }
  }

  /**
   * Increment plugin install count
   */
  async incrementInstall(pluginId: string): Promise<void> {
    try {
      await configManagementService.incrementPluginStat(pluginId, 'installs');
      console.log(`📈 Incremented install count for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to increment install for ${pluginId}:`, error);
    }
  }

  /**
   * Increment plugin like count
   */
  async incrementLike(pluginId: string): Promise<void> {
    try {
      await configManagementService.incrementPluginStat(pluginId, 'likes');
      console.log(`👍 Incremented like count for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to increment like for ${pluginId}:`, error);
    }
  }

  /**
   * Increment plugin star count
   */
  async incrementStar(pluginId: string): Promise<void> {
    try {
      await configManagementService.incrementPluginStat(pluginId, 'stars');
      console.log(`⭐ Incremented star count for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to increment star for ${pluginId}:`, error);
    }
  }

  /**
   * Get plugin permissions (for data isolation)
   */
  async getPluginPermissions(pluginId: string): Promise<string[]> {
    try {
      const plugins = await PluginService.loadPlugins();
      const plugin = plugins.find((p) => p.id === pluginId);
      return plugin?.config?.permissions || [];
    } catch (error) {
      console.error(`Failed to get plugin permissions for ${pluginId}:`, error);
      return [];
    }
  }

  /**
   * Create isolated data access for plugin
   */
  async createPluginDataAccess(pluginId: string): Promise<PluginDataAccess> {
    const settings = await this.getPluginSettings(pluginId);
    const analytics = await this.getPluginAnalytics(pluginId);
    const permissions = await this.getPluginPermissions(pluginId);

    const dataAccess: PluginDataAccess = {
      settings,
      analytics,
      permissions,
    };

    // Cache the data access
    this.pluginDataCache.set(pluginId, dataAccess);

    return dataAccess;
  }

  /**
   * Provide secure API for plugins to access their data
   */
  createPluginAPI(pluginId: string) {
    return {
      // Plugin-specific settings API
      settings: {
        get: async (key?: string) => {
          const settings = await this.getPluginSettings(pluginId);
          return key ? settings[key] : settings;
        },
        set: async (key: string, value: any) => {
          const settings = await this.getPluginSettings(pluginId);
          settings[key] = value;
          await this.savePluginSettings(pluginId, settings);
        },
        update: async (updates: PluginSettings) => {
          const settings = await this.getPluginSettings(pluginId);
          const newSettings = { ...settings, ...updates };
          await this.savePluginSettings(pluginId, newSettings);
        },
        delete: async (key: string) => {
          const settings = await this.getPluginSettings(pluginId);
          delete settings[key];
          await this.savePluginSettings(pluginId, settings);
        },
      },

      // Plugin analytics (read-only)
      analytics: {
        get: () => this.getPluginAnalytics(pluginId),
      },

      // Data validation based on permissions
      hasPermission: async (permission: string) => {
        const permissions = await this.getPluginPermissions(pluginId);
        return permissions.includes(permission);
      },

      // Standard plugin API from parent class
      ...this.getPluginAPI(),
    };
  }

  /**
   * Update plugin state (required by PluginService.savePlugin)
   */
  private async updatePluginState(pluginId: string, state: Partial<PluginStateRecord>): Promise<void> {
    try {
      await PluginService.updatePluginState(pluginId, state);
    } catch (error) {
      console.error(`Failed to update plugin state for ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced plugin installation with analytics tracking
   */
  async installPlugin(plugin: Plugin): Promise<void> {
    try {
      // Install the plugin using parent static method
      await PluginService.savePlugin(plugin, this.updatePluginState.bind(this));

      // Track installation
      await this.incrementInstall(plugin.id);

      // Initialize plugin settings if needed
      const settings = await this.getPluginSettings(plugin.id);
      if (Object.keys(settings).length === 0) {
        await this.savePluginSettings(plugin.id, {
          installed_at: new Date().toISOString(),
          version: plugin.version,
        });
      }

      console.log(`✅ Plugin installed with analytics tracking: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to install plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced plugin download with analytics tracking
   */
  async downloadPlugin(pluginId: string): Promise<void> {
    try {
      await this.incrementDownload(pluginId);
      console.log(`📥 Plugin download tracked: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to track plugin download ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Clear plugin data cache
   */
  clearCache(): void {
    this.pluginDataCache.clear();
  }

  /**
   * Get all plugin stats for analytics dashboard
   */
  async getAllPluginStats(): Promise<{ [pluginId: string]: PluginAnalytics }> {
    try {
      const plugins = await this.loadPlugins();
      const stats: { [pluginId: string]: PluginAnalytics } = {};

      for (const plugin of plugins) {
        stats[plugin.id] = await this.getPluginAnalytics(plugin.id);
      }

      return stats;
    } catch (error) {
      console.error('Failed to get all plugin stats:', error);
      return {};
    }
  }

  /**
   * Export plugin data including settings and analytics
   */
  async exportPluginData(pluginId: string): Promise<string> {
    try {
      const dataAccess = await this.createPluginDataAccess(pluginId);
      const plugins = await this.loadPlugins();
      const plugin = plugins.find((p) => p.id === pluginId);

      const exportData = {
        plugin,
        settings: dataAccess.settings,
        analytics: dataAccess.analytics,
        exported_at: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error(`Failed to export plugin data for ${pluginId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const databasePluginService = DatabasePluginService.getInstance();
