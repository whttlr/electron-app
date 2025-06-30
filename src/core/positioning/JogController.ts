import { Position } from '../machine/MachineTypes';
import { JogSettings, JogCommand } from './PositionTypes';
import { PositionController } from './PositionController';
import { logger } from '@/services/logger';
import machineConfig from '@config/machine.json';

export class JogController {
  private positionController: PositionController;
  private settings: JogSettings;
  private jogHistory: JogCommand[] = [];

  constructor() {
    this.positionController = new PositionController();
    this.settings = {
      speed: machineConfig.jogSettings.defaultSpeed,
      increment: 1,
      isMetric: true
    };
  }

  // Jog Operations  
  async jog(axis: keyof Position, direction: 1 | -1, customDistance?: number): Promise<Position> {
    const distance = direction * (customDistance || this.settings.increment);
    const command: JogCommand = {
      axis,
      distance,
      speed: this.settings.speed
    };
    
    logger.info(`Jog command: ${axis} axis, distance: ${distance}, speed: ${this.settings.speed}`);
    
    // Record the jog in history
    this.addToHistory(command);
    
    // Return the command for the caller to execute with current position
    // The actual position update should be handled by the machine controller
    return this.positionController.calculateJogTarget({ x: 0, y: 0, z: 0 }, axis, distance);
  }

  async executeJog(current: Position, command: JogCommand): Promise<Position> {
    const { axis, distance, speed = this.settings.speed } = command;
    
    logger.info(`Executing jog: ${axis} axis, distance: ${distance}, speed: ${speed}`);
    
    const target = this.positionController.calculateJogTarget(current, axis, distance);
    const validation = this.positionController.validatePosition(target);
    
    if (!validation.isValid) {
      const error = `Jog would exceed bounds: ${validation.errors?.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }

    // Record command in history
    this.jogHistory.push(command);
    if (this.jogHistory.length > 100) {
      this.jogHistory = this.jogHistory.slice(-100);
    }

    return target;
  }

  calculateStepJog(axis: keyof Position, direction: 1 | -1): JogCommand {
    return {
      axis,
      distance: this.settings.increment * direction,
      speed: this.settings.speed
    };
  }

  // Settings Management
  updateSettings(settings: Partial<JogSettings>): void {
    this.settings = { ...this.settings, ...settings };
    logger.debug('Jog settings updated', this.settings);
  }

  getSettings(): JogSettings {
    return { ...this.settings };
  }

  setMetricMode(isMetric: boolean): void {
    this.settings.isMetric = isMetric;
    // Reset increment to default for the new unit system
    this.settings.increment = isMetric ? 1 : 0.0625; // 1mm or 1/16"
  }

  // Increment Management
  getAvailableIncrements(): { value: number; label: string }[] {
    if (this.settings.isMetric) {
      return machineConfig.jogSettings.metricIncrements.map(value => ({
        value,
        label: this.formatMetricIncrement(value)
      }));
    } else {
      return machineConfig.jogSettings.imperialIncrements.map(value => ({
        value,
        label: this.formatImperialIncrement(value)
      }));
    }
  }

  private formatMetricIncrement(value: number): string {
    if (value < 1) {
      return `${value} mm`;
    }
    return `${value} mm`;
  }

  private formatImperialIncrement(value: number): string {
    // Convert mm to inches and format as fractions
    const inches = value / 25.4;
    
    if (inches === 0.015625) return '1/64"';
    if (inches === 0.03125) return '1/32"';
    if (inches === 0.0625) return '1/16"';
    if (inches === 0.125) return '1/8"';
    if (inches === 0.25) return '1/4"';
    if (inches === 0.5) return '1/2"';
    if (inches === 1) return '1"';
    
    return `${inches.toFixed(4)}"`;
  }

  // Speed Management
  validateSpeed(speed: number): boolean {
    return speed >= machineConfig.movement.minSpeed && 
           speed <= machineConfig.movement.maxSpeed;
  }

  getSpeedLimits(): { min: number; max: number } {
    return {
      min: machineConfig.movement.minSpeed,
      max: machineConfig.movement.maxSpeed
    };
  }

  // History
  addToHistory(command: JogCommand): void {
    this.jogHistory.push(command);
    if (this.jogHistory.length > 100) {
      this.jogHistory = this.jogHistory.slice(-100);
    }
  }

  getJogHistory(): JogCommand[] {
    return [...this.jogHistory];
  }

  clearHistory(): void {
    this.jogHistory = [];
  }

  getLastJog(): JogCommand | undefined {
    return this.jogHistory[this.jogHistory.length - 1];
  }
}