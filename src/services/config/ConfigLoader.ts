// Configuration File Loader
// Handles loading, fetching, and validation of configuration files with database backing

import {
  CompleteConfig,
  MachineConfig,
  StateConfig,
  AppConfig,
  UIConfig,
  APIConfig,
  DefaultsConfig,
  VisualizationConfig,
  CONFIG_FILES,
  ConfigFileName,
} from './types/index';
import { validateConfig, ValidationResult } from './validation';
import { configManagementService } from '../bundled-api-supabase/config-management';

export class ConfigLoader {
  private configPath: string = '';

  private configCache: Map<string, any> = new Map();

  /**
   * Set the configuration path
   */
  public setConfigPath(configPath: string): void {
    // Auto-detect path based on environment
    if (!configPath) {
      // Check if we're in Electron environment
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        // In Electron, use relative path from the current location
        configPath = 'config';
      } else {
        // In web environment, use absolute path
        configPath = '/config';
      }
    }

    // Set the config path appropriately
    if (configPath.startsWith('./') || (!configPath.startsWith('/') && typeof window !== 'undefined' && window.location.protocol === 'file:')) {
      // For relative paths in Electron
      this.configPath = configPath.replace(/^\.\//, '');
    } else {
      // For absolute paths in web
      this.configPath = configPath.startsWith('/') ? configPath : `/${configPath}`;
    }
  }

  /**
   * Load all configuration files with database backing
   */
  public async loadAllConfigurations(): Promise<CompleteConfig> {
    const configs = await Promise.all([
      this.loadConfigFile<MachineConfig>(CONFIG_FILES.MACHINE),
      this.loadConfigFile<StateConfig>(CONFIG_FILES.STATE),
      this.loadConfigFile<AppConfig>(CONFIG_FILES.APP),
      this.loadConfigFile<UIConfig>(CONFIG_FILES.UI),
      this.loadConfigFile<APIConfig>(CONFIG_FILES.API),
      this.loadConfigFile<DefaultsConfig>(CONFIG_FILES.DEFAULTS),
      this.loadConfigFile<VisualizationConfig>(CONFIG_FILES.VISUALIZATION),
    ]);

    return {
      machine: configs[0],
      state: configs[1],
      app: configs[2],
      ui: configs[3],
      api: configs[4],
      defaults: configs[5],
      visualization: configs[6],
    };
  }

  /**
   * Load a specific configuration file with database backing
   */
  public async loadConfigFile<T>(fileName: ConfigFileName): Promise<T> {
    const configType = this.getConfigType(fileName);
    const cacheKey = `${configType}_config`;

    try {
      // Check localStorage cache first
      const cachedConfig = this.getCachedConfig<T>(cacheKey);
      if (cachedConfig) {
        return cachedConfig;
      }

      // Check database for configuration
      const dbConfig = await configManagementService.getConfiguration(configType);
      if (dbConfig) {
        const config = dbConfig.config_data as T;
        this.setCachedConfig(cacheKey, config);
        return config;
      }

      // Fall back to file system default
      const defaultConfig = await this.loadDefaultConfigFile<T>(fileName);

      // Save default to database for future use
      await configManagementService.saveConfiguration(configType, defaultConfig);
      this.setCachedConfig(cacheKey, defaultConfig);

      return defaultConfig;
    } catch (error) {
      console.error(`Error loading config file ${fileName}:`, error);
      // If all else fails, try to load from file system
      return this.loadDefaultConfigFile<T>(fileName);
    }
  }

  /**
   * Load configuration from file system (fallback)
   */
  private async loadDefaultConfigFile<T>(fileName: ConfigFileName): Promise<T> {
    const response = await fetch(`${this.configPath}/${fileName}`);

    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}: ${response.status} ${response.statusText}`);
    }

    const config = await response.json();

    // Validate the configuration based on the file type
    const validationResult = this.validateConfigFile(config, fileName);

    // Log warnings but don't fail
    if (validationResult.warnings.length > 0) {
      console.warn(`Configuration warnings for ${fileName}:`, validationResult.warnings);
    }

    // Fail if there are validation errors
    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed for ${fileName}: ${validationResult.errors.join(', ')}`);
    }

    return config as T;
  }

  /**
   * Save configuration to database
   */
  public async saveConfiguration<T>(fileName: ConfigFileName, config: T): Promise<void> {
    const configType = this.getConfigType(fileName);
    const cacheKey = `${configType}_config`;

    // Validate before saving
    const validationResult = this.validateConfigFile(config, fileName);
    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Save to database
    await configManagementService.saveConfiguration(configType, config);

    // Update cache
    this.setCachedConfig(cacheKey, config);
  }

  /**
   * Get configuration type from filename
   */
  private getConfigType(fileName: ConfigFileName): 'machine' | 'state' | 'app' | 'ui' | 'api' | 'defaults' | 'visualization' {
    switch (fileName) {
      case CONFIG_FILES.MACHINE: return 'machine';
      case CONFIG_FILES.STATE: return 'state';
      case CONFIG_FILES.APP: return 'app';
      case CONFIG_FILES.UI: return 'ui';
      case CONFIG_FILES.API: return 'api';
      case CONFIG_FILES.DEFAULTS: return 'defaults';
      case CONFIG_FILES.VISUALIZATION: return 'visualization';
      default: throw new Error(`Unknown config file: ${fileName}`);
    }
  }

  /**
   * Get cached configuration
   */
  private getCachedConfig<T>(cacheKey: string): T | null {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set cached configuration
   */
  private setCachedConfig<T>(cacheKey: string, config: T): void {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to cache configuration:', error);
    }
  }

  /**
   * Clear configuration cache
   */
  public clearCache(): void {
    this.configCache.clear();
    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.endsWith('_config')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Validate configuration file based on its type
   */
  private validateConfigFile(config: any, fileName: ConfigFileName): ValidationResult {
    switch (fileName) {
      case CONFIG_FILES.MACHINE:
        return validateConfig(config, 'machine');
      case CONFIG_FILES.STATE:
        return validateConfig(config, 'state');
      case CONFIG_FILES.APP:
        return validateConfig(config, 'app');
      case CONFIG_FILES.UI:
        return validateConfig(config, 'ui');
      case CONFIG_FILES.API:
        return validateConfig(config, 'api');
      case CONFIG_FILES.DEFAULTS:
        return validateConfig(config, 'defaults');
      case CONFIG_FILES.VISUALIZATION:
        return validateConfig(config, 'visualization');
      default:
        return { isValid: true, errors: [], warnings: [] };
    }
  }

  /**
   * Get current config path
   */
  public getConfigPath(): string {
    return this.configPath;
  }
}
