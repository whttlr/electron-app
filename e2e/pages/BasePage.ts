import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common selectors
  get sidebar() {
    return this.page.locator('[data-testid="main-navigation"]');
  }

  get header() {
    return this.page.locator('[data-testid="app-header"]');
  }

  get content() {
    return this.page.locator('[data-testid="app-content"]');
  }

  get debugPanel() {
    return this.page.locator('[data-testid="debug-panel"]');
  }

  get loadingSpinner() {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  // Common actions
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForLoad();
  }

  async waitForLoad() {
    // Wait for the app to initialize
    await this.page.waitForSelector('[data-testid="app-initialized"]', { timeout: 10000 });
    
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { 
      state: 'hidden', 
      timeout: 5000 
    }).catch(() => {
      // Ignore if no loading spinner exists
    });
  }

  async toggleDebugPanel() {
    const debugButton = this.page.locator('[data-testid="toggle-debug-panel"]');
    await debugButton.click();
  }

  async waitForNavigation() {
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Utility methods
  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async isVisible(selector: string) {
    return await this.page.locator(selector).isVisible();
  }

  async getText(selector: string) {
    return await this.page.locator(selector).textContent();
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async fillInput(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }
}