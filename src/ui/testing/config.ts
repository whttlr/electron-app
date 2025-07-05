/**
 * UI Testing Configuration
 * 
 * Configures testing utilities and behavior for UI components
 */

export interface TestingConfig {
  /** Mobile testing configuration */
  mobile: {
    /** Device presets for testing */
    devicePresets: {
      [deviceName: string]: {
        width: number;
        height: number;
        pixelRatio: number;
        userAgent: string;
        touch: boolean;
      };
    };
    
    /** Touch event simulation settings */
    touchEvents: {
      /** Default touch duration in milliseconds */
      touchDuration: number;
      
      /** Swipe gesture thresholds */
      swipeThresholds: {
        minDistance: number;
        maxTime: number;
      };
      
      /** Pinch gesture settings */
      pinchSettings: {
        minScale: number;
        maxScale: number;
        sensitivity: number;
      };
    };
    
    /** Performance testing settings */
    performance: {
      /** Enable performance monitoring */
      enabled: boolean;
      
      /** Performance thresholds */
      thresholds: {
        renderTime: number;
        memoryUsage: number;
        frameRate: number;
      };
    };
  };
  
  /** Visual regression testing configuration */
  visualRegression: {
    /** Screenshot settings */
    screenshots: {
      /** Output directory for screenshots */
      outputDir: string;
      
      /** Image format */
      format: 'png' | 'jpg' | 'webp';
      
      /** Image quality (0-100) */
      quality: number;
      
      /** Pixel density */
      pixelRatio: number;
    };
    
    /** Comparison settings */
    comparison: {
      /** Pixel difference threshold */
      threshold: number;
      
      /** Enable anti-aliasing detection */
      antiAliasing: boolean;
      
      /** Ignore regions */
      ignoreRegions: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }>;
    };
    
    /** Baseline management */
    baseline: {
      /** Auto-update baselines */
      autoUpdate: boolean;
      
      /** Baseline directory */
      baselineDir: string;
      
      /** Diff output directory */
      diffDir: string;
    };
  };
  
  /** Component testing configuration */
  component: {
    /** Default render options */
    defaultRenderOptions: {
      /** Enable strict mode */
      strictMode: boolean;
      
      /** Default providers */
      providers: string[];
      
      /** Default props */
      defaultProps: Record<string, any>;
    };
    
    /** Mock settings */
    mocks: {
      /** Enable automatic mocking */
      autoMock: boolean;
      
      /** Mock directories */
      mockDirs: string[];
      
      /** Mock patterns */
      mockPatterns: string[];
    };
  };
  
  /** Accessibility testing configuration */
  accessibility: {
    /** A11y testing rules */
    rules: {
      /** Enable color contrast checking */
      colorContrast: boolean;
      
      /** Enable keyboard navigation testing */
      keyboardNavigation: boolean;
      
      /** Enable screen reader testing */
      screenReader: boolean;
      
      /** Enable ARIA validation */
      ariaValidation: boolean;
    };
    
    /** Automation settings */
    automation: {
      /** Enable automated a11y testing */
      enabled: boolean;
      
      /** A11y testing library */
      library: 'axe' | 'lighthouse' | 'custom';
      
      /** Test level */
      level: 'AA' | 'AAA';
    };
  };
  
  /** Test environment configuration */
  environment: {
    /** Test environment */
    env: 'jsdom' | 'node' | 'browser';
    
    /** Setup files */
    setupFiles: string[];
    
    /** Teardown files */
    teardownFiles: string[];
    
    /** Global variables */
    globals: Record<string, any>;
  };
  
  /** Reporting configuration */
  reporting: {
    /** Enable test reporting */
    enabled: boolean;
    
    /** Report formats */
    formats: ('json' | 'html' | 'xml' | 'text')[];
    
    /** Report output directory */
    outputDir: string;
    
    /** Coverage settings */
    coverage: {
      enabled: boolean;
      threshold: number;
      includePatterns: string[];
      excludePatterns: string[];
    };
  };
}

export const defaultTestingConfig: TestingConfig = {
  mobile: {
    devicePresets: {
      'iPhone 12': {
        width: 390,
        height: 844,
        pixelRatio: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        touch: true,
      },
      'iPad Air': {
        width: 820,
        height: 1180,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        touch: true,
      },
      'Android Phone': {
        width: 360,
        height: 800,
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
        touch: true,
      },
    },
    touchEvents: {
      touchDuration: 100,
      swipeThresholds: {
        minDistance: 50,
        maxTime: 300,
      },
      pinchSettings: {
        minScale: 0.5,
        maxScale: 3.0,
        sensitivity: 0.1,
      },
    },
    performance: {
      enabled: true,
      thresholds: {
        renderTime: 16, // 60fps
        memoryUsage: 50, // MB
        frameRate: 60,
      },
    },
  },
  visualRegression: {
    screenshots: {
      outputDir: '__screenshots__',
      format: 'png',
      quality: 90,
      pixelRatio: 1,
    },
    comparison: {
      threshold: 0.1,
      antiAliasing: true,
      ignoreRegions: [],
    },
    baseline: {
      autoUpdate: false,
      baselineDir: '__screenshots__/baseline',
      diffDir: '__screenshots__/diff',
    },
  },
  component: {
    defaultRenderOptions: {
      strictMode: true,
      providers: ['ComponentProvider', 'ThemeProvider'],
      defaultProps: {},
    },
    mocks: {
      autoMock: true,
      mockDirs: ['__mocks__'],
      mockPatterns: ['*.mock.ts', '*.mock.tsx'],
    },
  },
  accessibility: {
    rules: {
      colorContrast: true,
      keyboardNavigation: true,
      screenReader: true,
      ariaValidation: true,
    },
    automation: {
      enabled: true,
      library: 'axe',
      level: 'AA',
    },
  },
  environment: {
    env: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    teardownFiles: [],
    globals: {},
  },
  reporting: {
    enabled: true,
    formats: ['html', 'json'],
    outputDir: 'test-reports',
    coverage: {
      enabled: true,
      threshold: 80,
      includePatterns: ['src/**/*.{ts,tsx}'],
      excludePatterns: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.{ts,tsx}'],
    },
  },
};

export const getTestingConfig = (): TestingConfig => {
  // In a real application, this would load from configuration service
  return defaultTestingConfig;
};