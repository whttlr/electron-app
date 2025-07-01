// Main exports for the CNC Marketplace Client library

// Core client
export { MarketplaceClient } from './client/MarketplaceClient'
export type {
  PluginInfo,
  PluginVersion,
  SearchResult,
  PluginSearchItem,
  MarketplaceConfig
} from './client/MarketplaceClient'

// Authentication
export { AuthManager } from './auth/AuthManager'
export type {
  UserInfo,
  AuthConfig,
  LoginOptions
} from './auth/AuthManager'

// Package management
export { PackageManager } from './package/PackageManager'
export type {
  InstalledPlugin,
  PluginManifest,
  InstallOptions,
  UninstallOptions,
  UpdateOptions,
  ListOptions
} from './package/PackageManager'

// Search functionality
export { SearchManager } from './search/SearchManager'
export type {
  SearchOptions,
  SearchFilters
} from './search/SearchManager'

// Publishing
export { PublishManager } from './publish/PublishManager'
export type {
  PublishOptions,
  UnpublishOptions,
  DeprecateOptions,
  PackageMetadata,
  ValidationResult
} from './publish/PublishManager'

// Configuration
export { ConfigManager } from './config/ConfigManager'

// Utilities
export { Logger, PerformanceLogger } from './utils/Logger'
export type { LogLevel, LogEntry, LoggerOptions } from './utils/Logger'

// High-level convenience class that combines all functionality
export class CNCMarketplace {
  public client: MarketplaceClient
  public auth: AuthManager
  public packages: PackageManager
  public search: SearchManager
  public publish: PublishManager
  public config: ConfigManager
  public logger: Logger

  constructor(options?: {
    registryUrl?: string
    logLevel?: 'debug' | 'info' | 'warn' | 'error'
    silent?: boolean
  }) {
    this.logger = new Logger({
      debug: options?.logLevel === 'debug',
      verbose: options?.logLevel === 'debug',
      silent: options?.silent || false
    })

    this.config = new ConfigManager()
    this.client = new MarketplaceClient(options?.registryUrl ? { registryUrl: options.registryUrl } : undefined)
    this.auth = new AuthManager()
    this.packages = new PackageManager()
    this.search = new SearchManager()
    this.publish = new PublishManager()
  }

  /**
   * Initialize the marketplace client
   */
  async initialize(): Promise<void> {
    await this.config.initialize()
    this.logger.info('CNC Marketplace client initialized')
  }

  /**
   * Quick search for plugins
   */
  async searchPlugins(query: string, limit: number = 10) {
    return await this.search.search(query, { limit })
  }

  /**
   * Install a plugin
   */
  async installPlugin(pluginName: string, version?: string) {
    return await this.packages.install(pluginName, { version })
  }

  /**
   * Publish a plugin
   */
  async publishPlugin(pluginPath: string = '.', options?: PublishOptions) {
    return await this.publish.publish(pluginPath, options)
  }

  /**
   * Get marketplace statistics
   */
  async getStats() {
    return await this.client.getStats()
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    return await this.auth.isAuthenticated()
  }

  /**
   * Login to marketplace
   */
  async login(options?: LoginOptions) {
    if (options?.token) {
      return await this.auth.loginWithToken(options.token, options.registry)
    } else {
      return await this.auth.interactiveLogin(options?.username, options?.registry)
    }
  }

  /**
   * Logout from marketplace
   */
  async logout(registry?: string) {
    return await this.auth.logout(registry)
  }

  /**
   * Get current user info
   */
  async getCurrentUser(registry?: string) {
    return await this.auth.getCurrentUser(registry)
  }

  /**
   * List installed plugins
   */
  async listInstalled(options?: ListOptions) {
    return await this.packages.listInstalled(options)
  }

  /**
   * Update all plugins
   */
  async updateAll(options?: UpdateOptions) {
    return await this.packages.updateAll(options)
  }
}