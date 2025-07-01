import { defineConfig } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for testing Electron application
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Electron tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Electron
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/electron-results.json' }],
    ['junit', { outputFile: 'test-results/electron-results.xml' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  timeout: 60 * 1000, // 60 seconds for Electron startup
  expect: {
    timeout: 10000
  },
  outputDir: 'test-results/electron/',
});