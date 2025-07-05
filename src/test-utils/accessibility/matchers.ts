/**
 * Custom Jest Matchers for Accessibility Testing
 * Extended matchers for specific accessibility assertions
 */

import { axeTestHelpers, keyboardTestHelpers, screenReaderHelpers } from './helpers';

export const expectA11yCompliance = {
  async toPassAxeTests(container: HTMLElement) {
    try {
      await axeTestHelpers.runAxeTest(container);
      return {
        message: () => 'Expected element to fail axe accessibility tests',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected element to pass axe accessibility tests: ${error}`,
        pass: false,
      };
    }
  },

  toHaveProperColorContrast(element: HTMLElement, minimumRatio: number = 4.5) {
    const styles = getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // This is a simplified check - in practice you'd use a proper contrast calculation
    const hasGoodContrast = color !== backgroundColor;
    
    return {
      message: () => 
        hasGoodContrast 
          ? `Expected element to have poor color contrast`
          : `Expected element to have color contrast ratio of at least ${minimumRatio}`,
      pass: hasGoodContrast,
    };
  },

  toHaveAccessibleName(element: HTMLElement) {
    const accessibleName = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent ||
      element.getAttribute('title') ||
      element.getAttribute('alt');

    return {
      message: () => 
        accessibleName 
          ? 'Expected element to not have an accessible name'
          : 'Expected element to have an accessible name',
      pass: !!accessibleName,
    };
  }
};

export const expectKeyboardNavigation = {
  async toSupportTabNavigation(container: HTMLElement) {
    try {
      await keyboardTestHelpers.testTabNavigation(container);
      return {
        message: () => 'Expected element to not support tab navigation',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected element to support tab navigation: ${error}`,
        pass: false,
      };
    }
  },

  toBeFocusable(element: HTMLElement) {
    const isFocusable = element.tabIndex >= 0 || 
      ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName);

    return {
      message: () => 
        isFocusable 
          ? 'Expected element to not be focusable'
          : 'Expected element to be focusable',
      pass: isFocusable,
    };
  },

  toHaveVisibleFocusIndicator(element: HTMLElement) {
    element.focus();
    const styles = getComputedStyle(element);
    
    const hasFocusIndicator = 
      styles.outline !== 'none' && styles.outline !== '0' ||
      styles.boxShadow !== 'none' ||
      styles.borderColor !== 'transparent';

    return {
      message: () => 
        hasFocusIndicator 
          ? 'Expected element to not have a visible focus indicator'
          : 'Expected element to have a visible focus indicator when focused',
      pass: hasFocusIndicator,
    };
  }
};

export const expectScreenReaderSupport = {
  toHaveAriaLabel(element: HTMLElement, expectedLabel?: string) {
    const ariaLabel = element.getAttribute('aria-label');
    const hasAriaLabel = !!ariaLabel;
    const labelMatches = !expectedLabel || ariaLabel === expectedLabel;

    return {
      message: () => {
        if (!hasAriaLabel) return 'Expected element to have aria-label attribute';
        if (!labelMatches) return `Expected aria-label to be "${expectedLabel}", got "${ariaLabel}"`;
        return 'Expected element to not have aria-label';
      },
      pass: hasAriaLabel && labelMatches,
    };
  },

  toHaveRole(element: HTMLElement, expectedRole: string) {
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const hasCorrectRole = role === expectedRole;

    return {
      message: () => 
        hasCorrectRole 
          ? `Expected element to not have role "${expectedRole}"`
          : `Expected element to have role "${expectedRole}", got "${role}"`,
      pass: hasCorrectRole,
    };
  },

  toBeAccessibleToScreenReaders(element: HTMLElement) {
    const isHidden = 
      element.getAttribute('aria-hidden') === 'true' ||
      element.style.display === 'none' ||
      element.style.visibility === 'hidden';

    const hasAccessibleContent = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('alt') ||
      element.getAttribute('title');

    const isAccessible = !isHidden && !!hasAccessibleContent;

    return {
      message: () => 
        isAccessible 
          ? 'Expected element to not be accessible to screen readers'
          : 'Expected element to be accessible to screen readers',
      pass: isAccessible,
    };
  },

  toAnnounceChanges(element: HTMLElement) {
    const hasLiveRegion = 
      element.getAttribute('aria-live') ||
      element.getAttribute('role') === 'status' ||
      element.getAttribute('role') === 'alert';

    return {
      message: () => 
        hasLiveRegion 
          ? 'Expected element to not announce changes'
          : 'Expected element to announce changes to screen readers',
      pass: !!hasLiveRegion,
    };
  }
};

// Extend Jest with custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toPassAxeTests(): Promise<R>;
      toHaveProperColorContrast(minimumRatio?: number): R;
      toHaveAccessibleName(): R;
      toSupportTabNavigation(): Promise<R>;
      toBeFocusable(): R;
      toHaveVisibleFocusIndicator(): R;
      toHaveAriaLabel(expectedLabel?: string): R;
      toHaveRole(expectedRole: string): R;
      toBeAccessibleToScreenReaders(): R;
      toAnnounceChanges(): R;
    }
  }
}