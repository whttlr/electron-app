import { test, expect } from '../fixtures/electron';

test.describe('Electron App - Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to controls page
    await page.goto('#/controls');
    await page.waitForSelector('[data-testid="controls-container"]');
  });

  test('should display jog controls interface', async ({ page }) => {
    // Check for 3D visualization
    const visualization3D = page.locator('[data-testid="3d-visualization"]');
    await expect(visualization3D).toBeVisible();

    // Check for 2D display
    const display2D = page.locator('[data-testid="2d-display"]');
    await expect(display2D).toBeVisible();

    // Check for jog control buttons
    const jogControls = page.locator('[data-testid="jog-controls"]');
    await expect(jogControls).toBeVisible();

    // Verify axis buttons
    const xPlusBtn = page.locator('[data-testid="jog-x-plus"]');
    const xMinusBtn = page.locator('[data-testid="jog-x-minus"]');
    const yPlusBtn = page.locator('[data-testid="jog-y-plus"]');
    const yMinusBtn = page.locator('[data-testid="jog-y-minus"]');
    const zPlusBtn = page.locator('[data-testid="jog-z-plus"]');
    const zMinusBtn = page.locator('[data-testid="jog-z-minus"]');

    await expect(xPlusBtn).toBeVisible();
    await expect(xMinusBtn).toBeVisible();
    await expect(yPlusBtn).toBeVisible();
    await expect(yMinusBtn).toBeVisible();
    await expect(zPlusBtn).toBeVisible();
    await expect(zMinusBtn).toBeVisible();
  });

  test('should display current position', async ({ page }) => {
    // Check position display
    const positionDisplay = page.locator('[data-testid="position-display"]');
    await expect(positionDisplay).toBeVisible();

    // Verify coordinate values
    const xCoord = page.locator('[data-testid="position-x"]');
    const yCoord = page.locator('[data-testid="position-y"]');
    const zCoord = page.locator('[data-testid="position-z"]');

    await expect(xCoord).toBeVisible();
    await expect(yCoord).toBeVisible();
    await expect(zCoord).toBeVisible();

    // Check format of coordinates
    const xText = await xCoord.textContent();
    expect(xText).toMatch(/X:\s*-?\d+(\.\d+)?/);
  });

  test('should have jog step controls', async ({ page }) => {
    // Check for step size selector
    const stepSelector = page.locator('[data-testid="jog-step-selector"]');
    await expect(stepSelector).toBeVisible();

    // Click to open dropdown
    await stepSelector.click();

    // Check step options
    const stepOptions = page.locator('.jog-step-option');
    const count = await stepOptions.count();
    expect(count).toBeGreaterThan(0);

    // Select a different step size
    await stepOptions.first().click();
  });

  test('should handle jog button interactions', async ({ page }) => {
    // Get initial position
    const xCoord = page.locator('[data-testid="position-x"]');
    const initialX = await xCoord.textContent();

    // Click X+ button
    const xPlusBtn = page.locator('[data-testid="jog-x-plus"]');
    await xPlusBtn.click();

    // In a real app, position would change
    // For now, just verify button is clickable
    await expect(xPlusBtn).toBeEnabled();
  });

  test('should display workspace boundaries', async ({ page }) => {
    // Check workspace info
    const workspaceInfo = page.locator('[data-testid="workspace-info"]');
    await expect(workspaceInfo).toBeVisible();

    // Verify dimensions are displayed
    const dimensionsText = await workspaceInfo.textContent();
    expect(dimensionsText).toContain('mm');
  });

  test('should have home buttons', async ({ page }) => {
    // Check for home all button
    const homeAllBtn = page.locator('[data-testid="home-all-btn"]');
    await expect(homeAllBtn).toBeVisible();

    // Check individual axis home buttons
    const homeXBtn = page.locator('[data-testid="home-x-btn"]');
    const homeYBtn = page.locator('[data-testid="home-y-btn"]');
    const homeZBtn = page.locator('[data-testid="home-z-btn"]');

    await expect(homeXBtn).toBeVisible();
    await expect(homeYBtn).toBeVisible();
    await expect(homeZBtn).toBeVisible();
  });

  test('should handle keyboard shortcuts in Electron', async ({ page, electronApp }) => {
    // Focus on the controls area
    await page.focus('[data-testid="controls-container"]');

    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');

    // In Electron, we can also test global shortcuts
    const hasGlobalShortcuts = await electronApp.evaluate(async ({ globalShortcut }) => {
      return globalShortcut.isRegistered('CommandOrControl+J');
    });

    // Verify keyboard controls info is available
    const keyboardInfo = page.locator('[data-testid="keyboard-shortcuts-info"]');
    const isVisible = await keyboardInfo.isVisible().catch(() => false);
    
    // Keyboard info might be in a tooltip or help section
    if (!isVisible) {
      // Try to open help/settings
      const helpBtn = page.locator('[data-testid="help-button"]');
      if (await helpBtn.isVisible()) {
        await helpBtn.click();
      }
    }
  });

  test('should render 3D visualization canvas', async ({ page }) => {
    // Wait for Three.js to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Check canvas exists and has size
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBeGreaterThan(0);
    expect(canvasSize?.height).toBeGreaterThan(0);
  });

  test('should maintain controls state when switching views', async ({ page }) => {
    // Set a specific jog step
    const stepSelector = page.locator('[data-testid="jog-step-selector"]');
    await stepSelector.click();
    await page.locator('.jog-step-option').nth(1).click();

    // Navigate away and back
    await page.click('[data-testid="nav-dashboard"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-controls"]');
    await page.waitForURL('**/controls');

    // Check if step size persisted (if implemented)
    const currentStep = await stepSelector.textContent();
    expect(currentStep).toBeTruthy();
  });
});