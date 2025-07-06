/**
 * UI Interfaces Configuration
 *
 * Configures type checking, validation, and interface defaults
 */

export interface InterfaceConfig {
  /** Type checking configuration */
  typeChecking: {
    /** Enable strict type checking */
    strict: boolean;

    /** Enable null checks */
    nullChecks: boolean;

    /** Enable undefined checks */
    undefinedChecks: boolean;

    /** Enable excess property checks */
    excessPropertyChecks: boolean;
  };

  /** Component prop validation */
  propValidation: {
    /** Enable runtime prop validation */
    enabled: boolean;

    /** Validation level */
    level: 'error' | 'warning' | 'info';

    /** Log validation errors */
    logErrors: boolean;

    /** Throw on validation errors */
    throwOnError: boolean;
  };

  /** Default values for common interfaces */
  defaults: {
    /** Default button props */
    button: {
      variant: 'primary' | 'secondary' | 'danger';
      size: 'small' | 'medium' | 'large';
      disabled: boolean;
    };

    /** Default form props */
    form: {
      validateOnBlur: boolean;
      validateOnChange: boolean;
      autoComplete: boolean;
    };

    /** Default layout props */
    layout: {
      spacing: number;
      responsive: boolean;
      fluid: boolean;
    };
  };

  /** Event handling configuration */
  events: {
    /** Enable event delegation */
    delegation: boolean;

    /** Event listener options */
    listenerOptions: {
      passive: boolean;
      capture: boolean;
    };

    /** Custom event namespace */
    namespace: string;
  };

  /** Theme interface settings */
  theme: {
    /** Enable theme validation */
    validation: boolean;

    /** Default theme values */
    defaults: {
      colorScheme: 'light' | 'dark' | 'auto';
      fontSize: 'small' | 'medium' | 'large';
      borderRadius: number;
      spacing: number;
    };
  };

  /** Plugin interface settings */
  plugin: {
    /** Enable plugin type checking */
    typeChecking: boolean;

    /** Allowed plugin prop types */
    allowedPropTypes: string[];

    /** Required plugin interface methods */
    requiredMethods: string[];
  };
}

export const defaultInterfaceConfig: InterfaceConfig = {
  typeChecking: {
    strict: true,
    nullChecks: true,
    undefinedChecks: true,
    excessPropertyChecks: true,
  },
  propValidation: {
    enabled: true,
    level: 'warning',
    logErrors: true,
    throwOnError: false,
  },
  defaults: {
    button: {
      variant: 'primary',
      size: 'medium',
      disabled: false,
    },
    form: {
      validateOnBlur: true,
      validateOnChange: true,
      autoComplete: true,
    },
    layout: {
      spacing: 16,
      responsive: true,
      fluid: false,
    },
  },
  events: {
    delegation: true,
    listenerOptions: {
      passive: true,
      capture: false,
    },
    namespace: 'cnc-ui',
  },
  theme: {
    validation: true,
    defaults: {
      colorScheme: 'light',
      fontSize: 'medium',
      borderRadius: 4,
      spacing: 8,
    },
  },
  plugin: {
    typeChecking: true,
    allowedPropTypes: ['string', 'number', 'boolean', 'object', 'array', 'function'],
    requiredMethods: ['render', 'init', 'destroy'],
  },
};

export const getInterfaceConfig = (): InterfaceConfig =>
  // In a real application, this would load from configuration service
  defaultInterfaceConfig;
