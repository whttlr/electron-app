/**
 * Accessibility Testing Suite - Legacy Export
 * 
 * This file now re-exports from the modular accessibility test structure.
 * Use individual test imports for better organization.
 */

// Re-export all accessibility test modules
export * from './accessibility/basic-components.test';
export * from './accessibility/keyboard-navigation.test';
export * from './accessibility/aria-attributes.test';
export * from './accessibility/screen-reader.test';
export * from './accessibility/focus-management.test';

// Re-export utilities and helpers
export * from './accessibility/setup';
export * from './accessibility/helpers';
export * from './accessibility/matchers';
export * from './accessibility/config';
export * from './accessibility/mocks';

/**
 * @deprecated Use individual test file imports instead:
 * 
 * ```typescript
 * import './accessibility/basic-components.test';
 * import './accessibility/keyboard-navigation.test';
 * ```
 * 
 * Or use specific utilities:
 * 
 * ```typescript
 * import { setupA11yTests, axeTestHelpers } from '@/test-utils/accessibility';
 * ```
 */

// Quick test runner for all accessibility tests
export const runAllA11yTests = () => {
  describe('Comprehensive Accessibility Testing Suite', () => {
    require('./accessibility/basic-components.test');
    require('./accessibility/keyboard-navigation.test');
    require('./accessibility/aria-attributes.test');
    require('./accessibility/screen-reader.test');
    require('./accessibility/focus-management.test');
  });
};