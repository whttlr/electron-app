import type { ThemeConfig as AntdThemeConfig } from 'antd';

export interface AxisColors {
  x: string;
  y: string;
  z: string;
}

export interface CNCColors {
  connected: string;
  disconnected: string;
  error: string;
  warning: string;
  homing: string;
  jogging: string;
}

export interface UIConstants {
  defaultCardSize: 'small' | 'default' | 'large';
  defaultGutter: [number, number];
  containerPadding: string;
  maxWidth: string;
}

export interface AnimationConstants {
  transitionDuration: string;
  easingFunction: string;
}

// Legacy theme config for backward compatibility
export interface ThemeConfig {
  primaryColor: string;
  axisColors: AxisColors;
}

// New comprehensive theme configuration for Ant Design v5
export interface CustomThemeConfig {
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
  spacing: number;
  axisColors: AxisColors;
  cncColors: CNCColors;
}

// Theme context type with v5 support
export interface ThemeContextType {
  themeConfig: CustomThemeConfig;
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  updateTheme: (config: Partial<CustomThemeConfig>) => void;
  antdTheme: AntdThemeConfig;
}

export interface ColorPalette {
  50: string;
  100: string;
  500: string;
  600: string;
  700?: string;
}

export interface DesignTokens {
  colors: {
    primary: ColorPalette;
    success: Omit<ColorPalette, '50' | '100'>;
    warning: Omit<ColorPalette, '50' | '100'>;
    error: Omit<ColorPalette, '50' | '100'>;
    axis: AxisColors;
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borders: {
    thin: string;
    medium: string;
    thick: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    notification: number;
  };
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface CNCStatusColors {
  connected: string;
  disconnected: string;
  error: string;
  warning: string;
  homing: string;
  jogging: string;
}

export interface MotionColors {
  idle: string;
  moving: string;
  paused: string;
  alarm: string;
}