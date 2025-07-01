import { useState, useEffect, useContext } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'

export interface PluginSettings {
  updateInterval: number
  showDebugInfo: boolean
  alarmNotifications: boolean
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }

  const { api } = context

  const [settings, setSettings] = useState<PluginSettings>({
    updateInterval: 100,
    showDebugInfo: false,
    alarmNotifications: true
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const savedSettings = await api.settings.get('machine-status-monitor')
        if (savedSettings) {
          setSettings(savedSettings)
        }
      } catch (error) {
        api.logger.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()

    // Listen for settings changes from other sources
    const handleSettingsChange = (data: any) => {
      if (data.pluginId === 'machine-status-monitor') {
        setSettings(data.settings)
      }
    }

    api.events.on('settings.changed', handleSettingsChange)

    return () => {
      api.events.off('settings.changed', handleSettingsChange)
    }
  }, [api])

  const updateSetting = async <K extends keyof PluginSettings>(
    key: K,
    value: PluginSettings[K]
  ) => {
    const newSettings = {
      ...settings,
      [key]: value
    }

    setSettings(newSettings)

    try {
      await api.settings.set('machine-status-monitor', newSettings)
      api.logger.info(`Setting updated: ${key} = ${value}`)
    } catch (error) {
      api.logger.error('Failed to save settings:', error)
      // Revert on error
      setSettings(settings)
    }
  }

  const resetSettings = async () => {
    const defaultSettings: PluginSettings = {
      updateInterval: 100,
      showDebugInfo: false,
      alarmNotifications: true
    }

    setSettings(defaultSettings)

    try {
      await api.settings.set('machine-status-monitor', defaultSettings)
      api.logger.info('Settings reset to defaults')
    } catch (error) {
      api.logger.error('Failed to reset settings:', error)
    }
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    loading
  }
}