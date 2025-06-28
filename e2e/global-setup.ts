import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:3002');
    
    // Wait for the app to initialize
    await page.waitForSelector('[data-testid="app-initialized"]', { timeout: 30000 });
    console.log('✅ Application is ready for testing');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎯 Global setup completed successfully');
}

export default globalSetup;