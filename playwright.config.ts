import { defineConfig } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // Electron tests should run sequentially
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use single worker for Electron tests */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for Electron only */
  projects: [
    {
      name: 'electron',
      testMatch: /.*electron.*\.spec\.ts/,
      use: {
        // Electron-specific configuration
      },
    },
  ],

  /* Test timeout */
  timeout: 60 * 1000, // Increased timeout for Electron
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10000 // Increased timeout for Electron
  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
});