/**
 * Configuration Service
 * 
 * Centralized service for loading and managing application configuration.
 * Provides typed access to all configuration values and supports
 * environment-specific overrides.
 */

import appConfig from '../../../config/app.json';
import machineConfig from '../../../config/machine.json';
import uiConfig from '../../../config/ui.json';
import visualizationConfig from '../../../config/visualization.json';
import stateConfig from '../../../config/state.json';
import apiConfig from '../../../config/api.json';
import defaultsConfig from '../../../config/defaults.json';
import { logger } from '../logger';
import type { MachineConfig, MachineFeatures, WorkCoordinateSystem, ToolDirection } from '../../types/MachineConfig';

export interface ConfigValues {
  app: typeof appConfig;
  machine: typeof machineConfig;
  ui: typeof uiConfig;
  visualization: typeof visualizationConfig;
  state: typeof stateConfig;
  api: typeof apiConfig;
  defaults: typeof defaultsConfig;
}

class ConfigService {
  private config: ConfigValues;
  private overrides: Map<string, any> = new Map();

  constructor() {
    this.config = {
      app: appConfig,
      machine: machineConfig,
      ui: uiConfig,
      visualization: visualizationConfig,
      state: stateConfig,
      api: apiConfig,
      defaults: defaultsConfig
    };

    this.loadEnvironmentOverrides();
    logger.info('Configuration service initialized', {
      sections: Object.keys(this.config),
      overrides: Array.from(this.overrides.keys())
    });
  }

  /**
   * Get configuration section
   */
  get<K extends keyof ConfigValues>(section: K): ConfigValues[K] {
    const baseConfig = this.config[section];
    const overrideKey = section;
    
    if (this.overrides.has(overrideKey)) {
      return this.mergeConfig(baseConfig, this.overrides.get(overrideKey));
    }
    
    return baseConfig;
  }

