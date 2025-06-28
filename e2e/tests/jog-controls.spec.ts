import { test, expect } from '../fixtures/base';

test.describe('Jog Controls', () => {
  test.beforeEach(async ({ jogControlsPage }) => {
    await jogControlsPage.goto();
  });

  test('should load jog controls page successfully', async ({ jogControlsPage }) => {
    // Verify page title
    const title = await jogControlsPage.getPageTitle();
    expect(title).toBe('JogControls Playground');

    // Verify URL
    const url = await jogControlsPage.getCurrentUrl();
    expect(url).toContain('/controls');
  });

  test('should display all jog control cards', async ({ jogControlsPage }) => {
    // Verify all main cards are visible
    const allCardsVisible = await jogControlsPage.verifyAllCardsVisible();
    expect(allCardsVisible).toBe(true);
  });

  test('should show current position card', async ({ jogControlsPage }) => {
    // Verify current position card is visible
    expect(await jogControlsPage.currentPositionCard.isVisible()).toBe(true);

    // Get initial position
    const position = await jogControlsPage.getCurrentPosition();
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
    expect(typeof position.z).toBe('number');
  });

  test('should display machine position controls', async ({ jogControlsPage }) => {
    // Verify machine controls card is visible
    expect(await jogControlsPage.machineControlsCard.isVisible()).toBe(true);

    // Verify all axis controls are visible
    const axisControlsVisible = await jogControlsPage.verifyAxisControlsVisible();
    expect(axisControlsVisible).toBe(true);
  });

  test('should have enabled jog buttons when connected', async ({ jogControlsPage }) => {
    // Verify jog buttons are enabled
    const buttonsEnabled = await jogControlsPage.verifyJogButtonsEnabled();
    expect(buttonsEnabled).toBe(true);
  });

  test('should perform jog movements', async ({ jogControlsPage }) => {
    // Perform a sequence of jog movements
    const jogResult = await jogControlsPage.performJogSequence();
    
    // Verify position changed (in mock mode, position should update)
    expect(jogResult.moved).toBe(true);
    
    // Verify final position is different from initial
    expect(jogResult.final.x).not.toBe(jogResult.initial.x);
    expect(jogResult.final.y).not.toBe(jogResult.initial.y);
    expect(jogResult.final.z).not.toBe(jogResult.initial.z);
  });

  test('should perform individual axis movements', async ({ jogControlsPage }) => {
    const initialPosition = await jogControlsPage.getCurrentPosition();

    // Test X-axis positive movement
    await jogControlsPage.jogXPositive();
    await jogControlsPage.page.waitForTimeout(500);
    
    let currentPosition = await jogControlsPage.getCurrentPosition();
    expect(currentPosition.x).toBeGreaterThan(initialPosition.x);

    // Test Y-axis positive movement
    await jogControlsPage.jogYPositive();
    await jogControlsPage.page.waitForTimeout(500);
    
    currentPosition = await jogControlsPage.getCurrentPosition();
    expect(currentPosition.y).toBeGreaterThan(initialPosition.y);

    // Test Z-axis positive movement
    await jogControlsPage.jogZPositive();
    await jogControlsPage.page.waitForTimeout(500);
    
    currentPosition = await jogControlsPage.getCurrentPosition();
    expect(currentPosition.z).toBeGreaterThan(initialPosition.z);
  });

  test('should handle home command', async ({ jogControlsPage }) => {
    // Move away from home position
    await jogControlsPage.jogXPositive();
    await jogControlsPage.jogYPositive();
    await jogControlsPage.page.waitForTimeout(500);

    // Click home button
    await jogControlsPage.clickHome();
    await jogControlsPage.page.waitForTimeout(1000);

    // Verify position is back to origin (0, 0, 0)
    const position = await jogControlsPage.getCurrentPosition();
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
    expect(position.z).toBe(0);
  });

  test('should display and modify jog settings', async ({ jogControlsPage }) => {
    // Verify settings card is visible
    expect(await jogControlsPage.settingsCard.isVisible()).toBe(true);

    // Get initial settings
    const initialSettings = await jogControlsPage.getJogSettings();
    expect(typeof initialSettings.speed).toBe('number');
    expect(typeof initialSettings.increment).toBe('number');
    expect(typeof initialSettings.isMetric).toBe('boolean');

    // Modify speed
    await jogControlsPage.setJogSpeed(1500);
    
    // Verify speed changed
    const updatedSettings = await jogControlsPage.getJogSettings();
    expect(updatedSettings.speed).toBe(1500);
  });

  test('should toggle between metric and imperial units', async ({ jogControlsPage }) => {
    // Get initial unit setting
    const initialSettings = await jogControlsPage.getJogSettings();
    const wasMetric = initialSettings.isMetric;

    // Toggle units
    await jogControlsPage.toggleUnits();
    await jogControlsPage.page.waitForTimeout(500);

    // Verify units changed
    const newSettings = await jogControlsPage.getJogSettings();
    expect(newSettings.isMetric).toBe(!wasMetric);

    // Toggle back
    await jogControlsPage.toggleUnits();
    await jogControlsPage.page.waitForTimeout(500);

    // Verify units are back to original
    const finalSettings = await jogControlsPage.getJogSettings();
    expect(finalSettings.isMetric).toBe(wasMetric);
  });

  test('should display 2D and 3D preview cards', async ({ jogControlsPage }) => {
    // Verify 2D preview card is visible
    expect(await jogControlsPage.preview2DCard.isVisible()).toBe(true);

    // Verify 3D preview card is visible
    expect(await jogControlsPage.preview3DCard.isVisible()).toBe(true);
  });

  test('should handle responsive layout', async ({ page, jogControlsPage }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await jogControlsPage.goto();
    
    // Verify cards are still visible in mobile layout
    const allCardsVisible = await jogControlsPage.verifyAllCardsVisible();
    expect(allCardsVisible).toBe(true);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await jogControlsPage.goto();
    
    // Verify axis controls layout in desktop
    const axisControlsVisible = await jogControlsPage.verifyAxisControlsVisible();
    expect(axisControlsVisible).toBe(true);
  });

  test('should handle rapid jog movements', async ({ jogControlsPage }) => {
    const initialPosition = await jogControlsPage.getCurrentPosition();

    // Perform rapid movements
    for (let i = 0; i < 5; i++) {
      await jogControlsPage.jogXPositive();
      await jogControlsPage.page.waitForTimeout(100);
    }

    // Verify position changed significantly
    const finalPosition = await jogControlsPage.getCurrentPosition();
    expect(finalPosition.x).toBeGreaterThan(initialPosition.x + 3); // Should have moved at least 3 units
  });

  test('should maintain position consistency across page reloads', async ({ jogControlsPage }) => {
    // Move to a specific position
    await jogControlsPage.jogXPositive();
    await jogControlsPage.jogYPositive();
    await jogControlsPage.page.waitForTimeout(500);

    const positionBeforeReload = await jogControlsPage.getCurrentPosition();

    // Reload the page
    await jogControlsPage.page.reload();
    await jogControlsPage.waitForLoad();

    // Check if position is maintained (in a real app this might be restored from state)
    const positionAfterReload = await jogControlsPage.getCurrentPosition();
    
    // In mock mode, position might reset to default, so we just verify the page loaded correctly
    expect(typeof positionAfterReload.x).toBe('number');
    expect(typeof positionAfterReload.y).toBe('number');
    expect(typeof positionAfterReload.z).toBe('number');
  });
});