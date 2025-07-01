import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import Configstore from 'configstore'

export interface MarketplaceConfig {
  registry: {
    defaultUrl: string
    timeout: number
    retries: number
    userAgent: string
  }
  auth: {
    tokenStorage: 'file' | 'keychain'
    sessionTimeout: number
    autoRefresh: boolean
  }
  package: {
    defaultAccess: 'public' | 'private'
    maxPackageSize: number
    compressionLevel: number
    validateBeforePublish: boolean
  }
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
    directory: string
  }
  ui: {
    outputFormat: 'table' | 'json' | 'compact'
    colorOutput: boolean
    progressBars: boolean
  }
  search: {
    defaultLimit: number
    defaultSort: 'downloads' | 'rating' | 'updated' | 'created' | 'name'
    includePrerelease: boolean
  }
}

export class ConfigManager {
  private configStore: Configstore
  private configPath: string
  private defaultConfig: MarketplaceConfig

  constructor() {
    this.configPath = path.join(os.homedir(), '.cnc-marketplace')
    this.configStore = new Configstore('cnc-marketplace', {}, {
      configPath: path.join(this.configPath, 'config.json')
    })

    this.defaultConfig = {
      registry: {
        defaultUrl: 'https://registry.cnc-jog-controls.com',
        timeout: 30000,
        retries: 3,
        userAgent: 'cnc-marketplace-client/1.0.0'
      },
      auth: {
        tokenStorage: 'file',
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        autoRefresh: true
      },
      package: {
        defaultAccess: 'public',
        maxPackageSize: 50 * 1024 * 1024, // 50MB
        compressionLevel: 9,
        validateBeforePublish: true
      },
      cache: {
        enabled: true,
        ttl: 60 * 60 * 1000, // 1 hour
        maxSize: 100 * 1024 * 1024, // 100MB
        directory: path.join(this.configPath, 'cache')
      },
      ui: {
        outputFormat: 'table',
        colorOutput: true,
        progressBars: true
      },
      search: {
        defaultLimit: 20,
        defaultSort: 'downloads',
        includePrerelease: false
      }
    }
  }

  /**
   * Get configuration value by key path
   */
  get(keyPath: string): any {
    const value = this.configStore.get(keyPath)
    if (value !== undefined) {
      return value
    }

    // Return default value if not set
    return this.getNestedValue(this.defaultConfig, keyPath)
  }

  /**
   * Set configuration value by key path
   */
  async set(keyPath: string, value: any): Promise<void> {
    this.configStore.set(keyPath, value)
  }

  /**
   * Delete configuration key
   */
  async delete(keyPath: string): Promise<void> {
    this.configStore.delete(keyPath)
  }

  /**
   * Get all configuration
   */
  async getAll(): Promise<any> {
    const config = { ...this.defaultConfig }
    const storedConfig = this.configStore.all
    
    return this.mergeDeep(config, storedConfig)
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    this.configStore.clear()
  }

  /**
   * Initialize configuration directory and files
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(this.configPath)
    await fs.ensureDir(this.get('cache.directory'))
    
    // Create default config if it doesn't exist
    if (Object.keys(this.configStore.all).length === 0) {
      await this.setDefaults()
    }
  }

  /**
   * Set default configuration values
   */
  private async setDefaults(): Promise<void> {
    for (const [key, value] of Object.entries(this.defaultConfig)) {
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          await this.set(`${key}.${subKey}`, subValue)
        }
      } else {
        await this.set(key, value)
      }
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, keyPath: string): any {
    return keyPath.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * Deep merge two objects
   */
  private mergeDeep(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) {
      return source
    }
    
    if (typeof source !== 'object' || source === null) {
      return target
    }

    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeDeep(target[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  /**
   * Validate configuration values
   */
  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    const config = await this.getAll()

    // Validate registry URL
    try {
      new URL(config.registry.defaultUrl)
    } catch (error) {
      errors.push('Invalid registry URL')
    }

    // Validate timeouts
    if (config.registry.timeout < 1000) {
      errors.push('Registry timeout must be at least 1000ms')
    }

    if (config.auth.sessionTimeout < 60000) {
      errors.push('Auth session timeout must be at least 60000ms')
    }

    // Validate package size
    if (config.package.maxPackageSize < 1024) {
      errors.push('Max package size must be at least 1KB')
    }

    // Validate cache settings
    if (config.cache.ttl < 1000) {
      errors.push('Cache TTL must be at least 1000ms')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Export configuration to file
   */
  async exportConfig(filePath: string): Promise<void> {
    const config = await this.getAll()
    await fs.writeJson(filePath, config, { spaces: 2 })
  }

  /**
   * Import configuration from file
   */
  async importConfig(filePath: string, merge: boolean = true): Promise<void> {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Configuration file not found: ${filePath}`)
    }

    const importedConfig = await fs.readJson(filePath)
    
    if (merge) {
      const currentConfig = await this.getAll()
      const mergedConfig = this.mergeDeep(currentConfig, importedConfig)
      
      // Clear current config and set merged config
      this.configStore.clear()
      for (const [key, value] of Object.entries(mergedConfig)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const [subKey, subValue] of Object.entries(value)) {
            await this.set(`${key}.${subKey}`, subValue)
          }
        } else {
          await this.set(key, value)
        }
      }
    } else {
      // Replace entire configuration
      this.configStore.clear()
      this.configStore.set(importedConfig)
    }
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configStore.path
  }

  /**
   * Get configuration directory path
   */
  getConfigDir(): string {
    return this.configPath
  }

  /**
   * Check if configuration exists
   */
  exists(): boolean {
    return fs.existsSync(this.configStore.path)
  }

  /**
   * Get configuration size in bytes
   */
  async getConfigSize(): Promise<number> {
    if (!this.exists()) {
      return 0
    }
    
    const stats = await fs.stat(this.configStore.path)
    return stats.size
  }

  /**
   * Backup current configuration
   */
  async backup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(this.configPath, `config-backup-${timestamp}.json`)
    
    await this.exportConfig(backupPath)
    return backupPath
  }

  /**
   * List available configuration backups
   */
  async listBackups(): Promise<string[]> {
    const backupDir = this.configPath
    
    if (!await fs.pathExists(backupDir)) {
      return []
    }
    
    const files = await fs.readdir(backupDir)
    return files
      .filter(file => file.startsWith('config-backup-') && file.endsWith('.json'))
      .sort()
      .reverse() // Most recent first
  }

  /**
   * Restore configuration from backup
   */
  async restoreBackup(backupFileName: string): Promise<void> {
    const backupPath = path.join(this.configPath, backupFileName)
    
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`Backup file not found: ${backupFileName}`)
    }
    
    await this.importConfig(backupPath, false)
  }

  /**
   * Clean up old backups (keep only last N backups)
   */
  async cleanupBackups(keepCount: number = 5): Promise<void> {
    const backups = await this.listBackups()
    
    if (backups.length <= keepCount) {
      return
    }
    
    const toDelete = backups.slice(keepCount)
    
    for (const backup of toDelete) {
      const backupPath = path.join(this.configPath, backup)
      await fs.remove(backupPath)
    }
  }
}