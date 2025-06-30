/**
 * Plugin Loader - Handles plugin loading and lifecycle
 */

import { EventEmitter } from 'events'
import * as path from 'path'
import * as fs from 'fs/promises'
import { 
  PluginRegistryEntry, 
  PluginContext, 
  PluginLogger, 
  PluginStorage, 
  PluginEventEmitter,
  PluginAPI
} from '../types/plugin-types'

export interface PluginLoaderOptions {
  maxConcurrent: number
  timeout: number
  logger?: any
}

interface LoadingPlugin {
  name: string
  startTime: Date
  promise: Promise<PluginContext>
}

/**
 * Plugin Loader class
 * Responsible for loading, executing, and managing plugin instances
 */
export class PluginLoader extends EventEmitter {
  private options: PluginLoaderOptions
  private logger: any
  
  // Loading state
  private loadingPlugins: Map<string, LoadingPlugin> = new Map()
  private loadedModules: Map<string, any> = new Map()
  
  // Plugin contexts and instances
  private pluginInstances: Map<string, any> = new Map()
  private storageInstances: Map<string, PluginStorage> = new Map()
  private loggerInstances: Map<string, PluginLogger> = new Map()

  constructor(options: PluginLoaderOptions) {
    super()
    this.options = options
    this.logger = options.logger || console
  }

  async initialize(): Promise<void> {
    this.logger.debug('PluginLoader initialized')
  }

  async shutdown(): Promise<void> {
    // Cleanup all loaded plugins
    for (const [name] of this.pluginInstances) {
      try {
        await this.unloadPlugin(name, undefined as any)
      } catch (error) {
        this.logger.error(`Error unloading plugin ${name} during shutdown:`, error)
      }
    }

    this.loadingPlugins.clear()
    this.loadedModules.clear()
    this.pluginInstances.clear()
    this.storageInstances.clear()
    this.loggerInstances.clear()

    this.logger.debug('PluginLoader shutdown complete')
  }

  /**
   * Load a plugin and create its context
   */
  async loadPlugin(entry: PluginRegistryEntry): Promise<PluginContext> {
    const name = entry.manifest.metadata.name

    if (this.loadingPlugins.has(name)) {
      throw new Error(`Plugin ${name} is already being loaded`)
    }

    if (this.pluginInstances.has(name)) {
      throw new Error(`Plugin ${name} is already loaded`)
    }

    const loadingEntry: LoadingPlugin = {
      name,
      startTime: new Date(),
      promise: this.performLoad(entry)
    }

    this.loadingPlugins.set(name, loadingEntry)

    try {
      const context = await Promise.race([
        loadingEntry.promise,
        this.createTimeoutPromise(name)
      ])

      this.loadingPlugins.delete(name)
      return context

    } catch (error) {
      this.loadingPlugins.delete(name)
      this.emit('plugin-error', name, error)
      throw error
    }
  }

  /**
   * Unload a plugin and cleanup its context
   */
  async unloadPlugin(name: string, context: PluginContext): Promise<void> {
    try {
      const instance = this.pluginInstances.get(name)
      
      if (instance && typeof instance.deactivate === 'function') {
        await instance.deactivate()
      }

      // Cleanup storage
      const storage = this.storageInstances.get(name)
      if (storage && typeof storage.clear === 'function') {
        // Note: We don't automatically clear storage on unload
        // This is intentional to preserve plugin data
      }

      // Remove from maps
      this.pluginInstances.delete(name)
      this.loadedModules.delete(name)
      this.storageInstances.delete(name)
      this.loggerInstances.delete(name)

      this.logger.debug(`Plugin unloaded: ${name}`)

    } catch (error) {
      this.logger.error(`Error unloading plugin ${name}:`, error)
      throw error
    }
  }

  /**
   * Get current loading status
   */
  getLoadingStatus(): { name: string; duration: number }[] {
    return Array.from(this.loadingPlugins.values()).map(loading => ({
      name: loading.name,
      duration: Date.now() - loading.startTime.getTime()
    }))
  }

  // === PRIVATE METHODS ===

  /**
   * Perform the actual plugin loading
   */
  private async performLoad(entry: PluginRegistryEntry): Promise<PluginContext> {
    const name = entry.manifest.metadata.name
    const pluginPath = entry.path

    try {
      this.logger.debug(`Loading plugin: ${name} from ${pluginPath}`)

      // Load the plugin module
      const module = await this.loadPluginModule(entry)
      this.loadedModules.set(name, module)

      // Create plugin context
      const context = await this.createPluginContext(entry, module)

      // Initialize the plugin
      await this.initializePlugin(entry, module, context)

      this.logger.info(`Plugin loaded successfully: ${name}`)
      return context

    } catch (error) {
      this.logger.error(`Failed to load plugin ${name}:`, error)
      throw error
    }
  }

  /**
   * Load the plugin module based on runtime type
   */
  private async loadPluginModule(entry: PluginRegistryEntry): Promise<any> {
    const runtime = entry.manifest.technical.runtime
    const entryPoint = entry.manifest.technical.entry
    const pluginPath = entry.path

    switch (runtime) {
      case 'nodejs':
        return await this.loadNodeJSPlugin(pluginPath, entryPoint)
      
      case 'webassembly':
        return await this.loadWebAssemblyPlugin(pluginPath, entryPoint)
      
      case 'native':
        throw new Error('Native plugins not yet supported')
      
      default:
        throw new Error(`Unsupported runtime: ${runtime}`)
    }
  }

