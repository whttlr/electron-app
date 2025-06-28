// Theme constants extracted from the original constants.ts file
export const AXIS_COLORS = {
  z: '#00f', // Blue for Z
  y: '#f00', // Red for Y  
  x: '#2f2'  // Green for X
};

// Visual scale for the preview
export const VISUAL_SCALE = 0.02;

// Machine scaling constants
export const MACHINE_SCALE_FACTOR = 50;

// UI Layout constants
export const UI_CONSTANTS = {
  defaultCardSize: 'small' as const,
  defaultGutter: [16, 16] as [number, number],
  containerPadding: '20px',
  maxWidth: '1400px'
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  transitionDuration: '0.3s',
  easingFunction: 'ease-in-out'
};

// Extended theme design tokens
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#e6f7ff',
      100: '#bae7ff',
      500: '#1890ff',
      600: '#096dd9',
      700: '#0050b3'
    },
    success: {
      500: '#52c41a',
      600: '#389e0d'
    },
    warning: {
      500: '#faad14',
      600: '#d48806'
    },
    error: {
      500: '#ff4d4f',
      600: '#cf1322'
    },
    axis: AXIS_COLORS,
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e8e8e8',
      300: '#d9d9d9',
      400: '#bfbfbf',
      500: '#8c8c8c',
      600: '#595959',
      700: '#434343',
      800: '#262626',
      900: '#1f1f1f'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  borders: {
    thin: '1px solid',
    medium: '2px solid',
    thick: '4px solid'
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1070,
    notification: 1080
  }
};

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px'
};

// Theme mode constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

// CNC-specific color mappings
export const CNC_STATUS_COLORS = {
  connected: DESIGN_TOKENS.colors.success[500],
  disconnected: DESIGN_TOKENS.colors.neutral[400],
  error: DESIGN_TOKENS.colors.error[500],
  warning: DESIGN_TOKENS.colors.warning[500],
  homing: DESIGN_TOKENS.colors.primary[500],
  jogging: DESIGN_TOKENS.colors.primary[600]
};

// Motion state colors
export const MOTION_COLORS = {
  idle: DESIGN_TOKENS.colors.neutral[500],
  moving: DESIGN_TOKENS.colors.primary[500],
  paused: DESIGN_TOKENS.colors.warning[500],
  alarm: DESIGN_TOKENS.colors.error[500]
};