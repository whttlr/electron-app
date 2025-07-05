/**
 * Responsive Layout Components Module
 * 
 * Flexible, responsive layout components that adapt to different screen sizes
 * and provide consistent spacing and alignment patterns.
 */

export { breakpoints } from './breakpoints';
export type { BreakpointKey, ResponsiveValue, ResponsiveColumns, ResponsiveDirection } from './breakpoints';

export { useResponsive } from './useResponsive';

export { ResponsiveGrid } from './ResponsiveGrid';
export type { ResponsiveGridProps } from './ResponsiveGrid';

export { FlexContainer } from './FlexContainer';
export type { FlexContainerProps } from './FlexContainer';

export { AdaptiveSidebar } from './AdaptiveSidebar';
export type { AdaptiveSidebarProps } from './AdaptiveSidebar';

export { SplitPane } from './SplitPane';
export type { SplitPaneProps } from './SplitPane';

export { MasonryLayout } from './MasonryLayout';
export type { MasonryLayoutProps } from './MasonryLayout';

export { ResponsiveContainer } from './ResponsiveContainer';
export type { ResponsiveContainerProps } from './ResponsiveContainer';

export { Stack } from './Stack';
export type { StackProps } from './Stack';

// Default export for backward compatibility
export default {
  breakpoints: require('./breakpoints').breakpoints,
  useResponsive: require('./useResponsive').useResponsive,
  ResponsiveGrid: require('./ResponsiveGrid').ResponsiveGrid,
  FlexContainer: require('./FlexContainer').FlexContainer,
  AdaptiveSidebar: require('./AdaptiveSidebar').AdaptiveSidebar,
  SplitPane: require('./SplitPane').SplitPane,
  MasonryLayout: require('./MasonryLayout').MasonryLayout,
  ResponsiveContainer: require('./ResponsiveContainer').ResponsiveContainer,
  Stack: require('./Stack').Stack,
};