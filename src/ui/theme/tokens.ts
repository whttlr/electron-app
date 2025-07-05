/**
 * Unified Design Token System
 * 
 * This file consolidates all design tokens into a single source of truth
 * that supports the component abstraction layer and future migrations.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

/**
 * Base color palette - semantic naming for component abstraction
 */
export const colors = {
  // Primary brand colors (CNC Purple theme)
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',    // Main primary
    600: '#9333ea',    // Primary hover
    700: '#7c3aed',    // Primary active
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Secondary/neutral colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Industrial/CNC specific colors
  industrial: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Accent colors for highlights and special cases
  accent: {
    orange: '#f97316',
    emerald: '#10b981',
    cyan: '#06b6d4',
    pink: '#ec4899',
    yellow: '#eab308',
    violet: '#8b5cf6',
  },
};

/**
 * Semantic color mappings for component interfaces
 * These provide stable names that can map to different implementations
 */
export const semanticColors = {
  // Background colors
  background: {
    primary: colors.secondary[950],     // Main app background
    secondary: colors.secondary[900],   // Card backgrounds
    tertiary: colors.secondary[800],    // Elevated surfaces
    inverse: colors.secondary[50],      // Light mode primary
  },

  // Foreground/text colors
  foreground: {
    primary: colors.secondary[50],      // Primary text
    secondary: colors.secondary[400],   // Secondary text
    tertiary: colors.secondary[500],    // Muted text
    inverse: colors.secondary[900],     // Dark text on light
  },

  // Border colors
  border: {
    primary: colors.secondary[800],     // Default borders
    secondary: colors.secondary[700],   // Subtle borders
    accent: colors.primary[600],        // Accent borders
    focus: colors.primary[500],         // Focus indicators
  },

  // Interactive states
  interactive: {
    primary: colors.primary[600],       // Primary buttons, links
    primaryHover: colors.primary[700],  // Primary hover state
    secondary: colors.secondary[600],   // Secondary buttons
    secondaryHover: colors.secondary[500], // Secondary hover
    disabled: colors.secondary[700],    // Disabled elements
    muted: colors.secondary[600],       // Muted elements
  },

  // Status colors (semantic)
  status: {
    success: colors.success[500],
    successSubtle: colors.success[900],
    warning: colors.warning[500],
    warningSubtle: colors.warning[900],
    danger: colors.danger[500],
    dangerSubtle: colors.danger[900],
    info: colors.info[500],
    infoSubtle: colors.info[900],
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  0: '0rem',          // 0px
  px: '0.0625rem',    // 1px
  0.5: '0.125rem',    // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  11: '2.75rem',      // 44px
  12: '3rem',         // 48px
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  20: '5rem',         // 80px
  24: '6rem',         // 96px
  28: '7rem',         // 112px
  32: '8rem',         // 128px
  36: '9rem',         // 144px
  40: '10rem',        // 160px
  44: '11rem',        // 176px
  48: '12rem',        // 192px
  52: '13rem',        // 208px
  56: '14rem',        // 224px
  60: '15rem',        // 240px
  64: '16rem',        // 256px
  72: '18rem',        // 288px
  80: '20rem',        // 320px
  96: '24rem',        // 384px
};

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  none: '0rem',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',     // Fully rounded
};

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // CNC-specific shadows
  cnc: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  'cnc-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'cnc-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Colored shadows for focus states
  'focus-primary': '0 0 0 3px rgba(168, 85, 247, 0.1)',
  'focus-danger': '0 0 0 3px rgba(239, 68, 68, 0.1)',
  'focus-success': '0 0 0 3px rgba(34, 197, 94, 0.1)',
};

// ============================================================================
// ANIMATION & TRANSITIONS
// ============================================================================

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    ease: 'ease',
    linear: 'linear',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transition combinations
  all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============================================================================
// BREAKPOINTS & Z-INDEX
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
};

// ============================================================================
// CNC-SPECIFIC TOKENS
// ============================================================================

export const cncTokens = {
  // Machine status colors
  status: {
    connected: semanticColors.status.success,
    disconnected: semanticColors.status.danger,
    idle: colors.warning[500],
    running: colors.info[500],
    error: semanticColors.status.danger,
    warning: semanticColors.status.warning,
    emergency: colors.danger[600],
  },

  // Precision indicators
  precision: {
    high: semanticColors.status.success,
    medium: semanticColors.status.warning,
    low: semanticColors.status.danger,
  },

  // Control zones and safety
  controls: {
    emergency: colors.danger[600],
    caution: colors.warning[500],
    normal: colors.primary[500],
    safe: colors.success[500],
    disabled: semanticColors.interactive.disabled,
  },

  // Visualization colors
  visualization: {
    workspace: colors.secondary[100],
    workspaceBackground: colors.secondary[900],
    tool: colors.primary[500],
    toolPath: colors.accent.orange,
    origin: colors.secondary[600],
    grid: colors.secondary[800],
    gridMinor: colors.secondary[850],
    axes: {
      x: colors.danger[500],      // X-axis red
      y: colors.success[500],     // Y-axis green  
      z: colors.info[500],        // Z-axis blue
    },
  },

  // Measurement and data display
  measurement: {
    precise: colors.success[400],
    approximate: colors.warning[400],
    error: colors.danger[400],
    inactive: colors.secondary[600],
  },
};

// ============================================================================
// UNIFIED DESIGN TOKENS EXPORT
// ============================================================================

/**
 * Main design tokens object - single source of truth
 */
export const designTokens = {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  cncTokens,
} as const;

/**
 * Component-specific token mappings
 * These provide semantic names that component interfaces can use
 */
export const componentTokens = {
  // Button tokens
  button: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[6]}`,
    },
    borderRadius: {
      sm: borderRadius.md,
      md: borderRadius.md,
      lg: borderRadius.lg,
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
    },
  },

  // Card tokens
  card: {
    padding: spacing[6],
    borderRadius: borderRadius.lg,
    shadow: shadows.base,
    borderWidth: '1px',
  },

  // Form tokens
  form: {
    spacing: spacing[4],
    labelSpacing: spacing[2],
    inputHeight: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
    },
    inputPadding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[3]}`,
      lg: `${spacing[3]} ${spacing[4]}`,
    },
  },
} as const;

// Type definitions for TypeScript
export type ColorScale = typeof colors.primary;
export type SemanticColor = keyof typeof semanticColors;
export type SpacingValue = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type BorderRadiusValue = keyof typeof borderRadius;
export type ShadowValue = keyof typeof shadows;
export type BreakpointValue = keyof typeof breakpoints;
export type ZIndexValue = keyof typeof zIndex;

export default designTokens;