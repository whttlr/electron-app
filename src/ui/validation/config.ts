/**
 * UI Validation Configuration
 * 
 * Configures validation system behavior and rules for CNC applications
 */

export interface ValidationConfig {
  /** Real-time validation settings */
  realTime: {
    /** Enable real-time validation */
    enabled: boolean;
    
    /** Validation delay in milliseconds */
    debounceDelay: number;
    
    /** Validate on field blur */
    validateOnBlur: boolean;
    
    /** Validate on field change */
    validateOnChange: boolean;
    
    /** Validate on form submit */
    validateOnSubmit: boolean;
  };
  
  /** CNC-specific validation rules */
  cnc: {
    /** Coordinate system validation */
    coordinates: {
      /** Default coordinate bounds */
      defaultBounds: {
        x: { min: number; max: number };
        y: { min: number; max: number };
        z: { min: number; max: number };
      };
      
      /** Decimal precision for coordinates */
      precision: number;
      
      /** Supported units */
      units: ('mm' | 'inches')[];
      
      /** Default unit */
      defaultUnit: 'mm' | 'inches';
    };
    
    /** Feed rate validation */
    feedRate: {
      /** Feed rate limits by machine type */
      limits: {
        mill: { min: number; max: number };
        lathe: { min: number; max: number };
        router: { min: number; max: number };
      };
      
      /** Default feed rate */
      default: number;
      
      /** Supported units */
      units: ('mm/min' | 'inches/min')[];
    };
    
    /** Tool validation */
    tools: {
      /** Tool number range */
      toolNumber: { min: number; max: number };
      
      /** Tool diameter limits */
      diameter: { min: number; max: number };
      
      /** Tool length limits */
      length: { min: number; max: number };
      
      /** Supported tool materials */
      materials: string[];
      
      /** Tool compatibility matrix */
      compatibility: Record<string, string[]>;
    };
    
    /** Spindle speed validation */
    spindleSpeed: {
      /** Speed limits by machine type */
      limits: {
        mill: { min: number; max: number };
        lathe: { min: number; max: number };
        router: { min: number; max: number };
      };
      
      /** Default spindle speed */
      default: number;
      
      /** Speed units */
      units: 'rpm';
    };
  };
  
  /** Form validation settings */
  form: {
    /** Show validation summary */
    showSummary: boolean;
    
    /** Focus first invalid field */
    focusFirstInvalid: boolean;
    
    /** Prevent submission with errors */
    preventSubmitWithErrors: boolean;
    
    /** Auto-scroll to first error */
    scrollToFirstError: boolean;
    
    /** Validation message display duration */
    messageDuration: number;
  };
  
  /** Error message configuration */
  errorMessages: {
    /** Default error messages */
    defaults: {
      required: string;
      invalidType: string;
      outOfRange: string;
      invalidFormat: string;
      tooShort: string;
      tooLong: string;
    };
    
    /** CNC-specific error messages */
    cnc: {
      coordinateOutOfBounds: string;
      feedRateTooHigh: string;
      feedRateTooLow: string;
      invalidToolNumber: string;
      toolNotCompatible: string;
      spindleSpeedOutOfRange: string;
    };
    
    /** Enable internationalization */
    i18n: boolean;
    
    /** Default language */
    defaultLanguage: string;
  };
  
  /** Accessibility settings */
  accessibility: {
    /** Enable screen reader announcements */
    announcements: boolean;
    
    /** Announcement delay */
    announcementDelay: number;
    
    /** Use ARIA live regions */
    useAriaLive: boolean;
    
    /** Error message politeness */
    errorPoliteness: 'polite' | 'assertive';
    
    /** Include field labels in error messages */
    includeFieldLabels: boolean;
  };
  
  /** Performance optimization */
  performance: {
    /** Enable validation caching */
    caching: boolean;
    
    /** Cache timeout in milliseconds */
    cacheTimeout: number;
    
    /** Batch validation updates */
    batchUpdates: boolean;
    
    /** Maximum concurrent validations */
    maxConcurrentValidations: number;
  };
  
  /** Custom validation settings */
  custom: {
    /** Enable custom validators */
    enabled: boolean;
    
    /** Custom validator timeout */
    timeout: number;
    
    /** Async validation support */
    asyncValidation: boolean;
    
    /** Server-side validation */
    serverValidation: {
      enabled: boolean;
      endpoint: string;
      method: 'POST' | 'PUT';
    };
  };
}

export const defaultValidationConfig: ValidationConfig = {
  realTime: {
    enabled: true,
    debounceDelay: 300,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnSubmit: true,
  },
  cnc: {
    coordinates: {
      defaultBounds: {
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
        z: { min: -100, max: 100 },
      },
      precision: 3,
      units: ['mm', 'inches'],
      defaultUnit: 'mm',
    },
    feedRate: {
      limits: {
        mill: { min: 50, max: 5000 },
        lathe: { min: 25, max: 3000 },
        router: { min: 100, max: 10000 },
      },
      default: 1000,
      units: ['mm/min', 'inches/min'],
    },
    tools: {
      toolNumber: { min: 1, max: 99 },
      diameter: { min: 0.1, max: 50 },
      length: { min: 5, max: 200 },
      materials: ['HSS', 'Carbide', 'Ceramic', 'Diamond'],
      compatibility: {
        mill: ['HSS', 'Carbide', 'Ceramic'],
        lathe: ['HSS', 'Carbide', 'Ceramic', 'Diamond'],
        router: ['HSS', 'Carbide'],
      },
    },
    spindleSpeed: {
      limits: {
        mill: { min: 100, max: 24000 },
        lathe: { min: 50, max: 4000 },
        router: { min: 5000, max: 30000 },
      },
      default: 12000,
      units: 'rpm',
    },
  },
  form: {
    showSummary: true,
    focusFirstInvalid: true,
    preventSubmitWithErrors: true,
    scrollToFirstError: true,
    messageDuration: 5000,
  },
  errorMessages: {
    defaults: {
      required: 'This field is required',
      invalidType: 'Invalid data type',
      outOfRange: 'Value is out of range',
      invalidFormat: 'Invalid format',
      tooShort: 'Value is too short',
      tooLong: 'Value is too long',
    },
    cnc: {
      coordinateOutOfBounds: 'Coordinate is outside machine limits',
      feedRateTooHigh: 'Feed rate exceeds machine maximum',
      feedRateTooLow: 'Feed rate is below machine minimum',
      invalidToolNumber: 'Invalid tool number',
      toolNotCompatible: 'Tool is not compatible with selected operation',
      spindleSpeedOutOfRange: 'Spindle speed is outside machine limits',
    },
    i18n: false,
    defaultLanguage: 'en',
  },
  accessibility: {
    announcements: true,
    announcementDelay: 100,
    useAriaLive: true,
    errorPoliteness: 'assertive',
    includeFieldLabels: true,
  },
  performance: {
    caching: true,
    cacheTimeout: 300000, // 5 minutes
    batchUpdates: true,
    maxConcurrentValidations: 10,
  },
  custom: {
    enabled: true,
    timeout: 5000,
    asyncValidation: true,
    serverValidation: {
      enabled: false,
      endpoint: '/api/validate',
      method: 'POST',
    },
  },
};

export const getValidationConfig = (): ValidationConfig => {
  // In a real application, this would load from configuration service
  return defaultValidationConfig;
};