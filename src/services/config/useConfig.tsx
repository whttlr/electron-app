// React Hook for Configuration Service
// Provides reactive access to configuration data in React components

import { useState, useEffect, useCallback, useMemo } from 'react';
import { configService } from './ConfigService';
import {
  CompleteConfig,
  MachineConfig,
  StateConfig,
  AppConfig,
  UIConfig,
  APIConfig,
  DefaultsConfig,
  VisualizationConfig,
  ConfigLoadingState,
  ConfigEvent,
} from './types/index';

/**
 * Hook for accessing complete configuration
 */
export const useConfig = () => {
  const [config, setConfig] = useState<CompleteConfig | null>(configService.getConfig());
  const [loadingState, setLoadingState] = useState<ConfigLoadingState>(configService.getLoadingState());

  useEffect(() => {
    // Initialize config service if not already loaded
    if (!configService.isLoaded() && !configService.isLoading()) {
      configService.initialize().catch(error => {
        console.error('Failed to initialize config service:', error);
      });
    }

    // Set up event listeners
    const handleConfigEvent = (event: ConfigEvent) => {
      setConfig(configService.getConfig());
      setLoadingState(configService.getLoadingState());
    };

    configService.addEventListener('loaded', handleConfigEvent);
    configService.addEventListener('updated', handleConfigEvent);
    configService.addEventListener('error', handleConfigEvent);
    configService.addEventListener('reset', handleConfigEvent);

    // Cleanup
    return () => {
      configService.removeEventListener('loaded', handleConfigEvent);
      configService.removeEventListener('updated', handleConfigEvent);
      configService.removeEventListener('error', handleConfigEvent);
      configService.removeEventListener('reset', handleConfigEvent);
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      await configService.reload();
    } catch (error) {
      console.error('Failed to reload configuration:', error);
    }
  }, []);

  return {
    config,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
  };
};

/**
 * Hook for accessing machine configuration
 */
export const useMachineConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const machineConfig = useMemo(() => config?.machine || null, [config?.machine]);

  const jogIncrements = useCallback((isMetric: boolean = true) => {
    return configService.getJogIncrements(isMetric);
  }, []);

  const feedRateLimits = useCallback(() => {
    return configService.getFeedRateLimits();
  }, []);

  const workingAreaDimensions = useCallback(() => {
    return configService.getWorkingAreaDimensions();
  }, []);

  const defaultPosition = useCallback(() => {
    return configService.getDefaultPosition();
  }, []);

  return {
    machineConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
    // Convenience methods
    jogIncrements,
    feedRateLimits,
    workingAreaDimensions,
    defaultPosition,
  };
};

/**
 * Hook for accessing state configuration
 */
export const useStateConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const stateConfig = useMemo(() => config?.state || null, [config?.state]);

  const pollingIntervals = useCallback(() => {
    return configService.getPollingIntervals();
  }, []);

  return {
    stateConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
    // Convenience methods
    pollingIntervals,
  };
};

/**
 * Hook for accessing UI configuration
 */
export const useUIConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const uiConfig = useMemo(() => config?.ui || null, [config?.ui]);

  const axisColors = useCallback(() => {
    return configService.getAxisColors();
  }, []);

  return {
    uiConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
    // Convenience methods
    axisColors,
  };
};

/**
 * Hook for accessing app configuration
 */
export const useAppConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const appConfig = useMemo(() => config?.app || null, [config?.app]);

  return {
    appConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
  };
};

/**
 * Hook for accessing API configuration
 */
export const useAPIConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const apiConfig = useMemo(() => config?.api || null, [config?.api]);

  return {
    apiConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
  };
};

/**
 * Hook for accessing visualization configuration
 */
export const useVisualizationConfig = () => {
  const { config, loadingState, reload } = useConfig();

  const visualizationConfig = useMemo(() => config?.visualization || null, [config?.visualization]);

  return {
    visualizationConfig,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
    reload,
  };
};

/**
 * Hook for accessing configuration values by path
 */
export const useConfigValue = <T,>(path: string, fallback?: T) => {
  const { config, loadingState } = useConfig();

  const value = useMemo(() => {
    if (!config) return fallback;
    return configService.getConfigValue<T>(path) ?? fallback;
  }, [config, path, fallback]);

  return {
    value,
    loadingState,
    isLoading: loadingState.isLoading,
    isLoaded: loadingState.isLoaded,
    error: loadingState.error,
  };
};