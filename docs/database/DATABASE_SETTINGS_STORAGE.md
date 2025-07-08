# Database Settings Storage Guide

## Overview

The CNC Jog Controls application uses a sophisticated database settings storage system that handles user preferences, machine configurations, job history, plugin data, and application state. This guide covers database architecture, storage patterns, synchronization, and best practices for managing settings in a distributed environment.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Settings Storage Schema](#settings-storage-schema)
3. [Storage Patterns](#storage-patterns)
4. [User Settings Management](#user-settings-management)
5. [Machine Configuration Storage](#machine-configuration-storage)
6. [Plugin Settings Storage](#plugin-settings-storage)
7. [Synchronization Strategies](#synchronization-strategies)
8. [Performance Optimization](#performance-optimization)
9. [Backup and Recovery](#backup-and-recovery)
10. [Security and Encryption](#security-and-encryption)
11. [Migration and Versioning](#migration-and-versioning)
12. [Troubleshooting](#troubleshooting)

---

## Database Architecture

### Database Structure Overview

```
CNC Controls Database
├── users/                    # User accounts and profiles
├── settings/                 # Application and user settings
├── machines/                 # Machine configurations
├── jobs/                     # Job history and tracking
├── plugins/                  # Plugin configurations and data
├── workspaces/               # Workspace definitions
├── audit_logs/               # Change tracking and auditing
└── system/                   # System-level configurations
```

### Connection Configuration

```typescript
// src/services/database/connection.ts
export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  idleTimeout: number;
  schema?: string;
}

export class DatabaseConnectionManager {
  private connection: any = null;
  private config: DatabaseConfig;
  private pool: any = null;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'postgresql':
          await this.connectPostgreSQL();
          break;
        case 'mysql':
          await this.connectMySQL();
          break;
        case 'sqlite':
          await this.connectSQLite();
          break;
        case 'mongodb':
          await this.connectMongoDB();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.config.type}`);
      }

      console.log(`Connected to ${this.config.type} database`);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  private async connectPostgreSQL(): Promise<void> {
    const { Pool } = require('pg');
    
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.poolSize,
      connectionTimeoutMillis: this.config.connectionTimeout,
      idleTimeoutMillis: this.config.idleTimeout
    });

    // Test connection
    const client = await this.pool.connect();
    await client.query('SELECT NOW()');
    client.release();
  }

  private async connectSQLite(): Promise<void> {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');

    this.connection = await open({
      filename: this.config.database,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await this.connection.exec('PRAGMA foreign_keys = ON');
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (this.config.type === 'sqlite') {
        return await this.connection.all(sql, params);
      } else {
        const client = await this.pool.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
```

---

## Settings Storage Schema

### Database Schema Definition

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table - hierarchical key-value storage
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(50) NOT NULL,
  is_encrypted BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, key)
);

-- Machine configurations
CREATE TABLE machine_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  machine_type VARCHAR(50) NOT NULL,
  configuration JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plugin settings
CREATE TABLE plugin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plugin_id VARCHAR(255) NOT NULL,
  plugin_version VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  auto_update BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, plugin_id)
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workspace_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job history
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machine_configurations(id),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  gcode TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_settings_user_category ON settings(user_id, category);
CREATE INDEX idx_settings_category_key ON settings(category, key);
CREATE INDEX idx_machine_configurations_user ON machine_configurations(user_id);
CREATE INDEX idx_plugin_settings_user_plugin ON plugin_settings(user_id, plugin_id);
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_audit_log_user_table ON audit_log(user_id, table_name);
```

### TypeScript Schema Definitions

```typescript
// src/types/database.ts
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: string;
  userId?: string;
  category: SettingCategory;
  key: string;
  value: any;
  valueType: SettingValueType;
  isEncrypted: boolean;
  isSystem: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MachineConfiguration {
  id: string;
  userId: string;
  name: string;
  description?: string;
  machineType: MachineType;
  configuration: MachineConfig;
  isDefault: boolean;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginSetting {
  id: string;
  userId: string;
  pluginId: string;
  pluginVersion: string;
  settings: Record<string, any>;
  enabled: boolean;
  autoUpdate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'operator' | 'user';
export type SettingCategory = 'ui' | 'machine' | 'api' | 'security' | 'plugin' | 'workspace' | 'system';
export type SettingValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';
export type MachineType = 'grbl' | 'marlin' | 'simulator' | 'custom';
```

---

## Storage Patterns

### Settings Storage Service

```typescript
// src/services/database/settings-storage.ts
export class SettingsStorageService {
  private db: DatabaseConnectionManager;
  private cache: Map<string, any> = new Map();
  private encryptionService: EncryptionService;

  constructor(db: DatabaseConnectionManager, encryptionService: EncryptionService) {
    this.db = db;
    this.encryptionService = encryptionService;
  }

  async getSetting<T>(
    userId: string | null,
    category: SettingCategory,
    key: string
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(userId, category, key);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const sql = `
        SELECT value, value_type, is_encrypted 
        FROM settings 
        WHERE (user_id = $1 OR (user_id IS NULL AND is_system = true))
          AND category = $2 
          AND key = $3
        ORDER BY user_id NULLS LAST
        LIMIT 1
      `;

      const results = await this.db.query(sql, [userId, category, key]);
      
      if (results.length === 0) {
        return null;
      }

      const setting = results[0];
      let value = setting.value;

      // Decrypt if necessary
      if (setting.is_encrypted) {
        value = this.encryptionService.decrypt(value);
      }

      // Parse based on value type
      value = this.parseValue(value, setting.value_type);

      // Cache the result
      this.cache.set(cacheKey, value);

      return value;
    } catch (error) {
      console.error('Failed to get setting:', error);
      throw error;
    }
  }

  async setSetting<T>(
    userId: string | null,
    category: SettingCategory,
    key: string,
    value: T,
    options: SetSettingOptions = {}
  ): Promise<void> {
    try {
      const valueType = this.getValueType(value);
      const shouldEncrypt = options.encrypt || this.shouldEncryptSetting(category, key);
      
      let processedValue = value;
      if (shouldEncrypt) {
        processedValue = this.encryptionService.encrypt(JSON.stringify(value)) as T;
      }

      const sql = `
        INSERT INTO settings (user_id, category, key, value, value_type, is_encrypted, is_system)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, category, key)
        DO UPDATE SET 
          value = EXCLUDED.value,
          value_type = EXCLUDED.value_type,
          is_encrypted = EXCLUDED.is_encrypted,
          version = settings.version + 1,
          updated_at = CURRENT_TIMESTAMP
      `;

      await this.db.query(sql, [
        userId,
        category,
        key,
        JSON.stringify(processedValue),
        valueType,
        shouldEncrypt,
        options.isSystem || false
      ]);

      // Update cache
      const cacheKey = this.getCacheKey(userId, category, key);
      this.cache.set(cacheKey, value);

      // Log the change
      await this.logSettingChange(userId, category, key, value);

    } catch (error) {
      console.error('Failed to set setting:', error);
      throw error;
    }
  }

  async getSettingsByCategory<T>(
    userId: string | null,
    category: SettingCategory
  ): Promise<Record<string, T>> {
    try {
      const sql = `
        SELECT key, value, value_type, is_encrypted
        FROM settings
        WHERE (user_id = $1 OR (user_id IS NULL AND is_system = true))
          AND category = $2
        ORDER BY user_id NULLS LAST, key
      `;

      const results = await this.db.query(sql, [userId, category]);
      const settings: Record<string, T> = {};

      for (const row of results) {
        let value = row.value;

        if (row.is_encrypted) {
          value = this.encryptionService.decrypt(value);
        }

        settings[row.key] = this.parseValue(value, row.value_type);
      }

      return settings;
    } catch (error) {
      console.error('Failed to get settings by category:', error);
      throw error;
    }
  }

  async deleteSetting(
    userId: string | null,
    category: SettingCategory,
    key: string
  ): Promise<void> {
    try {
      const sql = `
        DELETE FROM settings 
        WHERE user_id = $1 AND category = $2 AND key = $3
      `;

      await this.db.query(sql, [userId, category, key]);

      // Remove from cache
      const cacheKey = this.getCacheKey(userId, category, key);
      this.cache.delete(cacheKey);

      // Log the deletion
      await this.logSettingChange(userId, category, key, null, 'DELETE');

    } catch (error) {
      console.error('Failed to delete setting:', error);
      throw error;
    }
  }

  async bulkSetSettings(
    userId: string | null,
    category: SettingCategory,
    settings: Record<string, any>
  ): Promise<void> {
    const transaction = await this.db.beginTransaction();
    
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.setSetting(userId, category, key, value);
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private getCacheKey(userId: string | null, category: string, key: string): string {
    return `${userId || 'system'}:${category}:${key}`;
  }

  private getValueType(value: any): SettingValueType {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return typeof value as SettingValueType;
  }

  private parseValue(value: any, valueType: SettingValueType): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  private shouldEncryptSetting(category: SettingCategory, key: string): boolean {
    const sensitiveKeys = [
      'password', 'apiKey', 'secret', 'token', 'connectionString'
    ];
    
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    );
  }

  private async logSettingChange(
    userId: string | null,
    category: SettingCategory,
    key: string,
    newValue: any,
    action: string = 'UPDATE'
  ): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_log (user_id, table_name, record_id, action, new_values)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await this.db.query(sql, [
        userId,
        'settings',
        `${category}:${key}`,
        action,
        JSON.stringify({ category, key, value: newValue })
      ]);
    } catch (error) {
      console.error('Failed to log setting change:', error);
      // Don't throw - logging failure shouldn't break the main operation
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export interface SetSettingOptions {
  encrypt?: boolean;
  isSystem?: boolean;
}
```

---

## User Settings Management

### User Settings API

```typescript
// src/services/database/user-settings.ts
export class UserSettingsService {
  private settingsStorage: SettingsStorageService;

  constructor(settingsStorage: SettingsStorageService) {
    this.settingsStorage = settingsStorage;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const uiSettings = await this.settingsStorage.getSettingsByCategory<any>(userId, 'ui');
    const machineSettings = await this.settingsStorage.getSettingsByCategory<any>(userId, 'machine');
    const workspaceSettings = await this.settingsStorage.getSettingsByCategory<any>(userId, 'workspace');

    return {
      ui: {
        theme: uiSettings.theme || 'cnc-controls',
        language: uiSettings.language || 'en',
        notifications: uiSettings.notifications || { enabled: true, position: 'top-right' },
        autoSave: uiSettings.autoSave !== false,
        confirmActions: uiSettings.confirmActions !== false
      },
      machine: {
        defaultType: machineSettings.defaultType || 'simulator',
        units: machineSettings.units || 'mm',
        safetyEnabled: machineSettings.safetyEnabled !== false,
        jogIncrement: machineSettings.jogIncrement || 1
      },
      workspace: {
        defaultWorkspace: workspaceSettings.defaultWorkspace,
        showGrid: workspaceSettings.showGrid !== false,
        gridSize: workspaceSettings.gridSize || 10,
        showRuler: workspaceSettings.showRuler !== false
      }
    };
  }

  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const updates: Array<{ category: SettingCategory; key: string; value: any }> = [];

    if (preferences.ui) {
      Object.entries(preferences.ui).forEach(([key, value]) => {
        updates.push({ category: 'ui', key, value });
      });
    }

    if (preferences.machine) {
      Object.entries(preferences.machine).forEach(([key, value]) => {
        updates.push({ category: 'machine', key, value });
      });
    }

    if (preferences.workspace) {
      Object.entries(preferences.workspace).forEach(([key, value]) => {
        updates.push({ category: 'workspace', key, value });
      });
    }

    // Apply all updates
    for (const update of updates) {
      await this.settingsStorage.setSetting(
        userId,
        update.category,
        update.key,
        update.value
      );
    }
  }

  async resetUserPreferences(userId: string): Promise<void> {
    const categories: SettingCategory[] = ['ui', 'machine', 'workspace'];
    
    for (const category of categories) {
      const settings = await this.settingsStorage.getSettingsByCategory(userId, category);
      
      for (const key of Object.keys(settings)) {
        await this.settingsStorage.deleteSetting(userId, category, key);
      }
    }
  }

  async exportUserSettings(userId: string): Promise<UserSettingsExport> {
    const preferences = await this.getUserPreferences(userId);
    const machineConfigs = await this.getMachineConfigurations(userId);
    const pluginSettings = await this.getPluginSettings(userId);

    return {
      version: '1.0',
      exportDate: new Date(),
      userId,
      preferences,
      machineConfigurations: machineConfigs,
      pluginSettings,
      metadata: {
        appVersion: '1.0.0',
        exportedBy: 'CNC Controls'
      }
    };
  }

  async importUserSettings(
    userId: string, 
    settingsData: UserSettingsExport
  ): Promise<void> {
    // Validate import data
    if (settingsData.version !== '1.0') {
      throw new Error('Unsupported settings export version');
    }

    // Import preferences
    if (settingsData.preferences) {
      await this.updateUserPreferences(userId, settingsData.preferences);
    }

    // Import machine configurations
    if (settingsData.machineConfigurations) {
      for (const config of settingsData.machineConfigurations) {
        await this.saveMachineConfiguration(userId, {
          ...config,
          id: undefined // Generate new ID
        });
      }
    }

    // Import plugin settings
    if (settingsData.pluginSettings) {
      for (const pluginSetting of settingsData.pluginSettings) {
        await this.savePluginSettings(userId, pluginSetting.pluginId, pluginSetting.settings);
      }
    }
  }

  private async getMachineConfigurations(userId: string): Promise<MachineConfiguration[]> {
    const sql = `
      SELECT * FROM machine_configurations 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    return await this.settingsStorage.db.query(sql, [userId]);
  }

  private async getPluginSettings(userId: string): Promise<PluginSetting[]> {
    const sql = `
      SELECT * FROM plugin_settings 
      WHERE user_id = $1 
      ORDER BY plugin_id
    `;
    
    return await this.settingsStorage.db.query(sql, [userId]);
  }

  private async saveMachineConfiguration(
    userId: string, 
    config: Partial<MachineConfiguration>
  ): Promise<string> {
    const sql = `
      INSERT INTO machine_configurations (user_id, name, description, machine_type, configuration, is_default, is_shared)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await this.settingsStorage.db.query(sql, [
      userId,
      config.name,
      config.description,
      config.machineType,
      JSON.stringify(config.configuration),
      config.isDefault || false,
      config.isShared || false
    ]);

    return result[0].id;
  }

  private async savePluginSettings(
    userId: string,
    pluginId: string,
    settings: Record<string, any>
  ): Promise<void> {
    const sql = `
      INSERT INTO plugin_settings (user_id, plugin_id, plugin_version, settings, enabled)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, plugin_id)
      DO UPDATE SET 
        settings = EXCLUDED.settings,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.settingsStorage.db.query(sql, [
      userId,
      pluginId,
      '1.0.0', // Default version
      JSON.stringify(settings),
      true
    ]);
  }
}

export interface UserPreferences {
  ui: {
    theme: string;
    language: string;
    notifications: {
      enabled: boolean;
      position: string;
    };
    autoSave: boolean;
    confirmActions: boolean;
  };
  machine: {
    defaultType: string;
    units: string;
    safetyEnabled: boolean;
    jogIncrement: number;
  };
  workspace: {
    defaultWorkspace?: string;
    showGrid: boolean;
    gridSize: number;
    showRuler: boolean;
  };
}

export interface UserSettingsExport {
  version: string;
  exportDate: Date;
  userId: string;
  preferences: UserPreferences;
  machineConfigurations: MachineConfiguration[];
  pluginSettings: PluginSetting[];
  metadata: {
    appVersion: string;
    exportedBy: string;
  };
}
```

---

## Machine Configuration Storage

### Machine Configuration Service

```typescript
// src/services/database/machine-config-storage.ts
export class MachineConfigurationService {
  private settingsStorage: SettingsStorageService;
  private db: DatabaseConnectionManager;

  constructor(settingsStorage: SettingsStorageService, db: DatabaseConnectionManager) {
    this.settingsStorage = settingsStorage;
    this.db = db;
  }

  async createMachineConfiguration(
    userId: string,
    config: CreateMachineConfigRequest
  ): Promise<MachineConfiguration> {
    try {
      const sql = `
        INSERT INTO machine_configurations (
          user_id, name, description, machine_type, configuration, is_default, is_shared
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await this.db.query(sql, [
        userId,
        config.name,
        config.description,
        config.machineType,
        JSON.stringify(config.configuration),
        config.isDefault || false,
        config.isShared || false
      ]);

      const machineConfig = result[0];

      // If this is set as default, unset other defaults
      if (config.isDefault) {
        await this.updateDefaultConfiguration(userId, machineConfig.id);
      }

      return this.mapDatabaseToMachineConfig(machineConfig);
    } catch (error) {
      console.error('Failed to create machine configuration:', error);
      throw error;
    }
  }

  async getMachineConfiguration(
    userId: string,
    configId: string
  ): Promise<MachineConfiguration | null> {
    try {
      const sql = `
        SELECT * FROM machine_configurations 
        WHERE id = $1 AND (user_id = $2 OR is_shared = true)
      `;

      const result = await this.db.query(sql, [configId, userId]);
      
      if (result.length === 0) {
        return null;
      }

      return this.mapDatabaseToMachineConfig(result[0]);
    } catch (error) {
      console.error('Failed to get machine configuration:', error);
      throw error;
    }
  }

  async getUserMachineConfigurations(userId: string): Promise<MachineConfiguration[]> {
    try {
      const sql = `
        SELECT * FROM machine_configurations 
        WHERE user_id = $1 OR is_shared = true
        ORDER BY is_default DESC, created_at DESC
      `;

      const results = await this.db.query(sql, [userId]);
      
      return results.map(this.mapDatabaseToMachineConfig);
    } catch (error) {
      console.error('Failed to get user machine configurations:', error);
      throw error;
    }
  }

  async updateMachineConfiguration(
    userId: string,
    configId: string,
    updates: UpdateMachineConfigRequest
  ): Promise<MachineConfiguration> {
    try {
      // Check ownership
      const existing = await this.getMachineConfiguration(userId, configId);
      if (!existing || existing.userId !== userId) {
        throw new Error('Configuration not found or access denied');
      }

      const sql = `
        UPDATE machine_configurations 
        SET 
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          machine_type = COALESCE($5, machine_type),
          configuration = COALESCE($6, configuration),
          is_default = COALESCE($7, is_default),
          is_shared = COALESCE($8, is_shared),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await this.db.query(sql, [
        configId,
        userId,
        updates.name,
        updates.description,
        updates.machineType,
        updates.configuration ? JSON.stringify(updates.configuration) : null,
        updates.isDefault,
        updates.isShared
      ]);

      if (result.length === 0) {
        throw new Error('Failed to update configuration');
      }

      // Handle default configuration logic
      if (updates.isDefault) {
        await this.updateDefaultConfiguration(userId, configId);
      }

      return this.mapDatabaseToMachineConfig(result[0]);
    } catch (error) {
      console.error('Failed to update machine configuration:', error);
      throw error;
    }
  }

  async deleteMachineConfiguration(userId: string, configId: string): Promise<void> {
    try {
      // Check ownership
      const existing = await this.getMachineConfiguration(userId, configId);
      if (!existing || existing.userId !== userId) {
        throw new Error('Configuration not found or access denied');
      }

      const sql = `
        DELETE FROM machine_configurations 
        WHERE id = $1 AND user_id = $2
      `;

      await this.db.query(sql, [configId, userId]);
    } catch (error) {
      console.error('Failed to delete machine configuration:', error);
      throw error;
    }
  }

  async getDefaultMachineConfiguration(userId: string): Promise<MachineConfiguration | null> {
    try {
      const sql = `
        SELECT * FROM machine_configurations 
        WHERE user_id = $1 AND is_default = true
        LIMIT 1
      `;

      const result = await this.db.query(sql, [userId]);
      
      if (result.length === 0) {
        return null;
      }

      return this.mapDatabaseToMachineConfig(result[0]);
    } catch (error) {
      console.error('Failed to get default machine configuration:', error);
      throw error;
    }
  }

  async cloneMachineConfiguration(
    userId: string,
    sourceConfigId: string,
    newName: string
  ): Promise<MachineConfiguration> {
    try {
      const sourceConfig = await this.getMachineConfiguration(userId, sourceConfigId);
      if (!sourceConfig) {
        throw new Error('Source configuration not found');
      }

      const cloneRequest: CreateMachineConfigRequest = {
        name: newName,
        description: `Cloned from ${sourceConfig.name}`,
        machineType: sourceConfig.machineType,
        configuration: sourceConfig.configuration,
        isDefault: false,
        isShared: false
      };

      return await this.createMachineConfiguration(userId, cloneRequest);
    } catch (error) {
      console.error('Failed to clone machine configuration:', error);
      throw error;
    }
  }

  private async updateDefaultConfiguration(userId: string, newDefaultId: string): Promise<void> {
    const sql = `
      UPDATE machine_configurations 
      SET is_default = CASE WHEN id = $2 THEN true ELSE false END
      WHERE user_id = $1
    `;

    await this.db.query(sql, [userId, newDefaultId]);
  }

  private mapDatabaseToMachineConfig(dbRow: any): MachineConfiguration {
    return {
      id: dbRow.id,
      userId: dbRow.user_id,
      name: dbRow.name,
      description: dbRow.description,
      machineType: dbRow.machine_type,
      configuration: typeof dbRow.configuration === 'string' 
        ? JSON.parse(dbRow.configuration) 
        : dbRow.configuration,
      isDefault: dbRow.is_default,
      isShared: dbRow.is_shared,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }
}

export interface CreateMachineConfigRequest {
  name: string;
  description?: string;
  machineType: MachineType;
  configuration: MachineConfig;
  isDefault?: boolean;
  isShared?: boolean;
}

export interface UpdateMachineConfigRequest {
  name?: string;
  description?: string;
  machineType?: MachineType;
  configuration?: MachineConfig;
  isDefault?: boolean;
  isShared?: boolean;
}
```

---

## Plugin Settings Storage

### Plugin Settings Service

```typescript
// src/services/database/plugin-settings-storage.ts
export class PluginSettingsService {
  private db: DatabaseConnectionManager;

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
  }

  async getPluginSettings(userId: string, pluginId: string): Promise<PluginSetting | null> {
    try {
      const sql = `
        SELECT * FROM plugin_settings 
        WHERE user_id = $1 AND plugin_id = $2
      `;

      const result = await this.db.query(sql, [userId, pluginId]);
      
      if (result.length === 0) {
        return null;
      }

      return this.mapDatabaseToPluginSetting(result[0]);
    } catch (error) {
      console.error('Failed to get plugin settings:', error);
      throw error;
    }
  }

  async savePluginSettings(
    userId: string,
    pluginId: string,
    pluginVersion: string,
    settings: Record<string, any>
  ): Promise<PluginSetting> {
    try {
      const sql = `
        INSERT INTO plugin_settings (user_id, plugin_id, plugin_version, settings, enabled)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, plugin_id)
        DO UPDATE SET 
          plugin_version = EXCLUDED.plugin_version,
          settings = EXCLUDED.settings,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await this.db.query(sql, [
        userId,
        pluginId,
        pluginVersion,
        JSON.stringify(settings),
        true
      ]);

      return this.mapDatabaseToPluginSetting(result[0]);
    } catch (error) {
      console.error('Failed to save plugin settings:', error);
      throw error;
    }
  }

  async updatePluginSetting(
    userId: string,
    pluginId: string,
    settingKey: string,
    settingValue: any
  ): Promise<void> {
    try {
      // Get current settings
      const currentSettings = await this.getPluginSettings(userId, pluginId);
      if (!currentSettings) {
        throw new Error('Plugin settings not found');
      }

      // Update the specific setting
      const updatedSettings = {
        ...currentSettings.settings,
        [settingKey]: settingValue
      };

      const sql = `
        UPDATE plugin_settings 
        SET settings = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND plugin_id = $2
      `;

      await this.db.query(sql, [userId, pluginId, JSON.stringify(updatedSettings)]);
    } catch (error) {
      console.error('Failed to update plugin setting:', error);
      throw error;
    }
  }

  async enablePlugin(userId: string, pluginId: string): Promise<void> {
    await this.setPluginEnabled(userId, pluginId, true);
  }

  async disablePlugin(userId: string, pluginId: string): Promise<void> {
    await this.setPluginEnabled(userId, pluginId, false);
  }

  private async setPluginEnabled(
    userId: string,
    pluginId: string,
    enabled: boolean
  ): Promise<void> {
    try {
      const sql = `
        UPDATE plugin_settings 
        SET enabled = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND plugin_id = $2
      `;

      await this.db.query(sql, [userId, pluginId, enabled]);
    } catch (error) {
      console.error('Failed to set plugin enabled status:', error);
      throw error;
    }
  }

  async getAllUserPluginSettings(userId: string): Promise<PluginSetting[]> {
    try {
      const sql = `
        SELECT * FROM plugin_settings 
        WHERE user_id = $1 
        ORDER BY plugin_id
      `;

      const results = await this.db.query(sql, [userId]);
      
      return results.map(this.mapDatabaseToPluginSetting);
    } catch (error) {
      console.error('Failed to get all user plugin settings:', error);
      throw error;
    }
  }

  async deletePluginSettings(userId: string, pluginId: string): Promise<void> {
    try {
      const sql = `
        DELETE FROM plugin_settings 
        WHERE user_id = $1 AND plugin_id = $2
      `;

      await this.db.query(sql, [userId, pluginId]);
    } catch (error) {
      console.error('Failed to delete plugin settings:', error);
      throw error;
    }
  }

  async getPluginSettingValue<T>(
    userId: string,
    pluginId: string,
    settingKey: string,
    defaultValue?: T
  ): Promise<T | undefined> {
    try {
      const pluginSettings = await this.getPluginSettings(userId, pluginId);
      
      if (!pluginSettings || !pluginSettings.settings) {
        return defaultValue;
      }

      return pluginSettings.settings[settingKey] ?? defaultValue;
    } catch (error) {
      console.error('Failed to get plugin setting value:', error);
      return defaultValue;
    }
  }

  async bulkUpdatePluginSettings(
    userId: string,
    pluginId: string,
    settings: Record<string, any>
  ): Promise<void> {
    try {
      // Get current settings
      const currentSettings = await this.getPluginSettings(userId, pluginId);
      if (!currentSettings) {
        throw new Error('Plugin settings not found');
      }

      // Merge with new settings
      const mergedSettings = {
        ...currentSettings.settings,
        ...settings
      };

      const sql = `
        UPDATE plugin_settings 
        SET settings = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND plugin_id = $2
      `;

      await this.db.query(sql, [userId, pluginId, JSON.stringify(mergedSettings)]);
    } catch (error) {
      console.error('Failed to bulk update plugin settings:', error);
      throw error;
    }
  }

  private mapDatabaseToPluginSetting(dbRow: any): PluginSetting {
    return {
      id: dbRow.id,
      userId: dbRow.user_id,
      pluginId: dbRow.plugin_id,
      pluginVersion: dbRow.plugin_version,
      settings: typeof dbRow.settings === 'string' 
        ? JSON.parse(dbRow.settings) 
        : dbRow.settings,
      enabled: dbRow.enabled,
      autoUpdate: dbRow.auto_update,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };
  }
}
```

---

## Synchronization Strategies

### Multi-Device Synchronization

```typescript
// src/services/database/sync-service.ts
export class DatabaseSyncService {
  private db: DatabaseConnectionManager;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: Map<string, Date> = new Map();

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
    this.setupConnectivityMonitoring();
  }

  async syncUserData(userId: string): Promise<SyncResult> {
    const syncResult: SyncResult = {
      success: true,
      syncedTables: [],
      conflicts: [],
      errors: []
    };

    try {
      // Sync settings
      await this.syncSettings(userId, syncResult);
      
      // Sync machine configurations
      await this.syncMachineConfigurations(userId, syncResult);
      
      // Sync plugin settings
      await this.syncPluginSettings(userId, syncResult);
      
      // Sync workspaces
      await this.syncWorkspaces(userId, syncResult);

      // Update last sync timestamp
      this.lastSyncTimestamp.set(userId, new Date());

    } catch (error) {
      syncResult.success = false;
      syncResult.errors.push(error.message);
    }

    return syncResult;
  }

  private async syncSettings(userId: string, syncResult: SyncResult): Promise<void> {
    const lastSync = this.lastSyncTimestamp.get(userId);
    
    // Get local changes since last sync
    const localChanges = await this.getLocalChanges('settings', userId, lastSync);
    
    // Get remote changes since last sync
    const remoteChanges = await this.getRemoteChanges('settings', userId, lastSync);
    
    // Resolve conflicts
    const conflicts = this.detectConflicts(localChanges, remoteChanges);
    syncResult.conflicts.push(...conflicts);
    
    // Apply non-conflicting changes
    await this.applyRemoteChanges(remoteChanges.filter(change => 
      !conflicts.some(conflict => conflict.recordId === change.id)
    ));
    
    // Push local changes
    await this.pushLocalChanges(localChanges.filter(change =>
      !conflicts.some(conflict => conflict.recordId === change.id)
    ));
    
    syncResult.syncedTables.push('settings');
  }

  private async syncMachineConfigurations(userId: string, syncResult: SyncResult): Promise<void> {
    // Similar implementation for machine configurations
    syncResult.syncedTables.push('machine_configurations');
  }

  private async syncPluginSettings(userId: string, syncResult: SyncResult): Promise<void> {
    // Similar implementation for plugin settings
    syncResult.syncedTables.push('plugin_settings');
  }

  private async syncWorkspaces(userId: string, syncResult: SyncResult): Promise<void> {
    // Similar implementation for workspaces
    syncResult.syncedTables.push('workspaces');
  }

  async queueOfflineChange(operation: SyncOperation): Promise<void> {
    this.syncQueue.push(operation);
    
    // Try to process queue if online
    if (this.isOnline) {
      await this.processQueuedOperations();
    }
  }

  private async processQueuedOperations(): Promise<void> {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const operation = this.syncQueue.shift()!;
      
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Failed to process queued operation:', error);
        // Re-queue for retry
        this.syncQueue.unshift(operation);
        break;
      }
    }
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'INSERT':
        await this.db.query(operation.sql, operation.params);
        break;
      case 'UPDATE':
        await this.db.query(operation.sql, operation.params);
        break;
      case 'DELETE':
        await this.db.query(operation.sql, operation.params);
        break;
    }
  }

  private setupConnectivityMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueuedOperations();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      this.isOnline = navigator.onLine;
    }
  }

  private async getLocalChanges(
    table: string,
    userId: string,
    since?: Date
  ): Promise<DatabaseChange[]> {
    const sql = `
      SELECT * FROM audit_log 
      WHERE user_id = $1 
        AND table_name = $2 
        AND created_at > $3
      ORDER BY created_at
    `;

    const results = await this.db.query(sql, [
      userId,
      table,
      since || new Date(0)
    ]);

    return results.map(this.mapToChange);
  }

  private async getRemoteChanges(
    table: string,
    userId: string,
    since?: Date
  ): Promise<DatabaseChange[]> {
    // Implementation would make API call to get remote changes
    // This is a placeholder
    return [];
  }

  private detectConflicts(
    localChanges: DatabaseChange[],
    remoteChanges: DatabaseChange[]
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const localChange of localChanges) {
      const conflictingRemoteChange = remoteChanges.find(remote =>
        remote.recordId === localChange.recordId &&
        remote.timestamp > localChange.timestamp
      );

      if (conflictingRemoteChange) {
        conflicts.push({
          recordId: localChange.recordId,
          localChange,
          remoteChange: conflictingRemoteChange,
          conflictType: 'concurrent_modification'
        });
      }
    }

    return conflicts;
  }

  private async applyRemoteChanges(changes: DatabaseChange[]): Promise<void> {
    for (const change of changes) {
      // Apply the remote change to local database
      await this.executeOperation({
        type: change.action,
        sql: change.sql,
        params: change.params
      });
    }
  }

  private async pushLocalChanges(changes: DatabaseChange[]): Promise<void> {
    // Implementation would push changes to remote server
    // This is a placeholder
  }

  private mapToChange(dbRow: any): DatabaseChange {
    return {
      id: dbRow.id,
      recordId: dbRow.record_id,
      action: dbRow.action,
      tableName: dbRow.table_name,
      timestamp: dbRow.created_at,
      userId: dbRow.user_id,
      sql: '', // Would be reconstructed from the change data
      params: []
    };
  }
}

export interface SyncOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  sql: string;
  params: any[];
}

export interface SyncResult {
  success: boolean;
  syncedTables: string[];
  conflicts: SyncConflict[];
  errors: string[];
}

export interface SyncConflict {
  recordId: string;
  localChange: DatabaseChange;
  remoteChange: DatabaseChange;
  conflictType: 'concurrent_modification' | 'deleted_modified' | 'modified_deleted';
}

export interface DatabaseChange {
  id: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  tableName: string;
  timestamp: Date;
  userId: string;
  sql: string;
  params: any[];
}
```

---

## Performance Optimization

### Database Performance Service

```typescript
// src/services/database/performance.ts
export class DatabasePerformanceService {
  private db: DatabaseConnectionManager;
  private queryCache: Map<string, CachedQuery> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
    this.setupPerformanceMonitoring();
  }

  async optimizeQueries(): Promise<void> {
    // Analyze slow queries
    const slowQueries = await this.getSlowQueries();
    
    for (const query of slowQueries) {
      await this.optimizeQuery(query);
    }

    // Update statistics
    await this.updateTableStatistics();
    
    // Clean up old data
    await this.cleanupOldData();
  }

  private async getSlowQueries(): Promise<SlowQuery[]> {
    // PostgreSQL specific - get slow queries
    const sql = `
      SELECT query, mean_time, calls, total_time
      FROM pg_stat_statements
      WHERE mean_time > 1000
      ORDER BY mean_time DESC
      LIMIT 10
    `;

    try {
      const results = await this.db.query(sql);
      return results.map(row => ({
        query: row.query,
        meanTime: row.mean_time,
        calls: row.calls,
        totalTime: row.total_time
      }));
    } catch (error) {
      console.warn('Could not get slow queries (pg_stat_statements may not be enabled)');
      return [];
    }
  }

  private async optimizeQuery(slowQuery: SlowQuery): Promise<void> {
    // Analyze query and suggest optimizations
    console.log(`Optimizing slow query: ${slowQuery.query}`);
    
    // Check if indexes are needed
    await this.checkIndexes(slowQuery.query);
  }

  private async checkIndexes(query: string): Promise<void> {
    // Analyze query plan and suggest indexes
    const explainSql = `EXPLAIN ANALYZE ${query}`;
    
    try {
      const plan = await this.db.query(explainSql);
      this.analyzeQueryPlan(plan);
    } catch (error) {
      console.warn('Could not analyze query plan:', error);
    }
  }

  private analyzeQueryPlan(plan: any[]): void {
    // Look for sequential scans and suggest indexes
    for (const step of plan) {
      if (step['Node Type'] === 'Seq Scan') {
        console.log(`Consider adding index for table: ${step['Relation Name']}`);
      }
    }
  }

  async cacheQuery<T>(
    sql: string,
    params: any[],
    ttl: number = this.CACHE_TTL
  ): Promise<T[]> {
    const cacheKey = this.getCacheKey(sql, params);
    const cached = this.queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result;
    }

    const result = await this.db.query(sql, params);
    
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  private getCacheKey(sql: string, params: any[]): string {
    return `${sql}:${JSON.stringify(params)}`;
  }

  async updateTableStatistics(): Promise<void> {
    const tables = [
      'users',
      'settings',
      'machine_configurations',
      'plugin_settings',
      'workspaces',
      'jobs'
    ];

    for (const table of tables) {
      try {
        await this.db.query(`ANALYZE ${table}`);
      } catch (error) {
        console.warn(`Failed to analyze table ${table}:`, error);
      }
    }
  }

  private async cleanupOldData(): Promise<void> {
    // Clean up old audit logs (keep last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await this.db.query(
      'DELETE FROM audit_log WHERE created_at < $1',
      [sixMonthsAgo]
    );

    // Clean up old job records (keep last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await this.db.query(
      'DELETE FROM jobs WHERE created_at < $1 AND status IN ($2, $3)',
      [oneYearAgo, 'completed', 'failed']
    );
  }

  private setupPerformanceMonitoring(): void {
    // Monitor query performance
    setInterval(async () => {
      await this.recordPerformanceMetrics();
    }, 60000); // Every minute

    // Clean cache periodically
    setInterval(() => {
      this.cleanCache();
    }, 300000); // Every 5 minutes
  }

  private async recordPerformanceMetrics(): Promise<void> {
    try {
      // Get database statistics
      const stats = await this.getDatabaseStats();
      
      // Log metrics (could send to monitoring service)
      console.log('Database Performance Metrics:', {
        activeConnections: stats.activeConnections,
        queriesPerSecond: stats.queriesPerSecond,
        cacheHitRatio: stats.cacheHitRatio,
        averageQueryTime: stats.averageQueryTime
      });
    } catch (error) {
      console.warn('Failed to record performance metrics:', error);
    }
  }

  private async getDatabaseStats(): Promise<DatabaseStats> {
    const sql = `
      SELECT 
        numbackends as active_connections,
        xact_commit + xact_rollback as transactions,
        blks_hit::float / (blks_hit + blks_read) as cache_hit_ratio
      FROM pg_stat_database 
      WHERE datname = current_database()
    `;

    const result = await this.db.query(sql);
    
    return {
      activeConnections: result[0]?.active_connections || 0,
      queriesPerSecond: 0, // Would need more complex calculation
      cacheHitRatio: result[0]?.cache_hit_ratio || 0,
      averageQueryTime: 0 // Would need query log analysis
    };
  }

  private cleanCache(): void {
    const now = Date.now();
    
    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.queryCache.delete(key);
      }
    }
  }
}

interface SlowQuery {
  query: string;
  meanTime: number;
  calls: number;
  totalTime: number;
}

interface CachedQuery {
  result: any[];
  timestamp: number;
}

interface DatabaseStats {
  activeConnections: number;
  queriesPerSecond: number;
  cacheHitRatio: number;
  averageQueryTime: number;
}
```

---

## Backup and Recovery

### Database Backup Service

```typescript
// src/services/database/backup.ts
export class DatabaseBackupService {
  private db: DatabaseConnectionManager;
  private config: BackupConfig;

  constructor(db: DatabaseConnectionManager, config: BackupConfig) {
    this.db = db;
    this.config = config;
  }

  async createBackup(type: BackupType = 'full'): Promise<BackupResult> {
    const backupId = this.generateBackupId();
    const startTime = Date.now();

    try {
      let backupData: any;

      switch (type) {
        case 'full':
          backupData = await this.createFullBackup();
          break;
        case 'incremental':
          backupData = await this.createIncrementalBackup();
          break;
        case 'user-data':
          backupData = await this.createUserDataBackup();
          break;
      }

      // Compress backup data
      const compressedData = await this.compressBackup(backupData);

      // Store backup
      const storagePath = await this.storeBackup(backupId, compressedData, type);

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: BackupResult = {
        backupId,
        type,
        path: storagePath,
        size: compressedData.length,
        duration,
        createdAt: new Date(),
        success: true
      };

      // Record backup metadata
      await this.recordBackupMetadata(result);

      return result;
    } catch (error) {
      console.error('Backup failed:', error);
      return {
        backupId,
        type,
        path: '',
        size: 0,
        duration: Date.now() - startTime,
        createdAt: new Date(),
        success: false,
        error: error.message
      };
    }
  }

  private async createFullBackup(): Promise<DatabaseBackup> {
    const backup: DatabaseBackup = {
      version: '1.0',
      timestamp: new Date(),
      type: 'full',
      data: {}
    };

    // Backup all tables
    const tables = [
      'users',
      'settings',
      'machine_configurations',
      'plugin_settings',
      'workspaces',
      'jobs'
    ];

    for (const table of tables) {
      const sql = `SELECT * FROM ${table}`;
      backup.data[table] = await this.db.query(sql);
    }

    return backup;
  }

  private async createIncrementalBackup(): Promise<DatabaseBackup> {
    const lastBackup = await this.getLastBackupTimestamp();
    
    const backup: DatabaseBackup = {
      version: '1.0',
      timestamp: new Date(),
      type: 'incremental',
      since: lastBackup,
      data: {}
    };

    // Get only changed records since last backup
    const tables = [
      'users',
      'settings',
      'machine_configurations',
      'plugin_settings',
      'workspaces',
      'jobs'
    ];

    for (const table of tables) {
      const sql = `SELECT * FROM ${table} WHERE updated_at > $1`;
      backup.data[table] = await this.db.query(sql, [lastBackup]);
    }

    return backup;
  }

  private async createUserDataBackup(userId?: string): Promise<DatabaseBackup> {
    const backup: DatabaseBackup = {
      version: '1.0',
      timestamp: new Date(),
      type: 'user-data',
      userId,
      data: {}
    };

    const userCondition = userId ? 'WHERE user_id = $1' : '';
    const params = userId ? [userId] : [];

    // Backup user-specific data
    const userTables = [
      'settings',
      'machine_configurations',
      'plugin_settings',
      'workspaces',
      'jobs'
    ];

    for (const table of userTables) {
      const sql = `SELECT * FROM ${table} ${userCondition}`;
      backup.data[table] = await this.db.query(sql, params);
    }

    return backup;
  }

  async restoreBackup(backupId: string): Promise<RestoreResult> {
    const startTime = Date.now();

    try {
      // Load backup data
      const backupData = await this.loadBackup(backupId);
      
      // Validate backup
      await this.validateBackup(backupData);

      // Create restore point
      const restorePoint = await this.createRestorePoint();

      // Restore data
      await this.restoreData(backupData);

      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        backupId,
        restorePoint,
        duration,
        success: true,
        restoredAt: new Date()
      };
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        backupId,
        restorePoint: '',
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        restoredAt: new Date()
      };
    }
  }

  private async restoreData(backup: DatabaseBackup): Promise<void> {
    // Begin transaction
    await this.db.query('BEGIN');

    try {
      // Restore each table
      for (const [tableName, records] of Object.entries(backup.data)) {
        await this.restoreTable(tableName, records);
      }

      // Commit transaction
      await this.db.query('COMMIT');
    } catch (error) {
      // Rollback on error
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  private async restoreTable(tableName: string, records: any[]): Promise<void> {
    if (records.length === 0) return;

    // Clear existing data (be careful!)
    await this.db.query(`DELETE FROM ${tableName}`);

    // Insert backup data
    for (const record of records) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
      `;

      await this.db.query(sql, values);
    }
  }

  async scheduleBackups(): Promise<void> {
    // Schedule daily full backups
    setInterval(async () => {
      if (this.isBackupTime('daily')) {
        await this.createBackup('full');
      }
    }, 60 * 60 * 1000); // Check every hour

    // Schedule incremental backups every 4 hours
    setInterval(async () => {
      if (this.isBackupTime('incremental')) {
        await this.createBackup('incremental');
      }
    }, 4 * 60 * 60 * 1000); // Every 4 hours
  }

  private isBackupTime(type: 'daily' | 'incremental'): boolean {
    const now = new Date();
    
    if (type === 'daily') {
      // Backup at 2 AM
      return now.getHours() === 2 && now.getMinutes() === 0;
    } else {
      // Incremental backups every 4 hours
      return now.getMinutes() === 0 && now.getHours() % 4 === 0;
    }
  }

  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substr(2, 9);
    return `backup-${timestamp}-${random}`;
  }

  private async compressBackup(data: any): Promise<Buffer> {
    const zlib = require('zlib');
    const jsonData = JSON.stringify(data);
    return zlib.gzipSync(jsonData);
  }

  private async storeBackup(
    backupId: string,
    data: Buffer,
    type: BackupType
  ): Promise<string> {
    const path = require('path');
    const fs = require('fs/promises');

    const backupDir = this.config.backupDirectory;
    const filename = `${backupId}-${type}.gz`;
    const filepath = path.join(backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Write backup file
    await fs.writeFile(filepath, data);

    return filepath;
  }

  private async recordBackupMetadata(result: BackupResult): Promise<void> {
    const sql = `
      INSERT INTO backup_metadata (backup_id, type, path, size, duration, created_at, success)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.db.query(sql, [
      result.backupId,
      result.type,
      result.path,
      result.size,
      result.duration,
      result.createdAt,
      result.success
    ]);
  }

  private async getLastBackupTimestamp(): Promise<Date> {
    const sql = `
      SELECT MAX(created_at) as last_backup
      FROM backup_metadata
      WHERE success = true
    `;

    const result = await this.db.query(sql);
    return result[0]?.last_backup || new Date(0);
  }

  private async loadBackup(backupId: string): Promise<DatabaseBackup> {
    // Implementation to load backup from storage
    // This is a placeholder
    throw new Error('Not implemented');
  }

  private async validateBackup(backup: DatabaseBackup): Promise<void> {
    // Validate backup structure and data integrity
    if (!backup.version || !backup.timestamp || !backup.data) {
      throw new Error('Invalid backup format');
    }
  }

  private async createRestorePoint(): Promise<string> {
    // Create a restore point before making changes
    const restoreId = this.generateBackupId();
    await this.createBackup('full');
    return restoreId;
  }
}

export type BackupType = 'full' | 'incremental' | 'user-data';

export interface BackupConfig {
  backupDirectory: string;
  retentionDays: number;
  compressionLevel: number;
}

export interface BackupResult {
  backupId: string;
  type: BackupType;
  path: string;
  size: number;
  duration: number;
  createdAt: Date;
  success: boolean;
  error?: string;
}

export interface RestoreResult {
  backupId: string;
  restorePoint: string;
  duration: number;
  success: boolean;
  error?: string;
  restoredAt: Date;
}

export interface DatabaseBackup {
  version: string;
  timestamp: Date;
  type: BackupType;
  since?: Date;
  userId?: string;
  data: Record<string, any[]>;
}
```

---

## Security and Encryption

### Database Encryption Service

```typescript
// src/services/database/encryption.ts
export class DatabaseEncryptionService {
  private encryptionKey: string;
  private algorithm: string = 'aes-256-gcm';

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  encrypt(data: string): EncryptedData {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData: EncryptedData | string): string {
    const crypto = require('crypto');
    
    let encrypted: EncryptedData;
    if (typeof encryptedData === 'string') {
      // Legacy format - plain encrypted string
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } else {
      encrypted = encryptedData;
    }
    
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    
    const decipher = crypto.createDecipherGCM(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 12);
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hash);
  }

  generateApiKey(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  sanitizeForLogging(data: any): any {
    const sensitiveFields = [
      'password',
      'password_hash',
      'api_key',
      'secret',
      'token',
      'connection_string'
    ];

    const sanitized = JSON.parse(JSON.stringify(data));
    
    this.recursiveSanitize(sanitized, sensitiveFields);
    
    return sanitized;
  }

  private recursiveSanitize(obj: any, sensitiveFields: string[]): void {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.recursiveSanitize(obj[key], sensitiveFields);
      } else if (sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        obj[key] = '***REDACTED***';
      }
    }
  }
}

export interface EncryptedData {
  data: string;
  iv: string;
  authTag: string;
}
```

---

## Migration and Versioning

### Database Migration Service

```typescript
// src/services/database/migration.ts
export class DatabaseMigrationService {
  private db: DatabaseConnectionManager;
  private migrations: Migration[] = [];

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
    this.loadMigrations();
  }

  private loadMigrations(): void {
    this.migrations = [
      {
        version: '1.0.0',
        description: 'Initial schema creation',
        up: async (db) => {
          await this.createInitialSchema(db);
        },
        down: async (db) => {
          await this.dropInitialSchema(db);
        }
      },
      {
        version: '1.1.0',
        description: 'Add plugin settings table',
        up: async (db) => {
          await db.query(`
            CREATE TABLE plugin_settings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
              plugin_id VARCHAR(255) NOT NULL,
              plugin_version VARCHAR(50) NOT NULL,
              settings JSONB NOT NULL,
              enabled BOOLEAN DEFAULT true,
              auto_update BOOLEAN DEFAULT false,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(user_id, plugin_id)
            )
          `);
        },
        down: async (db) => {
          await db.query('DROP TABLE plugin_settings');
        }
      }
      // Add more migrations here
    ];
  }

  async migrate(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      appliedMigrations: [],
      errors: []
    };

    try {
      // Ensure migration table exists
      await this.ensureMigrationTable();

      // Get current database version
      const currentVersion = await this.getCurrentVersion();

      // Get pending migrations
      const pendingMigrations = this.getPendingMigrations(currentVersion);

      if (pendingMigrations.length === 0) {
        console.log('Database is up to date');
        return result;
      }

      // Apply migrations
      for (const migration of pendingMigrations) {
        try {
          await this.applyMigration(migration);
          result.appliedMigrations.push(migration.version);
          console.log(`Applied migration: ${migration.version}`);
        } catch (error) {
          result.success = false;
          result.errors.push(`Failed to apply migration ${migration.version}: ${error.message}`);
          break; // Stop on first error
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error.message}`);
    }

    return result;
  }

  async rollback(targetVersion: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      appliedMigrations: [],
      errors: []
    };

    try {
      const currentVersion = await this.getCurrentVersion();
      const migrationsToRollback = this.getMigrationsToRollback(currentVersion, targetVersion);

      for (const migration of migrationsToRollback.reverse()) {
        try {
          await this.rollbackMigration(migration);
          result.appliedMigrations.push(migration.version);
          console.log(`Rolled back migration: ${migration.version}`);
        } catch (error) {
          result.success = false;
          result.errors.push(`Failed to rollback migration ${migration.version}: ${error.message}`);
          break;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Rollback failed: ${error.message}`);
    }

    return result;
  }

  private async ensureMigrationTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        description TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.db.query(sql);
  }

  private async getCurrentVersion(): Promise<string> {
    const sql = `
      SELECT version FROM schema_migrations
      ORDER BY version DESC
      LIMIT 1
    `;

    const result = await this.db.query(sql);
    return result.length > 0 ? result[0].version : '0.0.0';
  }

  private getPendingMigrations(currentVersion: string): Migration[] {
    return this.migrations.filter(migration =>
      this.compareVersions(migration.version, currentVersion) > 0
    );
  }

  private getMigrationsToRollback(currentVersion: string, targetVersion: string): Migration[] {
    return this.migrations.filter(migration =>
      this.compareVersions(migration.version, targetVersion) > 0 &&
      this.compareVersions(migration.version, currentVersion) <= 0
    );
  }

  private async applyMigration(migration: Migration): Promise<void> {
    // Begin transaction
    await this.db.query('BEGIN');

    try {
      // Apply migration
      await migration.up(this.db);

      // Record migration
      await this.recordMigration(migration);

      // Commit transaction
      await this.db.query('COMMIT');
    } catch (error) {
      // Rollback on error
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  private async rollbackMigration(migration: Migration): Promise<void> {
    // Begin transaction
    await this.db.query('BEGIN');

    try {
      // Rollback migration
      await migration.down(this.db);

      // Remove migration record
      await this.removeMigrationRecord(migration);

      // Commit transaction
      await this.db.query('COMMIT');
    } catch (error) {
      // Rollback on error
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  private async recordMigration(migration: Migration): Promise<void> {
    const sql = `
      INSERT INTO schema_migrations (version, description)
      VALUES ($1, $2)
    `;

    await this.db.query(sql, [migration.version, migration.description]);
  }

  private async removeMigrationRecord(migration: Migration): Promise<void> {
    const sql = `
      DELETE FROM schema_migrations
      WHERE version = $1
    `;

    await this.db.query(sql, [migration.version]);
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  private async createInitialSchema(db: DatabaseConnectionManager): Promise<void> {
    // Create all initial tables
    const createUsersSql = `
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.query(createUsersSql);

    // Continue with other tables...
    // (Implementation would include all initial schema creation)
  }

  private async dropInitialSchema(db: DatabaseConnectionManager): Promise<void> {
    // Drop all tables in reverse order
    const tables = [
      'audit_log',
      'jobs',
      'workspaces',
      'machine_configurations',
      'settings',
      'users'
    ];

    for (const table of tables) {
      await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}

export interface Migration {
  version: string;
  description: string;
  up: (db: DatabaseConnectionManager) => Promise<void>;
  down: (db: DatabaseConnectionManager) => Promise<void>;
}

export interface MigrationResult {
  success: boolean;
  appliedMigrations: string[];
  errors: string[];
}
```

---

## Troubleshooting

### Database Troubleshooting Guide

```typescript
// src/services/database/troubleshooting.ts
export class DatabaseTroubleshootingService {
  private db: DatabaseConnectionManager;

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
  }

  async diagnose(): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: new Date(),
      connectionStatus: 'unknown',
      databaseStats: null,
      tableStats: [],
      indexStats: [],
      issues: [],
      recommendations: []
    };

    try {
      // Test connection
      report.connectionStatus = await this.testConnection();

      // Get database statistics
      if (report.connectionStatus === 'connected') {
        report.databaseStats = await this.getDatabaseStatistics();
        report.tableStats = await this.getTableStatistics();
        report.indexStats = await this.getIndexStatistics();

        // Analyze for issues
        this.analyzeIssues(report);
      }
    } catch (error) {
      report.issues.push({
        severity: 'error',
        category: 'connection',
        message: `Database diagnosis failed: ${error.message}`,
        solution: 'Check database connection and credentials'
      });
    }

    return report;
  }

  private async testConnection(): Promise<'connected' | 'disconnected' | 'error'> {
    try {
      await this.db.query('SELECT 1');
      return 'connected';
    } catch (error) {
      console.error('Connection test failed:', error);
      return 'error';
    }
  }

  private async getDatabaseStatistics(): Promise<DatabaseStatistics> {
    const sql = `
      SELECT 
        pg_database_size(current_database()) as database_size,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
    `;

    const result = await this.db.query(sql);
    return {
      databaseSize: result[0].database_size,
      activeConnections: result[0].active_connections,
      maxConnections: result[0].max_connections
    };
  }

  private async getTableStatistics(): Promise<TableStatistics[]> {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;

    const results = await this.db.query(sql);
    return results.map(row => ({
      schema: row.schemaname,
      name: row.tablename,
      inserts: row.inserts,
      updates: row.updates,
      deletes: row.deletes,
      liveTuples: row.live_tuples,
      deadTuples: row.dead_tuples,
      size: row.table_size
    }));
  }

  private async getIndexStatistics(): Promise<IndexStatistics[]> {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexname)) as index_size
      FROM pg_stat_user_indexes
      ORDER BY idx_tup_read DESC
    `;

    const results = await this.db.query(sql);
    return results.map(row => ({
      schema: row.schemaname,
      table: row.tablename,
      name: row.indexname,
      tuples_read: row.idx_tup_read,
      tuples_fetched: row.idx_tup_fetch,
      size: row.index_size
    }));
  }

  private analyzeIssues(report: DiagnosticReport): void {
    // Check connection usage
    if (report.databaseStats) {
      const connectionUsage = report.databaseStats.activeConnections / report.databaseStats.maxConnections;
      
      if (connectionUsage > 0.8) {
        report.issues.push({
          severity: 'warning',
          category: 'performance',
          message: `High connection usage: ${Math.round(connectionUsage * 100)}%`,
          solution: 'Consider increasing max_connections or implementing connection pooling'
        });
      }
    }

    // Check for tables with high dead tuple ratios
    for (const table of report.tableStats) {
      if (table.liveTuples > 0) {
        const deadRatio = table.deadTuples / (table.liveTuples + table.deadTuples);
        
        if (deadRatio > 0.2) {
          report.issues.push({
            severity: 'warning',
            category: 'maintenance',
            message: `Table ${table.name} has high dead tuple ratio: ${Math.round(deadRatio * 100)}%`,
            solution: `Run VACUUM on table ${table.name}`
          });
        }
      }
    }

    // Check for unused indexes
    for (const index of report.indexStats) {
      if (index.tuples_read === 0) {
        report.issues.push({
          severity: 'info',
          category: 'optimization',
          message: `Index ${index.name} appears to be unused`,
          solution: `Consider dropping unused index ${index.name} to improve write performance`
        });
      }
    }

    // Generate recommendations
    this.generateRecommendations(report);
  }

  private generateRecommendations(report: DiagnosticReport): void {
    // Performance recommendations
    if (report.issues.some(issue => issue.category === 'performance')) {
      report.recommendations.push('Consider optimizing database performance');
      report.recommendations.push('Review slow query log');
      report.recommendations.push('Check if indexes are being used effectively');
    }

    // Maintenance recommendations
    if (report.issues.some(issue => issue.category === 'maintenance')) {
      report.recommendations.push('Schedule regular VACUUM operations');
      report.recommendations.push('Consider enabling autovacuum');
      report.recommendations.push('Monitor table bloat regularly');
    }

    // General recommendations
    report.recommendations.push('Implement regular backup schedule');
    report.recommendations.push('Monitor database metrics continuously');
    report.recommendations.push('Keep database statistics up to date');
  }

  async fixCommonIssues(): Promise<FixResult[]> {
    const results: FixResult[] = [];

    try {
      // Run VACUUM on tables with high dead tuple ratios
      const tableStats = await this.getTableStatistics();
      
      for (const table of tableStats) {
        if (table.liveTuples > 0) {
          const deadRatio = table.deadTuples / (table.liveTuples + table.deadTuples);
          
          if (deadRatio > 0.2) {
            try {
              await this.db.query(`VACUUM ${table.name}`);
              results.push({
                action: 'vacuum',
                target: table.name,
                success: true,
                message: `Vacuumed table ${table.name}`
              });
            } catch (error) {
              results.push({
                action: 'vacuum',
                target: table.name,
                success: false,
                message: `Failed to vacuum table ${table.name}: ${error.message}`
              });
            }
          }
        }
      }

      // Update table statistics
      try {
        await this.db.query('ANALYZE');
        results.push({
          action: 'analyze',
          target: 'all_tables',
          success: true,
          message: 'Updated table statistics'
        });
      } catch (error) {
        results.push({
          action: 'analyze',
          target: 'all_tables',
          success: false,
          message: `Failed to update statistics: ${error.message}`
        });
      }

    } catch (error) {
      results.push({
        action: 'general',
        target: 'database',
        success: false,
        message: `Auto-fix failed: ${error.message}`
      });
    }

    return results;
  }
}

export interface DiagnosticReport {
  timestamp: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'unknown';
  databaseStats: DatabaseStatistics | null;
  tableStats: TableStatistics[];
  indexStats: IndexStatistics[];
  issues: DatabaseIssue[];
  recommendations: string[];
}

export interface DatabaseStatistics {
  databaseSize: number;
  activeConnections: number;
  maxConnections: number;
}

export interface TableStatistics {
  schema: string;
  name: string;
  inserts: number;
  updates: number;
  deletes: number;
  liveTuples: number;
  deadTuples: number;
  size: string;
}

export interface IndexStatistics {
  schema: string;
  table: string;
  name: string;
  tuples_read: number;
  tuples_fetched: number;
  size: string;
}

export interface DatabaseIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'connection' | 'performance' | 'maintenance' | 'optimization';
  message: string;
  solution: string;
}

export interface FixResult {
  action: string;
  target: string;
  success: boolean;
  message: string;
}
```

This comprehensive database settings storage guide provides everything needed to implement a robust, secure, and scalable database layer for the CNC Jog Controls application. It covers schema design, storage patterns, performance optimization, backup strategies, and troubleshooting procedures.