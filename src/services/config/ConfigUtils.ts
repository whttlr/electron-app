// Configuration Utility Functions
// Helper functions for retrieving specific configuration values

import {
  CompleteConfig, MachineConfig, StateConfig, UIConfig,
} from './types/index';

export class ConfigUtils {
  /**
   * Get jog increments based on metric/imperial preference
   */
  public static getJogIncrements(machineConfig: MachineConfig | null, isMetric: boolean = true): number[] {
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
  public static getFeedRateLimits(machineConfig: MachineConfig | null): { min: number; max: number; default: number } {
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
  public static getWorkingAreaDimensions(
    machineConfig: MachineConfig | null,
  ): { width: number; height: number; depth: number } {
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
  public static getDefaultPosition(machineConfig: MachineConfig | null): { x: number; y: number; z: number } {
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
  public static getPollingIntervals(stateConfig: StateConfig | null): {
    position: number;
    status: number;
    connection: number;
  } {
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
  public static getAxisColors(uiConfig: UIConfig | null): { x: string; y: string; z: string } {
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
   * Get configuration value by path (dot notation)
   * Example: getConfigValue('machine.jogSettings.defaultSpeed')
   */
  public static getConfigValue<T>(config: CompleteConfig | null, path: string): T | null {
    if (!config) return null;

    const keys = path.split('.');
    let current: any = config;

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
  public static getConfigValueWithFallback<T>(config: CompleteConfig | null, path: string, fallback: T): T {
    const value = ConfigUtils.getConfigValue<T>(config, path);
    return value !== null ? value : fallback;
  }
}
