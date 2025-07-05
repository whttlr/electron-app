/**
 * Responsive Design System Configuration
 * 
 * Mobile-first responsive design tokens and utilities optimized for
 * industrial CNC environments including tablets, touch screens, and mobile devices.
 */

// Breakpoint system optimized for industrial devices
export const breakpoints = {
  // Mobile phones (portrait)
  xs: 0,
  // Mobile phones (landscape) / Small tablets
  sm: 576,
  // Tablets (portrait) / Industrial touch panels
  md: 768,
  // Tablets (landscape) / Small desktop displays
  lg: 1024,
  // Desktop displays / Workshop monitors
  xl: 1280,
  // Large displays / Multi-monitor setups
  xxl: 1920,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Container max-widths for different breakpoints
export const containerSizes = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
} as const;

// Touch target sizes for industrial environments
export const touchTargets = {
  // Minimum touch target size (accessibility requirement)
  min: 44,
  // Recommended touch target for industrial gloves
  recommended: 64,
  // Large touch target for safety-critical controls
  large: 80,
  // Extra large for emergency controls
  emergency: 120,
} as const;

// Spacing scale adapted for different screen sizes
export const responsiveSpacing = {
  // Compact spacing for mobile
  mobile: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
  },
  // Standard spacing for tablets
  tablet: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  // Generous spacing for desktop
  desktop: {
    xs: 6,
    sm: 12,
    md: 24,
    lg: 36,
    xl: 48,
    xxl: 60,
  },
} as const;

// Typography scale for different screen sizes
export const responsiveTypography = {
  mobile: {
    h1: { fontSize: 24, lineHeight: 1.2, fontWeight: 700 },
    h2: { fontSize: 20, lineHeight: 1.3, fontWeight: 600 },
    h3: { fontSize: 18, lineHeight: 1.4, fontWeight: 600 },
    h4: { fontSize: 16, lineHeight: 1.4, fontWeight: 500 },
    body: { fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
    small: { fontSize: 12, lineHeight: 1.4, fontWeight: 400 },
    button: { fontSize: 14, lineHeight: 1, fontWeight: 500 },
  },
  tablet: {
    h1: { fontSize: 32, lineHeight: 1.2, fontWeight: 700 },
    h2: { fontSize: 24, lineHeight: 1.3, fontWeight: 600 },
    h3: { fontSize: 20, lineHeight: 1.4, fontWeight: 600 },
    h4: { fontSize: 18, lineHeight: 1.4, fontWeight: 500 },
    body: { fontSize: 16, lineHeight: 1.5, fontWeight: 400 },
    small: { fontSize: 14, lineHeight: 1.4, fontWeight: 400 },
    button: { fontSize: 16, lineHeight: 1, fontWeight: 500 },
  },
  desktop: {
    h1: { fontSize: 40, lineHeight: 1.2, fontWeight: 700 },
    h2: { fontSize: 32, lineHeight: 1.3, fontWeight: 600 },
    h3: { fontSize: 24, lineHeight: 1.4, fontWeight: 600 },
    h4: { fontSize: 20, lineHeight: 1.4, fontWeight: 500 },
    body: { fontSize: 16, lineHeight: 1.6, fontWeight: 400 },
    small: { fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
    button: { fontSize: 16, lineHeight: 1, fontWeight: 500 },
  },
} as const;

// Media query utilities
export const mediaQueries = {
  up: (breakpoint: Breakpoint) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint: Breakpoint) => {
    const nextBreakpoint = Object.values(breakpoints).find(bp => bp > breakpoints[breakpoint]);
    return `@media (max-width: ${(nextBreakpoint || breakpoints.xxl) - 1}px)`;
  },
  between: (min: Breakpoint, max: Breakpoint) => 
    `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`,
  only: (breakpoint: Breakpoint) => {
    const breakpointValues = Object.values(breakpoints);
    const currentIndex = breakpointValues.indexOf(breakpoints[breakpoint]);
    const nextValue = breakpointValues[currentIndex + 1];
    
    if (!nextValue) {
      return `@media (min-width: ${breakpoints[breakpoint]}px)`;
    }
    
    return `@media (min-width: ${breakpoints[breakpoint]}px) and (max-width: ${nextValue - 1}px)`;
  },
} as const;

// Responsive grid system
export const gridSystem = {
  columns: 12,
  gutterWidth: {
    xs: 16,
    sm: 16,
    md: 24,
    lg: 24,
    xl: 32,
    xxl: 32,
  },
  containerPadding: {
    xs: 16,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
} as const;

// Device-specific adaptations
export const deviceAdaptations = {
  // Industrial tablet optimizations
  tablet: {
    minTouchTarget: touchTargets.recommended,
    preferredFontSize: 16,
    toolbarHeight: 64,
    navigationHeight: 72,
    contentPadding: 24,
  },
  // Mobile phone optimizations
  mobile: {
    minTouchTarget: touchTargets.min,
    preferredFontSize: 14,
    toolbarHeight: 56,
    navigationHeight: 64,
    contentPadding: 16,
  },
  // Desktop/workshop monitor optimizations
  desktop: {
    minTouchTarget: 32, // Mouse/trackpad precision
    preferredFontSize: 16,
    toolbarHeight: 48,
    navigationHeight: 56,
    contentPadding: 32,
  },
} as const;

// Orientation-specific layouts
export const orientationLayouts = {
  portrait: {
    navigationPosition: 'bottom',
    toolbarPosition: 'top',
    sidebarWidth: '100%',
    contentColumns: 1,
  },
  landscape: {
    navigationPosition: 'left',
    toolbarPosition: 'top',
    sidebarWidth: 280,
    contentColumns: 2,
  },
} as const;

// CSS custom properties for responsive design
export const responsiveCSSVariables = `
  /* Breakpoints */
  --breakpoint-xs: ${breakpoints.xs}px;
  --breakpoint-sm: ${breakpoints.sm}px;
  --breakpoint-md: ${breakpoints.md}px;
  --breakpoint-lg: ${breakpoints.lg}px;
  --breakpoint-xl: ${breakpoints.xl}px;
  --breakpoint-xxl: ${breakpoints.xxl}px;
  
  /* Touch targets */
  --touch-target-min: ${touchTargets.min}px;
  --touch-target-recommended: ${touchTargets.recommended}px;
  --touch-target-large: ${touchTargets.large}px;
  --touch-target-emergency: ${touchTargets.emergency}px;
  
  /* Container sizes */
  --container-sm: ${containerSizes.sm}px;
  --container-md: ${containerSizes.md}px;
  --container-lg: ${containerSizes.lg}px;
  --container-xl: ${containerSizes.xl}px;
  --container-xxl: ${containerSizes.xxl}px;
` as const;

// Utility functions for responsive design
export const responsiveUtils = {
  // Check if current screen size matches breakpoint
  isBreakpoint: (breakpoint: Breakpoint): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints[breakpoint];
  },
  
  // Get current breakpoint
  getCurrentBreakpoint: (): Breakpoint => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    const breakpointEntries = Object.entries(breakpoints) as [Breakpoint, number][];
    
    // Find the largest breakpoint that fits
    for (let i = breakpointEntries.length - 1; i >= 0; i--) {
      const [name, value] = breakpointEntries[i];
      if (width >= value) {
        return name;
      }
    }
    
    return 'xs';
  },
  
  // Check if device supports touch
  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Check device orientation
  getOrientation: (): 'portrait' | 'landscape' => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },
  
  // Calculate responsive value based on breakpoint
  getResponsiveValue: <T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T => {
    const currentBreakpoint = responsiveUtils.getCurrentBreakpoint();
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    // Look for the largest matching breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint]!;
      }
    }
    
    return fallback;
  },
};

