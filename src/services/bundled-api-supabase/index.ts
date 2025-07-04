/**
 * Bundled API Supabase Service
 *
 * Client service for interacting with Supabase through the bundled API server
 */

const API_BASE_URL = 'http://localhost:3000/api/v1/supabase';

export interface MachineConfig {
  id?: string
  name: string
  work_area_x?: number
  work_area_y?: number
  work_area_z?: number
  units?: 'mm' | 'in'
  connection_settings?: {
    port?: string
    baudRate?: number
    dataBits?: number
    stopBits?: number
    parity?: string
  }
  created_at?: string
  updated_at?: string
}

export interface CncJob {
  id?: string
  machine_config_id?: string
  job_name: string
  gcode_file?: string
  status?: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  start_time?: string
  end_time?: string
  position_log?: Array<{
    timestamp: string
    x: number
    y: number
    z: number
  }>
  created_at?: string
}

export class BundledApiSupabaseService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Supabase API Error (${endpoint}):`, error.message);
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Machine configurations
  async getMachineConfigs(): Promise<MachineConfig[]> {
    return this.request('/machine-configs');
  }

  async getMachineConfig(id: string): Promise<MachineConfig> {
    return this.request(`/machine-configs/${id}`);
  }

  async createMachineConfig(config: Omit<MachineConfig, 'id' | 'created_at' | 'updated_at'>): Promise<MachineConfig> {
    return this.request('/machine-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateMachineConfig(id: string, updates: Partial<MachineConfig>): Promise<MachineConfig> {
    return this.request(`/machine-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMachineConfig(id: string): Promise<void> {
    return this.request(`/machine-configs/${id}`, {
      method: 'DELETE',
    });
  }

  // Job history
  async getJobs(params?: {
    limit?: number
    offset?: number
    status?: string
  }): Promise<CncJob[]> {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/jobs${query ? `?${query}` : ''}`);
  }

  async createJob(job: Omit<CncJob, 'id' | 'status' | 'created_at'>): Promise<CncJob> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJobStatus(
    id: string,
    status: CncJob['status'],
    positionLog?: CncJob['position_log'],
  ): Promise<CncJob> {
    return this.request(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position_log: positionLog }),
    });
  }

  // Health check for the API connection
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3000/api/v1/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const bundledApiSupabaseService = new BundledApiSupabaseService();
