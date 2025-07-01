import React, { createContext } from 'react'
import { PluginAPI } from '@cnc-jog-controls/plugin-api'

interface SettingsContextValue {
  api: PluginAPI
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsProviderProps {
  api: PluginAPI
  children: React.ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ 
  api, 
  children 
}) => {
  const value: SettingsContextValue = {
    api
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}