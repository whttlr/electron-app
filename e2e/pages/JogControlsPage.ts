import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JogControlsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Jog Controls specific selectors
  get currentPositionCard() {
    return this.page.locator('[data-testid="current-position"]');
  }

  get machineControlsCard() {
    return this.page.locator('[data-testid="machine-controls"]');
  }

  get settingsCard() {
    return this.page.locator('[data-testid="jog-settings"]');
  }

  get preview2DCard() {
    return this.page.locator('[data-testid="preview-2d"]');
  }

  get preview3DCard() {
    return this.page.locator('[data-testid="preview-3d"]');
  }

  // Position controls
  get xAxisControls() {
    return this.page.locator('[data-testid="axis-control-x"]');
  }

  get yAxisControls() {
    return this.page.locator('[data-testid="axis-control-y"]');
  }

  get zAxisControls() {
    return this.page.locator('[data-testid="axis-control-z"]');
  }

  get homeControl() {
    return this.page.locator('[data-testid="home-control"]');
  }

  // Jog buttons
  get xNegativeButton() {
    return this.page.locator('[data-testid="jog-x-negative"]');
  }

  get xPositiveButton() {
    return this.page.locator('[data-testid="jog-x-positive"]');
  }

  get yNegativeButton() {
    return this.page.locator('[data-testid="jog-y-negative"]');
  }

  get yPositiveButton() {
    return this.page.locator('[data-testid="jog-y-positive"]');
  }

  get zNegativeButton() {
    return this.page.locator('[data-testid="jog-z-negative"]');
  }

  get zPositiveButton() {
    return this.page.locator('[data-testid="jog-z-positive"]');
  }

  get homeButton() {
    return this.page.locator('[data-testid="home-button"]');
  }

  // Settings controls
  get speedInput() {
    return this.page.locator('[data-testid="jog-speed-input"]');
  }

  get incrementSelect() {
    return this.page.locator('[data-testid="jog-increment-select"]');
  }

  get unitToggle() {
    return this.page.locator('[data-testid="jog-unit-toggle"]');
  }

  // Actions
  async goto() {
    await super.goto('/controls');
  }

  async jogXPositive() {
    await this.xPositiveButton.click();
  }

  async jogXNegative() {
    await this.xNegativeButton.click();
  }

  async jogYPositive() {
    await this.yPositiveButton.click();
  }

  async jogYNegative() {
    await this.yNegativeButton.click();
  }

  async jogZPositive() {
    await this.zPositiveButton.click();
  }

  async jogZNegative() {
    await this.zNegativeButton.click();
  }

  async clickHome() {
    await this.homeButton.click();
  }

  async setJogSpeed(speed: number) {
    await this.speedInput.fill(speed.toString());
  }

  async setJogIncrement(increment: string) {
    await this.incrementSelect.selectOption(increment);
  }

  async toggleUnits() {
    await this.unitToggle.click();
  }

  async getCurrentPosition() {
    const x = await this.currentPositionCard.locator('[data-testid="position-x"] .ant-statistic-content-value').textContent();
    const y = await this.currentPositionCard.locator('[data-testid="position-y"] .ant-statistic-content-value').textContent();
    const z = await this.currentPositionCard.locator('[data-testid="position-z"] .ant-statistic-content-value').textContent();
    
    return { 
      x: parseFloat(x || '0'), 
      y: parseFloat(y || '0'), 
      z: parseFloat(z || '0') 
    };
  }

  async getJogSettings() {
    const speed = await this.speedInput.inputValue();
    const increment = await this.incrementSelect.inputValue();
    const isMetric = await this.unitToggle.isChecked();
    
    return {
      speed: parseFloat(speed),
      increment: parseFloat(increment),
      isMetric
    };
  }

  async verifyAllCardsVisible() {
    const cards = [
      this.currentPositionCard,
      this.machineControlsCard,
      this.settingsCard,
      this.preview2DCard,
      this.preview3DCard
    ];

    const results = await Promise.all(
      cards.map(card => card.isVisible())
    );

    return results.every(visible => visible);
  }

  async verifyAxisControlsVisible() {
    const controls = [
      this.xAxisControls,
      this.yAxisControls,
      this.zAxisControls,
      this.homeControl
    ];

    const results = await Promise.all(
      controls.map(control => control.isVisible())
    );

    return results.every(visible => visible);
  }

  async verifyJogButtonsEnabled() {
    const buttons = [
      this.xNegativeButton,
      this.xPositiveButton,
      this.yNegativeButton,
      this.yPositiveButton,
      this.zNegativeButton,
      this.zPositiveButton,
      this.homeButton
    ];

    const results = await Promise.all(
      buttons.map(button => button.isEnabled())
    );

    return results.every(enabled => enabled);
  }

  async performJogSequence() {
    const initialPosition = await this.getCurrentPosition();
    
    // Perform a sequence of jog movements
    await this.jogXPositive();
    await this.page.waitForTimeout(500);
    
    await this.jogYPositive();
    await this.page.waitForTimeout(500);
    
    await this.jogZPositive();
    await this.page.waitForTimeout(500);
    
    const finalPosition = await this.getCurrentPosition();
    
    return {
      initial: initialPosition,
      final: finalPosition,
      moved: (
        finalPosition.x !== initialPosition.x ||
        finalPosition.y !== initialPosition.y ||
        finalPosition.z !== initialPosition.z
      )
    };
  }
}