/**
 * UI Controls Configuration
 * 
 * Configures CNC control interface components and behavior
 */

export interface ControlsConfig {
  /** Jog controls configuration */
  jog: {
    /** Default jog distances */
    defaultDistances: number[];
    
    /** Maximum jog distance */
    maxDistance: number;
    
    /** Minimum jog distance */
    minDistance: number;
    
    /** Default jog speed */
    defaultSpeed: number;
    
    /** Speed range */
    speedRange: { min: number; max: number };
    
    /** Enable continuous jogging */
    continuousJog: boolean;
    
    /** Jog acceleration */
    acceleration: number;
    
    /** Axis configuration */
    axes: {
      x: { enabled: boolean; label: string; direction: 1 | -1 };
      y: { enabled: boolean; label: string; direction: 1 | -1 };
      z: { enabled: boolean; label: string; direction: 1 | -1 };
    };
  };
  
  /** Emergency stop configuration */
  emergencyStop: {
    /** Enable emergency stop */
    enabled: boolean;
    
    /** Emergency stop button size */
    buttonSize: 'small' | 'medium' | 'large';
    
    /** Confirmation required */
    requireConfirmation: boolean;
    
    /** Auto-reset after stop */
    autoReset: boolean;
    
    /** Reset delay in milliseconds */
    resetDelay: number;
    
    /** Visual indicators */
    indicators: {
      color: string;
      flashRate: number;
      sound: boolean;
    };
  };
  
  /** Status indicators configuration */
  statusIndicators: {
    /** Update frequency in milliseconds */
    updateFrequency: number;
    
    /** Connection status */
    connection: {
      showStatus: boolean;
      colors: {
        connected: string;
        disconnected: string;
        connecting: string;
        error: string;
      };
    };
    
    /** Machine status */
    machine: {
      showStatus: boolean;
      states: {
        idle: { color: string; label: string };
        running: { color: string; label: string };
        paused: { color: string; label: string };
        error: { color: string; label: string };
        homing: { color: string; label: string };
      };
    };
    
    /** Position display */
    position: {
      showPosition: boolean;
      precision: number;
      units: 'mm' | 'inches';
      coordinates: ('x' | 'y' | 'z')[];
    };
  };
  
  /** Coordinate display configuration */
  coordinateDisplay: {
    /** Display precision */
    precision: number;
    
    /** Default units */
    units: 'mm' | 'inches';
    
    /** Show work coordinates */
    showWorkCoordinates: boolean;
    
    /** Show machine coordinates */
    showMachineCoordinates: boolean;
    
    /** Coordinate system */
    coordinateSystem: 'absolute' | 'relative' | 'both';
    
    /** Zero offset display */
    zeroOffset: boolean;
    
    /** Update frequency */
    updateFrequency: number;
  };
  
  /** Machine status monitor configuration */
  machineStatusMonitor: {
    /** Enable monitoring */
    enabled: boolean;
    
    /** Monitoring frequency */
    frequency: number;
    
    /** Display metrics */
    metrics: {
      feedRate: boolean;
      spindleSpeed: boolean;
      temperature: boolean;
      load: boolean;
      vibration: boolean;
    };
    
    /** Alert thresholds */
    alerts: {
      temperature: { warning: number; critical: number };
      load: { warning: number; critical: number };
      vibration: { warning: number; critical: number };
    };
    
    /** Data retention */
    dataRetention: {
      enabled: boolean;
      maxPoints: number;
      duration: number;
    };
  };
  
  /** Safety features */
  safety: {
    /** Enable safety checks */
    enabled: boolean;
    
    /** Limit switches */
    limitSwitches: {
      enabled: boolean;
      showStatus: boolean;
      bypassAllowed: boolean;
    };
    
    /** Soft limits */
    softLimits: {
      enabled: boolean;
      bounds: {
        x: { min: number; max: number };
        y: { min: number; max: number };
        z: { min: number; max: number };
      };
    };
    
    /** Home position */
    homePosition: {
      required: boolean;
      autoHome: boolean;
      homeSequence: ('x' | 'y' | 'z')[];
    };
  };
  
  /** User interface settings */
  ui: {
    /** Layout options */
    layout: 'compact' | 'standard' | 'expanded';
    
    /** Button sizes */
    buttonSize: 'small' | 'medium' | 'large';
    
    /** Show labels */
    showLabels: boolean;
    
    /** Show tooltips */
    showTooltips: boolean;
    
    /** Theme */
    theme: 'light' | 'dark' | 'auto';
    
    /** Animation */
    animation: {
      enabled: boolean;
      duration: number;
      easing: string;
    };
  };
  