  /**
   * Load a Node.js plugin
   */
  private async loadNodeJSPlugin(pluginPath: string, entryPoint: string): Promise<any> {
    const fullPath = path.resolve(pluginPath, entryPoint)
    
    try {
      // Check if we're in a Node.js environment
      if (typeof require === 'undefined') {
        throw new Error('Node.js plugins not supported in browser environment')
      }
      
      // Check if file exists
      await fs.access(fullPath)
      
      // Clear require cache for hot reloading
      delete require.cache[require.resolve(fullPath)]
      
      // Load the module
      const module = require(fullPath)
      
      return module.default || module
      
    } catch (error) {
      throw new Error(`Failed to load Node.js plugin: ${error}`)
    }
  }

  /**
   * Load a WebAssembly plugin
   */
  private async loadWebAssemblyPlugin(pluginPath: string, entryPoint: string): Promise<any> {
    const fullPath = path.resolve(pluginPath, entryPoint)
    
    try {
      const wasmBuffer = await fs.readFile(fullPath)
      const wasmModule = await WebAssembly.instantiate(wasmBuffer)
      
      return {
        instance: wasmModule.instance,
        module: wasmModule.module,
        exports: wasmModule.instance.exports
      }
      
    } catch (error) {
      throw new Error(`Failed to load WebAssembly plugin: ${error}`)
    }
  }

  /**
   * Create plugin context with API access and utilities
   */
  private async createPluginContext(entry: PluginRegistryEntry, module: any): Promise<PluginContext> {
    const name = entry.manifest.metadata.name

    // Create plugin-specific logger
    const logger = this.createPluginLogger(name)
    this.loggerInstances.set(name, logger)

    // Create plugin-specific storage
    const storage = this.createPluginStorage(name)
    this.storageInstances.set(name, storage)

    // Create plugin-specific event emitter
    const events = this.createPluginEventEmitter(name)

    // Create API proxy (will be injected by APIGateway)
    const api: PluginAPI = {}

    const context: PluginContext = {
      plugin: entry.manifest,
      api,
      logger,
      storage,
      events,
      configuration: entry.lifecycle.configuration || {}
    }

    return context
  }

  /**
   * Initialize the plugin instance
   */
  private async initializePlugin(entry: PluginRegistryEntry, module: any, context: PluginContext): Promise<void> {
    const name = entry.manifest.metadata.name

    try {
      let instance: any

      if (typeof module === 'function') {
        // Plugin is a constructor function
        instance = new module(context)
      } else if (module && typeof module.activate === 'function') {
        // Plugin has an activate method
        instance = module
        await instance.activate(context)
      } else if (module && typeof module.default === 'function') {
        // Plugin exports a default function
        instance = new module.default(context)
      } else {
        // Plugin is a plain object
        instance = module
      }

      this.pluginInstances.set(name, instance)

      // Call plugin initialization if available
      if (instance && typeof instance.initialize === 'function') {
        await instance.initialize()
      }

    } catch (error) {
      throw new Error(`Plugin initialization failed: ${error}`)
    }
  }

  /**
   * Create plugin-specific logger
   */
  private createPluginLogger(pluginName: string): PluginLogger {
    return {
      debug: (message: string, data?: any) => {
        this.logger.debug(`[${pluginName}] ${message}`, data)
      },
      info: (message: string, data?: any) => {
        this.logger.info(`[${pluginName}] ${message}`, data)
      },
      warn: (message: string, data?: any) => {
        this.logger.warn(`[${pluginName}] ${message}`, data)
      },
      error: (message: string, data?: any) => {
        this.logger.error(`[${pluginName}] ${message}`, data)
      }
    }
  }

  /**
   * Create plugin-specific storage
   */
  private createPluginStorage(pluginName: string): PluginStorage {
    // Simple in-memory storage implementation
    // In production, this would use a persistent storage backend
    const storageMap = new Map<string, any>()

    return {
      async get(key: string): Promise<any> {
        return storageMap.get(`${pluginName}:${key}`)
      },

      async set(key: string, value: any): Promise<void> {
        storageMap.set(`${pluginName}:${key}`, value)
      },

      async delete(key: string): Promise<void> {
        storageMap.delete(`${pluginName}:${key}`)
      },

      async clear(): Promise<void> {
        for (const key of storageMap.keys()) {
          if (key.startsWith(`${pluginName}:`)) {
            storageMap.delete(key)
          }
        }
      },

      async keys(): Promise<string[]> {
        const prefix = `${pluginName}:`
        return Array.from(storageMap.keys())
          .filter(key => key.startsWith(prefix))
          .map(key => key.slice(prefix.length))
      }
    }
  }

  /**
   * Create plugin-specific event emitter
   */
  private createPluginEventEmitter(pluginName: string): PluginEventEmitter {
    const emitter = new EventEmitter()

    return {
      emit: (event: string, data?: any) => {
        emitter.emit(event, data)
        // Also emit to global plugin events with plugin prefix
        this.emit(`plugin:${pluginName}:${event}`, data)
      },

      on: (event: string, handler: Function) => {
        emitter.on(event, handler)
        return () => emitter.off(event, handler)
      },

      off: (event: string, handler: Function) => {
        emitter.off(event, handler)
      }
    }
  }

  /**
   * Create timeout promise for plugin loading
   */
  private createTimeoutPromise(pluginName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Plugin loading timeout: ${pluginName}`))
      }, this.options.timeout)
    })
  }

  /**
   * Get plugin instance
   */
  getPluginInstance(name: string): any {
    return this.pluginInstances.get(name)
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(name: string): boolean {
    return this.pluginInstances.has(name)
  }

  /**
   * Get all loaded plugin names
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.pluginInstances.keys())
  }
}