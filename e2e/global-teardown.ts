import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  // Clean up any global resources if needed
  // For example: close databases, clean up files, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;