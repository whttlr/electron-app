import { test as base, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';

// Define the fixtures
export const test = base.extend<{
  electronApp: ElectronApplication;
  page: Page;
}>({
  // Start Electron app before each test
  electronApp: async ({}, use) => {
    // Path to the main electron file
    const electronMain = path.join(__dirname, '../../dist-electron/main/main.js');
    
    // Launch Electron app
    const electronApp = await electron.launch({
      args: [electronMain],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Use built files instead of dev server
        ELECTRON_IS_PACKAGED: 'false'
      },
      timeout: 60000 // 60 second timeout for app launch
    });

    // Wait for the app to be ready
    await electronApp.evaluate(async ({ app }) => {
      await app.whenReady();
    });

    // Use the app in tests
    await use(electronApp);

    // Close the app after tests
    await electronApp.close();
  },

  // Get the main window page
  page: async ({ electronApp }, use) => {
    // Wait for the first window to open
    const page = await electronApp.firstWindow();
    
    // Wait for the app to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for React to initialize
    await page.waitForTimeout(1000);
    
    // Use the page in tests
    await use(page);
  }
});

export { expect } from '@playwright/test';