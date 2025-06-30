/**
 * Core Plugin Manager - Main plugin orchestrator
 * Manages plugin lifecycle, loading, and coordination
 */

import { EventEmitter } from 'events'
import { PluginRegistry } from '../registry/PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { SecurityManager } from './SecurityManager'
import { APIGateway } from './APIGateway'
import { 
  PluginManifest, 
  PluginStatus, 
  PluginEvent, 
  PluginContext,
  PluginRegistryEntry,
  PluginValidationResult,
  PluginError
} from '../types/plugin-types'

export interface PluginManagerOptions {
  pluginDirectories: string[]
  enableAutoDiscovery: boolean
  enableSandboxing: boolean
  maxConcurrentLoads: number
  validationTimeout: number
  eventBus?: EventEmitter
  logger?: any
}

export interface PluginManagerState {
  totalPlugins: number
  activePlugins: number
  loadingPlugins: number
  errorPlugins: number
  lastDiscovery: Date | null
  systemHealth: 'healthy' | 'degraded' | 'critical'
}

/**
 * Main Plugin Manager class
 * Orchestrates all plugin-related operations
 */
export class PluginManager extends EventEmitter {
  private registry: PluginRegistry
  private loader: PluginLoader
  private security: SecurityManager
  private apiGateway: APIGateway
  private options: PluginManagerOptions
  private logger: any

  // Plugin state tracking
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private contexts: Map<string, PluginContext> = new Map()
  private loadingQueue: Set<string> = new Set()
  private dependencyGraph: Map<string, Set<string>> = new Map()

  // System state
  private isInitialized = false
  private discoveryTimer?: NodeJS.Timeout
  private healthCheckTimer?: NodeJS.Timeout

  constructor(options: Partial<PluginManagerOptions> = {}) {
    super()

    this.options = {
      pluginDirectories: ['./plugins', './node_modules'],
      enableAutoDiscovery: true,
      enableSandboxing: true,
      maxConcurrentLoads: 5,
      validationTimeout: 30000,
      ...options
    }

    this.logger = options.logger || console

    // Initialize core components
    this.registry = new PluginRegistry({
      directories: this.options.pluginDirectories,
      autoDiscovery: this.options.enableAutoDiscovery,
      logger: this.logger
    })

    this.loader = new PluginLoader({
      maxConcurrent: this.options.maxConcurrentLoads,
      timeout: this.options.validationTimeout,
      logger: this.logger
    })

    this.security = new SecurityManager({
      sandboxing: this.options.enableSandboxing,
      logger: this.logger
    })

    this.apiGateway = new APIGateway({
      logger: this.logger
    })

    this.setupEventHandlers()
  }

  // === INITIALIZATION ===

  /**
   * Initialize the plugin manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('PluginManager already initialized')
    }

    try {
      this.logger.info('Initializing Plugin Manager')

      // Initialize core components
      await this.registry.initialize()
      await this.loader.initialize()
      await this.security.initialize()
      await this.apiGateway.initialize()

      // Discover plugins
      if (this.options.enableAutoDiscovery) {
        await this.discoverPlugins()
      }

      // Start background tasks
      this.startBackgroundTasks()

      this.isInitialized = true
      this.emit('initialized')

      this.logger.info('Plugin Manager initialized successfully')

    } catch (error) {
      this.logger.error('Failed to initialize Plugin Manager', error)
      throw error
    }
  }

  /**
   * Shutdown the plugin manager
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      this.logger.info('Shutting down Plugin Manager')

      // Stop background tasks
      this.stopBackgroundTasks()

      // Unload all plugins
      await this.unloadAllPlugins()

      // Shutdown core components
      await this.apiGateway.shutdown()
      await this.security.shutdown()
      await this.loader.shutdown()
      await this.registry.shutdown()

      this.isInitialized = false
      this.emit('shutdown')

      this.logger.info('Plugin Manager shutdown complete')

    } catch (error) {
      this.logger.error('Error during Plugin Manager shutdown', error)
      throw error
    }
  }

  // === PLUGIN DISCOVERY ===

  /**
   * Discover plugins in configured directories
   */
  async discoverPlugins(): Promise<void> {
    try {
      this.logger.debug('Starting plugin discovery')

      const discovered = await this.registry.discoverPlugins()
      
      for (const entry of discovered) {
        if (!this.plugins.has(entry.manifest.metadata.name)) {
          this.plugins.set(entry.manifest.metadata.name, entry)
          this.emit('plugin-discovered', entry)
        }
      }

      this.logger.info(`Plugin discovery complete: ${discovered.length} plugins found`)

    } catch (error) {
      this.logger.error('Plugin discovery failed', error)
      throw error
    }
  }

