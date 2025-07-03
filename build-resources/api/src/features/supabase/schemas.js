/**
 * Validation schemas for Supabase endpoints
 */

export const machineConfigSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    work_area_x: { type: 'number', minimum: 0 },
    work_area_y: { type: 'number', minimum: 0 },
    work_area_z: { type: 'number', minimum: 0 },
    units: { type: 'string', enum: ['mm', 'in'] },
    connection_settings: {
      type: 'object',
      properties: {
        port: { type: 'string' },
        baudRate: { type: 'number' },
        dataBits: { type: 'number' },
        stopBits: { type: 'number' },
        parity: { type: 'string' }
      }
    }
  },
  required: ['name']
}

export const jobSchema = {
  type: 'object',
  properties: {
    machine_config_id: { type: 'string', format: 'uuid' },
    job_name: { type: 'string', minLength: 1, maxLength: 255 },
    gcode_file: { type: 'string' }
  },
  required: ['job_name']
}

export const jobStatusUpdateSchema = {
  type: 'object',
  properties: {
    status: { 
      type: 'string', 
      enum: ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'] 
    },
    position_log: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          x: { type: 'number' },
          y: { type: 'number' },
          z: { type: 'number' }
        }
      }
    }
  },
  required: ['status']
}