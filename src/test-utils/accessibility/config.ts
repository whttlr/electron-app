/**
 * Accessibility Test Configuration
 * Shared configuration for accessibility testing
 */

export const a11yConfig = {
  axe: {
    rules: {
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
  },
  keyboard: {
    keys: {
      tab: 'Tab',
      enter: 'Enter',
      space: ' ',
      escape: 'Escape',
      arrowUp: 'ArrowUp',
      arrowDown: 'ArrowDown',
      arrowLeft: 'ArrowLeft',
      arrowRight: 'ArrowRight',
    },
  },
  screenReader: {
    announcements: {
      loading: 'Loading content',
      error: 'Error occurred',
      success: 'Action completed successfully',
      navigation: 'Navigation menu',
    },
  },
};

export const testViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1440, height: 900 },
};

export const contrastThresholds = {
  normal: 4.5,
  large: 3.0,
  enhanced: 7.0,
};

export const focusIndicatorMinimums = {
  outlineWidth: '2px',
  outlineOffset: '2px',
  minContrast: 3.0,
};

export const touchTargetMinimums = {
  width: 44,
  height: 44,
  spacing: 8,
};

export const animationLimits = {
  maxDuration: 5000, // 5 seconds
  reducedMotionRespect: true,
  pauseOnFocus: true,
};