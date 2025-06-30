/**
 * Plugin Registry - Discovers, validates, and manages plugin registrations
 */

import { EventEmitter } from 'events'
import * as path from 'path'
import * as fs from 'fs/promises'
import { 
  PluginManifest, 
  PluginRegistryEntry, 
  PluginSource, 
  PluginLifecycle,
  PluginStatus,
  PluginMetrics
} from '../types/plugin-types'

export interface PluginRegistryOptions {
  directories: string[]
  autoDiscovery: boolean
  validateManifests: boolean
  logger?: any
}

/**
 * Plugin Registry class
 * Handles plugin discovery, registration, and metadata management
 */
export class PluginRegistry extends EventEmitter {
  private options: PluginRegistryOptions
  private logger: any

  // Registry state
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private manifestCache: Map<string, PluginManifest> = new Map()
  private lastDiscovery: Date | null = null
  private discoveryInProgress = false

  // File system watchers
  private watchers: Map<string, any> = new Map()

  constructor(options: PluginRegistryOptions) {
    super()
    this.options = options
    this.logger = options.logger || console
  }

  async initialize(): Promise<void> {
    try {
      // Set up directory watchers if auto-discovery is enabled
      if (this.options.autoDiscovery) {
        await this.setupDirectoryWatchers()
      }

      this.logger.debug('PluginRegistry initialized')
    } catch (error) {
      this.logger.error('Failed to initialize PluginRegistry:', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Close all watchers
      for (const [dir, watcher] of this.watchers.entries()) {
        try {
          if (watcher && typeof watcher.close === 'function') {
            await watcher.close()
          }
        } catch (error) {
          this.logger.error(`Error closing watcher for ${dir}:`, error)
        }
      }

      this.plugins.clear()
      this.manifestCache.clear()
      this.watchers.clear()

      this.logger.debug('PluginRegistry shutdown complete')
    } catch (error) {
      this.logger.error('Error during PluginRegistry shutdown:', error)
      throw error
    }
  }

  /**
   * Discover plugins in configured directories
   */
  async discoverPlugins(): Promise<PluginRegistryEntry[]> {
    if (this.discoveryInProgress) {
      this.logger.warn('Plugin discovery already in progress')
      return []
    }

    this.discoveryInProgress = true

    try {
      this.logger.info('Starting plugin discovery')
      const discovered: PluginRegistryEntry[] = []

      for (const directory of this.options.directories) {
        try {
          const plugins = await this.discoverInDirectory(directory)
          discovered.push(...plugins)
        } catch (error) {
          this.logger.error(`Error discovering plugins in ${directory}:`, error)
        }
      }

      this.lastDiscovery = new Date()
      this.logger.info(`Plugin discovery complete: ${discovered.length} plugins found`)

      return discovered

    } finally {
      this.discoveryInProgress = false
    }
  }

  /**
   * Register a plugin manually
   */
  async registerPlugin(manifest: PluginManifest, pluginPath: string): Promise<PluginRegistryEntry> {
    const name = manifest.metadata.name

    try {
      // Validate manifest if required
      if (this.options.validateManifests) {
        await this.validateManifest(manifest)
      }

      // Check for existing registration
      if (this.plugins.has(name)) {
        const existing = this.plugins.get(name)!
        if (existing.manifest.metadata.version === manifest.metadata.version) {
          this.logger.warn(`Plugin ${name} is already registered with same version`)
          return existing
        }
      }

      // Create registry entry
      const entry = await this.createRegistryEntry(manifest, pluginPath)

      // Store in registry
      this.plugins.set(name, entry)
      this.manifestCache.set(name, manifest)

      this.emit('plugin-registered', entry)
      this.logger.info(`Plugin registered: ${name} v${manifest.metadata.version}`)

      return entry

    } catch (error) {
      this.logger.error(`Failed to register plugin ${name}:`, error)
      throw error
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(name: string): Promise<void> {
    try {
      const entry = this.plugins.get(name)
      if (!entry) {
        this.logger.warn(`Plugin ${name} not found in registry`)
        return
      }

      this.plugins.delete(name)
      this.manifestCache.delete(name)

      this.emit('plugin-unregistered', entry)
      this.logger.info(`Plugin unregistered: ${name}`)

    } catch (error) {
      this.logger.error(`Failed to unregister plugin ${name}:`, error)
      throw error
    }
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): PluginRegistryEntry | undefined {
    return this.plugins.get(name)
  }

  /**
   * List all registered plugins
   */
  listPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Search plugins by criteria
   */
  searchPlugins(criteria: {
    category?: string
    author?: string
    keyword?: string
    status?: PluginStatus
  }): PluginRegistryEntry[] {
    return this.listPlugins().filter(plugin => {
      if (criteria.category && plugin.manifest.metadata.category !== criteria.category) {
        return false
      }

      if (criteria.author && plugin.manifest.metadata.author.name !== criteria.author) {
        return false
      }

      if (criteria.keyword) {
        const keywords = plugin.manifest.metadata.keywords.join(' ').toLowerCase()
        const description = plugin.manifest.metadata.description.toLowerCase()
        const searchTerm = criteria.keyword.toLowerCase()
        
        if (!keywords.includes(searchTerm) && !description.includes(searchTerm)) {
          return false
        }
      }

      if (criteria.status && plugin.lifecycle.status !== criteria.status) {
        return false
      }

      return true
    })
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): PluginRegistryEntry[] {
    return this.searchPlugins({ category })
  }

  /**
   * Get plugin dependencies
   */
  getPluginDependencies(name: string): string[] {
    const plugin = this.getPlugin(name)
    if (!plugin) {
      return []
    }

    return Object.keys(plugin.manifest.technical.dependencies || {})
  }

  /**
   * Get plugins that depend on given plugin
   */
  getPluginDependents(name: string): string[] {
    const dependents: string[] = []

    for (const plugin of this.listPlugins()) {
      const dependencies = Object.keys(plugin.manifest.technical.dependencies || {})
      if (dependencies.includes(name)) {
        dependents.push(plugin.manifest.metadata.name)
      }
    }

    return dependents
  }

  /**
   * Update plugin status
   */
  updatePluginStatus(name: string, status: PluginStatus, error?: any): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.lifecycle.status = status
      
      if (error) {
        plugin.lifecycle.lastError = {
          code: 'UPDATE_ERROR',
          message: error.message || error.toString(),
          stack: error.stack,
          timestamp: new Date(),
          context: { plugin: name }
        }
      }

      this.emit('plugin-status-updated', { plugin: name, status, error })
    }
  }

  /**
   * Get last discovery time
   */
  getLastDiscovery(): Date | null {
    return this.lastDiscovery
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    totalPlugins: number
    byCategory: Record<string, number>
    byStatus: Record<string, number>
    byAuthor: Record<string, number>
  } {
    const plugins = this.listPlugins()
    
    const byCategory: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byAuthor: Record<string, number> = {}

    for (const plugin of plugins) {
      // By category
      const category = plugin.manifest.metadata.category
      byCategory[category] = (byCategory[category] || 0) + 1

      // By status
      const status = plugin.lifecycle.status
      byStatus[status] = (byStatus[status] || 0) + 1

      // By author
      const author = plugin.manifest.metadata.author.name
      byAuthor[author] = (byAuthor[author] || 0) + 1
    }

    return {
      totalPlugins: plugins.length,
      byCategory,
      byStatus,
      byAuthor
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Discover plugins in a specific directory
   */
  private async discoverInDirectory(directory: string): Promise<PluginRegistryEntry[]> {
    try {
      const discovered: PluginRegistryEntry[] = []
      
      // Check if directory exists
      try {
        await fs.access(directory)
      } catch {
        this.logger.debug(`Plugin directory does not exist: ${directory}`)
        return discovered
      }

      const entries = await fs.readdir(directory, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const pluginPath = path.join(directory, entry.name)
            const plugin = await this.loadPluginFromDirectory(pluginPath)
            
            if (plugin) {
              discovered.push(plugin)
              this.emit('plugin-discovered', plugin)
            }
          } catch (error) {
            this.logger.error(`Error loading plugin from ${entry.name}:`, error)
          }
        }
      }

      return discovered

    } catch (error) {
      this.logger.error(`Error discovering plugins in ${directory}:`, error)
      return []
    }
  }

  /**
   * Load plugin from directory
   */
  private async loadPluginFromDirectory(pluginPath: string): Promise<PluginRegistryEntry | null> {
    try {
      // Look for manifest files
      const manifestPaths = [
        path.join(pluginPath, 'plugin.json'),
        path.join(pluginPath, 'manifest.json'),
        path.join(pluginPath, 'package.json')
      ]

      let manifestPath: string | null = null
      let manifestContent: any = null

      for (const candidate of manifestPaths) {
        try {
          await fs.access(candidate)
          const content = await fs.readFile(candidate, 'utf-8')
          const parsed = JSON.parse(content)
          
          // Check if it's a valid plugin manifest
          if (this.isValidManifest(parsed)) {
            manifestPath = candidate
            manifestContent = parsed
            break
          }
        } catch {
          // Continue to next candidate
        }
      }

      if (!manifestPath || !manifestContent) {
        return null
      }

      // Convert to standard manifest format if needed
      const manifest = this.normalizeManifest(manifestContent)

      // Create registry entry
      return await this.createRegistryEntry(manifest, pluginPath)

    } catch (error) {
      this.logger.error(`Error loading plugin from ${pluginPath}:`, error)
      return null
    }
  }

  /**
   * Check if manifest is valid
   */
  private isValidManifest(manifest: any): boolean {
    return (
      manifest &&
      typeof manifest === 'object' &&
      manifest.name &&
      manifest.version &&
      (manifest.pluginApi || manifest.main || manifest.entry)
    )
  }

  /**
   * Normalize manifest to standard format
   */
  private normalizeManifest(raw: any): PluginManifest {
    // Handle package.json format
    if (raw.main && !raw.entry) {
      raw.entry = raw.main
    }

    // Default values
    const manifest: PluginManifest = {
      metadata: {
        name: raw.name,
        version: raw.version,
        description: raw.description || '',
        author: raw.author || { name: 'Unknown' },
        license: raw.license || 'Unknown',
        homepage: raw.homepage,
        repository: raw.repository,
        keywords: raw.keywords || [],
        category: raw.category || 'utility'
      },
      technical: {
        runtime: raw.runtime || 'nodejs',
        entry: raw.entry || raw.main || 'index.js',
        dependencies: raw.dependencies || {},
        peerDependencies: raw.peerDependencies,
        engines: raw.engines || {},
        platforms: raw.platforms || ['darwin', 'linux', 'win32'],
        architectures: raw.architectures || ['x64']
      },
      capabilities: {
        apiLevel: raw.apiLevel || 'utility',
        permissions: raw.permissions || [],
        resources: raw.resources || {},
        features: raw.features || [],
        hooks: raw.hooks || [],
        exports: raw.exports || []
      },
      integration: raw.integration || {},
      configuration: {
        schema: raw.configSchema || { type: 'object', properties: {} },
        defaults: raw.configDefaults || {},
        validation: raw.configValidation || {},
        ui: raw.configUI || { type: 'form', layout: [] }
      }
    }

    return manifest
  }

  /**
   * Create registry entry
   */
  private async createRegistryEntry(manifest: PluginManifest, pluginPath: string): Promise<PluginRegistryEntry> {
    const name = manifest.metadata.name

    // Create lifecycle information
    const lifecycle: PluginLifecycle = {
      status: 'inactive',
      loadedAt: undefined,
      lastError: undefined,
      dependencies: [],
      dependents: [],
      configuration: {},
      metrics: {
        memoryUsage: 0,
        cpuUsage: 0,
        eventsSent: 0,
        eventsReceived: 0,
        apiCalls: 0,
        errors: 0,
        lastActivity: new Date()
      }
    }

    // Determine source information
    const source: PluginSource = {
      type: 'local',
      location: pluginPath
    }

    const entry: PluginRegistryEntry = {
      manifest,
      lifecycle,
      path: pluginPath,
      source,
      verified: false // Would be set based on signature verification
    }

    return entry
  }

  /**
   * Validate manifest structure
   */
  private async validateManifest(manifest: PluginManifest): Promise<void> {
    const errors: string[] = []

    // Required fields
    if (!manifest.metadata.name) {
      errors.push('Plugin name is required')
    }

    if (!manifest.metadata.version) {
      errors.push('Plugin version is required')
    }

    if (!manifest.technical.entry) {
      errors.push('Plugin entry point is required')
    }

    // Validate version format
    if (manifest.metadata.version && !/^\d+\.\d+\.\d+/.test(manifest.metadata.version)) {
      errors.push('Plugin version must follow semantic versioning (x.y.z)')
    }

    // Validate category
    const validCategories = ['core', 'machine', 'ui', 'integration', 'automation', 'utility']
    if (!validCategories.includes(manifest.metadata.category)) {
      errors.push(`Invalid category: ${manifest.metadata.category}`)
    }

    if (errors.length > 0) {
      throw new Error(`Manifest validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Set up directory watchers for auto-discovery
   */
  private async setupDirectoryWatchers(): Promise<void> {
    for (const directory of this.options.directories) {
      try {
        // Check if directory exists
        await fs.access(directory)

        // Set up watcher (simplified - would use chokidar in production)
        const watcher = {
          close: () => {}
        }
        
        this.watchers.set(directory, watcher)
        this.logger.debug(`Set up watcher for plugin directory: ${directory}`)

      } catch (error) {
        this.logger.debug(`Cannot watch plugin directory ${directory}: ${error}`)
      }
    }
  }
}