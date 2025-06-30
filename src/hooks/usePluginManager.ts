/**
 * Plugin Manager Hook - React hook for plugin management state and actions
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PluginRegistryEntry, PluginManagerState } from '../core/plugins/types/plugin-types'
import { PluginManager } from '../core/plugins/core/PluginManager'

export interface UsePluginManagerOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableDiagnostics?: boolean
}

export interface UsePluginManagerReturn {
  // State
  plugins: PluginRegistryEntry[]
  state: PluginManagerState
  diagnostics: any
  loading: boolean
  error: string | null

  // Actions
  loadPlugin: (name: string) => Promise<void>
  unloadPlugin: (name: string) => Promise<void>
  reloadPlugin: (name: string) => Promise<void>
  updateConfiguration: (name: string, config: any) => Promise<void>
  discoverPlugins: () => Promise<void>
  getPluginStatus: (name: string) => Promise<any>

  // Utilities
  refresh: () => Promise<void>
  clearError: () => void
}

/**
 * Plugin Manager Hook
 * Provides React integration for the plugin management system
 */
export const usePluginManager = (options: UsePluginManagerOptions = {}): UsePluginManagerReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableDiagnostics = true
  } = options

  // State
  const [plugins, setPlugins] = useState<PluginRegistryEntry[]>([])
  const [state, setState] = useState<PluginManagerState>({
    totalPlugins: 0,
    activePlugins: 0,
    loadingPlugins: 0,
    errorPlugins: 0,
    lastDiscovery: null,
    systemHealth: 'healthy'
  })
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Plugin manager instance
  const pluginManagerRef = useRef<PluginManager | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize plugin manager
  useEffect(() => {
    const initializePluginManager = async () => {
      try {
        setLoading(true)
        
        // Create plugin manager instance
        const manager = new PluginManager({
          pluginDirectories: ['./plugins', './node_modules'],
          enableAutoDiscovery: true,
          enableSandboxing: true,
          maxConcurrentLoads: 5,
          validationTimeout: 30000
        })

        // Set up event listeners
        manager.on('initialized', () => {
          console.log('Plugin manager initialized')
        })

        manager.on('plugin-discovered', (entry: PluginRegistryEntry) => {
          console.log('Plugin discovered:', entry.manifest.metadata.name)
          refreshData()
        })

        manager.on('plugin-loaded', (entry: PluginRegistryEntry) => {
          console.log('Plugin loaded:', entry.manifest.metadata.name)
          refreshData()
        })

        manager.on('plugin-unloaded', (entry: PluginRegistryEntry) => {
          console.log('Plugin unloaded:', entry.manifest.metadata.name)
          refreshData()
        })

        manager.on('plugin-error', ({ plugin, error }: { plugin: string; error: any }) => {
          console.error('Plugin error:', plugin, error)
          setError(`Plugin error in ${plugin}: ${error.message}`)
          refreshData()
        })

        manager.on('security-violation', ({ plugin, violation }: { plugin: string; violation: any }) => {
          console.warn('Security violation:', plugin, violation)
          refreshData()
        })

        // Initialize the manager
        await manager.initialize()
        
        pluginManagerRef.current = manager
        
        // Initial data refresh
        await refreshData()

      } catch (err) {
        console.error('Failed to initialize plugin manager:', err)
        setError(`Failed to initialize plugin manager: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    initializePluginManager()

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      
      if (pluginManagerRef.current) {
        pluginManagerRef.current.shutdown().catch(console.error)
      }
    }
  }, [])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !pluginManagerRef.current) {
      return
    }

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshData().then(scheduleRefresh)
      }, refreshInterval)
    }

    scheduleRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!pluginManagerRef.current) {
      return
    }

    try {
      // Get current state and plugins
      const currentState = pluginManagerRef.current.getState()
      const currentPlugins = pluginManagerRef.current.listPlugins()
      
      setState(currentState)
      setPlugins(currentPlugins)

      // Get diagnostics if enabled
      if (enableDiagnostics) {
        const currentDiagnostics = pluginManagerRef.current.getDiagnostics()
        setDiagnostics(currentDiagnostics)
      }

    } catch (err) {
      console.error('Failed to refresh plugin data:', err)
      setError(`Failed to refresh data: ${err.message}`)
    }
  }, [enableDiagnostics])

  // Load plugin
  const loadPlugin = useCallback(async (name: string) => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      setError(null)
      await pluginManagerRef.current.loadPlugin(name)
      await refreshData()
    } catch (err) {
      const message = `Failed to load plugin ${name}: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [refreshData])

  // Unload plugin
  const unloadPlugin = useCallback(async (name: string) => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      setError(null)
      await pluginManagerRef.current.unloadPlugin(name)
      await refreshData()
    } catch (err) {
      const message = `Failed to unload plugin ${name}: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [refreshData])

  // Reload plugin
  const reloadPlugin = useCallback(async (name: string) => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      setError(null)
      await pluginManagerRef.current.reloadPlugin(name)
      await refreshData()
    } catch (err) {
      const message = `Failed to reload plugin ${name}: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [refreshData])

  // Update plugin configuration
  const updateConfiguration = useCallback(async (name: string, config: any) => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      setError(null)
      await pluginManagerRef.current.updatePluginConfiguration(name, config)
      await refreshData()
    } catch (err) {
      const message = `Failed to update configuration for ${name}: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [refreshData])

  // Discover plugins
  const discoverPlugins = useCallback(async () => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      setError(null)
      await pluginManagerRef.current.discoverPlugins()
      await refreshData()
    } catch (err) {
      const message = `Failed to discover plugins: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [refreshData])

  // Get plugin status
  const getPluginStatus = useCallback(async (name: string) => {
    if (!pluginManagerRef.current) {
      throw new Error('Plugin manager not initialized')
    }

    try {
      const plugin = pluginManagerRef.current.getPlugin(name)
      if (!plugin) {
        throw new Error(`Plugin ${name} not found`)
      }

      return {
        plugin: plugin.manifest.metadata.name,
        status: plugin.lifecycle.status,
        version: plugin.manifest.metadata.version,
        loadedAt: plugin.lifecycle.loadedAt,
        lastError: plugin.lifecycle.lastError,
        metrics: plugin.lifecycle.metrics,
        configuration: plugin.lifecycle.configuration
      }
    } catch (err) {
      const message = `Failed to get status for ${name}: ${err.message}`
      setError(message)
      throw new Error(message)
    }
  }, [])

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await refreshData()
    } finally {
      setLoading(false)
    }
  }, [refreshData])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    plugins,
    state,
    diagnostics,
    loading,
    error,

    // Actions
    loadPlugin,
    unloadPlugin,
    reloadPlugin,
    updateConfiguration,
    discoverPlugins,
    getPluginStatus,

    // Utilities
    refresh,
    clearError
  }
}

