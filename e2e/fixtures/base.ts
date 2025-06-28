import { test as base, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { JogControlsPage } from '../pages/JogControlsPage';
import { NavigationPage } from '../pages/NavigationPage';

// Define custom fixtures for page objects
type TestFixtures = {
  dashboardPage: DashboardPage;
  jogControlsPage: JogControlsPage;
  navigationPage: NavigationPage;
};

export const test = base.extend<TestFixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  jogControlsPage: async ({ page }, use) => {
    const jogControlsPage = new JogControlsPage(page);
    await use(jogControlsPage);
  },

  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },
});

export { expect } from '@playwright/test';