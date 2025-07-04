/**
 * Machine Configuration Service
 *
 * Provides database-backed machine configuration management,
 * replacing the legacy file-based approach.
 */

import { bundledApiSupabaseService, type MachineConfig } from '../bundled-api-supabase';

export interface ExtendedMachineConfig extends MachineConfig {
  isDefault?: boolean
  isActive?: boolean
  axis_limits?: {
    x: { min: number; max: number }
    y: { min: number; max: number }
    z: { min: number; max: number }
  }
  speed_limits?: {
    max_feed_rate: number
    max_rapid_rate: number
    max_spindle_rpm: number
  }
}

export class MachineConfigService {
  private static instance: MachineConfigService;

  private cachedConfigs: ExtendedMachineConfig[] = [];

  private activeConfigId: string | null = null;

  private initialized = false;

  private constructor() {}

  static getInstance(): MachineConfigService {
    if (!MachineConfigService.instance) {
      MachineConfigService.instance = new MachineConfigService();
    }
    return MachineConfigService.instance;
  }

  /**
   * Initialize the service and load configurations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadConfigurations();
      this.initialized = true;
      console.log(`✅ Machine Config Service initialized with ${this.cachedConfigs.length} configurations`);
    } catch (error) {
      console.error('❌ Failed to initialize Machine Config Service:', error);
      throw error;
    }
  }

  /**
   * Load all configurations from database
   */
  async loadConfigurations(): Promise<ExtendedMachineConfig[]> {
    try {
      const configs = await bundledApiSupabaseService.getMachineConfigs();

      // Add extended properties
      this.cachedConfigs = configs.map((config, index) => ({
        ...config,
        isDefault: index === 0, // First config is default
        isActive: config.id === this.activeConfigId,
      }));

      // Set active config if none selected
      if (!this.activeConfigId && this.cachedConfigs.length > 0) {
        this.activeConfigId = this.cachedConfigs[0].id!;
        this.cachedConfigs[0].isActive = true;
      }

      return this.cachedConfigs;
    } catch (error) {
      console.error('Failed to load machine configurations:', error);
      // Return empty array if database is unavailable
      return [];
    }
  }

  /**
   * Get all machine configurations
   */
  async getAllConfigurations(): Promise<ExtendedMachineConfig[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cachedConfigs;
  }

  /**
   * Get the currently active machine configuration
   */
  async getActiveConfiguration(): Promise<ExtendedMachineConfig | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const activeConfig = this.cachedConfigs.find((config) => config.isActive);
    if (activeConfig) {
      return activeConfig;
    }

    // If no active config, make the first one active
    if (this.cachedConfigs.length > 0) {
      return this.setActiveConfiguration(this.cachedConfigs[0].id!);
    }

