import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation selectors
  get menuItems() {
    return this.page.locator('[data-testid="nav-menu-item"]');
  }

  get dashboardLink() {
    return this.page.locator('[data-testid="nav-dashboard"]');
  }

  get jogControlsLink() {
    return this.page.locator('[data-testid="nav-jog-controls"]');
  }

  get sidebarCollapseButton() {
    return this.page.locator('[data-testid="sidebar-collapse"]');
  }

  get breadcrumbs() {
    return this.page.locator('[data-testid="breadcrumbs"]');
  }

  // Actions
  async navigateToDashboard() {
    await this.dashboardLink.click();
    await this.waitForNavigation();
  }

  async navigateToJogControls() {
    await this.jogControlsLink.click();
    await this.waitForNavigation();
  }

  async collapseSidebar() {
    await this.sidebarCollapseButton.click();
  }

  async expandSidebar() {
    const isCollapsed = await this.sidebar.getAttribute('class');
    if (isCollapsed?.includes('collapsed')) {
      await this.sidebarCollapseButton.click();
    }
  }

  async getActiveMenuItem() {
    const activeItem = this.page.locator('[data-testid="nav-menu-item"].ant-menu-item-selected');
    return await activeItem.textContent();
  }

  async getBreadcrumbText() {
    const breadcrumbItems = this.page.locator('[data-testid="breadcrumb-item"]');
    const texts = await breadcrumbItems.allTextContents();
    return texts.join(' > ');
  }

  async getVisibleMenuItems() {
    const items = await this.menuItems.all();
    const visibleItems = [];
    
    for (const item of items) {
      if (await item.isVisible()) {
        const text = await item.textContent();
        if (text) visibleItems.push(text.trim());
      }
    }
    
    return visibleItems;
  }

  async verifyOnlyImplementedRoutesVisible() {
    const visibleItems = await this.getVisibleMenuItems();
    const expectedItems = ['Dashboard', 'Jog Controls'];
    
    return visibleItems.every(item => expectedItems.includes(item)) &&
           expectedItems.every(item => visibleItems.includes(item));
  }
}