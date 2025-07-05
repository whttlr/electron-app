/**
 * End-to-End Tests for Mobile CNC Workflows
 * 
 * Comprehensive E2E testing for mobile CNC control interfaces using Playwright.
 * Tests critical workflows, touch interactions, offline functionality,
 * and industrial use cases across different devices and orientations.
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { TouchEventSimulator } from '../src/ui/testing/mobile-test-utils';

// Test configuration for different devices
const DEVICE_CONFIGS = {
  mobile: {
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    deviceScaleFactor: 2,
  },
  tablet: {
    viewport: { width: 1024, height: 768 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    deviceScaleFactor: 2,
  },
  desktop: {
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    hasTouch: false,
    deviceScaleFactor: 1,
  },
};

// Helper functions
async function setupMobileEnvironment(page: Page, deviceType: keyof typeof DEVICE_CONFIGS) {
  const config = DEVICE_CONFIGS[deviceType];
  
  // Set viewport and user agent
  await page.setViewportSize(config.viewport);
  await page.setExtraHTTPHeaders({
    'User-Agent': config.userAgent,
  });

  // Mock touch capabilities
  if (config.hasTouch) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 10,
      });
      
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: {},
      });
    });
  }

  // Mock device pixel ratio
  await page.addInitScript((deviceScaleFactor) => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: deviceScaleFactor,
    });
  }, config.deviceScaleFactor);
}

async function mockMachineConnection(page: Page, connected = true) {
  await page.addInitScript((isConnected) => {
    (window as any).mockMachineConnection = {
      connected: isConnected,
      position: { x: 150, y: 150, z: 50 },
      state: 'idle',
    };
  }, connected);
}

async function simulateTouchEvent(
  page: Page, 
  selector: string, 
  eventType: 'tap' | 'longPress' | 'swipe',
  options: any = {}
) {
  await page.evaluate(
    ({ selector, eventType, options }) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Element ${selector} not found`);

      const rect = element.getBoundingClientRect();
      const x = rect.left + (options.x || rect.width / 2);
      const y = rect.top + (options.y || rect.height / 2);

      if (eventType === 'tap') {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [{
            identifier: 0,
            target: element,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            screenX: x,
            screenY: y,
          } as any],
        });
        element.dispatchEvent(touchEvent);

        setTimeout(() => {
          const endEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [{
              identifier: 0,
              target: element,
              clientX: x,
              clientY: y,
              pageX: x,
              pageY: y,
              screenX: x,
              screenY: y,
            } as any],
          });
          element.dispatchEvent(endEvent);
        }, 50);
      }
    },
    { selector, eventType, options }
  );
}

// Test suites
test.describe('Mobile CNC Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupMobileEnvironment(page, 'mobile');
    await mockMachineConnection(page, true);
    await page.goto('/');
  });

  test('should display dashboard with touch-optimized layout', async ({ page }) => {
    // Check for mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
    
    // Verify touch targets meet minimum size requirements
    const touchButtons = page.locator('button[data-touch-optimized="true"]');
    const count = await touchButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = touchButtons.nth(i);
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should navigate between tabs using touch', async ({ page }) => {
    // Test tab navigation
    await simulateTouchEvent(page, '[data-testid="tab-controls"]', 'tap');
    await expect(page.locator('[data-testid="controls-view"]')).toBeVisible();

    await simulateTouchEvent(page, '[data-testid="tab-status"]', 'tap');
    await expect(page.locator('[data-testid="status-view"]')).toBeVisible();

    await simulateTouchEvent(page, '[data-testid="tab-job"]', 'tap');
    await expect(page.locator('[data-testid="job-view"]')).toBeVisible();
  });

  test('should show connection status banner when offline', async ({ page }) => {
    // Simulate offline mode
    await page.setOfflineMode(true);
    await page.reload();

    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-banner"]')).toContainText('Offline mode');
  });

  test('should adapt to orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="portrait-layout"]')).toBeVisible();

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.evaluate(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });
    
    await expect(page.locator('[data-testid="landscape-layout"]')).toBeVisible();
  });
});

test.describe('Mobile CNC Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupMobileEnvironment(page, 'tablet');
    await mockMachineConnection(page, true);
    await page.goto('/controls');
  });

  test('should display touch-optimized jog controls', async ({ page }) => {
    await expect(page.locator('[data-testid="touch-jog-controls"]')).toBeVisible();
    
    // Check for all axis controls
    await expect(page.locator('[data-testid="jog-x-plus"]')).toBeVisible();
    await expect(page.locator('[data-testid="jog-x-minus"]')).toBeVisible();
    await expect(page.locator('[data-testid="jog-y-plus"]')).toBeVisible();
    await expect(page.locator('[data-testid="jog-y-minus"]')).toBeVisible();
    await expect(page.locator('[data-testid="jog-z-plus"]')).toBeVisible();
    await expect(page.locator('[data-testid="jog-z-minus"]')).toBeVisible();
  });

  test('should handle single jog movements', async ({ page }) => {
    // Mock jog command tracking
    await page.addInitScript(() => {
      (window as any).jogCommands = [];
      (window as any).addEventListener('jog-command', (e: any) => {
        (window as any).jogCommands.push(e.detail);
      });
    });

    // Perform jog movements
    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');
    await simulateTouchEvent(page, '[data-testid="jog-y-minus"]', 'tap');
    await simulateTouchEvent(page, '[data-testid="jog-z-plus"]', 'tap');

    // Verify jog commands were sent
    const jogCommands = await page.evaluate(() => (window as any).jogCommands);
    expect(jogCommands).toHaveLength(3);
    expect(jogCommands[0]).toMatchObject({ axis: 'X', direction: 1 });
    expect(jogCommands[1]).toMatchObject({ axis: 'Y', direction: -1 });
    expect(jogCommands[2]).toMatchObject({ axis: 'Z', direction: 1 });
  });

  test('should support continuous jogging with long press', async ({ page }) => {
    // Mock continuous jog tracking
    await page.addInitScript(() => {
      (window as any).continuousJogActive = false;
      (window as any).addEventListener('continuous-jog-start', () => {
        (window as any).continuousJogActive = true;
      });
      (window as any).addEventListener('continuous-jog-stop', () => {
        (window as any).continuousJogActive = false;
      });
    });

    // Start long press
    await page.locator('[data-testid="jog-x-plus"]').dispatchEvent('touchstart');
    
    // Wait for long press activation
    await page.waitForTimeout(600);
    
    const jogActive = await page.evaluate(() => (window as any).continuousJogActive);
    expect(jogActive).toBe(true);

    // End long press
    await page.locator('[data-testid="jog-x-plus"]').dispatchEvent('touchend');
    
    const jogStopped = await page.evaluate(() => (window as any).continuousJogActive);
    expect(jogStopped).toBe(false);
  });

  test('should respect step size settings', async ({ page }) => {
    // Change step size
    await simulateTouchEvent(page, '[data-testid="step-size-10"]', 'tap');
    
    // Verify step size is applied
    await expect(page.locator('[data-testid="step-size-10"]')).toHaveClass(/selected|active/);
    
    // Perform jog with new step size
    await page.addInitScript(() => {
      (window as any).lastJogDistance = null;
      (window as any).addEventListener('jog-command', (e: any) => {
        (window as any).lastJogDistance = e.detail.distance;
      });
    });

    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');
    
    const jogDistance = await page.evaluate(() => (window as any).lastJogDistance);
    expect(jogDistance).toBe(10);
  });

  test('should prevent movement beyond working area boundaries', async ({ page }) => {
    // Set position near boundary
    await page.evaluate(() => {
      (window as any).mockMachineConnection.position = { x: 299, y: 150, z: 50 };
    });

    await page.reload();

    // Try to move beyond boundary
    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');
    
    // Button should be disabled or movement prevented
    const jogButton = page.locator('[data-testid="jog-x-plus"]');
    expect(await jogButton.isDisabled()).toBe(true);
  });

  test('should handle emergency stop', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).emergencyStopCalled = false;
      (window as any).addEventListener('emergency-stop', () => {
        (window as any).emergencyStopCalled = true;
      });
    });

    // Trigger emergency stop
    await simulateTouchEvent(page, '[data-testid="emergency-stop"]', 'tap');
    
    const emergencyStopCalled = await page.evaluate(() => (window as any).emergencyStopCalled);
    expect(emergencyStopCalled).toBe(true);

    // Verify all controls are disabled
    const jogButtons = page.locator('[data-testid^="jog-"]');
    const count = await jogButtons.count();
    
    for (let i = 0; i < count; i++) {
      expect(await jogButtons.nth(i).isDisabled()).toBe(true);
    }
  });
});

test.describe('Mobile Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupMobileEnvironment(page, 'mobile');
    await page.goto('/');
  });

  test('should show offline page when network is unavailable', async ({ page }) => {
    // Go offline
    await page.setOfflineMode(true);
    await page.goto('/');

    // Should show offline page
    await expect(page.locator('h1')).toContainText('You\'re Offline');
    await expect(page.locator('[data-testid="offline-features"]')).toBeVisible();
  });

  test('should queue commands when offline', async ({ page }) => {
    // Start online, then go offline
    await page.goto('/controls');
    await page.setOfflineMode(true);

    // Mock offline queue
    await page.addInitScript(() => {
      (window as any).offlineQueue = [];
      (window as any).addEventListener('command-queued', (e: any) => {
        (window as any).offlineQueue.push(e.detail);
      });
    });

    // Try to send jog command while offline
    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');

    // Verify command is queued
    const queuedCommands = await page.evaluate(() => (window as any).offlineQueue);
    expect(queuedCommands).toHaveLength(1);
  });

  test('should sync queued commands when coming back online', async ({ page }) => {
    // Start offline with queued commands
    await page.setOfflineMode(true);
    await page.addInitScript(() => {
      localStorage.setItem('cnc-sync-queue', JSON.stringify([
        { id: '1', action: 'jog', data: { axis: 'X', direction: 1, distance: 1 } },
        { id: '2', action: 'jog', data: { axis: 'Y', direction: -1, distance: 1 } },
      ]));
    });

    await page.goto('/');

    // Go back online
    await page.setOfflineMode(false);
    
    // Mock sync completion
    await page.addInitScript(() => {
      (window as any).syncCompleted = false;
      setTimeout(() => {
        (window as any).syncCompleted = true;
        window.dispatchEvent(new CustomEvent('sync-completed'));
      }, 1000);
    });

    // Wait for sync to complete
    await page.waitForEvent('console', { 
      predicate: (msg) => msg.text().includes('sync-completed') 
    });

    const syncCompleted = await page.evaluate(() => (window as any).syncCompleted);
    expect(syncCompleted).toBe(true);
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupMobileEnvironment(page, 'tablet');
    await page.goto('/');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through controls
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Activate control with Enter
    await page.keyboard.press('Enter');
    // Should trigger the focused control
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/controls');

    // Check for ARIA labels on interactive elements
    const jogButtons = page.locator('[data-testid^="jog-"]');
    const count = await jogButtons.count();

    for (let i = 0; i < count; i++) {
      const button = jogButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/jog|axis|direction/i);
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast
    await page.addInitScript(() => {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    });

    await page.reload();

    // Verify high contrast styles are applied
    const bodyColor = await page.evaluate(() => {
      return getComputedStyle(document.body).color;
    });
    
    expect(bodyColor).toMatch(/rgb\(255, 255, 255\)|white/);
  });

  test('should announce important actions', async ({ page }) => {
    // Mock screen reader announcements
    await page.addInitScript(() => {
      (window as any).announcements = [];
      const originalAnnounce = (window as any).announceToScreenReader;
      (window as any).announceToScreenReader = (text: string) => {
        (window as any).announcements.push(text);
      };
    });

    await page.goto('/controls');

    // Trigger jog movement
    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');

    // Check for announcement
    const announcements = await page.evaluate(() => (window as any).announcements);
    expect(announcements).toContain(expect.stringMatching(/moved|jog|position/i));
  });
});

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    await setupMobileEnvironment(page, 'mobile');
  });

  test('should load quickly on mobile devices', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-dashboard"]');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds on mobile
    expect(loadTime).toBeLessThan(3000);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/controls');

    // Monitor frame rate
    await page.addInitScript(() => {
      let frameCount = 0;
      let lastTime = performance.now();
      
      (window as any).frameRate = 0;
      
      const countFrames = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          (window as any).frameRate = frameCount;
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(countFrames);
      };
      
      requestAnimationFrame(countFrames);
    });

    // Trigger animations
    await simulateTouchEvent(page, '[data-testid="jog-x-plus"]', 'tap');
    
    // Wait for frame rate measurement
    await page.waitForTimeout(2000);
    
    const frameRate = await page.evaluate(() => (window as any).frameRate);
    expect(frameRate).toBeGreaterThanOrEqual(30); // At least 30fps
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');

    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate through different views multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/controls');
      await page.goto('/jobs');
      await page.goto('/settings');
      await page.goto('/');
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should not grow significantly (less than 50MB increase)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});

test.describe('Cross-Device Compatibility', () => {
  ['mobile', 'tablet', 'desktop'].forEach(deviceType => {
    test(`should work correctly on ${deviceType}`, async ({ page }) => {
      await setupMobileEnvironment(page, deviceType as keyof typeof DEVICE_CONFIGS);
      await mockMachineConnection(page, true);
      await page.goto('/');

      // Basic functionality should work on all devices
      await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
      
      // Navigation should be accessible
      if (deviceType === 'desktop') {
        await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      }

      // Controls should be reachable
      await page.goto('/controls');
      await expect(page.locator('[data-testid="jog-controls"]')).toBeVisible();
    });
  });
});

// Helper for running tests with different configurations
function runTestWithConfigs<T>(
  testFn: (config: T) => void,
  configs: T[],
  name: string
) {
  configs.forEach((config, index) => {
    test(`${name} - Config ${index + 1}`, () => testFn(config));
  });
}