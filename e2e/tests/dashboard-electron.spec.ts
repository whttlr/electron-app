import { test, expect } from '../fixtures/electron';

test.describe('Electron App - Dashboard', () => {
  test('should launch electron app and load dashboard', async ({ page, electronApp }) => {
    // Check app info
    const appInfo = await electronApp.evaluate(async ({ app }) => {
      return {
        name: app.getName(),
        version: app.getVersion(),
      };
    });
    
    expect(appInfo.name).toBe('jog-controls-playground');
    
    // Verify the main window is visible
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];
      return {
        isVisible: mainWindow.isVisible(),
        isFocused: mainWindow.isFocused(),
        bounds: mainWindow.getBounds(),
      };
    });
    
    expect(windowState.isVisible).toBe(true);
    expect(windowState.bounds.width).toBeGreaterThan(0);
    expect(windowState.bounds.height).toBeGreaterThan(0);
  });

  test('should display dashboard elements', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]', { 
      timeout: 30000 
    });

    // Check for connection status
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    await expect(connectionStatus).toBeVisible();

    // Check for position cards
    const xPosition = page.locator('[data-testid="x-position-card"]');
    const yPosition = page.locator('[data-testid="y-position-card"]');
    const zPosition = page.locator('[data-testid="z-position-card"]');
    
    await expect(xPosition).toBeVisible();
    await expect(yPosition).toBeVisible();
    await expect(zPosition).toBeVisible();

    // Verify position values are present
    const xValue = await xPosition.locator('.position-value').textContent();
    expect(xValue).toMatch(/^-?\d+(\.\d+)?$/);
  });

  test('should navigate to controls page', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Click on jog controls quick action
    await page.click('[data-testid="quick-action-jog-controls"]');

    // Wait for navigation
    await page.waitForURL('**/controls');

    // Verify controls page loaded
    const controlsContainer = page.locator('[data-testid="controls-container"]');
    await expect(controlsContainer).toBeVisible();
  });

  test('should handle window controls', async ({ electronApp }) => {
    // Test minimize
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.minimize();
    });

    const isMinimized = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      return mainWindow.isMinimized();
    });
    
    expect(isMinimized).toBe(true);

    // Restore window
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.restore();
    });
  });

  test('should maintain state across page navigation', async ({ page }) => {
    // Set a value in localStorage
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    // Navigate to controls
    await page.click('[data-testid="quick-action-jog-controls"]');
    await page.waitForURL('**/controls');

    // Navigate back to dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await page.waitForURL('**/');

    // Check if localStorage persisted
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(storedValue).toBe('test-value');
  });

  test('should display all dashboard cards in correct layout', async ({ page }) => {
    // Wait for dashboard
    await page.waitForSelector('[data-testid="dashboard-container"]');

    // Check all main cards
    const cards = [
      'connection-status',
      'x-position-card', 
      'y-position-card',
      'z-position-card',
      'workspace-dimensions',
      'system-status',
      'machine-features',
      'quick-actions'
    ];

    for (const cardId of cards) {
      const card = page.locator(`[data-testid="${cardId}"]`);
      await expect(card).toBeVisible();
    }

    // Verify grid layout
    const dashboardGrid = page.locator('.dashboard-grid');
    const gridStyle = await dashboardGrid.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(gridStyle).toBe('grid');
  });

  test('should show correct window title', async ({ electronApp }) => {
    const title = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      return mainWindow.getTitle();
    });
    
    expect(title).toContain('JogControls');
  });

  test('should handle app menu interactions', async ({ electronApp, page }) => {
    // Check if menu is set
    const hasMenu = await electronApp.evaluate(async ({ Menu }) => {
      return Menu.getApplicationMenu() !== null;
    });

    // On macOS, there's always a menu
    if (process.platform === 'darwin') {
      expect(hasMenu).toBe(true);
    }
  });
});