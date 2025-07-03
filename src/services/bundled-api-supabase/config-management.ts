/**
 * Configuration Management Service
 * Handles database-backed configuration storage
 */

import { bundledApiSupabaseService } from './index'

const API_BASE_URL = 'http://localhost:3000/api/v1/supabase'

export interface AppConfiguration {
  id?: string
  config_type: 'machine' | 'state' | 'app' | 'ui' | 'api' | 'defaults' | 'visualization'
  config_data: any
  version?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserPreference {
  id?: string
  preference_key: string
  preference_value: any
  created_at?: string
  updated_at?: string
}

export interface FeedSpeed {
  id?: string
  machine_config_id: string
  tool_type: string
  material: string
  operation: 'drilling' | 'milling' | 'facing' | 'profiling' | 'pocketing' | 'engraving'
  feed_rate: number
  spindle_speed: number
  depth_of_cut?: number
  stepover?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface PluginSettings {
  id?: string
  plugin_id: string
  settings_data: any
  created_at?: string
  updated_at?: string
}

export interface PluginStats {
  id?: string
  plugin_id: string
  downloads: number
  likes: number
  stars: number
  installs: number
  created_at?: string
  updated_at?: string
}

export class ConfigManagementService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API request failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Config Management API Error (${endpoint}):`, error.message)
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  // App Configurations
  async getConfiguration(configType: AppConfiguration['config_type']): Promise<AppConfiguration | null> {
    try {
      const configs = await this.request<AppConfiguration[]>(
        `/app-configurations?config_type=${configType}&is_active=true`
      )
      return configs.length > 0 ? configs[0] : null
    } catch {
      return null
    }
  }

  async saveConfiguration(
    configType: AppConfiguration['config_type'], 
    configData: any
  ): Promise<AppConfiguration> {
    // Deactivate previous active config
    await this.request(`/app-configurations/deactivate/${configType}`, {
      method: 'PATCH',
    }).catch(() => {})

    return this.request<AppConfiguration>('/app-configurations', {
      method: 'POST',
      body: JSON.stringify({
        config_type: configType,
        config_data: configData,
        is_active: true
      }),
    })
  }

  // User Preferences
  async getPreference(key: string): Promise<any> {
    try {
      const pref = await this.request<UserPreference>(`/user-preferences/${key}`)
      return pref.preference_value
    } catch {
      return null
    }
  }

  async setPreference(key: string, value: any): Promise<UserPreference> {
    return this.request<UserPreference>('/user-preferences', {
      method: 'POST',
      body: JSON.stringify({
        preference_key: key,
        preference_value: value
      }),
    })
  }

  // Feed & Speeds
  async getFeedSpeeds(machineConfigId: string): Promise<FeedSpeed[]> {
    return this.request<FeedSpeed[]>(`/feed-speeds?machine_config_id=${machineConfigId}`)
  }

  async createFeedSpeed(feedSpeed: Omit<FeedSpeed, 'id' | 'created_at' | 'updated_at'>): Promise<FeedSpeed> {
    return this.request<FeedSpeed>('/feed-speeds', {
      method: 'POST',
      body: JSON.stringify(feedSpeed),
    })
  }

  async updateFeedSpeed(id: string, updates: Partial<FeedSpeed>): Promise<FeedSpeed> {
    return this.request<FeedSpeed>(`/feed-speeds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteFeedSpeed(id: string): Promise<void> {
    return this.request(`/feed-speeds/${id}`, {
      method: 'DELETE',
    })
  }

  // Plugin Settings
  async getPluginSettings(pluginId: string): Promise<any> {
    try {
      const settings = await this.request<PluginSettings>(`/plugin-settings/${pluginId}`)
      return settings.settings_data
    } catch {
      return null
    }
  }

  async savePluginSettings(pluginId: string, settings: any): Promise<PluginSettings> {
    return this.request<PluginSettings>('/plugin-settings', {
      method: 'POST',
      body: JSON.stringify({
        plugin_id: pluginId,
        settings_data: settings
      }),
    })
  }

  // Plugin Stats
  async incrementPluginStat(
    pluginId: string, 
    stat: 'downloads' | 'likes' | 'stars' | 'installs'
  ): Promise<void> {
    return this.request(`/plugin-stats/${pluginId}/increment`, {
      method: 'PATCH',
      body: JSON.stringify({ stat }),
    })
  }

  async getPluginStats(pluginId: string): Promise<PluginStats | null> {
    try {
      return await this.request<PluginStats>(`/plugin-stats/${pluginId}`)
    } catch {
      return null
    }
  }
}

export const configManagementService = new ConfigManagementService()