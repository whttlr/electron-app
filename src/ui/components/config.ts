/**
 * UI Components Configuration
 * 
 * Configures behavior and defaults for domain-specific components
 */

export interface ComponentConfig {
  /** Chart configuration */
  charts: {
    /** Default chart dimensions */
    defaultSize: { width: number; height: number };
    
    /** Animation duration in milliseconds */
    animationDuration: number;
    
    /** Color palette for charts */
    colorPalette: string[];
    
    /** Refresh interval for real-time charts */
    refreshInterval: number;
  };
  
  /** Mobile optimization settings */
  mobile: {
    /** Touch target minimum size */
    touchTargetSize: number;
    
    /** Touch sensitivity multiplier */
    touchSensitivity: number;
    
    /** Enable haptic feedback */
    hapticFeedback: boolean;
    
    /** Gesture recognition thresholds */
    gestureThresholds: {
      swipe: number;
      pinch: number;
      tap: number;
    };
  };
  
  /** Monitoring dashboard settings */
  monitoring: {
    /** Update frequency in milliseconds */
    updateFrequency: number;
    
    /** Maximum number of data points to display */
    maxDataPoints: number;
    
    /** Alert thresholds */
    alertThresholds: {
      warning: number;
      critical: number;
    };
  };
  
  /** Animation settings */
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
      default: string;
      bounce: string;
      smooth: string;
    };
  };
  
  /** Notification system settings */
  notifications: {
    /** Default notification duration */
    defaultDuration: number;
    
    /** Maximum number of notifications */
    maxNotifications: number;
    
    /** Position on screen */
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    
    /** Auto-dismiss settings */
    autoDismiss: boolean;
  };
}

export const defaultComponentConfig: ComponentConfig = {
  charts: {
    defaultSize: { width: 400, height: 300 },
    animationDuration: 300,
    colorPalette: [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', 
      '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
    ],
    refreshInterval: 1000,
  },
  mobile: {
    touchTargetSize: 44,
    touchSensitivity: 1.2,
    hapticFeedback: true,
    gestureThresholds: {
      swipe: 50,
      pinch: 0.1,
      tap: 300,
    },
  },
  monitoring: {
    updateFrequency: 500,
    maxDataPoints: 100,
    alertThresholds: {
      warning: 80,
      critical: 95,
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
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  notifications: {
    defaultDuration: 5000,
    maxNotifications: 5,
    position: 'top-right',
    autoDismiss: true,
  },
};

export const getComponentConfig = (): ComponentConfig => {
  // In a real application, this would load from configuration service
  return defaultComponentConfig;
};