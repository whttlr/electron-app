/**
 * Adapter Hooks
 * 
 * React hooks for working with UI adapters
 */

import { useContext, useMemo } from 'react';
import { AdapterConfig, getAdapterConfig } from '../config';

/**
 * Context for adapter configuration
 */
const AdapterConfigContext = React.createContext<AdapterConfig>(getAdapterConfig());

/**
 * Hook to access adapter configuration
 */
export function useAdapterConfig(): AdapterConfig {
  const config = useContext(AdapterConfigContext);
  return config;
}

/**
 * Hook to get the appropriate adapter for a component
 */
export function useAdapter(componentName: string): string {
  const config = useAdapterConfig();
  
  return useMemo(() => {
    // Check for component-specific override
    const override = config.componentOverrides[componentName];
    if (override?.adapter) {
      return override.adapter;
    }
    
    // Use primary adapter
    return config.primaryAdapter;
  }, [config, componentName]);
}

/**
 * Hook to get default props for a component
 */
export function useAdapterProps(componentName: string): Record<string, any> {
  const config = useAdapterConfig();
  
  return useMemo(() => {
    const override = config.componentOverrides[componentName];
    return override?.defaultProps || {};
  }, [config, componentName]);
}

/**
 * Hook to check if dark mode is enabled
 */
export function useAdapterDarkMode(): boolean {
  const config = useAdapterConfig();
  
  return useMemo(() => {
    return config.theme.darkMode || config.theme.colorScheme === 'dark';
  }, [config.theme]);
}

/**
 * Hook to get theme configuration
 */
export function useAdapterTheme() {
  const config = useAdapterConfig();
  
  return useMemo(() => {
    return {
      darkMode: config.theme.darkMode,
      colorScheme: config.theme.colorScheme,
      size: config.theme.size,
    };
  }, [config.theme]);
}

/**
 * Hook to get accessibility configuration
 */
export function useAdapterAccessibility() {
  const config = useAdapterConfig();
  
  return useMemo(() => {
    return {
      highContrast: config.accessibility.highContrast,
      reducedMotion: config.accessibility.reducedMotion,
      screenReader: config.accessibility.screenReader,
    };
  }, [config.accessibility]);
}