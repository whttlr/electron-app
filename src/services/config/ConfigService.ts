// Configuration Service
// Centralized configuration management with modular loading and event handling

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
  ConfigEventType,
} from './types/index';
import { ConfigLoader } from './ConfigLoader';
import { ConfigEventEmitter } from './ConfigEventEmitter';
import { ConfigUtils } from './ConfigUtils';

type ConfigEventListener = (event: any) => void;

export class ConfigService {
  private static instance: ConfigService | null = null;

  private config: CompleteConfig | null = null;

  private loadingState: ConfigLoadingState = {
    isLoading: false,
    isLoaded: false,
    error: null,
    lastUpdated: null,
  };

  private configLoader: ConfigLoader;

  private eventEmitter: ConfigEventEmitter;

  private constructor() {
    this.configLoader = new ConfigLoader();
    this.eventEmitter = new ConfigEventEmitter();
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
  public async initialize(configPath?: string): Promise<void> {
    this.configLoader.setConfigPath(configPath || '');
    await this.loadAllConfigurations();
  }

  /**
   * Load all configuration files
   */
  public async loadAllConfigurations(): Promise<void> {
    this.setLoadingState({ isLoading: true, error: null });

    try {
      this.config = await this.configLoader.loadAllConfigurations();

      this.setLoadingState({
        isLoading: false,
        isLoaded: true,
        error: null,
        lastUpdated: new Date(),
      });

      this.eventEmitter.emitEvent('loaded', { config: this.config });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading configuration';
      this.setLoadingState({
        isLoading: false,
        isLoaded: false,
        error: errorMessage,
        lastUpdated: null,
      });

      this.eventEmitter.emitEvent('error', undefined, error as Error);
      throw error;
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
    return ConfigUtils.getConfigValue<T>(this.config, path);
  }

  /**
   * Get configuration value with fallback
   */
  public getConfigValueWithFallback<T>(path: string, fallback: T): T {
    return ConfigUtils.getConfigValueWithFallback<T>(this.config, path, fallback);
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
    this.eventEmitter.emitEvent('reset');
  }

  /**
   * Add event listener
   */
  public addEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    this.eventEmitter.addEventListener(type, listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    this.eventEmitter.removeEventListener(type, listener);
  }

  /**
   * Get jog increments based on metric/imperial preference
   */
  public getJogIncrements(isMetric: boolean = true): number[] {
    return ConfigUtils.getJogIncrements(this.getMachineConfig(), isMetric);
  }

  /**
   * Get feed rate limits
   */
  public getFeedRateLimits(): { min: number; max: number; default: number } {
    return ConfigUtils.getFeedRateLimits(this.getMachineConfig());
  }

  /**
   * Get working area dimensions
   */
  public getWorkingAreaDimensions(): { width: number; height: number; depth: number } {
    return ConfigUtils.getWorkingAreaDimensions(this.getMachineConfig());
  }

  /**
   * Get default position
   */
  public getDefaultPosition(): { x: number; y: number; z: number } {
    return ConfigUtils.getDefaultPosition(this.getMachineConfig());
  }

  /**
   * Get polling intervals
   */
  public getPollingIntervals(): {
    position: number;
    status: number;
    connection: number;
    } {
    return ConfigUtils.getPollingIntervals(this.getStateConfig());
  }

  /**
   * Get axis colors
   */
  public getAxisColors(): { x: string; y: string; z: string } {
    return ConfigUtils.getAxisColors(this.getUIConfig());
  }

  /**
   * Private methods
   */
  private setLoadingState(updates: Partial<ConfigLoadingState>): void {
    this.loadingState = { ...this.loadingState, ...updates };
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();
