/**
 * Responsive Hook
 * Hook for responsive behavior and breakpoint detection
 */

import { Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 * Hook for responsive behavior
 */
export const useResponsive = () => {
  const screens = useBreakpoint();
  
  return {
    isMobile: !screens.md,
    isTablet: screens.md && !screens.lg,
    isDesktop: screens.lg,
    isLargeDesktop: screens.xl,
    screens,
  };
};