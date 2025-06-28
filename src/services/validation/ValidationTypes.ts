import { Position } from '../../core/machine/MachineTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: any) => ValidationResult;
  severity: 'error' | 'warning';
}

export interface PositionValidationContext {
  bounds: {
    min: Position;
    max: Position;
  };
  safetyMargin?: number;
}

export interface SpeedValidationContext {
  min: number;
  max: number;
  recommended?: { min: number; max: number };
}

export interface FileValidationContext {
  maxSize: number;
  allowedTypes: string[];
  maxLines?: number;
}