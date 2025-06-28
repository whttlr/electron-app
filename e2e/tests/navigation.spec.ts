import { test, expect } from '../fixtures/base';

test.describe('Navigation', () => {
  test.beforeEach(async ({ navigationPage }) => {
    await navigationPage.goto();
  });

  test('should display only implemented routes in sidebar', async ({ navigationPage }) => {
    // Verify only Dashboard and Jog Controls are visible
    const onlyImplementedVisible = await navigationPage.verifyOnlyImplementedRoutesVisible();
    expect(onlyImplementedVisible).toBe(true);

    // Get visible menu items
    const visibleItems = await navigationPage.getVisibleMenuItems();
    expect(visibleItems).toEqual(['Dashboard', 'Jog Controls']);
  });

  test('should navigate between dashboard and jog controls', async ({ navigationPage }) => {
    // Start at dashboard
    await navigationPage.navigateToDashboard();
    let url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/');

    // Navigate to jog controls
    await navigationPage.navigateToJogControls();
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Navigate back to dashboard
    await navigationPage.navigateToDashboard();
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/');
  });

  test('should highlight active menu item', async ({ navigationPage }) => {
    // Navigate to dashboard
    await navigationPage.navigateToDashboard();
    let activeItem = await navigationPage.getActiveMenuItem();
    expect(activeItem).toContain('Dashboard');

    // Navigate to jog controls
    await navigationPage.navigateToJogControls();
    activeItem = await navigationPage.getActiveMenuItem();
    expect(activeItem).toContain('Jog Controls');
  });

  test('should update breadcrumbs correctly', async ({ navigationPage }) => {
    // Check breadcrumbs on dashboard
    await navigationPage.navigateToDashboard();
    let breadcrumbText = await navigationPage.getBreadcrumbText();
    expect(breadcrumbText).toContain('Dashboard');

    // Check breadcrumbs on jog controls
    await navigationPage.navigateToJogControls();
    breadcrumbText = await navigationPage.getBreadcrumbText();
    expect(breadcrumbText).toContain('Jog Controls');
  });

  test('should collapse and expand sidebar', async ({ navigationPage }) => {
    // Initially sidebar should be expanded
    const sidebar = navigationPage.sidebar;
    expect(await sidebar.isVisible()).toBe(true);

    // Collapse sidebar
    await navigationPage.collapseSidebar();
    
    // Verify sidebar is collapsed (check for collapsed class or reduced width)
    const sidebarClass = await sidebar.getAttribute('class');
    expect(sidebarClass).toContain('ant-layout-sider-collapsed');

    // Expand sidebar
    await navigationPage.expandSidebar();
    
    // Verify sidebar is expanded again
    const expandedClass = await sidebar.getAttribute('class');
    expect(expandedClass).not.toContain('ant-layout-sider-collapsed');
  });

  test('should maintain navigation state on page refresh', async ({ navigationPage, page }) => {
    // Navigate to jog controls
    await navigationPage.navigateToJogControls();
    let url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Refresh the page
    await page.reload();
    await navigationPage.waitForLoad();

    // Verify still on jog controls page
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Verify correct menu item is still active
    const activeItem = await navigationPage.getActiveMenuItem();
    expect(activeItem).toContain('Jog Controls');
  });

  test('should handle direct URL navigation', async ({ page, navigationPage }) => {
    // Navigate directly to jog controls via URL
    await page.goto('/controls');
    await navigationPage.waitForLoad();

    // Verify correct page loaded
    const url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Verify correct menu item is active
    const activeItem = await navigationPage.getActiveMenuItem();
    expect(activeItem).toContain('Jog Controls');

    // Navigate directly to dashboard via URL
    await page.goto('/');
    await navigationPage.waitForLoad();

    // Verify dashboard loaded
    const dashboardUrl = await navigationPage.getCurrentUrl();
    expect(dashboardUrl).toMatch(/\/$|\/$/); // Should end with just /
  });

  test('should handle responsive navigation', async ({ page, navigationPage }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await navigationPage.goto();

    // Verify sidebar is still functional on mobile
    expect(await navigationPage.sidebar.isVisible()).toBe(true);
    
    // Test navigation on mobile
    await navigationPage.navigateToJogControls();
    let url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigationPage.goto();

    // Verify navigation works on desktop
    await navigationPage.navigateToDashboard();
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/');
  });

  test('should not show hidden routes', async ({ navigationPage }) => {
    // Get all visible menu items
    const visibleItems = await navigationPage.getVisibleMenuItems();
    
    // Verify hidden routes are not visible
    const hiddenRoutes = ['Machine', 'Workspace', 'Tools', 'Programs', 'Settings', 'Help'];
    
    for (const hiddenRoute of hiddenRoutes) {
      expect(visibleItems).not.toContain(hiddenRoute);
    }
  });

  test('should handle browser back/forward buttons', async ({ page, navigationPage }) => {
    // Start at dashboard
    await navigationPage.navigateToDashboard();
    
    // Navigate to jog controls
    await navigationPage.navigateToJogControls();
    let url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');

    // Use browser back button
    await page.goBack();
    await navigationPage.waitForNavigation();
    
    // Verify back at dashboard
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/');

    // Use browser forward button
    await page.goForward();
    await navigationPage.waitForNavigation();
    
    // Verify back at jog controls
    url = await navigationPage.getCurrentUrl();
    expect(url).toContain('/controls');
  });

  test('should maintain sidebar state across navigation', async ({ navigationPage }) => {
    // Collapse sidebar
    await navigationPage.collapseSidebar();
    
    // Navigate to jog controls
    await navigationPage.navigateToJogControls();
    
    // Verify sidebar is still collapsed
    const sidebarClass = await navigationPage.sidebar.getAttribute('class');
    expect(sidebarClass).toContain('ant-layout-sider-collapsed');

    // Navigate back to dashboard
    await navigationPage.navigateToDashboard();
    
    // Verify sidebar is still collapsed
    const stillCollapsedClass = await navigationPage.sidebar.getAttribute('class');
    expect(stillCollapsedClass).toContain('ant-layout-sider-collapsed');
  });

  test('should show connection-dependent menu items correctly', async ({ navigationPage }) => {
    // Since Jog Controls requires connection, verify it's visible when connected
    const jogControlsVisible = await navigationPage.jogControlsLink.isVisible();
    expect(jogControlsVisible).toBe(true);

    // Verify the menu item is not disabled (machine should be connected in mock mode)
    const isDisabled = await navigationPage.jogControlsLink.getAttribute('aria-disabled');
    expect(isDisabled).not.toBe('true');
  });
});