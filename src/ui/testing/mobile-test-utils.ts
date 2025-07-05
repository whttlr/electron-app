/**
 * Mobile Testing Utilities
 * 
 * Comprehensive testing utilities for mobile and touch-optimized components.
 * Includes touch event simulation, responsive design testing, and mobile-specific
 * test helpers for industrial CNC interfaces.
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { act } from 'react-dom/test-utils';

// Mock responsive context for testing
export interface MockResponsiveContext {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  isOnline: boolean;
  dimensions: {
    width: number;
    height: number;
  };
}

// Default mobile test environment
export const defaultMobileContext: MockResponsiveContext = {
  breakpoint: 'sm',
  orientation: 'portrait',
  isTouchDevice: true,
  isOnline: true,
  dimensions: {
    width: 375,
    height: 667,
  },
};

// Tablet test environment
export const tabletContext: MockResponsiveContext = {
  breakpoint: 'md',
  orientation: 'landscape',
  isTouchDevice: true,
  isOnline: true,
  dimensions: {
    width: 1024,
    height: 768,
  },
};

// Desktop test environment
export const desktopContext: MockResponsiveContext = {
  breakpoint: 'lg',
  orientation: 'landscape',
  isTouchDevice: false,
  isOnline: true,
  dimensions: {
    width: 1440,
    height: 900,
  },
};

// Offline test environment
export const offlineContext: MockResponsiveContext = {
  ...defaultMobileContext,
  isOnline: false,
};

// Touch event simulation utilities
export class TouchEventSimulator {
  static createTouchEvent(
    type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
    touches: Array<{ clientX: number; clientY: number; identifier?: number }> = []
  ): TouchEvent {
    const touchList = touches.map((touch, index) => ({
      identifier: touch.identifier ?? index,
      target: document.body,
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY,
      radiusX: 20,
      radiusY: 20,
      rotationAngle: 0,
      force: 1,
    }));

    return new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: touchList as any,
      targetTouches: touchList as any,
      changedTouches: touchList as any,
    });
  }

  static tap(element: Element, coordinates = { x: 0, y: 0 }): void {
    const rect = element.getBoundingClientRect();
    const x = rect.left + (coordinates.x || rect.width / 2);
    const y = rect.top + (coordinates.y || rect.height / 2);

    fireEvent(element, this.createTouchEvent('touchstart', [{ clientX: x, clientY: y }]));
    fireEvent(element, this.createTouchEvent('touchend', []));
  }

  static longPress(element: Element, duration = 500, coordinates = { x: 0, y: 0 }): Promise<void> {
    return new Promise((resolve) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + (coordinates.x || rect.width / 2);
      const y = rect.top + (coordinates.y || rect.height / 2);

      fireEvent(element, this.createTouchEvent('touchstart', [{ clientX: x, clientY: y }]));

      setTimeout(() => {
        fireEvent(element, this.createTouchEvent('touchend', []));
        resolve();
      }, duration);
    });
  }

  static swipe(
    element: Element,
    startCoords: { x: number; y: number },
    endCoords: { x: number; y: number },
    duration = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      const rect = element.getBoundingClientRect();
      const startX = rect.left + startCoords.x;
      const startY = rect.top + startCoords.y;
      const endX = rect.left + endCoords.x;
      const endY = rect.top + endCoords.y;

      fireEvent(element, this.createTouchEvent('touchstart', [{ clientX: startX, clientY: startY }]));

      // Simulate movement
      const steps = 10;
      const stepX = (endX - startX) / steps;
      const stepY = (endY - startY) / steps;

      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          const currentX = startX + (stepX * i);
          const currentY = startY + (stepY * i);
          fireEvent(element, this.createTouchEvent('touchmove', [{ clientX: currentX, clientY: currentY }]));
        }, (duration / steps) * i);
      }

      setTimeout(() => {
        fireEvent(element, this.createTouchEvent('touchend', []));
        resolve();
      }, duration);
    });
  }

  static pinch(
    element: Element,
    startDistance: number,
    endDistance: number,
    duration = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const getCoords = (distance: number) => [
        { clientX: centerX - distance / 2, clientY: centerY },
        { clientX: centerX + distance / 2, clientY: centerY },
      ];

      fireEvent(element, this.createTouchEvent('touchstart', getCoords(startDistance)));

      const steps = 10;
      const stepDistance = (endDistance - startDistance) / steps;

      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          const currentDistance = startDistance + (stepDistance * i);
          fireEvent(element, this.createTouchEvent('touchmove', getCoords(currentDistance)));
        }, (duration / steps) * i);
      }

      setTimeout(() => {
        fireEvent(element, this.createTouchEvent('touchend', []));
        resolve();
      }, duration);
    });
  }
}

// Responsive design testing utilities
export class ResponsiveTestUtils {
  static setViewportSize(width: number, height: number): void {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));
  }

  static setOrientation(orientation: 'portrait' | 'landscape'): void {
    const angle = orientation === 'portrait' ? 0 : 90;
    
    Object.defineProperty(screen, 'orientation', {
      writable: true,
      configurable: true,
      value: {
        angle,
        type: orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary',
      },
    });

    // Trigger orientationchange event
    fireEvent(window, new Event('orientationchange'));
  }

  static mockTouchDevice(isTouch: boolean = true): void {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: isTouch ? {} : undefined,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: isTouch ? 10 : 0,
    });
  }

  static mockNetworkStatus(isOnline: boolean = true): void {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: isOnline,
    });

    fireEvent(window, new Event(isOnline ? 'online' : 'offline'));
  }

  static setupMobileEnvironment(context: MockResponsiveContext = defaultMobileContext): void {
    this.setViewportSize(context.dimensions.width, context.dimensions.height);
    this.setOrientation(context.orientation);
    this.mockTouchDevice(context.isTouchDevice);
    this.mockNetworkStatus(context.isOnline);
  }
}

// Performance testing utilities
export class PerformanceTestUtils {
  static measureRenderTime<T>(renderFn: () => T): { result: T; duration: number } {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime,
    };
  }

  static async measureAsyncOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime,
    };
  }

  static mockSlowNetwork(): void {
    // Mock slow network conditions
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((...args) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(originalFetch(...args));
        }, 1000); // 1 second delay
      });
    });
  }

  static restoreNetwork(): void {
    if (jest.isMockFunction(global.fetch)) {
      global.fetch.mockRestore();
    }
  }
}

// Accessibility testing utilities
export class AccessibilityTestUtils {
  static async checkAriaLabels(container: HTMLElement): Promise<string[]> {
    const issues: string[] = [];
    const interactiveElements = container.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="link"], [tabindex]'
    );

    interactiveElements.forEach((element, index) => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasVisibleText = element.textContent?.trim();

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasVisibleText) {
        issues.push(`Interactive element ${index} lacks accessible name`);
      }
    });

    return issues;
  }

  static async checkTouchTargetSize(container: HTMLElement): Promise<string[]> {
    const issues: string[] = [];
    const touchTargets = container.querySelectorAll('button, [role="button"], input, select');
    const minimumSize = 44; // WCAG recommended minimum

    touchTargets.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minimumSize || rect.height < minimumSize) {
        issues.push(
          `Touch target ${index} (${rect.width}x${rect.height}) is smaller than ${minimumSize}px minimum`
        );
      }
    });

    return issues;
  }

  static async checkColorContrast(container: HTMLElement): Promise<string[]> {
    // Simplified contrast checking - in reality, you'd use a proper contrast checker
    const issues: string[] = [];
    const textElements = container.querySelectorAll('*');

    textElements.forEach((element, index) => {
      const style = getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;

      // Basic check for common low-contrast combinations
      if (
        (backgroundColor.includes('rgb(128') || backgroundColor.includes('#808080')) &&
        (color.includes('rgb(169') || color.includes('#a9a9a9'))
      ) {
        issues.push(`Element ${index} may have insufficient color contrast`);
      }
    });

    return issues;
  }
}

// Mock providers for testing
export const createMockResponsiveProvider = (context: MockResponsiveContext) => {
  return ({ children }: { children: ReactNode }) => {
    // This would wrap children with mocked responsive context
    return children as ReactElement;
  };
};

// Custom render function with mobile context
export interface MobileRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mobileContext?: MockResponsiveContext;
  wrapper?: React.ComponentType<any>;
}

export function renderWithMobileContext(
  ui: ReactElement,
  options: MobileRenderOptions = {}
): RenderResult {
  const { mobileContext = defaultMobileContext, wrapper, ...renderOptions } = options;

  // Setup mobile environment
  ResponsiveTestUtils.setupMobileEnvironment(mobileContext);

  const MockWrapper = wrapper || createMockResponsiveProvider(mobileContext);

  return render(ui, {
    wrapper: MockWrapper,
    ...renderOptions,
  });
}

// Test assertion helpers
export const mobileAssertions = {
  async expectTouchSupport(element: HTMLElement): Promise<void> {
    expect(element).toHaveAttribute('touch-action');
  },

  async expectResponsiveLayout(
    element: HTMLElement,
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ): Promise<void> {
    const classList = Array.from(element.classList);
    const hasResponsiveClass = classList.some(className => 
      className.includes(breakpoint) || className.includes('responsive')
    );
    expect(hasResponsiveClass).toBe(true);
  },

  async expectOfflineSupport(element: HTMLElement): Promise<void> {
    // Check for offline indicators or cached data attributes
    const hasOfflineSupport = 
      element.hasAttribute('data-offline-ready') ||
      element.querySelector('[data-offline]') !== null;
    expect(hasOfflineSupport).toBe(true);
  },

  async expectAccessibleTouchTarget(element: HTMLElement): Promise<void> {
    const rect = element.getBoundingClientRect();
    expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
  },

  async expectHapticFeedback(element: HTMLElement): Promise<void> {
    // Mock vibration API
    const mockVibrate = jest.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      configurable: true,
      value: mockVibrate,
    });

    TouchEventSimulator.tap(element);
    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalled();
    });
  },
};

// Mock implementations for common APIs
export const mockAPIs = {
  geolocation: {
    setup: () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      };
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });
      return mockGeolocation;
    },
  },

  deviceOrientation: {
    setup: () => {
      const mockOrientationEvent = {
        alpha: 0,
        beta: 0,
        gamma: 0,
      };
      return mockOrientationEvent;
    },
  },

  battery: {
    setup: () => {
      const mockBattery = {
        level: 1,
        charging: false,
        chargingTime: Infinity,
        dischargingTime: 3600,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      
      Object.defineProperty(navigator, 'getBattery', {
        value: () => Promise.resolve(mockBattery),
        configurable: true,
      });
      
      return mockBattery;
    },
  },

  vibration: {
    setup: () => {
      const mockVibrate = jest.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        configurable: true,
      });
      return mockVibrate;
    },
  },

  serviceWorker: {
    setup: () => {
      const mockServiceWorker = {
        register: jest.fn(() => Promise.resolve({
          installing: null,
          waiting: null,
          active: null,
          addEventListener: jest.fn(),
        })),
        getRegistration: jest.fn(),
        getRegistrations: jest.fn(),
      };
      
      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockServiceWorker,
        configurable: true,
      });
      
      return mockServiceWorker;
    },
  },
};

export default {
  TouchEventSimulator,
  ResponsiveTestUtils,
  PerformanceTestUtils,
  AccessibilityTestUtils,
  renderWithMobileContext,
  mobileAssertions,
  mockAPIs,
  defaultMobileContext,
  tabletContext,
  desktopContext,
  offlineContext,
};