/**
 * Plugin Status Hook
 * Provides real-time status for a specific plugin
 */
export const usePluginStatus = (pluginName: string) => {
  const { plugins, getPluginStatus } = usePluginManager()
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plugin = plugins.find(p => p.manifest.metadata.name === pluginName)

  useEffect(() => {
    if (!pluginName || !plugin) {
      setStatus(null)
      return
    }

    const fetchStatus = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const pluginStatus = await getPluginStatus(pluginName)
        setStatus(pluginStatus)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Refresh status every 5 seconds
    const interval = setInterval(fetchStatus, 5000)
    
    return () => clearInterval(interval)
  }, [pluginName, plugin, getPluginStatus])

  return { status, loading, error }
}

/**
 * Plugin Metrics Hook
 * Provides aggregated metrics for plugin performance monitoring
 */
export const usePluginMetrics = () => {
  const { diagnostics, refresh } = usePluginManager({ enableDiagnostics: true })
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    if (!diagnostics) {
      return
    }

    // Process and aggregate metrics
    const processedMetrics = {
      overview: {
        totalPlugins: diagnostics.state.totalPlugins,
        activePlugins: diagnostics.state.activePlugins,
        errorRate: diagnostics.state.totalPlugins > 0 
          ? (diagnostics.state.errorPlugins / diagnostics.state.totalPlugins) * 100 
          : 0,
        systemHealth: diagnostics.state.systemHealth
      },
      performance: {
        totalMemory: diagnostics.plugins.reduce((sum: number, p: any) => sum + p.memoryUsage, 0),
        averageMemory: diagnostics.plugins.length > 0 
          ? diagnostics.plugins.reduce((sum: number, p: any) => sum + p.memoryUsage, 0) / diagnostics.plugins.length 
          : 0,
        totalAPICalls: diagnostics.api.totalAPICalls,
        activeCalls: diagnostics.api.activeCalls
      },
      security: {
        trustedPlugins: diagnostics.security.trustedPlugins,
        blockedPlugins: diagnostics.security.blockedPlugins,
        recentViolations: diagnostics.security.recentViolations.length,
        riskLevel: diagnostics.security.recentViolations.some((v: any) => v.severity === 'critical') 
          ? 'high' 
          : diagnostics.security.recentViolations.length > 5 
            ? 'medium' 
            : 'low'
      },
      topUsers: diagnostics.api.topAPIUsers,
      recentErrors: diagnostics.api.recentErrors
    }

    setMetrics(processedMetrics)
  }, [diagnostics])

  return { metrics, refresh }
}