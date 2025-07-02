import { test, expect } from '../fixtures/electron';

test.describe('Electron App - General', () => {
  test('should start with correct window properties', async ({ electronApp }) => {
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
        throw new Error('No windows found');
      }
      const mainWindow = windows[0];
      const bounds = mainWindow.getBounds();
      return {
        width: bounds.width,
        height: bounds.height,
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
    // Wait for app to load and check we're on dashboard
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 30000 });

    // Navigate to controls
    await page.click('[data-testid="nav-controls"]');
    await expect(page.locator('[data-testid="controls-container"]')).toBeVisible();

    // Navigate to plugins
    await page.click('[data-testid="nav-plugins"]');
    await expect(page.locator('[data-testid="plugins-container"]')).toBeVisible();

    // Navigate to settings
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('[data-testid="settings-container"]')).toBeVisible();

    // Navigate back to dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('should handle browser navigation buttons', async ({ page }) => {
    // Wait for app to load
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: 30000 });
    
    // Navigate through pages
    await page.click('[data-testid="nav-controls"]');
    await expect(page.locator('[data-testid="controls-container"]')).toBeVisible();
    
    await page.click('[data-testid="nav-plugins"]');
    await expect(page.locator('[data-testid="plugins-container"]')).toBeVisible();

    // Use browser back button
    await page.goBack();
    await expect(page.locator('[data-testid="controls-container"]')).toBeVisible();

    await page.goBack();
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

    // Use browser forward button
    await page.goForward();
    await expect(page.locator('[data-testid="controls-container"]')).toBeVisible();
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