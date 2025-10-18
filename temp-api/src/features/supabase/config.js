/**
 * Configuration for Supabase feature
 */

export default {
  // Default pagination settings
  pagination: {
    defaultLimit: 50,
    maxLimit: 100
  },
  
  // Job status options
  jobStatuses: [
    'pending',
    'running',
    'paused',
    'completed',
    'failed',
    'cancelled'
  ],
  
  // Default units
  defaultUnits: 'mm',
  
  // Table names
  tables: {
    machineConfigs: 'machine_configs',
    jobs: 'cnc_jobs',
    pluginConfigs: 'plugin_configs',
    machineState: 'machine_state'
  }
}