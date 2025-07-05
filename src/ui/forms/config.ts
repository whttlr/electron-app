/**
 * UI Forms Configuration
 * 
 * Configures form behavior, validation rules, and defaults for CNC applications
 */

export interface FormConfig {
  /** Validation configuration */
  validation: {
    /** Enable real-time validation */
    realTimeValidation: boolean;
    
    /** Validation debounce delay in milliseconds */
    validationDelay: number;
    
    /** Show validation errors on blur */
    validateOnBlur: boolean;
    
    /** Show validation errors on change */
    validateOnChange: boolean;
  };
  
  /** Auto-save configuration */
  autoSave: {
    /** Enable automatic saving */
    enabled: boolean;
    
    /** Save interval in milliseconds */
    saveInterval: number;
    
    /** Save on form blur */
    saveOnBlur: boolean;
  };
  
  /** CNC-specific validation rules */
  cncValidation: {
    /** Coordinate bounds validation */
    coordinateBounds: {
      x: { min: number; max: number };
      y: { min: number; max: number };
      z: { min: number; max: number };
    };
    
    /** Feed rate limits */
    feedRateLimits: {
      min: number;
      max: number;
      default: number;
    };
    
    /** Spindle speed limits */
    spindleSpeedLimits: {
      min: number;
      max: number;
      default: number;
    };
    
    /** Precision settings */
    precision: {
      coordinates: number;
      feedRate: number;
      spindleSpeed: number;
    };
  };
  
  /** Form interaction settings */
  interaction: {
    /** Enable keyboard shortcuts */
    keyboardShortcuts: boolean;
    
    /** Enable undo/redo */
    undoRedo: boolean;
    
    /** Maximum undo stack size */
    undoStackSize: number;
    
    /** Confirm destructive actions */
    confirmDestructive: boolean;
  };
  
  /** Mobile optimization */
  mobile: {
    /** Use mobile-optimized inputs */
    mobileInputs: boolean;
    
    /** Large touch targets */
    largeTouchTargets: boolean;
    
    /** Haptic feedback on interactions */
    hapticFeedback: boolean;
  };
  
  /** Accessibility settings */
  accessibility: {
    /** Enable high contrast mode */
    highContrast: boolean;
    
    /** Enable screen reader announcements */
    screenReaderAnnouncements: boolean;
    
    /** Enable keyboard navigation hints */
    keyboardHints: boolean;
  };
}

export const defaultFormConfig: FormConfig = {
  validation: {
    realTimeValidation: true,
    validationDelay: 300,
    validateOnBlur: true,
    validateOnChange: true,
  },
  autoSave: {
    enabled: true,
    saveInterval: 5000,
    saveOnBlur: true,
  },
  cncValidation: {
    coordinateBounds: {
      x: { min: -500, max: 500 },
      y: { min: -500, max: 500 },
      z: { min: -100, max: 100 },
    },
    feedRateLimits: {
      min: 1,
      max: 5000,
      default: 1000,
    },
    spindleSpeedLimits: {
      min: 100,
      max: 24000,
      default: 12000,
    },
    precision: {
      coordinates: 3,
      feedRate: 0,
      spindleSpeed: 0,
    },
  },
  interaction: {
    keyboardShortcuts: true,
    undoRedo: true,
    undoStackSize: 50,
    confirmDestructive: true,
  },
  mobile: {
    mobileInputs: true,
    largeTouchTargets: true,
    hapticFeedback: true,
  },
  accessibility: {
    highContrast: false,
    screenReaderAnnouncements: true,
    keyboardHints: true,
  },
};

export const getFormConfig = (): FormConfig => {
  // In a real application, this would load from configuration service
  return defaultFormConfig;
};