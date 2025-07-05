/**
 * Accessibility Test Helper Functions
 * Utility functions for accessibility testing
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

export const axeTestHelpers = {
  async runAxeTest(container: HTMLElement) {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    return results;
  },

  async testColorContrast(element: HTMLElement, expectedRatio: number = 4.5) {
    const results = await axe(element, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    const violations = results.violations.filter(v => v.id === 'color-contrast');
    expect(violations).toHaveLength(0);
  },

  async testWithCustomRules(container: HTMLElement, rules: any) {
    const results = await axe(container, { rules });
    expect(results).toHaveNoViolations();
    return results;
  }
};

export const keyboardTestHelpers = {
  async testTabNavigation(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      throw new Error('No focusable elements found for keyboard navigation test');
    }

    // Test forward tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      await userEvent.tab();
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test backward tab navigation
    for (let i = focusableElements.length - 1; i >= 0; i--) {
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(focusableElements[i]);
    }
  },

  async testEnterKey(element: HTMLElement, expectedAction: () => void) {
    element.focus();
    await userEvent.keyboard('{Enter}');
    expectedAction();
  },

  async testSpaceKey(element: HTMLElement, expectedAction: () => void) {
    element.focus();
    await userEvent.keyboard(' ');
    expectedAction();
  },

  async testEscapeKey(expectedAction: () => void) {
    await userEvent.keyboard('{Escape}');
    expectedAction();
  },

  async testArrowNavigation(container: HTMLElement, direction: 'up' | 'down' | 'left' | 'right') {
    const keyMap = {
      up: '{ArrowUp}',
      down: '{ArrowDown}',
      left: '{ArrowLeft}',
      right: '{ArrowRight}'
    };

    await userEvent.keyboard(keyMap[direction]);
  }
};

export const screenReaderHelpers = {
  expectAriaLabel(element: HTMLElement, expectedLabel: string) {
    expect(element).toHaveAttribute('aria-label', expectedLabel);
  },

  expectAriaLabelledBy(element: HTMLElement, labelId: string) {
    expect(element).toHaveAttribute('aria-labelledby', labelId);
    
    const labelElement = document.getElementById(labelId);
    expect(labelElement).toBeInTheDocument();
  },

  expectAriaDescribedBy(element: HTMLElement, descriptionId: string) {
    expect(element).toHaveAttribute('aria-describedby', descriptionId);
    
    const descriptionElement = document.getElementById(descriptionId);
    expect(descriptionElement).toBeInTheDocument();
  },

  expectRole(element: HTMLElement, expectedRole: string) {
    expect(element).toHaveAttribute('role', expectedRole);
  },

  expectAriaExpanded(element: HTMLElement, isExpanded: boolean) {
    expect(element).toHaveAttribute('aria-expanded', isExpanded.toString());
  },

  expectAriaPressed(element: HTMLElement, isPressed: boolean) {
    expect(element).toHaveAttribute('aria-pressed', isPressed.toString());
  },

  expectAriaChecked(element: HTMLElement, isChecked: boolean) {
    expect(element).toHaveAttribute('aria-checked', isChecked.toString());
  },

  expectAriaDisabled(element: HTMLElement, isDisabled: boolean) {
    expect(element).toHaveAttribute('aria-disabled', isDisabled.toString());
  },

  expectAriaLive(element: HTMLElement, politeness: 'polite' | 'assertive' | 'off') {
    expect(element).toHaveAttribute('aria-live', politeness);
  },

  expectVisuallyHidden(element: HTMLElement) {
    const styles = getComputedStyle(element);
    const isVisuallyHidden = 
      styles.position === 'absolute' &&
      styles.width === '1px' &&
      styles.height === '1px' &&
      styles.overflow === 'hidden' &&
      styles.clip === 'rect(0, 0, 0, 0)';
    
    expect(isVisuallyHidden).toBe(true);
  },

  async testDynamicAnnouncement(liveRegion: HTMLElement, newContent: string) {
    const initialContent = liveRegion.textContent;
    
    // Update content
    fireEvent.change(liveRegion, { target: { textContent: newContent } });
    
    await waitFor(() => {
      expect(liveRegion.textContent).toBe(newContent);
    });
  }
};

export const focusTestHelpers = {
  expectFocusable(element: HTMLElement) {
    expect(element.tabIndex).toBeGreaterThanOrEqual(0);
  },

  expectNotFocusable(element: HTMLElement) {
    expect(element.tabIndex).toBe(-1);
  },

  expectFocusVisible(element: HTMLElement) {
    element.focus();
    expect(document.activeElement).toBe(element);
    
    // Check for visible focus indicator
    const styles = getComputedStyle(element);
    const hasFocusIndicator = 
      styles.outline !== 'none' || 
      styles.boxShadow !== 'none' ||
      styles.borderColor !== 'transparent';
    
    expect(hasFocusIndicator).toBe(true);
  },

  async testFocusTrap(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length < 2) {
      throw new Error('Focus trap requires at least 2 focusable elements');
    }

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstElement.focus();
    expect(document.activeElement).toBe(firstElement);

    // Tab from last element should cycle to first
    lastElement.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(firstElement);

    // Shift+Tab from first element should cycle to last
    firstElement.focus();
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(lastElement);
  }
};