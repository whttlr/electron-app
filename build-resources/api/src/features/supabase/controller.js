import { supabase } from '../../config/supabase.js'
import { error as logError, info } from '@cnc/core/services/logger'

/**
 * Machine Configurations Controller
 */
export class SupabaseMachineController {
  
  async getAllConfigs(req, res) {
    try {
      const { data, error } = await supabase
        .from('machine_configs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      res.success(data, 'Machine configurations retrieved successfully')
      info(`Retrieved ${data?.length || 0} machine configurations`)
    } catch (error) {
      logError('Failed to get machine configs:', error)
      res.error('Failed to retrieve machine configurations', error.message)
    }
  }
  
  async getConfig(req, res) {
    try {
      const { id } = req.params
      
      const { data, error } = await supabase
        .from('machine_configs')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.error('Machine configuration not found', null, 404)
        }
        throw error
      }
      
      res.success(data, 'Machine configuration retrieved successfully')
    } catch (error) {
      logError('Failed to get machine config:', error)
      res.error('Failed to retrieve machine configuration', error.message)
    }
  }
  
  async createConfig(req, res) {
    try {
      const configData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('machine_configs')
        .insert([configData])
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Machine configuration created successfully', 201)
      info(`Created machine configuration: ${data.name}`)
    } catch (error) {
      logError('Failed to create machine config:', error)
      res.error('Failed to create machine configuration', error.message)
    }
  }
  
  async updateConfig(req, res) {
    try {
      const { id } = req.params
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('machine_configs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.error('Machine configuration not found', null, 404)
        }
        throw error
      }
      
      res.success(data, 'Machine configuration updated successfully')
      info(`Updated machine configuration: ${id}`)
    } catch (error) {
      logError('Failed to update machine config:', error)
      res.error('Failed to update machine configuration', error.message)
    }
  }
  
  async deleteConfig(req, res) {
    try {
      const { id } = req.params
      
      const { error } = await supabase
        .from('machine_configs')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      res.success(null, 'Machine configuration deleted successfully')
      info(`Deleted machine configuration: ${id}`)
    } catch (error) {
      logError('Failed to delete machine config:', error)
      res.error('Failed to delete machine configuration', error.message)
    }
  }
}

/**
 * App Configuration Controller
 */
export class SupabaseConfigController {
  
