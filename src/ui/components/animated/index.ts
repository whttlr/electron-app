/**
 * Animated Components Module
 * 
 * Advanced animated components using Framer Motion for smooth,
 * professional interactions and transitions.
 */

export { animationVariants } from './variants';
export { AnimatedCard } from './AnimatedCard';
export type { AnimatedCardProps } from './AnimatedCard';
export { AnimatedProgress } from './AnimatedProgress';
export type { AnimatedProgressProps } from './AnimatedProgress';
export { AnimatedStatus } from './AnimatedStatus';
export type { AnimatedStatusProps } from './AnimatedStatus';
export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps } from './FloatingActionButton';
export { AnimatedList } from './AnimatedList';
export type { AnimatedListProps } from './AnimatedList';
export { ScrollReveal } from './ScrollReveal';
export type { ScrollRevealProps } from './ScrollReveal';

// Default export for backward compatibility
export default {
  animationVariants: require('./variants').animationVariants,
  AnimatedCard: require('./AnimatedCard').AnimatedCard,
  AnimatedProgress: require('./AnimatedProgress').AnimatedProgress,
  AnimatedStatus: require('./AnimatedStatus').AnimatedStatus,
  FloatingActionButton: require('./FloatingActionButton').FloatingActionButton,
  AnimatedList: require('./AnimatedList').AnimatedList,
  ScrollReveal: require('./ScrollReveal').ScrollReveal,
};