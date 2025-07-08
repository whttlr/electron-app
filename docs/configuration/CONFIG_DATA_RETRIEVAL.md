# Configuration Data Retrieval Guide

## Overview

The CNC Jog Controls application uses a hierarchical configuration system that retrieves data from multiple sources including local files, environment variables, remote APIs, and user preferences. This guide covers all aspects of configuration data retrieval, management, and best practices.

## Table of Contents

1. [Configuration Architecture](#configuration-architecture)
2. [Configuration Sources](#configuration-sources)
3. [Retrieval Strategies](#retrieval-strategies)
4. [Configuration Loading](#configuration-loading)
5. [Environment-Specific Configs](#environment-specific-configs)
6. [Runtime Configuration](#runtime-configuration)
7. [Configuration Validation](#configuration-validation)
8. [Caching and Performance](#caching-and-performance)
9. [Error Handling](#error-handling)
10. [Security Considerations](#security-considerations)
11. [Testing Configuration](#testing-configuration)
12. [Troubleshooting](#troubleshooting)

---

## Configuration Architecture

### Configuration Hierarchy

```
Configuration Priority (Highest to Lowest):
1. Runtime overrides (API calls, user actions)
2. Environment variables
3. User-specific config files
4. Local config files (config/*.json)
5. Default embedded values
```

### Configuration Structure

```typescript
// src/config/types.ts
export interface AppConfig {
  app: AppSettings;
  machine: MachineConfig;
  api: ApiConfig;
  ui: UIConfig;
  database: DatabaseConfig;
  plugins: PluginConfig;
  security: SecurityConfig;
}

export interface AppSettings {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  dataPath: string;
  tempPath: string;
}

export interface MachineConfig {
  type: 'grbl' | 'marlin' | 'simulator';
  connectionString: string;
  baudRate: number;
  timeout: number;
  safetyEnabled: boolean;
  workspaceSize: {
    width: number;
    height: number;
    depth: number;
  };
  homePosition: {
    x: number;
    y: number;
    z: number;
  };
  maxSpeed: {
    x: number;
    y: number;
    z: number;
  };
  units: 'mm' | 'inches';
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  apiKey: string;
  endpoints: {
    machine: string;
    database: string;
    plugins: string;
    auth: string;
  };
}
```

---

## Configuration Sources

### 1. Local Configuration Files

#### Default Configuration Structure

```
config/
├── defaults.json          # Base defaults for all environments
├── app.json              # Application metadata
├── machine.json          # Machine-specific settings
├── api.json              # API endpoints and settings
├── ui.json               # UI preferences and theming
├── database.json         # Database connection settings
├── security.json         # Security policies
├── development.json      # Development overrides
├── staging.json          # Staging overrides
└── production.json       # Production overrides
```

#### Configuration File Examples

```json
// config/defaults.json
{
  "app": {
    "name": "CNC Jog Controls",
    "version": "1.0.0",
    "environment": "development",
    "debug": true,
    "logLevel": "info",
    "dataPath": "~/.cnc-controls/data",
    "tempPath": "~/.cnc-controls/temp"
  },
  "machine": {
    "type": "simulator",
    "connectionString": "simulator://localhost:3001",
    "baudRate": 115200,
    "timeout": 5000,
    "safetyEnabled": true,
    "workspaceSize": {
      "width": 300,
      "height": 300,
      "depth": 100
    },
    "homePosition": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "maxSpeed": {
      "x": 1000,
      "y": 1000,
      "z": 500
    },
    "units": "mm"
  },
  "api": {
    "baseUrl": "http://localhost:3000",
    "timeout": 30000,
    "retryAttempts": 3,
    "endpoints": {
      "machine": "/api/machine",
      "database": "/api/database",
      "plugins": "/api/plugins",
      "auth": "/api/auth"
    }
  }
}
```

```json
// config/production.json
{
  "app": {
    "environment": "production",
    "debug": false,
    "logLevel": "warn"
  },
  "machine": {
    "type": "grbl",
    "connectionString": "serial:///dev/ttyUSB0:115200",
    "safetyEnabled": true
  },
  "api": {
    "baseUrl": "https://api.cnc-controls.com",
    "timeout": 60000
  }
}
```

### 2. Environment Variables

```typescript
// src/config/env-loader.ts
export class EnvironmentConfigLoader {
  static loadFromEnvironment(): Partial<AppConfig> {
    return {
      app: {
        environment: (process.env.NODE_ENV as any) || 'development',
        debug: process.env.DEBUG === 'true',
        logLevel: (process.env.LOG_LEVEL as any) || 'info',
        dataPath: process.env.DATA_PATH,
        tempPath: process.env.TEMP_PATH
      },
      machine: {
        type: (process.env.MACHINE_TYPE as any),
        connectionString: process.env.MACHINE_CONNECTION,
        baudRate: process.env.MACHINE_BAUD_RATE ? parseInt(process.env.MACHINE_BAUD_RATE) : undefined,
        timeout: process.env.MACHINE_TIMEOUT ? parseInt(process.env.MACHINE_TIMEOUT) : undefined,
        safetyEnabled: process.env.MACHINE_SAFETY === 'true'
      },
      api: {
        baseUrl: process.env.API_BASE_URL,
        timeout: process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT) : undefined,
        retryAttempts: process.env.API_RETRY_ATTEMPTS ? parseInt(process.env.API_RETRY_ATTEMPTS) : undefined,
        apiKey: process.env.API_KEY
      },
      database: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      security: {
        encryptionKey: process.env.ENCRYPTION_KEY,
        jwtSecret: process.env.JWT_SECRET,
        corsOrigins: process.env.CORS_ORIGINS?.split(',')
      }
    };
  }

  static validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables for production
    if (process.env.NODE_ENV === 'production') {
      const requiredVars = [
        'API_BASE_URL',
        'DATABASE_URL',
        'ENCRYPTION_KEY',
        'JWT_SECRET'
      ];

      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          errors.push(`Missing required environment variable: ${varName}`);
        }
      }
    }

    // Check for deprecated variables
    const deprecatedVars = [
      'OLD_API_URL',
      'LEGACY_DB_CONNECTION'
    ];

    for (const varName of deprecatedVars) {
      if (process.env[varName]) {
        warnings.push(`Deprecated environment variable: ${varName}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### 3. User Configuration Files

```typescript
// src/config/user-config.ts
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

export class UserConfigLoader {
  private static readonly USER_CONFIG_DIR = path.join(os.homedir(), '.cnc-controls');
  private static readonly USER_CONFIG_FILE = path.join(this.USER_CONFIG_DIR, 'config.json');

  static async loadUserConfig(): Promise<Partial<AppConfig>> {
    try {
      await this.ensureConfigDirectory();
      
      const configExists = await this.configExists();
      if (!configExists) {
        await this.createDefaultUserConfig();
      }

      const configContent = await fs.readFile(this.USER_CONFIG_FILE, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.warn('Failed to load user config:', error);
      return {};
    }
  }

  static async saveUserConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      await this.ensureConfigDirectory();
      
      const existingConfig = await this.loadUserConfig();
      const mergedConfig = this.deepMerge(existingConfig, config);
      
      await fs.writeFile(
        this.USER_CONFIG_FILE,
        JSON.stringify(mergedConfig, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save user config:', error);
      throw error;
    }
  }

  static async resetUserConfig(): Promise<void> {
    try {
      if (await this.configExists()) {
        await fs.unlink(this.USER_CONFIG_FILE);
      }
      await this.createDefaultUserConfig();
    } catch (error) {
      console.error('Failed to reset user config:', error);
      throw error;
    }
  }

  private static async ensureConfigDirectory(): Promise<void> {
    try {
      await fs.access(this.USER_CONFIG_DIR);
    } catch {
      await fs.mkdir(this.USER_CONFIG_DIR, { recursive: true });
    }
  }

  private static async configExists(): Promise<boolean> {
    try {
      await fs.access(this.USER_CONFIG_FILE);
      return true;
    } catch {
      return false;
    }
  }

  private static async createDefaultUserConfig(): Promise<void> {
    const defaultConfig: Partial<AppConfig> = {
      ui: {
        theme: 'cnc-controls',
        language: 'en',
        autoSave: true,
        confirmDestructiveActions: true
      },
      machine: {
        units: 'mm'
      }
    };

    await fs.writeFile(
      this.USER_CONFIG_FILE,
      JSON.stringify(defaultConfig, null, 2),
      'utf8'
    );
  }

  private static deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}
```

### 4. Remote Configuration

```typescript
// src/config/remote-config.ts
export class RemoteConfigLoader {
  private apiClient: ApiClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async loadRemoteConfig(configKey: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(configKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await this.apiClient.get(`/config/${configKey}`);
      
      // Cache the response
      this.cache.set(configKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.warn(`Failed to load remote config: ${configKey}`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.warn(`Using expired cache for config: ${configKey}`);
        return cached.data;
      }
      
      return null;
    }
  }

  async loadMachineProfiles(): Promise<MachineProfile[]> {
    return this.loadRemoteConfig('machine-profiles') || [];
  }

  async loadPluginConfigs(): Promise<PluginConfig[]> {
    return this.loadRemoteConfig('plugin-configs') || [];
  }

  async loadSecurityPolicies(): Promise<SecurityPolicy[]> {
    return this.loadRemoteConfig('security-policies') || [];
  }

  invalidateCache(configKey?: string): void {
    if (configKey) {
      this.cache.delete(configKey);
    } else {
      this.cache.clear();
    }
  }
}

export interface MachineProfile {
  id: string;
  name: string;
  description: string;
  config: MachineConfig;
  verified: boolean;
  author: string;
  created: Date;
  updated: Date;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  rules: SecurityRule[];
  enforced: boolean;
}
```

---

## Retrieval Strategies

### Configuration Manager

```typescript
// src/config/config-manager.ts
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;
  private watchers: Map<string, ConfigWatcher[]> = new Map();
  private remoteLoader: RemoteConfigLoader;

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async initialize(apiClient?: ApiClient): Promise<AppConfig> {
    if (apiClient) {
      this.remoteLoader = new RemoteConfigLoader(apiClient);
    }

    this.config = await this.loadConfiguration();
    return this.config;
  }

  private async loadConfiguration(): Promise<AppConfig> {
    const configSources = [
      await this.loadDefaultConfig(),
      await this.loadFileConfigs(),
      await this.loadUserConfig(),
      this.loadEnvironmentConfig(),
      await this.loadRemoteConfig()
    ];

    // Merge configurations in priority order
    const mergedConfig = this.mergeConfigurations(configSources);
    
    // Validate the final configuration
    const validation = this.validateConfiguration(mergedConfig);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    return mergedConfig;
  }

  private async loadDefaultConfig(): Promise<Partial<AppConfig>> {
    try {
      const defaultsPath = path.join(__dirname, '../../config/defaults.json');
      const content = await fs.readFile(defaultsPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to load default config:', error);
      return {};
    }
  }

  private async loadFileConfigs(): Promise<Partial<AppConfig>> {
    const environment = process.env.NODE_ENV || 'development';
    const configDir = path.join(__dirname, '../../config');
    
    const configFiles = [
      'app.json',
      'machine.json',
      'api.json',
      'ui.json',
      'database.json',
      'security.json',
      `${environment}.json`
    ];

    const configs: Partial<AppConfig>[] = [];

    for (const fileName of configFiles) {
      try {
        const filePath = path.join(configDir, fileName);
        const content = await fs.readFile(filePath, 'utf8');
        configs.push(JSON.parse(content));
      } catch (error) {
        // It's okay if some config files don't exist
        console.debug(`Config file ${fileName} not found or invalid`);
      }
    }

    return this.mergeConfigurations(configs);
  }

  private async loadUserConfig(): Promise<Partial<AppConfig>> {
    return UserConfigLoader.loadUserConfig();
  }

  private loadEnvironmentConfig(): Partial<AppConfig> {
    return EnvironmentConfigLoader.loadFromEnvironment();
  }

  private async loadRemoteConfig(): Promise<Partial<AppConfig>> {
    if (!this.remoteLoader) {
      return {};
    }

    try {
      const remoteConfig = await this.remoteLoader.loadRemoteConfig('app-config');
      return remoteConfig || {};
    } catch (error) {
      console.warn('Failed to load remote config:', error);
      return {};
    }
  }

  private mergeConfigurations(configs: Partial<AppConfig>[]): AppConfig {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {}) as AppConfig;
  }

  private deepMerge(target: any, source: any): any {
    if (!source) return target;
    if (!target) return source;

    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private validateConfiguration(config: AppConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.app?.name) {
      errors.push('App name is required');
    }

    if (!config.api?.baseUrl) {
      errors.push('API base URL is required');
    }

    if (!config.machine?.type) {
      errors.push('Machine type is required');
    }

    // Validate field values
    if (config.machine?.type && !['grbl', 'marlin', 'simulator'].includes(config.machine.type)) {
      errors.push('Invalid machine type');
    }

    if (config.api?.timeout && config.api.timeout < 1000) {
      warnings.push('API timeout is very low');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Configuration access methods
  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }
    return this.config;
  }

  get<T>(path: string): T {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      value = value?.[key];
    }

    return value as T;
  }

  set<T>(path: string, value: T): void {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    const keys = path.split('.');
    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Notify watchers
    this.notifyWatchers(path, oldValue, value);
  }

  watch(path: string, callback: ConfigWatcher): void {
    const watchers = this.watchers.get(path) || [];
    watchers.push(callback);
    this.watchers.set(path, watchers);
  }

  unwatch(path: string, callback: ConfigWatcher): void {
    const watchers = this.watchers.get(path) || [];
    const index = watchers.indexOf(callback);
    if (index !== -1) {
      watchers.splice(index, 1);
    }
  }

  private notifyWatchers(path: string, oldValue: any, newValue: any): void {
    const watchers = this.watchers.get(path) || [];
    watchers.forEach(watcher => {
      try {
        watcher(path, oldValue, newValue);
      } catch (error) {
        console.error('Error in config watcher:', error);
      }
    });
  }

  async reload(): Promise<AppConfig> {
    const newConfig = await this.loadConfiguration();
    
    // Compare configs and notify watchers of changes
    this.compareAndNotify('', this.config, newConfig);
    
    this.config = newConfig;
    return newConfig;
  }

  private compareAndNotify(basePath: string, oldConfig: any, newConfig: any): void {
    const allKeys = new Set([
      ...Object.keys(oldConfig || {}),
      ...Object.keys(newConfig || {})
    ]);

    for (const key of allKeys) {
      const path = basePath ? `${basePath}.${key}` : key;
      const oldValue = oldConfig?.[key];
      const newValue = newConfig?.[key];

      if (typeof oldValue === 'object' && typeof newValue === 'object') {
        this.compareAndNotify(path, oldValue, newValue);
      } else if (oldValue !== newValue) {
        this.notifyWatchers(path, oldValue, newValue);
      }
    }
  }
}

export type ConfigWatcher = (path: string, oldValue: any, newValue: any) => void;
```

---

## Configuration Loading

### React Hook for Configuration

```typescript
// src/hooks/useConfig.ts
import { useState, useEffect } from 'react';
import { ConfigManager } from '../config/config-manager';

export function useConfig<T>(path?: string): T | AppConfig {
  const [config, setConfig] = useState<T | AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const configManager = ConfigManager.getInstance();
    
    const loadConfig = async () => {
      try {
        setLoading(true);
        await configManager.initialize();
        
        const configValue = path ? configManager.get<T>(path) : configManager.getConfig();
        setConfig(configValue);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // Watch for changes if path is specified
    if (path) {
      const watcher = (changedPath: string, oldValue: any, newValue: any) => {
        if (changedPath === path) {
          setConfig(newValue);
        }
      };

      configManager.watch(path, watcher);

      return () => {
        configManager.unwatch(path, watcher);
      };
    }
  }, [path]);

  return { config, loading, error };
}

// Specific hooks for common config sections
export function useMachineConfig(): {
  config: MachineConfig | null;
  loading: boolean;
  error: Error | null;
  updateConfig: (updates: Partial<MachineConfig>) => void;
} {
  const { config, loading, error } = useConfig<MachineConfig>('machine');
  
  const updateConfig = (updates: Partial<MachineConfig>) => {
    const configManager = ConfigManager.getInstance();
    const currentConfig = configManager.get<MachineConfig>('machine');
    const newConfig = { ...currentConfig, ...updates };
    configManager.set('machine', newConfig);
  };

  return { config, loading, error, updateConfig };
}

export function useApiConfig(): {
  config: ApiConfig | null;
  loading: boolean;
  error: Error | null;
} {
  return useConfig<ApiConfig>('api');
}

export function useUIConfig(): {
  config: UIConfig | null;
  loading: boolean;
  error: Error | null;
  updateTheme: (theme: string) => void;
  updateLanguage: (language: string) => void;
} {
  const { config, loading, error } = useConfig<UIConfig>('ui');
  
  const updateTheme = (theme: string) => {
    const configManager = ConfigManager.getInstance();
    configManager.set('ui.theme', theme);
  };

  const updateLanguage = (language: string) => {
    const configManager = ConfigManager.getInstance();
    configManager.set('ui.language', language);
  };

  return { config, loading, error, updateTheme, updateLanguage };
}
```

### Configuration Component

```typescript
// src/components/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigManager } from '../config/config-manager';
import { ApiClient } from '../services/api/client';

interface ConfigContextValue {
  config: AppConfig | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  get: <T>(path: string) => T;
  set: <T>(path: string, value: T) => void;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export interface ConfigProviderProps {
  children: React.ReactNode;
  apiClient?: ApiClient;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ 
  children, 
  apiClient 
}) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setLoading(true);
        const configManager = ConfigManager.getInstance();
        const loadedConfig = await configManager.initialize(apiClient);
        setConfig(loadedConfig);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize configuration:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeConfig();
  }, [apiClient]);

  const reload = async () => {
    try {
      setLoading(true);
      const configManager = ConfigManager.getInstance();
      const reloadedConfig = await configManager.reload();
      setConfig(reloadedConfig);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const get = <T,>(path: string): T => {
    const configManager = ConfigManager.getInstance();
    return configManager.get<T>(path);
  };

  const set = <T,>(path: string, value: T): void => {
    const configManager = ConfigManager.getInstance();
    configManager.set(path, value);
    setConfig({ ...configManager.getConfig() }); // Trigger re-render
  };

  const value: ConfigContextValue = {
    config,
    loading,
    error,
    reload,
    get,
    set
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
};
```

---

## Environment-Specific Configs

### Environment Detection

```typescript
// src/config/environment.ts
export class EnvironmentDetector {
  static getCurrentEnvironment(): AppEnvironment {
    // Check explicit environment variable
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV as AppEnvironment;
    }

    // Check for development indicators
    if (this.isDevelopment()) {
      return 'development';
    }

    // Check for staging indicators
    if (this.isStaging()) {
      return 'staging';
    }

    // Default to production
    return 'production';
  }

  private static isDevelopment(): boolean {
    return (
      process.env.DEBUG === 'true' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('dev')
    );
  }

  private static isStaging(): boolean {
    return (
      window.location.hostname.includes('staging') ||
      window.location.hostname.includes('test')
    );
  }

  static getEnvironmentConfig(env: AppEnvironment): EnvironmentConfig {
    const configs: Record<AppEnvironment, EnvironmentConfig> = {
      development: {
        apiUrl: 'http://localhost:3000',
        debugMode: true,
        logLevel: 'debug',
        enableAnalytics: false,
        enableSentry: false,
        machineSimulator: true
      },
      staging: {
        apiUrl: 'https://staging-api.cnc-controls.com',
        debugMode: true,
        logLevel: 'info',
        enableAnalytics: false,
        enableSentry: true,
        machineSimulator: false
      },
      production: {
        apiUrl: 'https://api.cnc-controls.com',
        debugMode: false,
        logLevel: 'warn',
        enableAnalytics: true,
        enableSentry: true,
        machineSimulator: false
      }
    };

    return configs[env];
  }
}

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  apiUrl: string;
  debugMode: boolean;
  logLevel: string;
  enableAnalytics: boolean;
  enableSentry: boolean;
  machineSimulator: boolean;
}
```

### Feature Flags

```typescript
// src/config/feature-flags.ts
export class FeatureFlagManager {
  private flags: Map<string, boolean> = new Map();
  private remoteFlags: Map<string, boolean> = new Map();

  constructor(private configManager: ConfigManager) {
    this.loadLocalFlags();
  }

  async initialize(): Promise<void> {
    await this.loadRemoteFlags();
    this.setupFlagUpdates();
  }

  private loadLocalFlags(): void {
    const localFlags = this.configManager.get<Record<string, boolean>>('featureFlags') || {};
    
    Object.entries(localFlags).forEach(([flag, enabled]) => {
      this.flags.set(flag, enabled);
    });
  }

  private async loadRemoteFlags(): Promise<void> {
    try {
      const remoteConfig = await fetch('/api/feature-flags');
      const remoteFlags = await remoteConfig.json();
      
      Object.entries(remoteFlags).forEach(([flag, enabled]) => {
        this.remoteFlags.set(flag, enabled as boolean);
      });
    } catch (error) {
      console.warn('Failed to load remote feature flags:', error);
    }
  }

  private setupFlagUpdates(): void {
    // Listen for flag updates via WebSocket or polling
    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      this.setupWebSocketUpdates();
    } else {
      this.setupPollingUpdates();
    }
  }

  private setupWebSocketUpdates(): void {
    const ws = new WebSocket('ws://localhost:3000/feature-flags');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'flag-update') {
        this.remoteFlags.set(update.flag, update.enabled);
      }
    };
  }

  private setupPollingUpdates(): void {
    setInterval(async () => {
      await this.loadRemoteFlags();
    }, 5 * 60 * 1000); // Poll every 5 minutes
  }

  isEnabled(flag: string): boolean {
    // Remote flags take precedence over local flags
    if (this.remoteFlags.has(flag)) {
      return this.remoteFlags.get(flag)!;
    }

    return this.flags.get(flag) || false;
  }

  setFlag(flag: string, enabled: boolean): void {
    this.flags.set(flag, enabled);
    
    // Update local configuration
    const currentFlags = this.configManager.get<Record<string, boolean>>('featureFlags') || {};
    currentFlags[flag] = enabled;
    this.configManager.set('featureFlags', currentFlags);
  }

  getAllFlags(): Record<string, boolean> {
    const allFlags: Record<string, boolean> = {};
    
    // Start with local flags
    this.flags.forEach((enabled, flag) => {
      allFlags[flag] = enabled;
    });
    
    // Override with remote flags
    this.remoteFlags.forEach((enabled, flag) => {
      allFlags[flag] = enabled;
    });
    
    return allFlags;
  }
}

// Common feature flags
export const FeatureFlags = {
  NEW_UI: 'new-ui',
  PLUGIN_MARKETPLACE: 'plugin-marketplace',
  ADVANCED_SAFETY: 'advanced-safety',
  MACHINE_LEARNING: 'machine-learning',
  CLOUD_SYNC: 'cloud-sync',
  BETA_FEATURES: 'beta-features'
} as const;
```

---

## Runtime Configuration

### Dynamic Configuration Updates

```typescript
// src/config/runtime-config.ts
export class RuntimeConfigManager {
  private configManager: ConfigManager;
  private apiClient: ApiClient;
  private updateQueue: ConfigUpdate[] = [];
  private isProcessing: boolean = false;

  constructor(configManager: ConfigManager, apiClient: ApiClient) {
    this.configManager = configManager;
    this.apiClient = apiClient;
  }

  async updateConfig(path: string, value: any, options: UpdateOptions = {}): Promise<void> {
    const update: ConfigUpdate = {
      path,
      value,
      timestamp: Date.now(),
      options
    };

    this.updateQueue.push(update);
    
    if (!this.isProcessing) {
      await this.processUpdates();
    }
  }

  private async processUpdates(): Promise<void> {
    this.isProcessing = true;

    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift()!;
      
      try {
        await this.applyUpdate(update);
      } catch (error) {
        console.error('Failed to apply config update:', error);
        
        if (update.options.retryOnFailure) {
          // Re-queue for retry
          this.updateQueue.unshift(update);
        }
      }
    }

    this.isProcessing = false;
  }

  private async applyUpdate(update: ConfigUpdate): Promise<void> {
    // Apply locally first
    this.configManager.set(update.path, update.value);

    // Persist to user config if requested
    if (update.options.persist) {
      await this.persistUpdate(update);
    }

    // Sync to remote if requested
    if (update.options.syncRemote) {
      await this.syncToRemote(update);
    }

    // Validate the update if validator provided
    if (update.options.validator) {
      const isValid = await update.options.validator(update.value);
      if (!isValid) {
        throw new Error(`Validation failed for config update: ${update.path}`);
      }
    }
  }

  private async persistUpdate(update: ConfigUpdate): Promise<void> {
    const userConfig = await UserConfigLoader.loadUserConfig();
    
    // Set the value in user config
    const keys = update.path.split('.');
    let current: any = userConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = update.value;
    
    await UserConfigLoader.saveUserConfig(userConfig);
  }

  private async syncToRemote(update: ConfigUpdate): Promise<void> {
    await this.apiClient.post('/config/update', {
      body: {
        path: update.path,
        value: update.value,
        timestamp: update.timestamp
      }
    });
  }

  async batchUpdate(updates: Array<{ path: string; value: any }>): Promise<void> {
    const batchUpdates = updates.map(({ path, value }) => ({
      path,
      value,
      timestamp: Date.now(),
      options: { persist: true }
    }));

    this.updateQueue.push(...batchUpdates);
    
    if (!this.isProcessing) {
      await this.processUpdates();
    }
  }

  async revertToDefaults(section?: string): Promise<void> {
    const defaultConfig = await this.loadDefaultConfiguration();
    
    if (section) {
      const defaultValue = this.getNestedValue(defaultConfig, section);
      await this.updateConfig(section, defaultValue, { persist: true });
    } else {
      // Revert entire configuration
      for (const [key, value] of Object.entries(defaultConfig)) {
        await this.updateConfig(key, value, { persist: true });
      }
    }
  }

  private async loadDefaultConfiguration(): Promise<AppConfig> {
    // Load from defaults.json
    const defaultsPath = path.join(__dirname, '../../config/defaults.json');
    const content = await fs.readFile(defaultsPath, 'utf8');
    return JSON.parse(content);
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value;
  }
}

interface ConfigUpdate {
  path: string;
  value: any;
  timestamp: number;
  options: UpdateOptions;
}

interface UpdateOptions {
  persist?: boolean;
  syncRemote?: boolean;
  retryOnFailure?: boolean;
  validator?: (value: any) => Promise<boolean>;
}
```

---

## Configuration Validation

### Schema Validation

```typescript
// src/config/validation.ts
import Joi from 'joi';

export class ConfigValidator {
  private static readonly CONFIG_SCHEMA = Joi.object({
    app: Joi.object({
      name: Joi.string().required(),
      version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
      environment: Joi.string().valid('development', 'staging', 'production').required(),
      debug: Joi.boolean().required(),
      logLevel: Joi.string().valid('error', 'warn', 'info', 'debug').required(),
      dataPath: Joi.string().required(),
      tempPath: Joi.string().required()
    }).required(),

    machine: Joi.object({
      type: Joi.string().valid('grbl', 'marlin', 'simulator').required(),
      connectionString: Joi.string().required(),
      baudRate: Joi.number().integer().min(9600).max(921600).required(),
      timeout: Joi.number().integer().min(1000).max(60000).required(),
      safetyEnabled: Joi.boolean().required(),
      workspaceSize: Joi.object({
        width: Joi.number().positive().required(),
        height: Joi.number().positive().required(),
        depth: Joi.number().positive().required()
      }).required(),
      homePosition: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required(),
        z: Joi.number().required()
      }).required(),
      maxSpeed: Joi.object({
        x: Joi.number().positive().required(),
        y: Joi.number().positive().required(),
        z: Joi.number().positive().required()
      }).required(),
      units: Joi.string().valid('mm', 'inches').required()
    }).required(),

    api: Joi.object({
      baseUrl: Joi.string().uri().required(),
      timeout: Joi.number().integer().min(1000).max(300000).required(),
      retryAttempts: Joi.number().integer().min(0).max(10).required(),
      apiKey: Joi.string().min(32),
      endpoints: Joi.object({
        machine: Joi.string().required(),
        database: Joi.string().required(),
        plugins: Joi.string().required(),
        auth: Joi.string().required()
      }).required()
    }).required(),

    ui: Joi.object({
      theme: Joi.string().required(),
      language: Joi.string().length(2).required(),
      autoSave: Joi.boolean().required(),
      confirmDestructiveActions: Joi.boolean().required(),
      notifications: Joi.object({
        enabled: Joi.boolean().required(),
        position: Joi.string().valid('top-left', 'top-right', 'bottom-left', 'bottom-right').required(),
        timeout: Joi.number().integer().min(1000).max(30000).required()
      })
    }),

    database: Joi.object({
      url: Joi.string().uri(),
      host: Joi.string().hostname(),
      port: Joi.number().integer().min(1).max(65535),
      username: Joi.string(),
      password: Joi.string(),
      database: Joi.string(),
      ssl: Joi.boolean(),
      maxConnections: Joi.number().integer().min(1).max(100)
    }),

    security: Joi.object({
      encryptionKey: Joi.string().length(32),
      jwtSecret: Joi.string().min(32),
      corsOrigins: Joi.array().items(Joi.string().uri()),
      sessionTimeout: Joi.number().integer().min(300).max(86400),
      maxLoginAttempts: Joi.number().integer().min(1).max(10)
    })
  });

  static validate(config: any): ValidationResult {
    const { error, value, warning } = this.CONFIG_SCHEMA.validate(config, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    const errors = error?.details.map(detail => detail.message) || [];
    const warnings = warning?.details.map(detail => detail.message) || [];

    return {
      valid: !error,
      errors,
      warnings,
      value
    };
  }

  static validateSection(section: string, config: any): ValidationResult {
    const sectionSchemas: Record<string, Joi.Schema> = {
      app: this.CONFIG_SCHEMA.extract('app'),
      machine: this.CONFIG_SCHEMA.extract('machine'),
      api: this.CONFIG_SCHEMA.extract('api'),
      ui: this.CONFIG_SCHEMA.extract('ui'),
      database: this.CONFIG_SCHEMA.extract('database'),
      security: this.CONFIG_SCHEMA.extract('security')
    };

    const schema = sectionSchemas[section];
    if (!schema) {
      return {
        valid: false,
        errors: [`Unknown configuration section: ${section}`],
        warnings: []
      };
    }

    const { error, value, warning } = schema.validate(config, {
      abortEarly: false,
      allowUnknown: true
    });

    const errors = error?.details.map(detail => detail.message) || [];
    const warnings = warning?.details.map(detail => detail.message) || [];

    return {
      valid: !error,
      errors,
      warnings,
      value
    };
  }

  static sanitize(config: any): AppConfig {
    const { value } = this.CONFIG_SCHEMA.validate(config, {
      stripUnknown: true,
      allowUnknown: false
    });

    return value;
  }
}
```

---

## Caching and Performance

### Configuration Cache

```typescript
// src/config/cache.ts
export class ConfigCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  // Periodic cleanup
  startCleanup(interval: number = 60000): void {
    setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
}
```

---

## Error Handling

### Configuration Error Handler

```typescript
// src/config/error-handler.ts
export class ConfigErrorHandler {
  static handle(error: ConfigError): ConfigErrorResponse {
    switch (error.type) {
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error);
        
      case 'LOADING_ERROR':
        return this.handleLoadingError(error);
        
      case 'REMOTE_ERROR':
        return this.handleRemoteError(error);
        
      case 'PERMISSION_ERROR':
        return this.handlePermissionError(error);
        
      default:
        return this.handleUnknownError(error);
    }
  }

  private static handleValidationError(error: ConfigError): ConfigErrorResponse {
    return {
      severity: 'error',
      message: `Configuration validation failed: ${error.message}`,
      suggestions: [
        'Check configuration file syntax',
        'Verify all required fields are present',
        'Validate data types match expected schema'
      ],
      recoverable: true,
      fallbackAction: 'use-defaults'
    };
  }

  private static handleLoadingError(error: ConfigError): ConfigErrorResponse {
    return {
      severity: 'warning',
      message: `Failed to load configuration: ${error.message}`,
      suggestions: [
        'Check file permissions',
        'Verify file path exists',
        'Ensure valid JSON syntax'
      ],
      recoverable: true,
      fallbackAction: 'use-embedded-defaults'
    };
  }

  private static handleRemoteError(error: ConfigError): ConfigErrorResponse {
    return {
      severity: 'warning',
      message: `Remote configuration unavailable: ${error.message}`,
      suggestions: [
        'Check internet connection',
        'Verify API endpoint availability',
        'Check authentication credentials'
      ],
      recoverable: true,
      fallbackAction: 'use-cached-config'
    };
  }

  private static handlePermissionError(error: ConfigError): ConfigErrorResponse {
    return {
      severity: 'error',
      message: `Permission denied: ${error.message}`,
      suggestions: [
        'Run application with appropriate permissions',
        'Check file/directory ownership',
        'Verify user has write access to config directory'
      ],
      recoverable: false,
      fallbackAction: 'read-only-mode'
    };
  }

  private static handleUnknownError(error: ConfigError): ConfigErrorResponse {
    return {
      severity: 'error',
      message: `Unexpected configuration error: ${error.message}`,
      suggestions: [
        'Check application logs for details',
        'Report issue to support team',
        'Restart application'
      ],
      recoverable: false,
      fallbackAction: 'use-safe-defaults'
    };
  }
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public type: ConfigErrorType,
    public details?: any
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

export type ConfigErrorType = 
  | 'VALIDATION_ERROR'
  | 'LOADING_ERROR'
  | 'REMOTE_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ConfigErrorResponse {
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestions: string[];
  recoverable: boolean;
  fallbackAction: string;
}
```

---

## Security Considerations

### Secure Configuration Handling

```typescript
// src/config/security.ts
export class SecureConfigManager {
  private encryptionKey: string;
  
  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  encryptSensitiveData(data: any): string {
    const crypto = require('crypto');
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }

  decryptSensitiveData(encryptedData: string): any {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  sanitizeForLogging(config: any): any {
    const sensitiveKeys = [
      'password',
      'apiKey',
      'secret',
      'token',
      'key',
      'connectionString'
    ];

    const sanitized = JSON.parse(JSON.stringify(config));
    
    this.deepSanitize(sanitized, sensitiveKeys);
    
    return sanitized;
  }

  private deepSanitize(obj: any, sensitiveKeys: string[]): void {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.deepSanitize(obj[key], sensitiveKeys);
      } else if (sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive.toLowerCase())
      )) {
        obj[key] = '***REDACTED***';
      }
    }
  }

  validateConfigSecurity(config: AppConfig): SecurityValidation {
    const issues: SecurityIssue[] = [];

    // Check for insecure protocols
    if (config.api?.baseUrl?.startsWith('http://')) {
      issues.push({
        severity: 'high',
        message: 'API using insecure HTTP protocol',
        recommendation: 'Use HTTPS for API communication'
      });
    }

    // Check for default passwords
    if (config.database?.password === 'password' || 
        config.database?.password === 'admin') {
      issues.push({
        severity: 'critical',
        message: 'Default password detected',
        recommendation: 'Change to a strong, unique password'
      });
    }

    // Check for weak encryption keys
    if (config.security?.encryptionKey && 
        config.security.encryptionKey.length < 32) {
      issues.push({
        severity: 'high',
        message: 'Weak encryption key',
        recommendation: 'Use a 32+ character encryption key'
      });
    }

    return {
      secure: issues.length === 0,
      issues
    };
  }
}

interface SecurityValidation {
  secure: boolean;
  issues: SecurityIssue[];
}

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}
```

---

## Testing Configuration

### Configuration Testing Suite

```typescript
// src/config/__tests__/config-manager.test.ts
import { ConfigManager } from '../config-manager';
import { EnvironmentConfigLoader } from '../env-loader';
import { UserConfigLoader } from '../user-config';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = ConfigManager.getInstance();
  });

  afterEach(() => {
    // Reset singleton instance
    (ConfigManager as any).instance = null;
  });

  describe('Configuration Loading', () => {
    it('should load default configuration', async () => {
      const config = await configManager.initialize();
      
      expect(config.app.name).toBe('CNC Jog Controls');
      expect(config.machine.type).toBeDefined();
      expect(config.api.baseUrl).toBeDefined();
    });

    it('should merge configurations in correct priority order', async () => {
      // Mock environment override
      process.env.API_BASE_URL = 'https://test-api.com';
      
      const config = await configManager.initialize();
      
      expect(config.api.baseUrl).toBe('https://test-api.com');
    });

    it('should validate configuration after loading', async () => {
      await expect(configManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('Configuration Access', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    it('should get configuration values by path', () => {
      const machineType = configManager.get<string>('machine.type');
      expect(['grbl', 'marlin', 'simulator']).toContain(machineType);
    });

    it('should set configuration values', () => {
      configManager.set('machine.safetyEnabled', false);
      
      const safetyEnabled = configManager.get<boolean>('machine.safetyEnabled');
      expect(safetyEnabled).toBe(false);
    });

    it('should notify watchers when values change', () => {
      const watcher = jest.fn();
      configManager.watch('machine.safetyEnabled', watcher);
      
      configManager.set('machine.safetyEnabled', false);
      
      expect(watcher).toHaveBeenCalledWith(
        'machine.safetyEnabled',
        true, // old value
        false // new value
      );
    });
  });

  describe('Configuration Persistence', () => {
    it('should save user configuration', async () => {
      const mockSave = jest.spyOn(UserConfigLoader, 'saveUserConfig');
      mockSave.mockResolvedValue();

      await configManager.initialize();
      configManager.set('ui.theme', 'dark');

      // Trigger save (implementation would call this automatically)
      await UserConfigLoader.saveUserConfig({
        ui: { theme: 'dark' }
      });

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration files gracefully', async () => {
      // Mock file not found
      jest.spyOn(require('fs/promises'), 'readFile')
        .mockRejectedValue(new Error('ENOENT'));

      await expect(configManager.initialize()).resolves.not.toThrow();
    });

    it('should handle invalid JSON gracefully', async () => {
      // Mock invalid JSON
      jest.spyOn(require('fs/promises'), 'readFile')
        .mockResolvedValue('invalid json');

      await expect(configManager.initialize()).resolves.not.toThrow();
    });
  });
});

describe('EnvironmentConfigLoader', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.NODE_ENV;
    delete process.env.API_BASE_URL;
    delete process.env.MACHINE_TYPE;
  });

  it('should load configuration from environment variables', () => {
    process.env.NODE_ENV = 'production';
    process.env.API_BASE_URL = 'https://api.example.com';
    process.env.MACHINE_TYPE = 'grbl';

    const config = EnvironmentConfigLoader.loadFromEnvironment();

    expect(config.app?.environment).toBe('production');
    expect(config.api?.baseUrl).toBe('https://api.example.com');
    expect(config.machine?.type).toBe('grbl');
  });

  it('should validate required environment variables', () => {
    process.env.NODE_ENV = 'production';
    // Missing required variables

    const validation = EnvironmentConfigLoader.validateEnvironment();

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Missing required environment variable: API_BASE_URL');
  });
});
```

---

## Troubleshooting

### Common Configuration Issues

#### 1. **Configuration Loading Failures**

```typescript
// Debug configuration loading
const debugConfigLoading = async () => {
  console.log('=== Configuration Loading Debug ===');
  
  try {
    // Check default config
    const defaultConfig = await loadDefaultConfig();
    console.log('✓ Default config loaded');
  } catch (error) {
    console.error('✗ Default config failed:', error);
  }

  try {
    // Check user config
    const userConfig = await UserConfigLoader.loadUserConfig();
    console.log('✓ User config loaded');
  } catch (error) {
    console.error('✗ User config failed:', error);
  }

  try {
    // Check environment config
    const envConfig = EnvironmentConfigLoader.loadFromEnvironment();
    console.log('✓ Environment config loaded');
  } catch (error) {
    console.error('✗ Environment config failed:', error);
  }
};
```

#### 2. **Permission Issues**

```bash
# Fix config directory permissions
chmod 755 ~/.cnc-controls
chmod 644 ~/.cnc-controls/config.json

# Check file ownership
ls -la ~/.cnc-controls/
```

#### 3. **Configuration Validation Errors**

```typescript
// Validate specific configuration sections
const validateConfig = (config: AppConfig) => {
  const sections = ['app', 'machine', 'api', 'ui', 'database'];
  
  for (const section of sections) {
    const validation = ConfigValidator.validateSection(section, config[section]);
    
    if (!validation.valid) {
      console.error(`${section} validation failed:`, validation.errors);
    } else {
      console.log(`✓ ${section} configuration valid`);
    }
  }
};
```

This comprehensive configuration data retrieval guide provides everything needed to understand and work with the configuration system in the CNC Jog Controls application. It covers loading strategies, validation, security, and troubleshooting for a robust configuration management system.