  async getAppConfigurations(req, res) {
    try {
      const { config_type, is_active } = req.query
      
      let query = supabase
        .from('app_configurations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (config_type) {
        query = query.eq('config_type', config_type)
      }
      
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true')
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'App configurations retrieved successfully')
    } catch (error) {
      logError('Failed to get app configurations:', error)
      res.error('Failed to retrieve app configurations', error.message)
    }
  }
  
  async createAppConfiguration(req, res) {
    try {
      const configData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('app_configurations')
        .insert([configData])
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'App configuration created successfully', 201)
      info(`Created app configuration: ${data.config_type}`)
    } catch (error) {
      logError('Failed to create app configuration:', error)
      res.error('Failed to create app configuration', error.message)
    }
  }
  
  async updateAppConfiguration(req, res) {
    try {
      const { id } = req.params
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('app_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'App configuration updated successfully')
      info(`Updated app configuration: ${id}`)
    } catch (error) {
      logError('Failed to update app configuration:', error)
      res.error('Failed to update app configuration', error.message)
    }
  }
  
  async deactivateAppConfiguration(req, res) {
    try {
      const { config_type } = req.params
      
      const { data, error } = await supabase
        .from('app_configurations')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('config_type', config_type)
        .eq('is_active', true)
        .select()
      
      if (error) throw error
      
      res.success(data, 'App configuration deactivated successfully')
      info(`Deactivated app configuration: ${config_type}`)
    } catch (error) {
      logError('Failed to deactivate app configuration:', error)
      res.error('Failed to deactivate app configuration', error.message)
    }
  }
  
  async getUserPreferences(req, res) {
    try {
      const { user_id, preference_type } = req.query
      
      let query = supabase
        .from('user_preferences')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (user_id) {
        query = query.eq('user_id', user_id)
      }
      
      if (preference_type) {
        query = query.eq('preference_type', preference_type)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'User preferences retrieved successfully')
    } catch (error) {
      logError('Failed to get user preferences:', error)
      res.error('Failed to retrieve user preferences', error.message)
    }
  }
  
  async saveUserPreference(req, res) {
    try {
      const preferenceData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, { 
          onConflict: 'user_id,preference_type',
          returning: 'representation'
        })
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'User preference saved successfully', 201)
      info(`Saved user preference: ${data.preference_type}`)
    } catch (error) {
      logError('Failed to save user preference:', error)
      res.error('Failed to save user preference', error.message)
    }
  }
  
  async getPluginSettings(req, res) {
    try {
      // Support both query parameter and URL parameter
      const plugin_id = req.params.plugin_id || req.query.plugin_id
      
      let query = supabase
        .from('plugin_settings')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (plugin_id) {
        query = query.eq('plugin_id', plugin_id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'Plugin settings retrieved successfully')
    } catch (error) {
      logError('Failed to get plugin settings:', error)
      res.error('Failed to retrieve plugin settings', error.message)
    }
  }
  
  async savePluginSettings(req, res) {
    try {
      const settingsData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('plugin_settings')
        .upsert(settingsData, { 
          onConflict: 'plugin_id',
          returning: 'representation'
        })
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Plugin settings saved successfully', 201)
      info(`Saved plugin settings: ${data.plugin_id}`)
    } catch (error) {
      logError('Failed to save plugin settings:', error)
      res.error('Failed to save plugin settings', error.message)
    }
  }
  
  async getPluginStats(req, res) {
    try {
      // Support both query parameter and URL parameter
      const plugin_id = req.params.plugin_id || req.query.plugin_id
      
      let query = supabase
        .from('plugin_stats')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (plugin_id) {
        query = query.eq('plugin_id', plugin_id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'Plugin stats retrieved successfully')
    } catch (error) {
      logError('Failed to get plugin stats:', error)
      res.error('Failed to retrieve plugin stats', error.message)
    }
  }
  
  async updatePluginStats(req, res) {
    try {
      const { plugin_id } = req.params
      
      // Handle increment requests
      if (req.url.includes('/increment') && req.body.stat) {
        const { stat } = req.body
        
        // Get current stats
        const { data: currentStats, error: fetchError } = await supabase
          .from('plugin_stats')
          .select('*')
          .eq('plugin_id', plugin_id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError
        }
        
        // Initialize stats if not exists
        const stats = currentStats || {
          plugin_id,
          downloads: 0,
          likes: 0,
          stars: 0,
          installs: 0,
          created_at: new Date().toISOString()
        }
        
        // Increment the specified stat
        stats[stat] = (stats[stat] || 0) + 1
        stats.updated_at = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('plugin_stats')
          .upsert(stats, { 
            onConflict: 'plugin_id',
            returning: 'representation'
          })
          .select()
          .single()
        
        if (error) throw error
        
        res.success(data, `Plugin ${stat} incremented successfully`)
        info(`Incremented ${stat} for plugin: ${plugin_id}`)
      } else {
        // Handle regular update requests
        const updateData = {
          plugin_id,
          ...req.body,
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('plugin_stats')
          .upsert(updateData, { 
            onConflict: 'plugin_id',
            returning: 'representation'
          })
          .select()
          .single()
        
        if (error) throw error
        
        res.success(data, 'Plugin stats updated successfully')
        info(`Updated plugin stats: ${plugin_id}`)
      }
    } catch (error) {
      logError('Failed to update plugin stats:', error)
      res.error('Failed to update plugin stats', error.message)
    }
  }
  
  async getFeedSpeeds(req, res) {
    try {
      const { machine_id, tool_type, material_type, operation_type } = req.query
      
      let query = supabase
        .from('feed_speeds')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (machine_id) {
        query = query.eq('machine_id', machine_id)
      }
      
      if (tool_type) {
        query = query.eq('tool_type', tool_type)
      }
      
      if (material_type) {
        query = query.eq('material_type', material_type)
      }
      
      if (operation_type) {
        query = query.eq('operation_type', operation_type)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'Feed speeds retrieved successfully')
    } catch (error) {
      logError('Failed to get feed speeds:', error)
      res.error('Failed to retrieve feed speeds', error.message)
    }
  }
  
  async saveFeedSpeed(req, res) {
    try {
      const feedSpeedData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('feed_speeds')
        .insert([feedSpeedData])
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Feed speed saved successfully', 201)
      info(`Saved feed speed: ${data.tool_type} - ${data.material_type}`)
    } catch (error) {
      logError('Failed to save feed speed:', error)
      res.error('Failed to save feed speed', error.message)
    }
  }
  
  async updateFeedSpeed(req, res) {
    try {
      const { id } = req.params
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('feed_speeds')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Feed speed updated successfully')
      info(`Updated feed speed: ${id}`)
    } catch (error) {
      logError('Failed to update feed speed:', error)
      res.error('Failed to update feed speed', error.message)
    }
  }
  
  async deleteFeedSpeed(req, res) {
    try {
      const { id } = req.params
      
      const { error } = await supabase
        .from('feed_speeds')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      res.success(null, 'Feed speed deleted successfully')
      info(`Deleted feed speed: ${id}`)
    } catch (error) {
      logError('Failed to delete feed speed:', error)
      res.error('Failed to delete feed speed', error.message)
    }
  }
}

/**
 * Job History Controller
 */
export class SupabaseJobController {
  
  async getAllJobs(req, res) {
    try {
      const { limit = 50, offset = 0, status } = req.query
      
      let query = supabase
        .from('cnc_jobs')
        .select(`
          *,
          machine_configs(name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      res.success(data, 'Job history retrieved successfully')
    } catch (error) {
      logError('Failed to get job history:', error)
      res.error('Failed to retrieve job history', error.message)
    }
  }
  
  async createJob(req, res) {
    try {
      const jobData = {
        ...req.body,
        status: 'pending',
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('cnc_jobs')
        .insert([jobData])
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Job created successfully', 201)
      info(`Created job: ${data.job_name}`)
    } catch (error) {
      logError('Failed to create job:', error)
      res.error('Failed to create job', error.message)
    }
  }
  
  async updateJobStatus(req, res) {
    try {
      const { id } = req.params
      const { status, position_log } = req.body
      
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'running' && !req.body.start_time) {
        updateData.start_time = new Date().toISOString()
      }
      
      if (status === 'completed' || status === 'failed') {
        updateData.end_time = new Date().toISOString()
      }
      
      if (position_log) {
        updateData.position_log = position_log
      }
      
      const { data, error } = await supabase
        .from('cnc_jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      res.success(data, 'Job status updated successfully')
    } catch (error) {
      logError('Failed to update job status:', error)
      res.error('Failed to update job status', error.message)
    }
  }
}