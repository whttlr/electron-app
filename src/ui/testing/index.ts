/**
 * UI Testing Public API
 * 
 * Exports testing utilities and helpers for UI components
 */

// Configuration
export { defaultTestingConfig, getTestingConfig } from './config';
export type { TestingConfig } from './config';

// Mobile testing utilities
export { 
  simulateTouchEvent,
  simulateSwipeGesture,
  simulatePinchGesture,
  setMobileViewport,
  mockMobileDevice,
  measureMobilePerformance
} from './mobile-test-utils';

// Visual regression testing
export {
  captureScreenshot,
  compareScreenshots,
  updateBaseline,
  generateVisualDiff,
  setupVisualTesting,
  cleanupVisualTesting
} from './visual-regression';

// Component testing utilities
export {
  renderWithProviders,
  renderWithTheme,
  renderWithAccessibility,
  createMockProvider,
  waitForComponent,
  findByTestId,
  fireEvent,
  screen,
  within
} from './component-test-utils';

// Accessibility testing utilities
export {
  runAxeAudit,
  testKeyboardNavigation,
  testScreenReader,
  testColorContrast,
  checkAriaLabels,
  validateAccessibility
} from './accessibility-test-utils';

// Testing hooks
export { useTestingContext } from './hooks/useTestingContext';
export { useVisualTesting } from './hooks/useVisualTesting';
export { useMobileTesting } from './hooks/useMobileTesting';
export { useA11yTesting } from './hooks/useA11yTesting';

// Mock utilities
export { createComponentMock } from './mocks/component-mocks';
export { createProviderMock } from './mocks/provider-mocks';
export { createServiceMock } from './mocks/service-mocks';

// Test data factories
export { createTestProps } from './factories/prop-factory';
export { createTestState } from './factories/state-factory';
export { createTestEvents } from './factories/event-factory';

// Types
export type {
  TestingContextValue,
  MockProvider,
  TestEvent,
  VisualTestResult,
  AccessibilityTestResult,
  MobileTestResult,
  ComponentTestProps
} from './types';