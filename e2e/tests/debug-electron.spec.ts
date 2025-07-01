import { test, expect } from '../fixtures/electron';

test.describe('Debug Electron App', () => {
  test('should show page content for debugging', async ({ page }) => {
    // Listen for console logs and errors BEFORE navigation
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
      pageErrors.push(error.message);
    });

    // Listen for response failures
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`Failed response: ${response.status()} ${response.url()}`);
      }
    });

    // Listen for request failures
    page.on('requestfailed', request => {
      console.log(`Failed request: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Wait for load
    await page.waitForLoadState('domcontentloaded');

    // Get the page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get the URL
    const url = page.url();
    console.log('Page URL:', url);

    // Check if root element exists
    const rootElement = await page.locator('#root').isVisible();
    console.log('Root element visible:', rootElement);

    // Check if scripts are present
    const scripts = await page.locator('script').count();
    console.log('Number of script tags:', scripts);

    // Check for React mounting
    await page.waitForTimeout(5000);
    
    // Try to manually test React
    const reactTest = await page.evaluate(() => {
      try {
        // Test if React global is available
        const hasReact = typeof window.React !== 'undefined';
        
        // Test if we can manually create element
        const testDiv = document.createElement('div');
        testDiv.id = 'manual-test';
        testDiv.textContent = 'Manual test works';
        document.body.appendChild(testDiv);
        
        return {
          hasReact,
          canCreateElements: true,
          windowKeys: Object.keys(window).filter(k => k.includes('React') || k.includes('react'))
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('React test results:', JSON.stringify(reactTest));
    
    const rootContent = await page.locator('#root').innerHTML();
    console.log('Root element content:', rootContent.substring(0, 1000) + '...');
    
    // Check if manual test element exists
    const manualTest = await page.locator('#manual-test').isVisible();
    console.log('Manual test element visible:', manualTest);

    // Check what page we're actually on
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Full body HTML:', bodyHTML.substring(0, 2000) + '...');

    // Check for dashboard specific elements
    const dashboardExists = await page.locator('[data-testid="dashboard-container"]').isVisible();
    console.log('Dashboard container exists:', dashboardExists);

    // Check for any visible text
    const visibleText = await page.locator('body').textContent();
    console.log('Visible text:', visibleText?.substring(0, 500) + '...');

    // Log any console messages
    console.log('Console messages:', consoleMessages);
    console.log('Page errors:', pageErrors);

    // Check network requests
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Always pass so we can see the debug output
    expect(true).toBe(true);
  });
});