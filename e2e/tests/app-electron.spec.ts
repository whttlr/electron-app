import { test, expect } from '../fixtures/electron';

test.describe('Electron App - General', () => {
  test('should start with correct window properties', async ({ electronApp }) => {
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      return {
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height,
        isResizable: mainWindow.isResizable(),
        isMaximizable: mainWindow.isMaximizable(),
        isMinimizable: mainWindow.isMinimizable(),
      };
    });

    expect(windowState.width).toBeGreaterThanOrEqual(800);
    expect(windowState.height).toBeGreaterThanOrEqual(600);
    expect(windowState.isResizable).toBe(true);
    expect(windowState.isMaximizable).toBe(true);
    expect(windowState.isMinimizable).toBe(true);
  });

  test('should have correct app metadata', async ({ electronApp }) => {
    const appInfo = await electronApp.evaluate(async ({ app }) => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        locale: app.getLocale(),
        isPackaged: app.isPackaged,
      };
    });

    expect(appInfo.name).toBe('jog-controls-playground');
    expect(appInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(appInfo.locale).toBeTruthy();
  });

  test('should navigate between all main routes', async ({ page }) => {
    // Start at dashboard
    await page.goto('#/');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Navigate to controls
    await page.click('[data-testid="nav-controls"]');
    await page.waitForURL('**/controls');
    await expect(page.locator('[data-testid="controls-container"]')).toBeVisible();

    // Navigate to plugins
    await page.click('[data-testid="nav-plugins"]');
    await page.waitForURL('**/plugins');
    await expect(page.locator('[data-testid="plugins-container"]')).toBeVisible();

    // Navigate to settings
    await page.click('[data-testid="nav-settings"]');
    await page.waitForURL('**/settings');
    await expect(page.locator('[data-testid="settings-container"]')).toBeVisible();

    // Navigate back to dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('should handle browser navigation buttons', async ({ page }) => {
    // Navigate through pages
    await page.goto('#/');
    await page.click('[data-testid="nav-controls"]');
    await page.click('[data-testid="nav-plugins"]');

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/controls$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/controls$/);
  });

  test('should maintain app state across window operations', async ({ page, electronApp }) => {
    // Set some app state
    await page.evaluate(() => {
      localStorage.setItem('app-theme', 'dark');
      localStorage.setItem('app-language', 'en');
    });

    // Minimize and restore window
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.minimize();
      await new Promise(resolve => setTimeout(resolve, 100));
      mainWindow.restore();
    });

    // Check if state persists
    const theme = await page.evaluate(() => localStorage.getItem('app-theme'));
    const language = await page.evaluate(() => localStorage.getItem('app-language'));

    expect(theme).toBe('dark');
    expect(language).toBe('en');
  });

  test('should handle window resize', async ({ page, electronApp }) => {
    // Set different window sizes
    const sizes = [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
    ];

    for (const size of sizes) {
      await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.setSize(width, height);
      }, size);

      await page.waitForTimeout(100); // Wait for resize

      const viewportSize = await page.viewportSize();
      expect(viewportSize?.width).toBeLessThanOrEqual(size.width);
      expect(viewportSize?.height).toBeLessThanOrEqual(size.height);
    }
  });

  test('should handle fullscreen mode', async ({ electronApp }) => {
    // Enter fullscreen
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.setFullScreen(true);
    });

    let isFullScreen = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      return mainWindow.isFullScreen();
    });

    expect(isFullScreen).toBe(true);

    // Exit fullscreen
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.setFullScreen(false);
    });

    isFullScreen = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      return mainWindow.isFullScreen();
    });

    expect(isFullScreen).toBe(false);
  });

  test('should handle app paths correctly', async ({ electronApp }) => {
    const paths = await electronApp.evaluate(async ({ app }) => {
      return {
        userData: app.getPath('userData'),
        temp: app.getPath('temp'),
        appData: app.getPath('appData'),
      };
    });

    expect(paths.userData).toContain('jog-controls-playground');
    expect(paths.temp).toBeTruthy();
    expect(paths.appData).toBeTruthy();
  });

  test('should display correct menu structure', async ({ electronApp }) => {
    // Get menu template
    const hasMenu = await electronApp.evaluate(async ({ Menu }) => {
      const menu = Menu.getApplicationMenu();
      return menu !== null;
    });

    // On macOS, menu is always present
    if (process.platform === 'darwin') {
      expect(hasMenu).toBe(true);
    }
  });

  test('should handle IPC communication', async ({ page, electronApp }) => {
    // Test getting app version through IPC
    const version = await page.evaluate(async () => {
      // This would use the exposed electronAPI
      if ((window as any).electronAPI) {
        return await (window as any).electronAPI.getAppVersion();
      }
      return null;
    });

    if (version) {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});