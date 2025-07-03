/**
 * React Hook for Machine Configuration Management
 * 
 * Provides easy access to machine configurations in React components
 */

import { useState, useEffect, useCallback } from 'react'
import { machineConfigService, type ExtendedMachineConfig, type MachineConfig } from './index'

export interface UseMachineConfigReturn {
  // Data
  configurations: ExtendedMachineConfig[]
  activeConfiguration: ExtendedMachineConfig | null
  isLoading: boolean
  isConnected: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
  setActive: (configId: string) => Promise<void>
  createConfiguration: (config: Omit<MachineConfig, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateConfiguration: (configId: string, updates: Partial<MachineConfig>) => Promise<void>
  deleteConfiguration: (configId: string) => Promise<void>
  getLegacyConfig: () => Promise<any>
}

export function useMachineConfig(): UseMachineConfigReturn {
  const [configurations, setConfigurations] = useState<ExtendedMachineConfig[]>([])
  const [activeConfiguration, setActiveConfiguration] = useState<ExtendedMachineConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize and load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check connection first
      const connected = await machineConfigService.isConnected()
      setIsConnected(connected)

      if (!connected) {
        setError('Database connection unavailable')
        return
      }

      // Load configurations
      const [configs, activeConfig] = await Promise.all([
        machineConfigService.getAllConfigurations(),
        machineConfigService.getActiveConfiguration()
      ])

      setConfigurations(configs)
      setActiveConfiguration(activeConfig)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to load machine configurations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Set active configuration
  const setActive = useCallback(async (configId: string) => {
    try {
      setError(null)
      const newActiveConfig = await machineConfigService.setActiveConfiguration(configId)
      
      // Update local state
      setConfigurations(prev => prev.map(config => ({
        ...config,
        isActive: config.id === configId
      })))
      setActiveConfiguration(newActiveConfig)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set active configuration'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Create new configuration
  const createConfiguration = useCallback(async (configData: Omit<MachineConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const newConfig = await machineConfigService.createConfiguration(configData)
      
      setConfigurations(prev => [...prev, newConfig])
      
      // If it's the first config, set it as active
      if (configurations.length === 0) {
        setActiveConfiguration(newConfig)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create configuration'
      setError(errorMessage)
      throw err
    }
  }, [configurations.length])

  // Update configuration
  const updateConfiguration = useCallback(async (configId: string, updates: Partial<MachineConfig>) => {
    try {
      setError(null)
      const updatedConfig = await machineConfigService.updateConfiguration(configId, updates)
      
      setConfigurations(prev => prev.map(config => 
        config.id === configId ? updatedConfig : config
      ))
      
      // Update active config if it was the one being updated
      if (activeConfiguration?.id === configId) {
        setActiveConfiguration(updatedConfig)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration'
      setError(errorMessage)
      throw err
    }
  }, [activeConfiguration?.id])

  // Delete configuration
  const deleteConfiguration = useCallback(async (configId: string) => {
    try {
      setError(null)
      await machineConfigService.deleteConfiguration(configId)
      
      const remainingConfigs = configurations.filter(config => config.id !== configId)
      setConfigurations(remainingConfigs)
      
      // Update active config if we deleted it
      if (activeConfiguration?.id === configId) {
        const newActiveConfig = remainingConfigs.find(c => c.isActive) || null
        setActiveConfiguration(newActiveConfig)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete configuration'
      setError(errorMessage)
      throw err
    }
  }, [configurations, activeConfiguration?.id])

  // Get legacy config format
  const getLegacyConfig = useCallback(async () => {
    try {
      return await machineConfigService.getLegacyMachineConfig()
    } catch (err) {
      console.error('Failed to get legacy config:', err)
      return null
    }
  }, [])

  return {
    // Data
    configurations,
    activeConfiguration,
    isLoading,
    isConnected,
    error,

    // Actions
    refresh,
    setActive,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    getLegacyConfig
  }
}