import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ValidationRule,
  PositionValidationContext,
  SpeedValidationContext,
  FileValidationContext
} from './ValidationTypes';
import { Position } from '../../core/machine/MachineTypes';
import { logger } from '../logger';
import machineConfig from '@config/machine.json';

export class ValidationService {
  private rules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.registerBuiltInRules();
  }

  // Rule Management
  registerRule(category: string, rule: ValidationRule): void {
    if (!this.rules.has(category)) {
      this.rules.set(category, []);
    }
    
    this.rules.get(category)!.push(rule);
    logger.debug(`Validation rule registered: ${category}.${rule.name}`);
  }

  removeRule(category: string, ruleName: string): void {
    const categoryRules = this.rules.get(category);
    if (categoryRules) {
      const index = categoryRules.findIndex(rule => rule.name === ruleName);
      if (index >= 0) {
        categoryRules.splice(index, 1);
        logger.debug(`Validation rule removed: ${category}.${ruleName}`);
      }
    }
  }

  // Position Validation
  validatePosition(position: Position, context?: PositionValidationContext): ValidationResult {
    const result = this.createEmptyResult();
    const ctx = context || this.getDefaultPositionContext();

    // Check bounds
    this.validatePositionBounds(position, ctx, result);
    
    // Check safety margins
    if (ctx.safetyMargin) {
      this.validateSafetyMargins(position, ctx, result);
    }

    // Apply custom rules
    this.applyRules('position', position, ctx, result);

    return result;
  }

  private validatePositionBounds(
    position: Position, 
    context: PositionValidationContext, 
    result: ValidationResult
  ): void {
    const { bounds } = context;

    if (position.x < bounds.min.x || position.x > bounds.max.x) {
      result.errors.push({
        field: 'position.x',
        message: `X position ${position.x} is outside bounds (${bounds.min.x} to ${bounds.max.x})`,
        code: 'POSITION_OUT_OF_BOUNDS',
        value: position.x
      });
    }

    if (position.y < bounds.min.y || position.y > bounds.max.y) {
      result.errors.push({
        field: 'position.y',
        message: `Y position ${position.y} is outside bounds (${bounds.min.y} to ${bounds.max.y})`,
        code: 'POSITION_OUT_OF_BOUNDS',
        value: position.y
      });
    }

    if (position.z < bounds.min.z || position.z > bounds.max.z) {
      result.errors.push({
        field: 'position.z',
        message: `Z position ${position.z} is outside bounds (${bounds.min.z} to ${bounds.max.z})`,
        code: 'POSITION_OUT_OF_BOUNDS',
        value: position.z
      });
    }
  }

  private validateSafetyMargins(
    position: Position,
    context: PositionValidationContext,
    result: ValidationResult
  ): void {
    const { bounds, safetyMargin } = context;
    const margin = safetyMargin!;

    // Check if position is within safety margin of bounds
    const distanceToEdges = [
      position.x - bounds.min.x,
      bounds.max.x - position.x,
      position.y - bounds.min.y,
      bounds.max.y - position.y,
      position.z - bounds.min.z,
      bounds.max.z - position.z
    ];

    const minDistance = Math.min(...distanceToEdges);
    
    if (minDistance < margin && minDistance >= 0) {
      result.warnings.push({
        field: 'position',
        message: `Position is within safety margin (${margin}mm) of bounds`,
        code: 'POSITION_NEAR_BOUNDS',
        value: minDistance
      });
    }
  }

  // Speed Validation
  validateSpeed(speed: number, context?: SpeedValidationContext): ValidationResult {
    const result = this.createEmptyResult();
    const ctx = context || this.getDefaultSpeedContext();

    if (speed < ctx.min) {
      result.errors.push({
        field: 'speed',
        message: `Speed ${speed} is below minimum (${ctx.min})`,
        code: 'SPEED_TOO_LOW',
        value: speed
      });
    }

    if (speed > ctx.max) {
      result.errors.push({
        field: 'speed',
        message: `Speed ${speed} exceeds maximum (${ctx.max})`,
        code: 'SPEED_TOO_HIGH',
        value: speed
      });
    }

    // Check recommended range
    if (ctx.recommended) {
      if (speed < ctx.recommended.min || speed > ctx.recommended.max) {
        result.warnings.push({
          field: 'speed',
          message: `Speed ${speed} is outside recommended range (${ctx.recommended.min}-${ctx.recommended.max})`,
          code: 'SPEED_NOT_RECOMMENDED',
          value: speed
        });
      }
    }

    this.applyRules('speed', speed, ctx, result);
    return result;
  }

  // Increment Validation
  validateIncrement(increment: number, isMetric: boolean): ValidationResult {
    const result = this.createEmptyResult();

    if (increment <= 0) {
      result.errors.push({
        field: 'increment',
        message: 'Increment must be positive',
        code: 'INVALID_INCREMENT',
        value: increment
      });
    }

    const maxIncrement = isMetric ? 1000 : 39.37; // 1000mm or ~39 inches
    if (increment > maxIncrement) {
      result.warnings.push({
        field: 'increment',
        message: `Large increment value (${increment}${isMetric ? 'mm' : 'in'})`,
        code: 'LARGE_INCREMENT',
        value: increment
      });
    }

    this.applyRules('increment', { increment, isMetric }, null, result);
    return result;
  }

  // File Validation (for G-code files)
  validateFile(file: File, context?: FileValidationContext): ValidationResult {
    const result = this.createEmptyResult();
    const ctx = context || this.getDefaultFileContext();

    // Size validation
    if (file.size > ctx.maxSize) {
      result.errors.push({
        field: 'file.size',
        message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit (${(ctx.maxSize / 1024 / 1024).toFixed(1)}MB)`,
        code: 'FILE_TOO_LARGE',
        value: file.size
      });
    }

    // Type validation
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !ctx.allowedTypes.includes(fileExtension)) {
      result.errors.push({
        field: 'file.type',
        message: `File type .${fileExtension} not allowed. Allowed types: ${ctx.allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
        value: fileExtension
      });
    }

    this.applyRules('file', file, ctx, result);
    return result;
  }

  // Numeric Input Validation
  validateNumber(
    value: any, 
    min?: number, 
    max?: number, 
    required: boolean = true
  ): ValidationResult {
    const result = this.createEmptyResult();

    if (required && (value === null || value === undefined || value === '')) {
      result.errors.push({
        field: 'value',
        message: 'Value is required',
        code: 'REQUIRED_FIELD',
        value
      });
      return result;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      result.errors.push({
        field: 'value',
        message: 'Value must be a number',
        code: 'INVALID_NUMBER',
        value
      });
      return result;
    }

    if (min !== undefined && numValue < min) {
      result.errors.push({
        field: 'value',
        message: `Value ${numValue} is below minimum (${min})`,
        code: 'VALUE_TOO_LOW',
        value: numValue
      });
    }

    if (max !== undefined && numValue > max) {
      result.errors.push({
        field: 'value',
        message: `Value ${numValue} exceeds maximum (${max})`,
        code: 'VALUE_TOO_HIGH',
        value: numValue
      });
    }

    return result;
  }

  // Batch Validation
  validateBatch(validations: Array<() => ValidationResult>): ValidationResult {
    const result = this.createEmptyResult();

    validations.forEach(validation => {
      const subResult = validation();
      result.errors.push(...subResult.errors);
      result.warnings.push(...subResult.warnings);
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // Private Methods
  private applyRules(
    category: string, 
    value: any, 
    context: any, 
    result: ValidationResult
  ): void {
    const categoryRules = this.rules.get(category) || [];
    
    categoryRules.forEach(rule => {
      try {
        const ruleResult = rule.validate(value, context);
        
        if (rule.severity === 'error') {
          result.errors.push(...ruleResult.errors);
        } else {
          result.warnings.push(...ruleResult.warnings);
        }
      } catch (error) {
        logger.error(`Validation rule error: ${category}.${rule.name}`, { error });
      }
    });
  }

  private createEmptyResult(): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  private getDefaultPositionContext(): PositionValidationContext {
    return {
      bounds: {
        min: { x: 0, y: 0, z: 0 },
        max: {
          x: machineConfig.defaultDimensions.width,
          y: machineConfig.defaultDimensions.height,
          z: machineConfig.defaultDimensions.depth
        }
      },
      safetyMargin: 5
    };
  }

  private getDefaultSpeedContext(): SpeedValidationContext {
    return {
      min: machineConfig.movement.minSpeed,
      max: machineConfig.movement.maxSpeed,
      recommended: {
        min: 100,
        max: 2000
      }
    };
  }

  private getDefaultFileContext(): FileValidationContext {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['gcode', 'nc', 'txt'],
      maxLines: 10000
    };
  }

  private registerBuiltInRules(): void {
    // Register built-in safety rules
    this.registerRule('position', {
      name: 'z-axis-safety',
      severity: 'warning',
      validate: (position: Position) => {
        const result = this.createEmptyResult();
        if (position.z > 40) {
          result.warnings.push({
            field: 'position.z',
            message: 'High Z position may be unsafe',
            code: 'HIGH_Z_POSITION',
            value: position.z
          });
        }
        return result;
      }
    });

    this.registerRule('speed', {
      name: 'high-speed-warning',
      severity: 'warning',
      validate: (speed: number) => {
        const result = this.createEmptyResult();
        if (speed > 3000) {
          result.warnings.push({
            field: 'speed',
            message: 'High speed setting - ensure machine can handle this safely',
            code: 'HIGH_SPEED_WARNING',
            value: speed
          });
        }
        return result;
      }
    });
  }
}