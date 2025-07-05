/**
 * UI Adapters Configuration
 * 
 * Configures which UI library adapter to use and component defaults
 */

export interface AdapterConfig {
  /** Primary UI library adapter */
  primaryAdapter: 'ant-design' | 'headless-ui' | 'custom';
  
  /** Fallback adapter when primary is unavailable */
  fallbackAdapter: 'ant-design' | 'headless-ui' | 'custom';
  
  /** Component-specific overrides */
  componentOverrides: {
    [componentName: string]: {
      adapter?: 'ant-design' | 'headless-ui' | 'custom';
      defaultProps?: Record<string, any>;
    };
  };
  
  /** Theme configuration */
  theme: {
    /** Enable dark mode support */
    darkMode: boolean;
    
    /** Color scheme */
    colorScheme: 'light' | 'dark' | 'auto';
    
    /** Component size defaults */
    size: 'small' | 'medium' | 'large';
  };
  
  /** Accessibility settings */
  accessibility: {
    /** Enable high contrast mode */
    highContrast: boolean;
    
    /** Enable reduced motion */
    reducedMotion: boolean;
    
    /** Enable screen reader optimizations */
    screenReader: boolean;
  };
}

export const defaultAdapterConfig: AdapterConfig = {
  primaryAdapter: 'ant-design',
  fallbackAdapter: 'custom',
  componentOverrides: {},
  theme: {
    darkMode: false,
    colorScheme: 'light',
    size: 'medium',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  },
};

export const getAdapterConfig = (): AdapterConfig => {
  // In a real application, this would load from configuration service
  return defaultAdapterConfig;
};