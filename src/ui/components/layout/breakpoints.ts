/**
 * Breakpoint Utilities
 * Responsive breakpoint definitions and utilities
 */

export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export type BreakpointKey = keyof typeof breakpoints;

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}

export type ResponsiveColumns = ResponsiveValue<number>;
export type ResponsiveDirection = ResponsiveValue<'row' | 'col' | 'vertical' | 'horizontal'>;