/**
 * Memory Management Utilities - Legacy Export
 *
 * This file now re-exports from the modular memory management structure.
 * Use individual imports for better organization.
 */

// Re-export all memory management modules
export * from './memory';

// Re-export default for backward compatibility
export { default } from './memory';

/**
 * @deprecated Use individual imports instead:
 *
 * ```typescript
 * import { MemoryManager, memoryManager } from '@/stores/memory';
 * import { ObjectPool } from '@/stores/memory';
 * import { RingBuffer, WeakCache } from '@/stores/memory';
 * ```
 *
 * Or use specific utilities:
 *
 * ```typescript
 * import { memoryAwareDebounce, boundedMemoize } from '@/stores/memory';
 * ```
 */
