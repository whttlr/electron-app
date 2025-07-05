/**
 * UI Providers Configuration
 * 
 * Configures React context providers for global UI state management
 */

export interface ProviderConfig {
  /** Component provider configuration */
  component: {
    /** Enable component registration */
    enableRegistration: boolean;
    
    /** Default component props */
    defaultProps: Record<string, any>;
    
    /** Enable prop validation */
    enableValidation: boolean;
    
    /** Component cache settings */
    cache: {
      enabled: boolean;
      maxSize: number;
      ttl: number;
    };
  };
  
  /** Theme provider configuration */
  theme: {
    /** Default theme */
    defaultTheme: 'light' | 'dark' | 'auto';
    
    /** Enable theme persistence */
    persist: boolean;
    
    /** Theme transition duration */
    transitionDuration: number;
    
    /** Available themes */
    themes: string[];
    
    /** Custom theme variables */
    customVariables: Record<string, any>;
  };
  
  /** Accessibility provider configuration */
  accessibility: {
    /** Enable accessibility features */
    enabled: boolean;
    
    /** Default accessibility settings */
    defaults: {
      highContrast: boolean;
      reducedMotion: boolean;
      screenReader: boolean;
      keyboardNavigation: boolean;
    };
    
    /** Accessibility announcement settings */
    announcements: {
      enabled: boolean;
      politeness: 'polite' | 'assertive' | 'off';
      debounceDelay: number;
    };
  };
  
  /** Layout provider configuration */
  layout: {
    /** Responsive breakpoints */
    breakpoints: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    
    /** Grid system settings */
    grid: {
      columns: number;
      gutter: number;
      margin: number;
    };
    
    /** Orientation handling */
    orientation: {
      enableDetection: boolean;
      debounceDelay: number;
    };
    
    /** Container settings */
    container: {
      maxWidth: number;
      padding: number;
      fluid: boolean;
    };
  };
  
  /** Plugin provider configuration */
  plugin: {
    /** Enable plugin UI integration */
    enabled: boolean;
    
    /** Plugin state management */
    stateManagement: {
      enabled: boolean;
      storageKey: string;
      syncInterval: number;
    };
    
    /** Plugin isolation settings */
    isolation: {
      enabled: boolean;
      sandboxMode: boolean;
      allowedDomains: string[];
    };
  };
  
  /** Performance optimization */
  performance: {
    /** Enable memo optimization */
    enableMemo: boolean;
    
    /** Enable lazy loading */
    enableLazyLoading: boolean;
    
    /** Virtual scrolling settings */
    virtualScrolling: {
      enabled: boolean;
      itemHeight: number;
      overscan: number;
    };
  };
}

export const defaultProviderConfig: ProviderConfig = {
  component: {
    enableRegistration: true,
    defaultProps: {},
    enableValidation: true,
    cache: {
      enabled: true,
      maxSize: 100,
      ttl: 300000, // 5 minutes
    },
  },
  theme: {
    defaultTheme: 'light',
    persist: true,
    transitionDuration: 300,
    themes: ['light', 'dark', 'auto'],
    customVariables: {},
  },
  accessibility: {
    enabled: true,
    defaults: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
    },
    announcements: {
      enabled: true,
      politeness: 'polite',
      debounceDelay: 100,
    },
  },
  layout: {
    breakpoints: {
      xs: 480,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1920,
    },
    grid: {
      columns: 12,
      gutter: 16,
      margin: 16,
    },
    orientation: {
      enableDetection: true,
      debounceDelay: 250,
    },
    container: {
      maxWidth: 1200,
      padding: 16,
      fluid: false,
    },
  },
  plugin: {
    enabled: true,
    stateManagement: {
      enabled: true,
      storageKey: 'cnc-plugin-state',
      syncInterval: 1000,
    },
    isolation: {
      enabled: true,
      sandboxMode: false,
      allowedDomains: ['localhost', '127.0.0.1'],
    },
  },
  performance: {
    enableMemo: true,
    enableLazyLoading: true,
    virtualScrolling: {
      enabled: false,
      itemHeight: 50,
      overscan: 5,
    },
  },
};

export const getProviderConfig = (): ProviderConfig => {
  // In a real application, this would load from configuration service
  return defaultProviderConfig;
};