/**
 * UI Theme Configuration
 * 
 * Configures theming system behavior and customization options
 */

export interface ThemeConfig {
  /** Default theme settings */
  defaults: {
    /** Default theme mode */
    mode: 'light' | 'dark' | 'high-contrast' | 'auto';
    
    /** Enable theme persistence */
    persist: boolean;
    
    /** Theme transition duration */
    transitionDuration: number;
    
    /** Enable system theme detection */
    systemTheme: boolean;
  };
  
  /** Color system configuration */
  colors: {
    /** Color palette customization */
    palette: {
      /** Primary color customization */
      primary: {
        adjustHue: number;
        adjustSaturation: number;
        adjustLightness: number;
      };
      
      /** Secondary color customization */
      secondary: {
        adjustHue: number;
        adjustSaturation: number;
        adjustLightness: number;
      };
    };
    
    /** Semantic color mappings */
    semantic: {
      error: string;
      warning: string;
      success: string;
      info: string;
    };
    
    /** Accessibility color settings */
    accessibility: {
      /** Minimum contrast ratio */
      minContrastRatio: number;
      
      /** High contrast mode settings */
      highContrast: {
        enabled: boolean;
        multiplier: number;
      };
    };
  };
  
  /** Typography configuration */
  typography: {
    /** Font family settings */
    fontFamily: {
      /** Primary font stack */
      primary: string[];
      
      /** Monospace font stack */
      monospace: string[];
      
      /** Enable web font loading */
      webFonts: boolean;
    };
    
    /** Font size settings */
    fontSize: {
      /** Base font size */
      base: number;
      
      /** Font size scale ratio */
      scale: number;
      
      /** Responsive font sizing */
      responsive: boolean;
    };
    
    /** Line height settings */
    lineHeight: {
      /** Base line height */
      base: number;
      
      /** Heading line height */
      heading: number;
      
      /** Body text line height */
      body: number;
    };
  };
  
  /** Spacing configuration */
  spacing: {
    /** Base spacing unit */
    base: number;
    
    /** Spacing scale multiplier */
    scale: number;
    
    /** Responsive spacing */
    responsive: boolean;
    
    /** Component-specific spacing */
    components: {
      button: { padding: number; margin: number };
      card: { padding: number; margin: number };
      form: { padding: number; margin: number };
    };
  };
  
  /** Responsive design configuration */
  responsive: {
    /** Breakpoint values */
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
      maxWidth: number;
    };
    
    /** Container settings */
    container: {
      padding: number;
      maxWidth: number;
    };
  };
  
  /** Animation configuration */
  animation: {
    /** Enable animations */
    enabled: boolean;
    
    /** Animation duration presets */
    duration: {
      fast: number;
      medium: number;
      slow: number;
    };
    
    /** Animation easing functions */
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
    
    /** Reduced motion support */
    reducedMotion: boolean;
  };
  
  /** Theme customization */
  customization: {
    /** Enable theme customization */
    enabled: boolean;
    
    /** Customizable properties */
    properties: string[];
    
    /** Theme presets */
    presets: Array<{
      name: string;
      description: string;
      config: Partial<ThemeConfig>;
    }>;
  };
}

export const defaultThemeConfig: ThemeConfig = {
  defaults: {
    mode: 'light',
    persist: true,
    transitionDuration: 300,
    systemTheme: true,
  },
  colors: {
    palette: {
      primary: {
        adjustHue: 0,
        adjustSaturation: 0,
        adjustLightness: 0,
      },
      secondary: {
        adjustHue: 0,
        adjustSaturation: 0,
        adjustLightness: 0,
      },
    },
    semantic: {
      error: '#f5222d',
      warning: '#faad14',
      success: '#52c41a',
      info: '#1890ff',
    },
    accessibility: {
      minContrastRatio: 4.5,
      highContrast: {
        enabled: false,
        multiplier: 1.5,
      },
    },
  },
  typography: {
    fontFamily: {
      primary: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      monospace: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      webFonts: false,
    },
    fontSize: {
      base: 16,
      scale: 1.25,
      responsive: true,
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
      body: 1.6,
    },
  },
  spacing: {
    base: 8,
    scale: 1.5,
    responsive: true,
    components: {
      button: { padding: 12, margin: 8 },
      card: { padding: 16, margin: 16 },
      form: { padding: 16, margin: 12 },
    },
  },
  responsive: {
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
      maxWidth: 1200,
    },
    container: {
      padding: 16,
      maxWidth: 1200,
    },
  },
  animation: {
    enabled: true,
    duration: {
      fast: 150,
      medium: 300,
      slow: 500,
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    reducedMotion: false,
  },
  customization: {
    enabled: true,
    properties: ['colors', 'typography', 'spacing', 'borderRadius'],
    presets: [
      {
        name: 'Default',
        description: 'Standard theme with balanced colors and spacing',
        config: {},
      },
      {
        name: 'High Contrast',
        description: 'Enhanced contrast for better accessibility',
        config: {
          defaults: { mode: 'high-contrast' },
        },
      },
      {
        name: 'Compact',
        description: 'Reduced spacing for information-dense interfaces',
        config: {
          spacing: { base: 4, scale: 1.2 },
        },
      },
    ],
  },
};

export const getThemeConfig = (): ThemeConfig => {
  // In a real application, this would load from configuration service
  return defaultThemeConfig;
};