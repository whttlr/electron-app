import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Dashboard specific selectors
  get connectionStatus() {
    return this.page.locator('[data-testid="connection-status"]');
  }

  get machinePosition() {
    return this.page.locator('[data-testid="machine-position"]');
  }

  get xPositionCard() {
    return this.page.locator('[data-testid="position-x"]');
  }

  get yPositionCard() {
    return this.page.locator('[data-testid="position-y"]');
  }

  get zPositionCard() {
    return this.page.locator('[data-testid="position-z"]');
  }

  get quickActionsCard() {
    return this.page.locator('[data-testid="quick-actions"]');
  }

  get jogControlsButton() {
    return this.page.locator('[data-testid="quick-action-jog-controls"]');
  }

  get machineSetupButton() {
    return this.page.locator('[data-testid="quick-action-machine-setup"]');
  }

  get workspaceButton() {
    return this.page.locator('[data-testid="quick-action-workspace"]');
  }

  get programsButton() {
    return this.page.locator('[data-testid="quick-action-programs"]');
  }

  get workspaceDimensions() {
    return this.page.locator('[data-testid="workspace-dimensions"]');
  }

  get systemStatus() {
    return this.page.locator('[data-testid="system-status"]');
  }

  get machineFeatures() {
    return this.page.locator('[data-testid="machine-features"]');
  }

  get configurationInfo() {
    return this.page.locator('[data-testid="configuration-info"]');
  }

  // Actions
  async goto() {
    await super.goto('/');
  }

  async clickJogControlsQuickAction() {
    await this.jogControlsButton.click();
    await this.waitForNavigation();
  }

  async getConnectionStatusText() {
    return await this.connectionStatus.textContent();
  }

  async getMachinePosition() {
    const x = await this.xPositionCard.locator('.ant-statistic-content-value').textContent();
    const y = await this.yPositionCard.locator('.ant-statistic-content-value').textContent();
    const z = await this.zPositionCard.locator('.ant-statistic-content-value').textContent();
    
    return { x: parseFloat(x || '0'), y: parseFloat(y || '0'), z: parseFloat(z || '0') };
  }

  async getWorkspaceDimensions() {
    const width = await this.workspaceDimensions.locator('[data-testid="dimension-width"] .ant-statistic-content-value').textContent();
    const height = await this.workspaceDimensions.locator('[data-testid="dimension-height"] .ant-statistic-content-value').textContent();
    const depth = await this.workspaceDimensions.locator('[data-testid="dimension-depth"] .ant-statistic-content-value').textContent();
    
    return { 
      width: parseFloat(width || '0'), 
      height: parseFloat(height || '0'), 
      depth: parseFloat(depth || '0') 
    };
  }

  async getSystemInitializationStatus() {
    const statusText = await this.systemStatus.locator('[data-testid="initialization-status"]').textContent();
    return statusText?.includes('Complete');
  }

  async getMachineFeatureStatus() {
    const wcsStatus = await this.machineFeatures.locator('[data-testid="feature-wcs"]').textContent();
    const toolDirectionStatus = await this.machineFeatures.locator('[data-testid="feature-tool-direction"]').textContent();
    const spindleStatus = await this.machineFeatures.locator('[data-testid="feature-spindle"]').textContent();
    const probingStatus = await this.machineFeatures.locator('[data-testid="feature-probing"]').textContent();
    
    return {
      wcs: wcsStatus?.includes('available'),
      toolDirection: toolDirectionStatus?.includes('clockwise'),
      spindle: spindleStatus?.includes('Enabled'),
      probing: probingStatus?.includes('Enabled')
    };
  }

  async verifyQuickActionsExist() {
    const buttons = [
      this.jogControlsButton,
      this.machineSetupButton,
      this.workspaceButton,
      this.programsButton
    ];

    const results = await Promise.all(
      buttons.map(button => button.isVisible())
    );

    return results.every(visible => visible);
  }

  async verifyAllCardsVisible() {
    const cards = [
      this.connectionStatus,
      this.xPositionCard,
      this.yPositionCard,
      this.zPositionCard,
      this.quickActionsCard,
      this.workspaceDimensions,
      this.systemStatus,
      this.machineFeatures,
      this.configurationInfo
    ];

    const results = await Promise.all(
      cards.map(card => card.isVisible())
    );

    return results.every(visible => visible);
  }
}