// React hook for responsive design
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('md');
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('landscape');
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  
  React.useEffect(() => {
    const updateResponsiveState = () => {
      setBreakpoint(responsiveUtils.getCurrentBreakpoint());
      setOrientation(responsiveUtils.getOrientation());
      setIsTouchDevice(responsiveUtils.isTouchDevice());
    };
    
    // Initial setup
    updateResponsiveState();
    
    // Listen for resize events
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);
    
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);
  
  return {
    breakpoint,
    orientation,
    isTouchDevice,
    isBreakpoint: (bp: Breakpoint) => responsiveUtils.isBreakpoint(bp),
    getResponsiveValue: responsiveUtils.getResponsiveValue,
  };
};

// CSS-in-JS responsive utilities
export const responsiveStyles = {
  // Container with responsive padding
  container: (breakpoint?: Breakpoint) => ({
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: breakpoint ? gridSystem.containerPadding[breakpoint] : gridSystem.containerPadding.md,
    paddingRight: breakpoint ? gridSystem.containerPadding[breakpoint] : gridSystem.containerPadding.md,
    maxWidth: breakpoint && containerSizes[breakpoint] ? containerSizes[breakpoint] : '100%',
  }),
  
  // Responsive grid item
  gridItem: (columns: number, breakpoint: Breakpoint = 'md') => ({
    width: `${(columns / gridSystem.columns) * 100}%`,
    paddingLeft: gridSystem.gutterWidth[breakpoint] / 2,
    paddingRight: gridSystem.gutterWidth[breakpoint] / 2,
  }),
  
  // Touch-friendly button
  touchButton: (size: keyof typeof touchTargets = 'recommended') => ({
    minHeight: touchTargets[size],
    minWidth: touchTargets[size],
    padding: `${touchTargets[size] / 4}px ${touchTargets[size] / 3}px`,
  }),
};

export default {
  breakpoints,
  containerSizes,
  touchTargets,
  responsiveSpacing,
  responsiveTypography,
  mediaQueries,
  gridSystem,
  deviceAdaptations,
  orientationLayouts,
  responsiveCSSVariables,
  responsiveUtils,
  useResponsive,
  responsiveStyles,
};