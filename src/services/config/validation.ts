// Configuration Validation
// Schema validation and error handling for configuration files

import {
  CompleteConfig,
  MachineConfig,
  StateConfig,
  AppConfig,
  UIConfig,
  APIConfig,
  DefaultsConfig,
  VisualizationConfig,
} from './types/index';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  /**
   * Validate complete configuration
   */
  public static validateCompleteConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Configuration must be an object');
      return result;
    }

    // Validate each configuration section
    const sections = [
      { key: 'machine', validator: this.validateMachineConfig },
      { key: 'state', validator: this.validateStateConfig },
      { key: 'app', validator: this.validateAppConfig },
      { key: 'ui', validator: this.validateUIConfig },
      { key: 'api', validator: this.validateAPIConfig },
      { key: 'defaults', validator: this.validateDefaultsConfig },
      { key: 'visualization', validator: this.validateVisualizationConfig },
    ];

    sections.forEach(({ key, validator }) => {
      if (config[key]) {
        const sectionResult = validator(config[key]);
        if (!sectionResult.isValid) {
          result.isValid = false;
          result.errors.push(...sectionResult.errors.map(error => `${key}: ${error}`));
        }
        result.warnings.push(...sectionResult.warnings.map(warning => `${key}: ${warning}`));
      } else {
        result.warnings.push(`Missing ${key} configuration section`);
      }
    });

    return result;
  }

  /**
   * Validate machine configuration
   */
  public static validateMachineConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Machine config must be an object');
      return result;
    }

    // Validate required sections
    const requiredSections = ['defaultDimensions', 'defaultPosition', 'jogSettings'];
    requiredSections.forEach(section => {
      if (!config[section]) {
        result.isValid = false;
        result.errors.push(`Missing required section: ${section}`);
      }
    });

    // Validate defaultDimensions
    if (config.defaultDimensions) {
      const dims = config.defaultDimensions;
      if (typeof dims.width !== 'number' || dims.width <= 0) {
        result.errors.push('defaultDimensions.width must be a positive number');
        result.isValid = false;
      }
      if (typeof dims.height !== 'number' || dims.height <= 0) {
        result.errors.push('defaultDimensions.height must be a positive number');
        result.isValid = false;
      }
      if (typeof dims.depth !== 'number' || dims.depth <= 0) {
        result.errors.push('defaultDimensions.depth must be a positive number');
        result.isValid = false;
      }
    }

    // Validate defaultPosition
    if (config.defaultPosition) {
      const pos = config.defaultPosition;
      if (typeof pos.x !== 'number') {
        result.errors.push('defaultPosition.x must be a number');
        result.isValid = false;
      }
      if (typeof pos.y !== 'number') {
        result.errors.push('defaultPosition.y must be a number');
        result.isValid = false;
      }
      if (typeof pos.z !== 'number') {
        result.errors.push('defaultPosition.z must be a number');
        result.isValid = false;
      }
    }

    // Validate jogSettings
    if (config.jogSettings) {
      const jog = config.jogSettings;
      if (typeof jog.defaultSpeed !== 'number' || jog.defaultSpeed <= 0) {
        result.errors.push('jogSettings.defaultSpeed must be a positive number');
        result.isValid = false;
      }
      if (typeof jog.maxSpeed !== 'number' || jog.maxSpeed <= 0) {
        result.errors.push('jogSettings.maxSpeed must be a positive number');
        result.isValid = false;
      }
      if (typeof jog.minSpeed !== 'number' || jog.minSpeed <= 0) {
        result.errors.push('jogSettings.minSpeed must be a positive number');
        result.isValid = false;
      }
      if (jog.minSpeed >= jog.maxSpeed) {
        result.errors.push('jogSettings.minSpeed must be less than maxSpeed');
        result.isValid = false;
      }
      if (!Array.isArray(jog.metricIncrements)) {
        result.errors.push('jogSettings.metricIncrements must be an array');
        result.isValid = false;
      }
      if (!Array.isArray(jog.imperialIncrements)) {
        result.errors.push('jogSettings.imperialIncrements must be an array');
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate state configuration
   */
  public static validateStateConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('State config must be an object');
      return result;
    }

    // Validate required sections
    const requiredSections = ['defaultState', 'polling'];
    requiredSections.forEach(section => {
      if (!config[section]) {
        result.isValid = false;
        result.errors.push(`Missing required section: ${section}`);
      }
    });

    // Validate polling intervals
    if (config.polling) {
      const polling = config.polling;
      const intervals = ['positionUpdateInterval', 'statusUpdateInterval', 'connectionCheckInterval'];
      intervals.forEach(interval => {
        if (typeof polling[interval] !== 'number' || polling[interval] <= 0) {
          result.errors.push(`polling.${interval} must be a positive number`);
          result.isValid = false;
        }
      });

      if (polling.positionUpdateInterval > polling.statusUpdateInterval) {
        result.warnings.push('Position update interval is higher than status update interval');
      }
    }

    return result;
  }

  /**
   * Validate app configuration
   */
  public static validateAppConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('App config must be an object');
      return result;
    }

    // Validate required fields
    if (typeof config.name !== 'string' || config.name.trim() === '') {
      result.errors.push('name must be a non-empty string');
      result.isValid = false;
    }

    if (typeof config.version !== 'string' || config.version.trim() === '') {
      result.errors.push('version must be a non-empty string');
      result.isValid = false;
    }

    if (typeof config.environment !== 'string') {
      result.errors.push('environment must be a string');
      result.isValid = false;
    }

    // Validate performance settings
    if (config.performance) {
      const perf = config.performance;
      if (typeof perf.renderInterval !== 'number' || perf.renderInterval <= 0) {
        result.errors.push('performance.renderInterval must be a positive number');
        result.isValid = false;
      }
      if (typeof perf.maxFPS !== 'number' || perf.maxFPS <= 0) {
        result.errors.push('performance.maxFPS must be a positive number');
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate UI configuration
   */
  public static validateUIConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('UI config must be an object');
      return result;
    }

    // Validate theme colors
    if (config.theme && config.theme.axisColors) {
      const colors = config.theme.axisColors;
      const axes = ['x', 'y', 'z'];
      axes.forEach(axis => {
        if (typeof colors[axis] !== 'string' || !this.isValidColor(colors[axis])) {
          result.errors.push(`theme.axisColors.${axis} must be a valid color string`);
          result.isValid = false;
        }
      });
    }

    return result;
  }

  /**
   * Validate API configuration
   */
  public static validateAPIConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('API config must be an object');
      return result;
    }

    // Validate endpoints
    if (config.endpoints) {
      const endpoints = config.endpoints;
      if (typeof endpoints.base !== 'string' || !this.isValidURL(endpoints.base)) {
        result.errors.push('endpoints.base must be a valid URL');
        result.isValid = false;
      }
    }

    // Validate timeouts
    if (config.timeouts) {
      const timeouts = config.timeouts;
      Object.keys(timeouts).forEach(key => {
        if (typeof timeouts[key] !== 'number' || timeouts[key] <= 0) {
          result.errors.push(`timeouts.${key} must be a positive number`);
          result.isValid = false;
        }
      });
    }

    return result;
  }

  /**
   * Validate defaults configuration
   */
  public static validateDefaultsConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Defaults config must be an object');
      return result;
    }

    // Basic validation - in a real implementation, you'd validate all nested structures
    const requiredSections = ['machine', 'jog', 'visualization', 'ui'];
    requiredSections.forEach(section => {
      if (!config[section]) {
        result.warnings.push(`Missing section: ${section}`);
      }
    });

    return result;
  }

  /**
   * Validate visualization configuration
   */
  public static validateVisualizationConfig(config: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Visualization config must be an object');
      return result;
    }

    // Validate 3D camera settings
    if (config.preview3D && config.preview3D.camera) {
      const camera = config.preview3D.camera;
      if (typeof camera.fov !== 'number' || camera.fov <= 0 || camera.fov >= 180) {
        result.errors.push('preview3D.camera.fov must be between 0 and 180');
        result.isValid = false;
      }
      if (typeof camera.near !== 'number' || camera.near <= 0) {
        result.errors.push('preview3D.camera.near must be a positive number');
        result.isValid = false;
      }
      if (typeof camera.far !== 'number' || camera.far <= camera.near) {
        result.errors.push('preview3D.camera.far must be greater than near');
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Helper methods
   */
  private static isValidColor(color: string): boolean {
    // Basic color validation - supports hex colors and named colors
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const namedColors = ['red', 'green', 'blue', 'white', 'black', 'yellow', 'cyan', 'magenta'];
    
    return hexPattern.test(color) || namedColors.includes(color.toLowerCase());
  }

  private static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Validate configuration with detailed error reporting
 */
export function validateConfig(config: any, type: 'complete' | 'machine' | 'state' | 'app' | 'ui' | 'api' | 'defaults' | 'visualization'): ValidationResult {
  switch (type) {
    case 'complete':
      return ConfigValidator.validateCompleteConfig(config);
    case 'machine':
      return ConfigValidator.validateMachineConfig(config);
    case 'state':
      return ConfigValidator.validateStateConfig(config);
    case 'app':
      return ConfigValidator.validateAppConfig(config);
    case 'ui':
      return ConfigValidator.validateUIConfig(config);
    case 'api':
      return ConfigValidator.validateAPIConfig(config);
    case 'defaults':
      return ConfigValidator.validateDefaultsConfig(config);
    case 'visualization':
      return ConfigValidator.validateVisualizationConfig(config);
    default:
      return {
        isValid: false,
        errors: [`Unknown configuration type: ${type}`],
        warnings: [],
      };
  }
}