  /**
   * Get specific configuration value using dot notation
   */
  getValue<T = any>(path: string, defaultValue?: T): T {
    const parts = path.split('.');
    let current: any = this.config;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return defaultValue as T;
      }
    }

    return current as T;
  }

  /**
   * Set configuration override
   */
  setOverride(path: string, value: any): void {
    this.overrides.set(path, value);
    logger.debug('Configuration override set', { path, value });
  }

  /**
   * Remove configuration override
   */
  removeOverride(path: string): void {
    this.overrides.delete(path);
    logger.debug('Configuration override removed', { path });
  }

  /**
   * Get default state configuration
   */
  getDefaultState(): typeof stateConfig.defaultState {
    return this.get('state').defaultState;
  }

  /**
   * Get machine configuration
   */
  getMachineConfig(): typeof machineConfig {
    return this.get('machine');
  }

  /**
   * Get jog settings
   */
  getJogDefaults(): typeof defaultsConfig.jog {
    return this.get('defaults').jog;
  }

  /**
   * Get API configuration
   */
  getApiConfig(): typeof apiConfig {
    return this.get('api');
  }

  /**
   * Get visualization settings
   */
  getVisualizationConfig(): typeof visualizationConfig & typeof defaultsConfig.visualization {
    return {
      ...this.get('visualization'),
      ...this.get('defaults').visualization
    };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof appConfig.features): boolean {
    return this.get('app').features[feature];
  }

  /**
   * Get environment name
   */
  getEnvironment(): string {
    return this.get('app').environment;
  }

  /**
   * Check if development mode
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  /**
   * Check if mock mode is enabled
   */
  isMockEnabled(): boolean {
    return this.get('api').mock.enabled;
  }

  /**
   * Load environment-specific overrides
   */
  private loadEnvironmentOverrides(): void {
    // Check for environment variables
    if (typeof window !== 'undefined') {
      // Browser environment - could load from localStorage or URL params
      const urlParams = new URLSearchParams(window.location.search);
      
      // Allow debug mode override via URL
      if (urlParams.has('debug')) {
        this.setOverride('app.features.debugPanel', urlParams.get('debug') === 'true');
      }
      
      // Allow mock mode override via URL
      if (urlParams.has('mock')) {
        this.setOverride('api.mock.enabled', urlParams.get('mock') === 'true');
      }
    }
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(base: any, override: any): any {
    if (typeof override !== 'object' || override === null) {
      return override;
    }

    const result = { ...base };
    
    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
          result[key] = this.mergeConfig(result[key] || {}, override[key]);
        } else {
          result[key] = override[key];
        }
      }
    }

    return result;
  }

  /**
   * Validate configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate machine dimensions
    const dimensions = this.getMachineConfig().defaultDimensions;
    if (dimensions.width <= 0 || dimensions.height <= 0 || dimensions.depth <= 0) {
      errors.push('Machine dimensions must be positive values');
    }

    // Validate jog settings
    const jogSettings = this.getMachineConfig().jogSettings;
    if (jogSettings.minSpeed >= jogSettings.maxSpeed) {
      errors.push('Jog min speed must be less than max speed');
    }

    // Validate API endpoints
    const apiConfig = this.getApiConfig();
    if (!apiConfig.endpoints.base) {
      errors.push('API base URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.overrides.clear();
    logger.info('Configuration reset to defaults');
  }

  /**
   * Get machine feature configuration
   */
  getMachineFeature<T extends keyof MachineFeatures>(feature: T): MachineFeatures[T] {
    return this.getMachineConfig().features[feature];
  }

  /**
   * Check if machine feature is enabled
   */
  isMachineFeatureEnabled(feature: keyof MachineFeatures): boolean {
    const featureConfig = this.getMachineFeature(feature);
    return featureConfig && 'enabled' in featureConfig ? featureConfig.enabled : false;
  }

  /**
   * Get work coordinate systems
   */
  getWorkCoordinateSystems(): WorkCoordinateSystem[] {
    return this.getMachineFeature('workCoordinateSystems').supportedSystems;
  }

  /**
   * Get default work coordinate system
   */
  getDefaultWorkCoordinateSystem(): WorkCoordinateSystem {
    return this.getMachineFeature('workCoordinateSystems').defaultSystem;
  }

  /**
   * Get supported tool directions
   */
  getToolDirections(): ToolDirection[] {
    return this.getMachineFeature('toolDirection').supportedDirections;
  }

  /**
   * Get default tool direction
   */
  getDefaultToolDirection(): ToolDirection {
    return this.getMachineFeature('toolDirection').defaultDirection;
  }

  /**
   * Get spindle RPM range
   */
  getSpindleRange(): { min: number; max: number; default: number; step: number } {
    const spindle = this.getMachineFeature('spindleControl');
    return {
      min: spindle.minRPM,
      max: spindle.maxRPM,
      default: spindle.defaultRPM,
      step: spindle.stepSize
    };
  }

  /**
   * Get G-code command for tool direction
   */
  getToolDirectionCommand(direction: ToolDirection): string {
    const toolDirection = this.getMachineFeature('toolDirection');
    return toolDirection.commandCodes[direction];
  }

  /**
   * Get coolant control commands
   */
  getCoolantCommands(): { flood: string; mist: string; off: string } {
    const coolant = this.getMachineFeature('spindleControl').coolantControl;
    return {
      flood: coolant.floodCoolant,
      mist: coolant.mistCoolant,
      off: coolant.coolantOff
    };
  }

  /**
   * Get machine capabilities
   */
  getMachineCapabilities(): typeof machineConfig.machineCapabilities {
    return this.getMachineConfig().machineCapabilities;
  }

  /**
   * Get G-code settings
   */
  getGCodeSettings(): typeof machineConfig.gCodeSettings {
    return this.getMachineConfig().gCodeSettings;
  }

  /**
   * Get all configuration for debugging
   */
  getAllConfig(): ConfigValues & { overrides: Record<string, any> } {
    return {
      ...this.config,
      overrides: Object.fromEntries(this.overrides)
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;