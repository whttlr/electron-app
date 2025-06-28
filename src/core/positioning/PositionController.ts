import { Position } from '../machine/MachineTypes';
import { PositionBounds, PositionValidation, ScaledPosition } from './PositionTypes';
import { logger } from '@/services/logger';
import machineConfig from '@config/machine.json';

export class PositionController {
  private bounds: PositionBounds;
  private scaleFactor: number;

  constructor() {
    this.scaleFactor = machineConfig.scaling.machineScaleFactor;
    this.bounds = {
      min: { x: 0, y: 0, z: 0 },
      max: {
        x: machineConfig.defaultDimensions.width,
        y: machineConfig.defaultDimensions.height,
        z: machineConfig.defaultDimensions.depth
      }
    };
  }

  // Position Scaling
  scaleForDisplay(machinePosition: Position): Position {
    return {
      x: machinePosition.x / this.scaleFactor,
      y: machinePosition.y / this.scaleFactor,
      z: machinePosition.z / this.scaleFactor
    };
  }

  scaleForMachine(displayPosition: Position): Position {
    return {
      x: displayPosition.x * this.scaleFactor,
      y: displayPosition.y * this.scaleFactor,
      z: displayPosition.z * this.scaleFactor
    };
  }

  getScaledPositions(machinePosition: Position): ScaledPosition {
    return {
      machine: machinePosition,
      display: this.scaleForDisplay(machinePosition)
    };
  }

  // Position Validation
  validatePosition(position: Position): PositionValidation {
    const errors: string[] = [];

    if (position.x < this.bounds.min.x || position.x > this.bounds.max.x) {
      errors.push(`X position ${position.x} is out of bounds (${this.bounds.min.x}-${this.bounds.max.x})`);
    }

    if (position.y < this.bounds.min.y || position.y > this.bounds.max.y) {
      errors.push(`Y position ${position.y} is out of bounds (${this.bounds.min.y}-${this.bounds.max.y})`);
    }

    if (position.z < this.bounds.min.z || position.z > this.bounds.max.z) {
      errors.push(`Z position ${position.z} is out of bounds (${this.bounds.min.z}-${this.bounds.max.z})`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  isWithinBounds(position: Position): boolean {
    return this.validatePosition(position).isValid;
  }

  // Position Calculations
  calculateDistance(from: Position, to: Position): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  calculateJogTarget(current: Position, axis: keyof Position, distance: number): Position {
    const target = { ...current };
    target[axis] += distance;
    return target;
  }

  clampToBounds(position: Position): Position {
    return {
      x: Math.max(this.bounds.min.x, Math.min(this.bounds.max.x, position.x)),
      y: Math.max(this.bounds.min.y, Math.min(this.bounds.max.y, position.y)),
      z: Math.max(this.bounds.min.z, Math.min(this.bounds.max.z, position.z))
    };
  }

  // Bounds Management
  setBounds(bounds: PositionBounds): void {
    this.bounds = { ...bounds };
    logger.info('Position bounds updated', bounds);
  }

  getBounds(): PositionBounds {
    return {
      min: { ...this.bounds.min },
      max: { ...this.bounds.max }
    };
  }

  // Utility Methods
  interpolatePosition(from: Position, to: Position, progress: number): Position {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return {
      x: from.x + (to.x - from.x) * clampedProgress,
      y: from.y + (to.y - from.y) * clampedProgress,
      z: from.z + (to.z - from.z) * clampedProgress
    };
  }

  formatPosition(position: Position, precision: number = 3): string {
    return `X:${position.x.toFixed(precision)} Y:${position.y.toFixed(precision)} Z:${position.z.toFixed(precision)}`;
  }
}