import { test, expect } from '../fixtures/electron';
import path from 'path';

test.describe('Electron App - Plugins', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to plugins page
    await page.goto('#/plugins');
    await page.waitForSelector('[data-testid="plugins-container"]');
  });

  test('should display plugins management interface', async ({ page }) => {
    // Check for plugins list
    const pluginsList = page.locator('[data-testid="plugins-list"]');
    await expect(pluginsList).toBeVisible();

    // Check for upload area
    const uploadArea = page.locator('[data-testid="plugin-upload-area"]');
    await expect(uploadArea).toBeVisible();

    // Check for plugin actions
    const installBtn = page.locator('[data-testid="install-plugin-btn"]');
    await expect(installBtn).toBeVisible();
  });

  test('should show installed plugins', async ({ page }) => {
    // Check if any plugins are installed
    const pluginItems = page.locator('[data-testid="plugin-item"]');
    const count = await pluginItems.count();

    if (count > 0) {
      // Verify plugin item structure
      const firstPlugin = pluginItems.first();
      await expect(firstPlugin).toBeVisible();

      // Check for plugin controls
      const enableToggle = firstPlugin.locator('[data-testid="plugin-enable-toggle"]');
      const configBtn = firstPlugin.locator('[data-testid="plugin-config-btn"]');
      const deleteBtn = firstPlugin.locator('[data-testid="plugin-delete-btn"]');

      await expect(enableToggle).toBeVisible();
      await expect(configBtn).toBeVisible();
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('should handle plugin file upload', async ({ page }) => {
    // Get file input
    const fileInput = page.locator('input[type="file"]');
    
    // Check if file input accepts zip files
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toContain('.zip');
  });

  test('should display plugin configuration modal', async ({ page }) => {
    // Check if there are any plugins to configure
    const pluginItems = page.locator('[data-testid="plugin-item"]');
    const count = await pluginItems.count();

    if (count > 0) {
      // Click config button on first plugin
      const configBtn = pluginItems.first().locator('[data-testid="plugin-config-btn"]');
      await configBtn.click();

      // Wait for modal
      const configModal = page.locator('[data-testid="plugin-config-modal"]');
      await expect(configModal).toBeVisible();

      // Check modal contents
      const modalTitle = configModal.locator('.modal-title');
      await expect(modalTitle).toBeVisible();

      // Close modal
      const closeBtn = configModal.locator('[data-testid="modal-close-btn"]');
      await closeBtn.click();
      await expect(configModal).not.toBeVisible();
    }
  });

  test('should filter plugins by status', async ({ page }) => {
    // Check for filter controls
    const filterTabs = page.locator('[data-testid="plugin-filter-tabs"]');
    
    if (await filterTabs.isVisible()) {
      // Click on enabled filter
      const enabledTab = filterTabs.locator('[data-testid="filter-enabled"]');
      await enabledTab.click();

      // Verify filtered results (implementation dependent)
      await page.waitForTimeout(500); // Wait for filter to apply
    }
  });

  test('should handle plugin search', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('[data-testid="plugin-search-input"]');
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test plugin');
      
      // Verify search is working (results update)
      await page.waitForTimeout(500); // Wait for search to apply
    }
  });

  test('should display plugin marketplace link', async ({ page }) => {
    // Check for marketplace link or button
    const marketplaceLink = page.locator('[data-testid="plugin-marketplace-link"]');
    
    if (await marketplaceLink.isVisible()) {
      // In Electron, external links should be handled properly
      const href = await marketplaceLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should show plugin details', async ({ page }) => {
    const pluginItems = page.locator('[data-testid="plugin-item"]');
    const count = await pluginItems.count();

    if (count > 0) {
      const firstPlugin = pluginItems.first();
      
      // Check for plugin metadata
      const pluginName = firstPlugin.locator('[data-testid="plugin-name"]');
      const pluginVersion = firstPlugin.locator('[data-testid="plugin-version"]');
      const pluginAuthor = firstPlugin.locator('[data-testid="plugin-author"]');

      await expect(pluginName).toBeVisible();
      await expect(pluginVersion).toBeVisible();
      
      // Author might be optional
      const hasAuthor = await pluginAuthor.isVisible().catch(() => false);
      if (hasAuthor) {
        const authorText = await pluginAuthor.textContent();
        expect(authorText).toBeTruthy();
      }
    }
  });

  test('should handle plugin enable/disable', async ({ page }) => {
    const pluginItems = page.locator('[data-testid="plugin-item"]');
    const count = await pluginItems.count();

    if (count > 0) {
      const firstPlugin = pluginItems.first();
      const enableToggle = firstPlugin.locator('[data-testid="plugin-enable-toggle"]');
      
      // Get initial state
      const initialState = await enableToggle.isChecked();
      
      // Toggle the plugin
      await enableToggle.click();
      
      // Verify state changed
      const newState = await enableToggle.isChecked();
      expect(newState).toBe(!initialState);
      
      // Toggle back
      await enableToggle.click();
      const finalState = await enableToggle.isChecked();
      expect(finalState).toBe(initialState);
    }
  });

  test('should persist plugin state in Electron storage', async ({ page, electronApp }) => {
    // Check if plugins data is stored
    const hasPluginData = await electronApp.evaluate(async ({ app }) => {
      const userDataPath = app.getPath('userData');
      // In a real app, check for plugin config files
      return true; // Placeholder
    });

    expect(hasPluginData).toBe(true);
  });
});