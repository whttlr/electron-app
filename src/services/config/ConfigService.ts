// Configuration Service
// Centralized configuration management with JSON file loading and caching

import {
  CompleteConfig,
  MachineConfig,
  StateConfig,
  AppConfig,
  UIConfig,
  APIConfig,
  DefaultsConfig,
  VisualizationConfig,
  ConfigLoadingState,
  ConfigEvent,
  ConfigEventType,
  CONFIG_FILES,
  ConfigFileName
} from './types';
import { validateConfig, ValidationResult } from './validation';

type ConfigEventListener = (event: ConfigEvent) => void;

export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: CompleteConfig | null = null;
  private loadingState: ConfigLoadingState = {
    isLoading: false,
    isLoaded: false,
    error: null,
    lastUpdated: null,
  };
  private eventListeners: Map<ConfigEventType, ConfigEventListener[]> = new Map();
  private configPath: string = '';

  private constructor() {
    // Initialize event listener arrays
    Object.values(['loaded', 'error', 'updated', 'reset'] as ConfigEventType[]).forEach(type => {
      this.eventListeners.set(type, []);
    });
  }

  /**
   * Get singleton instance of ConfigService
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Initialize the configuration service with the config path
   */
  public async initialize(configPath: string = '/config'): Promise<void> {
    this.configPath = configPath.startsWith('/') ? configPath : `/${configPath}`;
    await this.loadAllConfigurations();
  }

  /**
   * Load all configuration files
   */
  public async loadAllConfigurations(): Promise<void> {
    this.setLoadingState({ isLoading: true, error: null });

    try {
      const configs = await Promise.all([
        this.loadConfigFile<MachineConfig>(CONFIG_FILES.MACHINE),
        this.loadConfigFile<StateConfig>(CONFIG_FILES.STATE),
        this.loadConfigFile<AppConfig>(CONFIG_FILES.APP),
        this.loadConfigFile<UIConfig>(CONFIG_FILES.UI),
        this.loadConfigFile<APIConfig>(CONFIG_FILES.API),
        this.loadConfigFile<DefaultsConfig>(CONFIG_FILES.DEFAULTS),
        this.loadConfigFile<VisualizationConfig>(CONFIG_FILES.VISUALIZATION),
      ]);

      this.config = {
        machine: configs[0],
        state: configs[1],
        app: configs[2],
        ui: configs[3],
        api: configs[4],
        defaults: configs[5],
        visualization: configs[6],
      };

      this.setLoadingState({
        isLoading: false,
        isLoaded: true,
        error: null,
        lastUpdated: new Date(),
      });

      this.emitEvent('loaded', { config: this.config });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading configuration';
      this.setLoadingState({
        isLoading: false,
        isLoaded: false,
        error: errorMessage,
        lastUpdated: null,
      });

      this.emitEvent('error', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Load a specific configuration file
   */
  private async loadConfigFile<T>(fileName: ConfigFileName): Promise<T> {
    try {
      // In a real Electron app, you'd use fs.readFile or similar
      // For now, we'll use fetch to load from the public directory
      const response = await fetch(`${this.configPath}/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${fileName}: ${response.status} ${response.statusText}`);
      }

      const config = await response.json();
      
      // Validate the configuration based on the file type
      let validationResult: ValidationResult;
      
      switch (fileName) {
        case CONFIG_FILES.MACHINE:
          validationResult = validateConfig(config, 'machine');
          break;
        case CONFIG_FILES.STATE:
          validationResult = validateConfig(config, 'state');
          break;
        case CONFIG_FILES.APP:
          validationResult = validateConfig(config, 'app');
          break;
        case CONFIG_FILES.UI:
          validationResult = validateConfig(config, 'ui');
          break;
        case CONFIG_FILES.API:
          validationResult = validateConfig(config, 'api');
          break;
        case CONFIG_FILES.DEFAULTS:
          validationResult = validateConfig(config, 'defaults');
          break;
        case CONFIG_FILES.VISUALIZATION:
          validationResult = validateConfig(config, 'visualization');
          break;
        default:
          validationResult = { isValid: true, errors: [], warnings: [] };
      }

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
   * Get the complete configuration
   */
  public getConfig(): CompleteConfig | null {
    return this.config;
  }

  /**
   * Get machine configuration
   */
  public getMachineConfig(): MachineConfig | null {
    return this.config?.machine || null;
  }

  /**
   * Get state configuration
   */
  public getStateConfig(): StateConfig | null {
    return this.config?.state || null;
  }

  /**
   * Get app configuration
   */
  public getAppConfig(): AppConfig | null {
    return this.config?.app || null;
  }

  /**
   * Get UI configuration
   */
  public getUIConfig(): UIConfig | null {
    return this.config?.ui || null;
  }

  /**
   * Get API configuration
   */
  public getAPIConfig(): APIConfig | null {
    return this.config?.api || null;
  }

  /**
   * Get defaults configuration
   */
  public getDefaultsConfig(): DefaultsConfig | null {
    return this.config?.defaults || null;
  }

  /**
   * Get visualization configuration
   */
  public getVisualizationConfig(): VisualizationConfig | null {
    return this.config?.visualization || null;
  }

  /**
   * Get configuration value by path (dot notation)
   * Example: getConfigValue('machine.jogSettings.defaultSpeed')
   */
  public getConfigValue<T>(path: string): T | null {
    if (!this.config) return null;

    const keys = path.split('.');
    let current: any = this.config;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return null;
      }
      current = current[key];
    }

    return current as T;
  }

  /**
   * Get configuration value with fallback
   */
  public getConfigValueWithFallback<T>(path: string, fallback: T): T {
    const value = this.getConfigValue<T>(path);
    return value !== null ? value : fallback;
  }

  /**
   * Get loading state
   */
  public getLoadingState(): ConfigLoadingState {
    return { ...this.loadingState };
  }

  /**
   * Check if configuration is loaded
   */
  public isLoaded(): boolean {
    return this.loadingState.isLoaded;
  }

  /**
   * Check if configuration is loading
   */
  public isLoading(): boolean {
    return this.loadingState.isLoading;
  }

  /**
   * Get last error
   */
  public getLastError(): string | null {
    return this.loadingState.error;
  }

  /**
   * Reload all configurations
   */
  public async reload(): Promise<void> {
    await this.loadAllConfigurations();
  }

  /**
   * Reset configuration service
   */
  public reset(): void {
    this.config = null;
    this.setLoadingState({
      isLoading: false,
      isLoaded: false,
      error: null,
      lastUpdated: null,
    });
    this.emitEvent('reset');
  }

  /**
   * Add event listener
   */
  public addEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.push(listener);
    this.eventListeners.set(type, listeners);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    const listeners = this.eventListeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get jog increments based on metric/imperial preference
   */
  public getJogIncrements(isMetric: boolean = true): number[] {
    const machineConfig = this.getMachineConfig();
    if (!machineConfig) {
      // Fallback values
      return isMetric ? [0.1, 1, 10, 100] : [0.396875, 0.79375, 1.5875, 3.175];
    }

    return isMetric 
      ? machineConfig.jogSettings.metricIncrements
      : machineConfig.jogSettings.imperialIncrements;
  }

  /**
   * Get feed rate limits
   */
  public getFeedRateLimits(): { min: number; max: number; default: number } {
    const machineConfig = this.getMachineConfig();
    if (!machineConfig) {
      return { min: 1, max: 5000, default: 1000 };
    }

    return {
      min: machineConfig.jogSettings.minSpeed,
      max: machineConfig.jogSettings.maxSpeed,
      default: machineConfig.jogSettings.defaultSpeed,
    };
  }

  /**
   * Get working area dimensions
   */
  public getWorkingAreaDimensions(): { width: number; height: number; depth: number } {
    const machineConfig = this.getMachineConfig();
    if (!machineConfig) {
      return { width: 100, height: 100, depth: 50 };
    }

    return {
      width: machineConfig.defaultDimensions.width,
      height: machineConfig.defaultDimensions.height,
      depth: machineConfig.defaultDimensions.depth,
    };
  }

  /**
   * Get default position
   */
  public getDefaultPosition(): { x: number; y: number; z: number } {
    const machineConfig = this.getMachineConfig();
    if (!machineConfig) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: machineConfig.defaultPosition.x,
      y: machineConfig.defaultPosition.y,
      z: machineConfig.defaultPosition.z,
    };
  }

  /**
   * Get polling intervals
   */
  public getPollingIntervals(): {
    position: number;
    status: number;
    connection: number;
  } {
    const stateConfig = this.getStateConfig();
    if (!stateConfig) {
      return { position: 100, status: 500, connection: 2000 };
    }

    return {
      position: stateConfig.polling.positionUpdateInterval,
      status: stateConfig.polling.statusUpdateInterval,
      connection: stateConfig.polling.connectionCheckInterval,
    };
  }

  /**
   * Get axis colors
   */
  public getAxisColors(): { x: string; y: string; z: string } {
    const uiConfig = this.getUIConfig();
    if (!uiConfig) {
      return { x: '#2f2', y: '#f00', z: '#00f' };
    }

    return {
      x: uiConfig.theme.axisColors.x,
      y: uiConfig.theme.axisColors.y,
      z: uiConfig.theme.axisColors.z,
    };
  }

  /**
   * Private methods
   */
  private setLoadingState(updates: Partial<ConfigLoadingState>): void {
    this.loadingState = { ...this.loadingState, ...updates };
  }

  private emitEvent(type: ConfigEventType, data?: any, error?: Error): void {
    const event: ConfigEvent = {
      type,
      timestamp: new Date(),
      data,
      error,
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in config event listener for ${type}:`, error);
      }
    });
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();