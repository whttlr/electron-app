/**
 * UI Theme Public API
 * 
 * Exports theming system components and utilities
 */

// Configuration
export { defaultThemeConfig, getThemeConfig } from './config';
export type { ThemeConfig } from './config';

// Design tokens
export { tokens } from './tokens';
export type { DesignTokens } from './tokens';

// Component styles
export { componentStyles } from './component-styles';
export type { ComponentStyles } from './component-styles';

// Responsive system
export { breakpoints, gridSystem, containerSizes } from './responsive';
export type { Breakpoints, GridSystem, ContainerSizes } from './responsive';

// Theme utilities
export { createTheme } from './utils/theme-factory';
export { interpolateColor } from './utils/color-utils';
export { calculateSpacing } from './utils/spacing-utils';
export { generateTypographyScale } from './utils/typography-utils';
export { createResponsiveValue } from './utils/responsive-utils';

// Theme hooks
export { useTheme } from './hooks/useTheme';
export { useResponsive } from './hooks/useResponsive';
export { useColorScheme } from './hooks/useColorScheme';
export { useDarkMode } from './hooks/useDarkMode';

// Theme constants
export { THEME_MODES, COLOR_SCHEMES, BREAKPOINT_NAMES } from './constants';

// Theme types
export type {
  Theme,
  ThemeMode,
  ColorScheme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeShadows,
  ThemeBorderRadius,
  ResponsiveValue,
  BreakpointValue
} from './types';