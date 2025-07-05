/**
 * Animated UI Components - Legacy Export
 * 
 * This file now re-exports from the modular animated components structure.
 * Use individual imports for better organization.
 */

// Re-export all animated component modules
export * from './index';

// Re-export default for backward compatibility
export { default } from './index';

/**
 * @deprecated Use individual imports instead:
 * 
 * ```typescript
 * import { AnimatedCard, AnimatedProgress, AnimatedStatus } from '@/ui/components/animated';
 * import { FloatingActionButton, AnimatedList, ScrollReveal } from '@/ui/components/animated';
 * import { animationVariants } from '@/ui/components/animated';
 * ```
 * 
 * Or use specific components:
 * 
 * ```typescript
 * import { AnimatedCard } from '@/ui/components/animated/AnimatedCard';
 * import type { AnimatedCardProps } from '@/ui/components/animated/AnimatedCard';
 * ```
 */
