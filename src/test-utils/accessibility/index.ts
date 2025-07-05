/**
 * Accessibility Testing Utilities - Main Export
 * Comprehensive accessibility testing tools and utilities
 */

// Test utilities
export { setupA11yTests, createA11yTestSuite } from './setup';
export { axeTestHelpers, keyboardTestHelpers, screenReaderHelpers } from './helpers';

// Shared test configurations
export { a11yConfig, testViewports, contrastThresholds } from './config';

// Custom matchers and utilities
export { expectA11yCompliance, expectKeyboardNavigation, expectScreenReaderSupport } from './matchers';

// Test data and mocks
export { mockA11yComponents, a11yTestData } from './mocks';