    return null;
  }

  /**
   * Set the active machine configuration
   */
  async setActiveConfiguration(configId: string): Promise<ExtendedMachineConfig | null> {
    const config = this.cachedConfigs.find((c) => c.id === configId);
    if (!config) {
      throw new Error(`Machine configuration with ID ${configId} not found`);
    }

    // Update active status
    this.cachedConfigs.forEach((c) => { c.isActive = false; });
    config.isActive = true;
    this.activeConfigId = configId;

    // Store in localStorage for persistence
    localStorage.setItem('activeMachineConfigId', configId);

    console.log(`✅ Active machine configuration set to: ${config.name}`);
    return config;
  }

  /**
   * Create a new machine configuration
   */
  async createConfiguration(configData: Omit<ExtendedMachineConfig, 'id' | 'created_at' | 'updated_at' | 'isDefault' | 'isActive'>): Promise<ExtendedMachineConfig> {
    try {
      // Add default axis limits and speed limits if not provided
      const configWithDefaults = {
        ...configData,
        axis_limits: configData.axis_limits || {
          x: { min: 0, max: configData.work_area_x || 300 },
          y: { min: 0, max: configData.work_area_y || 180 },
          z: { min: -(configData.work_area_z || 45), max: 0 },
        },
        speed_limits: configData.speed_limits || {
          max_feed_rate: 3000,
          max_rapid_rate: 5000,
          max_spindle_rpm: 10000,
        },
      };

      const newConfig = await bundledApiSupabaseService.createMachineConfig(configWithDefaults);

      const extendedConfig: ExtendedMachineConfig = {
        ...newConfig,
        isDefault: this.cachedConfigs.length === 0,
        isActive: this.cachedConfigs.length === 0, // Make active if it's the first config
      };

      this.cachedConfigs.push(extendedConfig);

      // Set as active if it's the first config
      if (this.cachedConfigs.length === 1) {
        this.activeConfigId = newConfig.id!;
      }

      console.log(`✅ Created machine configuration: ${newConfig.name}`);
      return extendedConfig;
    } catch (error) {
      console.error('Failed to create machine configuration:', error);
      throw error;
    }
  }

  /**
   * Update an existing machine configuration
   */
  async updateConfiguration(configId: string, updates: Partial<MachineConfig>): Promise<ExtendedMachineConfig> {
    try {
      const updatedConfig = await bundledApiSupabaseService.updateMachineConfig(configId, updates);

      // Update cached config
      const index = this.cachedConfigs.findIndex((c) => c.id === configId);
      if (index !== -1) {
        this.cachedConfigs[index] = {
          ...this.cachedConfigs[index],
          ...updatedConfig,
        };
      }

      console.log(`✅ Updated machine configuration: ${updatedConfig.name}`);
      return this.cachedConfigs[index];
    } catch (error) {
      console.error('Failed to update machine configuration:', error);
      throw error;
    }
  }

  /**
   * Delete a machine configuration
   */
  async deleteConfiguration(configId: string): Promise<void> {
    try {
      await bundledApiSupabaseService.deleteMachineConfig(configId);

      // Remove from cache
      const index = this.cachedConfigs.findIndex((c) => c.id === configId);
      if (index !== -1) {
        const deletedConfig = this.cachedConfigs[index];
        this.cachedConfigs.splice(index, 1);

        // If we deleted the active config, set a new active one
        if (deletedConfig.isActive && this.cachedConfigs.length > 0) {
          await this.setActiveConfiguration(this.cachedConfigs[0].id!);
        } else if (this.cachedConfigs.length === 0) {
          this.activeConfigId = null;
        }

        console.log(`✅ Deleted machine configuration: ${deletedConfig.name}`);
      }
    } catch (error) {
      console.error('Failed to delete machine configuration:', error);
      throw error;
    }
  }

  /**
   * Get a configuration by ID
   */
  async getConfigurationById(configId: string): Promise<ExtendedMachineConfig | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cachedConfigs.find((c) => c.id === configId) || null;
  }

  /**
   * Refresh configurations from database
   */
  async refresh(): Promise<ExtendedMachineConfig[]> {
    console.log('🔄 Refreshing machine configurations from database...');
    const storedActiveId = localStorage.getItem('activeMachineConfigId');
    if (storedActiveId) {
      this.activeConfigId = storedActiveId;
    }
    return this.loadConfigurations();
  }

  /**
   * Get configuration suitable for legacy machine.json format
   */
  async getLegacyMachineConfig(): Promise<any> {
    const activeConfig = await this.getActiveConfiguration();
    if (!activeConfig) {
      return null;
    }

    // Convert to legacy format
    return {
      name: activeConfig.name,
      workArea: {
        x: activeConfig.work_area_x || 300,
        y: activeConfig.work_area_y || 180,
        z: activeConfig.work_area_z || 45,
      },
      units: activeConfig.units || 'mm',
      connection: activeConfig.connection_settings || {
        port: '/dev/ttyUSB0',
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      },
    };
  }

  /**
   * Check if service is connected to database
   */
  async isConnected(): Promise<boolean> {
    try {
      return await bundledApiSupabaseService.checkConnection();
    } catch {
      return false;
    }
  }

  /**
   * Validate position against machine limits
   */
  validatePosition(
    machineConfig: ExtendedMachineConfig,
    position: { x: number; y: number; z: number },
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!machineConfig.axis_limits) {
      return { isValid: true, errors: [] };
    }

    const { x, y, z } = position;
    const limits = machineConfig.axis_limits;

    if (x < limits.x.min || x > limits.x.max) {
      errors.push(`X position ${x} is outside limits (${limits.x.min} to ${limits.x.max})`);
    }

    if (y < limits.y.min || y > limits.y.max) {
      errors.push(`Y position ${y} is outside limits (${limits.y.min} to ${limits.y.max})`);
    }

    if (z < limits.z.min || z > limits.z.max) {
      errors.push(`Z position ${z} is outside limits (${limits.z.min} to ${limits.z.max})`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate feed rate against machine limits
   */
  validateFeedRate(
    machineConfig: ExtendedMachineConfig,
    feedRate: number,
  ): { isValid: boolean; error?: string } {
    if (!machineConfig.speed_limits) {
      return { isValid: true };
    }

    if (feedRate > machineConfig.speed_limits.max_feed_rate) {
      return {
        isValid: false,
        error: `Feed rate ${feedRate} exceeds maximum (${machineConfig.speed_limits.max_feed_rate})`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate spindle speed against machine limits
   */
  validateSpindleSpeed(
    machineConfig: ExtendedMachineConfig,
    spindleSpeed: number,
  ): { isValid: boolean; error?: string } {
    if (!machineConfig.speed_limits) {
      return { isValid: true };
    }

    if (spindleSpeed > machineConfig.speed_limits.max_spindle_rpm) {
      return {
        isValid: false,
        error: `Spindle speed ${spindleSpeed} exceeds maximum (${machineConfig.speed_limits.max_spindle_rpm})`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get feed speeds for a machine
   */
  async getFeedSpeeds(machineConfigId: string) {
    const { configManagementService } = await import('../bundled-api-supabase/config-management');
    return configManagementService.getFeedSpeeds(machineConfigId);
  }

  /**
   * Create feed speed entry
   */
  async createFeedSpeed(feedSpeed: any) {
    const { configManagementService } = await import('../bundled-api-supabase/config-management');
    return configManagementService.createFeedSpeed(feedSpeed);
  }

  /**
   * Update feed speed entry
   */
  async updateFeedSpeed(id: string, updates: any) {
    const { configManagementService } = await import('../bundled-api-supabase/config-management');
    return configManagementService.updateFeedSpeed(id, updates);
  }

  /**
   * Delete feed speed entry
   */
  async deleteFeedSpeed(id: string) {
    const { configManagementService } = await import('../bundled-api-supabase/config-management');
    return configManagementService.deleteFeedSpeed(id);
  }
}

// Export singleton instance
export const machineConfigService = MachineConfigService.getInstance();

// Export types
export * from '../bundled-api-supabase';
