/**
 * Responsive Layout Components - Legacy Export
 * 
 * This file now re-exports from the modular layout components structure.
 * Use individual imports for better organization.
 */

// Re-export all layout component modules
export * from './index';

// Re-export default for backward compatibility
export { default } from './index';

/**
 * @deprecated Use individual imports instead:
 * 
 * ```typescript
 * import { ResponsiveGrid, FlexContainer, AdaptiveSidebar } from '@/ui/components/layout';
 * import { SplitPane, MasonryLayout, ResponsiveContainer, Stack } from '@/ui/components/layout';
 * import { useResponsive, breakpoints } from '@/ui/components/layout';
 * ```
 * 
 * Or use specific components:
 * 
 * ```typescript
 * import { ResponsiveGrid } from '@/ui/components/layout/ResponsiveGrid';
 * import type { ResponsiveGridProps } from '@/ui/components/layout/ResponsiveGrid';
 * ```
 */
