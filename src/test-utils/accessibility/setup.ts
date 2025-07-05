/**
 * Accessibility Test Setup and Configuration
 * Common setup functions for accessibility testing
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { configureAxe } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Configure axe with custom rules
const axeConfig = configureAxe({
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-accessible': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
});

// Mock window.matchMedia for responsive design tests
export const setupA11yTests = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock getBoundingClientRect for layout tests
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => {},
  }));

  // Mock IntersectionObserver for visibility tests
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock ResizeObserver for responsive tests
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

// Create a standardized accessibility test suite
export const createA11yTestSuite = (
  componentName: string,
  renderComponent: () => any,
  options: {
    skipAxe?: boolean;
    skipKeyboard?: boolean;
    skipScreenReader?: boolean;
    customTests?: Array<() => void>;
  } = {}
) => {
  describe(`${componentName} Accessibility`, () => {
    beforeEach(() => {
      setupA11yTests();
    });

    if (!options.skipAxe) {
      it('should pass axe accessibility tests', async () => {
        const { container } = renderComponent();
        const results = await axeConfig(container);
        expect(results).toHaveNoViolations();
      });
    }

    if (!options.skipKeyboard) {
      it('should support keyboard navigation', async () => {
        const { container } = renderComponent();
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        expect(focusableElements.length).toBeGreaterThan(0);
        
        // Test tab navigation
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus();
        expect(document.activeElement).toBe(firstElement);
      });
    }

    if (!options.skipScreenReader) {
      it('should provide screen reader support', () => {
        const { container } = renderComponent();
        const ariaElements = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
        
        // Should have some ARIA attributes for screen readers
        expect(ariaElements.length).toBeGreaterThan(0);
      });
    }

    // Run custom tests if provided
    if (options.customTests) {
      options.customTests.forEach((customTest, index) => {
        it(`should pass custom accessibility test ${index + 1}`, customTest);
      });
    }
  });
};