import React, { createContext, useEffect, useState } from 'react'
import { PluginAPI } from '@cnc-jog-controls/plugin-api'

interface MachineStatusContextValue {
  api: PluginAPI
  updateInterval: number
}

export const MachineStatusContext = createContext<MachineStatusContextValue | null>(null)

interface MachineStatusProviderProps {
  api: PluginAPI
  children: React.ReactNode
}

export const MachineStatusProvider: React.FC<MachineStatusProviderProps> = ({ 
  api, 
  children 
}) => {
  const [updateInterval, setUpdateInterval] = useState(100)

  useEffect(() => {
    // Listen for settings changes that affect update interval
    const handleSettingsChange = async (data: any) => {
      if (data.pluginId === 'machine-status-monitor' && data.settings.updateInterval) {
        setUpdateInterval(data.settings.updateInterval)
      }
    }

    // Load initial update interval
    const loadInitialInterval = async () => {
      const settings = await api.settings.get('machine-status-monitor')
      if (settings?.updateInterval) {
        setUpdateInterval(settings.updateInterval)
      }
    }

    loadInitialInterval()
    api.events.on('settings.changed', handleSettingsChange)

    return () => {
      api.events.off('settings.changed', handleSettingsChange)
    }
  }, [api])

  const value: MachineStatusContextValue = {
    api,
    updateInterval
  }

  return (
    <MachineStatusContext.Provider value={value}>
      {children}
    </MachineStatusContext.Provider>
  )
}