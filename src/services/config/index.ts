// Configuration Service Module - Public API

// Configuration service
export { ConfigService, configService } from './ConfigService';

// Configuration types
export type {
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
  Position,
  Dimensions,
  JogSettings,
  MachineFeatures,
  CONFIG_FILES,
} from './types';

// Validation utilities
export { validateConfig, ConfigValidator } from './validation';
export type { ValidationResult } from './validation';

// React hooks for configuration
export {
  useConfig,
  useMachineConfig,
  useStateConfig,
  useUIConfig,
  useAppConfig,
  useAPIConfig,
  useVisualizationConfig,
  useConfigValue,
} from './useConfig';

// Configuration module metadata
export const ConfigModule = {
  version: '1.0.0',
  description: 'Centralized configuration management with validation and caching'
};