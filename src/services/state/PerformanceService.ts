/**
 * Performance Monitoring Store - Legacy Export
 * 
 * This file now re-exports from the modular performance service structure.
 * Use individual imports for better organization.
 */

// Re-export all performance service modules
export * from './performance';

// Re-export default for backward compatibility
export { default } from './performance';

/**
 * @deprecated Use individual imports instead:
 * 
 * ```typescript
 * import { usePerformanceStore, performanceSelectors } from '@/services/state/performance';
 * import { PerformanceMonitor } from '@/services/state/performance';
 * ```
 * 
 * Or use specific types:
 * 
 * ```typescript
 * import type { PerformanceStore, SystemHealthStatus } from '@/services/state/performance';
 * ```
 */
