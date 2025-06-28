import { test, expect } from '../fixtures/base';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('should load dashboard page successfully', async ({ dashboardPage }) => {
    // Verify page title
    const title = await dashboardPage.getPageTitle();
    expect(title).toBe('JogControls Playground');

    // Verify URL
    const url = await dashboardPage.getCurrentUrl();
    expect(url).toContain('/');
  });

  test('should display all dashboard cards', async ({ dashboardPage }) => {
    // Verify all main cards are visible
    const allCardsVisible = await dashboardPage.verifyAllCardsVisible();
    expect(allCardsVisible).toBe(true);
  });

  test('should show connection status', async ({ dashboardPage }) => {
    // Verify connection status is displayed
    expect(await dashboardPage.connectionStatus.isVisible()).toBe(true);
    
    // Check connection status text
    const statusText = await dashboardPage.getConnectionStatusText();
    expect(statusText).toContain('Machine Status');
  });

  test('should display machine position cards', async ({ dashboardPage }) => {
    // Verify position cards are visible
    expect(await dashboardPage.xPositionCard.isVisible()).toBe(true);
    expect(await dashboardPage.yPositionCard.isVisible()).toBe(true);
    expect(await dashboardPage.zPositionCard.isVisible()).toBe(true);

    // Verify position values are numbers
    const position = await dashboardPage.getMachinePosition();
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
    expect(typeof position.z).toBe('number');
  });

  test('should display workspace dimensions', async ({ dashboardPage }) => {
    // Verify workspace dimensions card is visible
    expect(await dashboardPage.workspaceDimensions.isVisible()).toBe(true);

    // Verify dimensions have valid values
    const dimensions = await dashboardPage.getWorkspaceDimensions();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
    expect(dimensions.depth).toBeGreaterThan(0);
  });

  test('should show system status with initialization', async ({ dashboardPage }) => {
    // Verify system status card is visible
    expect(await dashboardPage.systemStatus.isVisible()).toBe(true);

    // Check initialization status
    const isInitialized = await dashboardPage.getSystemInitializationStatus();
    expect(isInitialized).toBe(true);
  });

  test('should display machine features configuration', async ({ dashboardPage }) => {
    // Verify machine features card is visible
    expect(await dashboardPage.machineFeatures.isVisible()).toBe(true);

    // Check feature status
    const features = await dashboardPage.getMachineFeatureStatus();
    expect(features.wcs).toBe(true);
    expect(features.toolDirection).toBe(true);
    expect(features.spindle).toBe(true);
    expect(features.probing).toBe(true);
  });

  test('should have working quick actions', async ({ dashboardPage }) => {
    // Verify all quick action buttons exist
    const quickActionsExist = await dashboardPage.verifyQuickActionsExist();
    expect(quickActionsExist).toBe(true);

    // Test jog controls quick action
    await dashboardPage.clickJogControlsQuickAction();
    
    // Verify navigation to jog controls
    const url = await dashboardPage.getCurrentUrl();
    expect(url).toContain('/controls');
  });

  test('should handle responsive layout', async ({ page, dashboardPage }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.goto();
    
    // Verify cards are still visible in mobile layout
    const allCardsVisible = await dashboardPage.verifyAllCardsVisible();
    expect(allCardsVisible).toBe(true);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await dashboardPage.goto();
    
    // Verify cards layout in desktop
    const quickActionsExist = await dashboardPage.verifyQuickActionsExist();
    expect(quickActionsExist).toBe(true);
  });

  test('should display configuration information', async ({ dashboardPage }) => {
    // Verify configuration info card is visible
    expect(await dashboardPage.configurationInfo.isVisible()).toBe(true);

    // Check that WCS and tool directions are displayed
    const configText = await dashboardPage.configurationInfo.textContent();
    expect(configText).toContain('G54');
    expect(configText).toContain('clockwise');
  });
});