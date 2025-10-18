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