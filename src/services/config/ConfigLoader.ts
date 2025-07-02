// Configuration File Loader
// Handles loading, fetching, and validation of configuration files

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

export class ConfigLoader {
  private configPath: string = '';

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
   * Load all configuration files
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
   * Load a specific configuration file
   */
  public async loadConfigFile<T>(fileName: ConfigFileName): Promise<T> {
    try {
      // In a real Electron app, you'd use fs.readFile or similar
      // For now, we'll use fetch to load from the public directory
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
    } catch (error) {
      console.error(`Error loading config file ${fileName}:`, error);
      throw new Error(`Failed to load configuration file: ${fileName}`);
    }
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