  /**
   * Register a plugin manually
   */
  async registerPlugin(manifest: PluginManifest, path: string): Promise<void> {
    try {
      const entry = await this.registry.registerPlugin(manifest, path)
      this.plugins.set(manifest.metadata.name, entry)
      this.emit('plugin-registered', entry)

      this.logger.info(`Plugin registered: ${manifest.metadata.name}`)

    } catch (error) {
      this.logger.error(`Failed to register plugin: ${manifest.metadata.name}`, error)
      throw error
    }
  }

  // === PLUGIN LIFECYCLE ===

  /**
   * Load a plugin
   */
  async loadPlugin(name: string): Promise<void> {
    if (this.loadingQueue.has(name)) {
      throw new Error(`Plugin ${name} is already being loaded`)
    }

    const entry = this.plugins.get(name)
    if (!entry) {
      throw new Error(`Plugin ${name} not found`)
    }

    if (entry.lifecycle.status === 'active') {
      this.logger.warn(`Plugin ${name} is already loaded`)
      return
    }

    try {
      this.loadingQueue.add(name)
      this.updatePluginStatus(name, 'loading')

      // Validate plugin
      const validation = await this.validatePlugin(entry)
      if (!validation.valid) {
        throw new Error(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // Check dependencies
      await this.resolveDependencies(entry)

      // Security check
      await this.security.validatePlugin(entry)

      // Load the plugin
      const context = await this.loader.loadPlugin(entry)
      this.contexts.set(name, context)

      // Register with API gateway
      await this.apiGateway.registerPlugin(entry, context)

      this.updatePluginStatus(name, 'active')
      this.loadingQueue.delete(name)

      this.emit('plugin-loaded', entry)
      this.logger.info(`Plugin loaded successfully: ${name}`)

    } catch (error) {
      this.loadingQueue.delete(name)
      this.handlePluginError(name, error as Error)
      throw error
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) {
      throw new Error(`Plugin ${name} not found`)
    }

    if (entry.lifecycle.status !== 'active') {
      this.logger.warn(`Plugin ${name} is not loaded`)
      return
    }

    try {
      // Check dependents
      const dependents = this.getDependents(name)
      if (dependents.length > 0) {
        throw new Error(`Cannot unload plugin ${name}: required by ${dependents.join(', ')}`)
      }

      const context = this.contexts.get(name)
      if (context) {
        // Unregister from API gateway
        await this.apiGateway.unregisterPlugin(name)

        // Unload the plugin
        await this.loader.unloadPlugin(name, context)

        this.contexts.delete(name)
      }

      this.updatePluginStatus(name, 'inactive')
      this.emit('plugin-unloaded', entry)

      this.logger.info(`Plugin unloaded successfully: ${name}`)

    } catch (error) {
      this.handlePluginError(name, error as Error)
      throw error
    }
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(name: string): Promise<void> {
    try {
      await this.unloadPlugin(name)
      await this.loadPlugin(name)
    } catch (error) {
      this.logger.error(`Failed to reload plugin: ${name}`, error)
      throw error
    }
  }

  /**
   * Load all plugins
   */
  async loadAllPlugins(): Promise<void> {
    const loadOrder = this.calculateLoadOrder()
    
    for (const batch of loadOrder) {
      const loadPromises = batch.map(name => this.loadPlugin(name).catch(error => {
        this.logger.error(`Failed to load plugin ${name}:`, error)
        return null
      }))

      await Promise.all(loadPromises)
    }
  }

  /**
   * Unload all plugins
   */
  async unloadAllPlugins(): Promise<void> {
    const unloadOrder = this.calculateUnloadOrder()
    
    for (const batch of unloadOrder) {
      const unloadPromises = batch.map(name => this.unloadPlugin(name).catch(error => {
        this.logger.error(`Failed to unload plugin ${name}:`, error)
        return null
      }))

      await Promise.all(unloadPromises)
    }
  }

  // === PLUGIN MANAGEMENT ===

  /**
   * Get plugin information
   */
  getPlugin(name: string): PluginRegistryEntry | undefined {
    return this.plugins.get(name)
  }

  /**
   * List all plugins
   */
  listPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugins by status
   */
  getPluginsByStatus(status: PluginStatus): PluginRegistryEntry[] {
    return this.listPlugins().filter(plugin => plugin.lifecycle.status === status)
  }

  /**
   * Get plugin context
   */
  getPluginContext(name: string): PluginContext | undefined {
    return this.contexts.get(name)
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfiguration(name: string, config: any): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) {
      throw new Error(`Plugin ${name} not found`)
    }

    const context = this.contexts.get(name)
    if (!context) {
      throw new Error(`Plugin ${name} is not loaded`)
    }

    try {
      // Validate configuration
      const validation = await this.validatePluginConfiguration(entry, config)
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }

      // Update configuration
      entry.lifecycle.configuration = config
      context.configuration = config

      // Notify plugin of configuration change
      if (context.events) {
        context.events.emit('configuration-changed', config)
      }

      this.emit('plugin-configured', { plugin: name, config })
      this.logger.info(`Plugin configuration updated: ${name}`)

    } catch (error) {
      this.logger.error(`Failed to update plugin configuration: ${name}`, error)
      throw error
    }
  }

  // === SYSTEM STATE ===

  /**
   * Get system state
   */
  getState(): PluginManagerState {
    const plugins = this.listPlugins()
    
    return {
      totalPlugins: plugins.length,
      activePlugins: plugins.filter(p => p.lifecycle.status === 'active').length,
      loadingPlugins: plugins.filter(p => p.lifecycle.status === 'loading').length,
      errorPlugins: plugins.filter(p => p.lifecycle.status === 'error').length,
      lastDiscovery: this.registry.getLastDiscovery(),
      systemHealth: this.calculateSystemHealth()
    }
  }

  /**
   * Get system diagnostics
   */
  getDiagnostics(): any {
    return {
      state: this.getState(),
      plugins: this.listPlugins().map(p => ({
        name: p.manifest.metadata.name,
        status: p.lifecycle.status,
        version: p.manifest.metadata.version,
        memoryUsage: p.lifecycle.metrics.memoryUsage,
        lastActivity: p.lifecycle.metrics.lastActivity
      })),
      loadingQueue: Array.from(this.loadingQueue),
      dependencyGraph: Array.from(this.dependencyGraph.entries()),
      api: this.apiGateway.getDiagnostics(),
      security: this.security.getDiagnostics()
    }
  }

  // === PRIVATE METHODS ===

  private setupEventHandlers(): void {
    this.registry.on('plugin-discovered', (entry: PluginRegistryEntry) => {
      this.plugins.set(entry.manifest.metadata.name, entry)
      this.emit('plugin-discovered', entry)
    })

    this.loader.on('plugin-error', (name: string, error: Error) => {
      this.handlePluginError(name, error)
    })

    this.security.on('security-violation', (name: string, violation: any) => {
      this.logger.warn(`Security violation in plugin ${name}:`, violation)
      this.emit('security-violation', { plugin: name, violation })
    })
  }

  private async validatePlugin(entry: PluginRegistryEntry): Promise<PluginValidationResult> {
    // Implementation would validate manifest, dependencies, permissions, etc.
    return {
      valid: true,
      errors: [],
      warnings: [],
      security: {
        trustLevel: 'medium',
        risks: [],
        permissions: [],
        signature: {
          signed: false,
          valid: false
        }
      }
    }
  }

  private async validatePluginConfiguration(entry: PluginRegistryEntry, config: any): Promise<PluginValidationResult> {
    // Implementation would validate configuration against schema
    return {
      valid: true,
      errors: [],
      warnings: [],
      security: {
        trustLevel: 'medium',
        risks: [],
        permissions: [],
        signature: {
          signed: false,
          valid: false
        }
      }
    }
  }

  private async resolveDependencies(entry: PluginRegistryEntry): Promise<void> {
    const dependencies = entry.manifest.technical.dependencies || {}
    const name = entry.manifest.metadata.name

    for (const [depName, version] of Object.entries(dependencies)) {
      const depEntry = this.plugins.get(depName)
      if (!depEntry) {
        throw new Error(`Dependency ${depName} not found for plugin ${name}`)
      }

      if (depEntry.lifecycle.status !== 'active') {
        // Load dependency first
        await this.loadPlugin(depName)
      }

      // Add to dependency graph
      if (!this.dependencyGraph.has(name)) {
        this.dependencyGraph.set(name, new Set())
      }
      this.dependencyGraph.get(name)!.add(depName)
    }
  }

  private getDependents(name: string): string[] {
    const dependents: string[] = []
    
    for (const [pluginName, deps] of this.dependencyGraph.entries()) {
      if (deps.has(name)) {
        dependents.push(pluginName)
      }
    }
    
    return dependents
  }

  private calculateLoadOrder(): string[][] {
    // Implementation would perform topological sort based on dependencies
    return [Array.from(this.plugins.keys())]
  }

  private calculateUnloadOrder(): string[][] {
    // Reverse of load order
    return this.calculateLoadOrder().reverse()
  }

  private updatePluginStatus(name: string, status: PluginStatus): void {
    const entry = this.plugins.get(name)
    if (entry) {
      entry.lifecycle.status = status
      
      if (status === 'active') {
        entry.lifecycle.loadedAt = new Date()
      }

      this.emit('plugin-status-changed', { plugin: name, status })
    }
  }

  private handlePluginError(name: string, error: Error): void {
    const entry = this.plugins.get(name)
    if (entry) {
      const pluginError: PluginError = {
        code: 'PLUGIN_ERROR',
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context: { plugin: name }
      }

      entry.lifecycle.lastError = pluginError
      entry.lifecycle.status = 'error'
      entry.lifecycle.metrics.errors++

      this.emit('plugin-error', { plugin: name, error: pluginError })
    }

    this.logger.error(`Plugin error in ${name}:`, error)
  }

  private calculateSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    const state = this.getState()
    
    if (state.errorPlugins > state.totalPlugins * 0.5) {
      return 'critical'
    } else if (state.errorPlugins > state.totalPlugins * 0.2) {
      return 'degraded'
    } else {
      return 'healthy'
    }
  }

  private startBackgroundTasks(): void {
    if (this.options.enableAutoDiscovery) {
      this.discoveryTimer = setInterval(() => {
        this.discoverPlugins().catch(error => {
          this.logger.error('Auto-discovery failed:', error)
        })
      }, 60000) // Check every minute
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Health check every 30 seconds
  }

  private stopBackgroundTasks(): void {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer)
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
  }

  private performHealthCheck(): void {
    try {
      const state = this.getState()
      
      if (state.systemHealth !== 'healthy') {
        this.logger.warn(`Plugin system health: ${state.systemHealth}`, state)
      }

      // Check for hung plugins
      for (const [name, entry] of this.plugins.entries()) {
        if (entry.lifecycle.status === 'loading' && 
            Date.now() - (entry.lifecycle.loadedAt?.getTime() || 0) > this.options.validationTimeout) {
          this.logger.warn(`Plugin ${name} appears to be hung during loading`)
          this.handlePluginError(name, new Error('Plugin loading timeout'))
        }
      }

      this.emit('health-check', state)

    } catch (error) {
      this.logger.error('Health check failed:', error)
    }
  }
}