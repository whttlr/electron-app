import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  config?: {
    placement?: 'dashboard' | 'standalone' | 'modal' | 'sidebar';
    screen?: 'main' | 'new' | 'controls' | 'settings';
    size?: { width: number | 'auto', height: number | 'auto' };
    priority?: number;
    autoStart?: boolean;
    permissions?: string[];
    menuTitle?: string;
    menuIcon?: string;
    routePath?: string;
  };
}

interface PluginContextType {
  plugins: Plugin[];
  setPlugins: React.Dispatch<React.SetStateAction<Plugin[]>>;
  getStandalonePlugins: () => Plugin[];
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

interface PluginProviderProps {
  children: ReactNode;
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'machine-monitor',
      name: 'Machine Status Monitor',
      version: '1.0.0',
      description: 'Real-time machine status monitoring with performance charts',
      status: 'active',
      type: 'visualization',
      config: {
        placement: 'standalone',
        screen: 'new',
        size: { width: 'auto', height: 'auto' },
        priority: 100,
        autoStart: true,
        permissions: ['machine.read', 'status.read'],
        menuTitle: 'Machine Monitor',
        menuIcon: 'monitor',
        routePath: '/machine-monitor'
      }
    },
    {
      id: 'gcode-snippets',
      name: 'G-code Snippets',
      version: '1.0.0',
      description: 'Manage and insert common G-code snippets',
      status: 'active',
      type: 'productivity',
      config: {
        placement: 'modal',
        screen: 'main',
        size: { width: 600, height: 'auto' },
        priority: 150,
        autoStart: false,
        permissions: ['file.read', 'file.write', 'machine.control']
      }
    }
  ]);

  const getStandalonePlugins = () => {
    return plugins.filter(plugin => 
      plugin.status === 'active' && 
      plugin.config?.placement === 'standalone'
    );
  };

  return (
    <PluginContext.Provider value={{ plugins, setPlugins, getStandalonePlugins }}>
      {children}
    </PluginContext.Provider>
  );
};