  /** Keyboard shortcuts */
  keyboardShortcuts: {
    /** Enable keyboard shortcuts */
    enabled: boolean;
    
    /** Shortcut mappings */
    shortcuts: {
      emergencyStop: string;
      jogXPlus: string;
      jogXMinus: string;
      jogYPlus: string;
      jogYMinus: string;
      jogZPlus: string;
      jogZMinus: string;
      homeAll: string;
      homeX: string;
      homeY: string;
      homeZ: string;
    };
    
    /** Show shortcut hints */
    showHints: boolean;
  };
}

export const defaultControlsConfig: ControlsConfig = {
  jog: {
    defaultDistances: [0.1, 1, 10, 100],
    maxDistance: 1000,
    minDistance: 0.001,
    defaultSpeed: 1000,
    speedRange: { min: 1, max: 5000 },
    continuousJog: true,
    acceleration: 500,
    axes: {
      x: { enabled: true, label: 'X', direction: 1 },
      y: { enabled: true, label: 'Y', direction: 1 },
      z: { enabled: true, label: 'Z', direction: 1 },
    },
  },
  emergencyStop: {
    enabled: true,
    buttonSize: 'large',
    requireConfirmation: false,
    autoReset: false,
    resetDelay: 5000,
    indicators: {
      color: '#ff0000',
      flashRate: 500,
      sound: true,
    },
  },
  statusIndicators: {
    updateFrequency: 100,
    connection: {
      showStatus: true,
      colors: {
        connected: '#52c41a',
        disconnected: '#f5222d',
        connecting: '#faad14',
        error: '#ff4d4f',
      },
    },
    machine: {
      showStatus: true,
      states: {
        idle: { color: '#52c41a', label: 'Idle' },
        running: { color: '#1890ff', label: 'Running' },
        paused: { color: '#faad14', label: 'Paused' },
        error: { color: '#f5222d', label: 'Error' },
        homing: { color: '#722ed1', label: 'Homing' },
      },
    },
    position: {
      showPosition: true,
      precision: 3,
      units: 'mm',
      coordinates: ['x', 'y', 'z'],
    },
  },
  coordinateDisplay: {
    precision: 3,
    units: 'mm',
    showWorkCoordinates: true,
    showMachineCoordinates: true,
    coordinateSystem: 'both',
    zeroOffset: true,
    updateFrequency: 100,
  },
  machineStatusMonitor: {
    enabled: true,
    frequency: 500,
    metrics: {
      feedRate: true,
      spindleSpeed: true,
      temperature: true,
      load: true,
      vibration: false,
    },
    alerts: {
      temperature: { warning: 60, critical: 80 },
      load: { warning: 80, critical: 95 },
      vibration: { warning: 5, critical: 10 },
    },
    dataRetention: {
      enabled: true,
      maxPoints: 1000,
      duration: 300000, // 5 minutes
    },
  },
  safety: {
    enabled: true,
    limitSwitches: {
      enabled: true,
      showStatus: true,
      bypassAllowed: false,
    },
    softLimits: {
      enabled: true,
      bounds: {
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
        z: { min: -100, max: 100 },
      },
    },
    homePosition: {
      required: true,
      autoHome: false,
      homeSequence: ['z', 'x', 'y'],
    },
  },
  ui: {
    layout: 'standard',
    buttonSize: 'medium',
    showLabels: true,
    showTooltips: true,
    theme: 'light',
    animation: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
    },
  },
  keyboardShortcuts: {
    enabled: true,
    shortcuts: {
      emergencyStop: 'Escape',
      jogXPlus: 'ArrowRight',
      jogXMinus: 'ArrowLeft',
      jogYPlus: 'ArrowUp',
      jogYMinus: 'ArrowDown',
      jogZPlus: 'PageUp',
      jogZMinus: 'PageDown',
      homeAll: 'Home',
      homeX: 'Shift+X',
      homeY: 'Shift+Y',
      homeZ: 'Shift+Z',
    },
    showHints: true,
  },
};

export const getControlsConfig = (): ControlsConfig => {
  // In a real application, this would load from configuration service
  return defaultControlsConfig;
};