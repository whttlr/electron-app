/**
 * CNC Validation Utilities
 * 
 * Comprehensive validation utilities for CNC machine settings,
 * coordinates, speeds, and other machine-specific parameters.
 */

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  code?: string;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
  message?: string;
  type?: 'string' | 'number' | 'email' | 'url' | 'coordinate' | 'feedrate';
}

export interface CoordinateValidationOptions {
  min?: number;
  max?: number;
  precision?: number;
  allowNegative?: boolean;
  units?: 'mm' | 'in';
}

export interface FeedRateValidationOptions {
  min?: number;
  max?: number;
  units?: 'mm/min' | 'in/min' | '%';
  machineType?: 'cnc' | 'laser' | '3d-printer';
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Common validation patterns for CNC applications
 */
export const validationPatterns = {
  // Coordinate patterns
  coordinate: /^[+-]?\d*\.?\d+$/,
  coordinateWithUnits: /^[+-]?\d*\.?\d+\s*(mm|in)?$/i,
  
  // Speed and feed rate patterns
  feedRate: /^\d*\.?\d+$/,
  percentage: /^(100|[1-9]?\d)(\.\d+)?$/,
  rpm: /^\d+$/,
  
  // Machine identifiers
  machineId: /^[a-zA-Z0-9_-]+$/,
  serialNumber: /^[A-Z0-9-]+$/,
  
  // Network and connection
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  macAddress: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  
  // File and path validation
  fileName: /^[^<>:"|?*\/\\]+$/,
  filePath: /^[^<>:"|?*]+$/,
  gcodeExtension: /\.(gcode|cnc|nc|tap)$/i,
  
  // Units and measurements
  distance: /^\d*\.?\d+\s*(mm|in|cm|m|ft)$/i,
  angle: /^[+-]?\d*\.?\d+\s*(deg|rad)?$/i,
  temperature: /^\d*\.?\d+\s*(C|F|K)?$/i,
};

// ============================================================================
// COORDINATE VALIDATION
// ============================================================================

/**
 * Validate coordinate values with comprehensive checks
 */
export function validateCoordinate(
  value: string | number,
  axis: 'X' | 'Y' | 'Z',
  options: CoordinateValidationOptions = {}
): ValidationResult {
  const {
    min = -1000,
    max = 1000,
    precision = 3,
    allowNegative = true,
    units = 'mm'
  } = options;
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: `${axis}-axis coordinate must be a valid number`,
      type: 'error',
      code: 'INVALID_NUMBER'
    };
  }
  
  // Check negative values
  if (!allowNegative && numValue < 0) {
    return {
      isValid: false,
      message: `${axis}-axis coordinate cannot be negative`,
      type: 'error',
      code: 'NEGATIVE_NOT_ALLOWED'
    };
  }
  
  // Check range
  if (numValue < min) {
    return {
      isValid: false,
      message: `${axis}-axis coordinate must be >= ${min}${units}`,
      type: 'error',
      code: 'BELOW_MINIMUM'
    };
  }
  
  if (numValue > max) {
    return {
      isValid: false,
      message: `${axis}-axis coordinate must be <= ${max}${units}`,
      type: 'error',
      code: 'ABOVE_MAXIMUM'
    };
  }
  
  // Check precision
  const decimalPlaces = value.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > precision) {
    return {
      isValid: false,
      message: `${axis}-axis coordinate precision cannot exceed ${precision} decimal places`,
      type: 'warning',
      code: 'PRECISION_EXCEEDED'
    };
  }
  
  return {
    isValid: true,
    type: 'success'
  };
}

/**
 * Validate a complete coordinate set (X, Y, Z)
 */
export function validateCoordinateSet(
  coordinates: { x?: number; y?: number; z?: number },
  workingArea: { width: number; height: number; depth: number },
  origin: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
): ValidationResult {
  const errors: string[] = [];
  
  // Validate each axis if provided
  if (coordinates.x !== undefined) {
    const xResult = validateCoordinate(coordinates.x, 'X', {
      min: origin.x,
      max: origin.x + workingArea.width
    });
    if (!xResult.isValid) errors.push(xResult.message!);
  }
  
  if (coordinates.y !== undefined) {
    const yResult = validateCoordinate(coordinates.y, 'Y', {
      min: origin.y,
      max: origin.y + workingArea.height
    });
    if (!yResult.isValid) errors.push(yResult.message!);
  }
  
  if (coordinates.z !== undefined) {
    const zResult = validateCoordinate(coordinates.z, 'Z', {
      min: origin.z - workingArea.depth,
      max: origin.z
    });
    if (!zResult.isValid) errors.push(zResult.message!);
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors.join('; '),
      type: 'error',
      code: 'COORDINATE_SET_INVALID'
    };
  }
  
  return { isValid: true, type: 'success' };
}

// ============================================================================
// FEED RATE VALIDATION
// ============================================================================

/**
 * Validate feed rate values
 */
export function validateFeedRate(
  value: string | number,
  options: FeedRateValidationOptions = {}
): ValidationResult {
  const {
    min = 1,
    max = 10000,
    units = 'mm/min',
    machineType = 'cnc'
  } = options;
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: 'Feed rate must be a valid number',
      type: 'error',
      code: 'INVALID_NUMBER'
    };
  }
  
  // Check positive value
  if (numValue <= 0) {
    return {
      isValid: false,
      message: 'Feed rate must be greater than 0',
      type: 'error',
      code: 'NOT_POSITIVE'
    };
  }
  
  // Check range
  if (numValue < min) {
    return {
      isValid: false,
      message: `Feed rate must be >= ${min} ${units}`,
      type: 'error',
      code: 'BELOW_MINIMUM'
    };
  }
  
  if (numValue > max) {
    return {
      isValid: false,
      message: `Feed rate must be <= ${max} ${units}`,
      type: 'error',
      code: 'ABOVE_MAXIMUM'
    };
  }
  
  // Machine-specific validation
  if (machineType === 'laser' && numValue > 5000) {
    return {
      isValid: false,
      message: 'Laser cutting feed rate should not exceed 5000 mm/min for safety',
      type: 'warning',
      code: 'LASER_SPEED_WARNING'
    };
  }
  
  if (machineType === '3d-printer' && numValue > 200) {
    return {
      isValid: false,
      message: '3D printer feed rate typically should not exceed 200 mm/min',
      type: 'warning',
      code: 'PRINTER_SPEED_WARNING'
    };
  }
  
  return {
    isValid: true,
    type: 'success'
  };
}

// ============================================================================
// MACHINE CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate machine ID
 */
export function validateMachineId(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: 'Machine ID is required',
      type: 'error',
      code: 'REQUIRED'
    };
  }
  
  if (!validationPatterns.machineId.test(value)) {
    return {
      isValid: false,
      message: 'Machine ID can only contain letters, numbers, dashes, and underscores',
      type: 'error',
      code: 'INVALID_FORMAT'
    };
  }
  
  if (value.length < 3) {
    return {
      isValid: false,
      message: 'Machine ID must be at least 3 characters long',
      type: 'error',
      code: 'TOO_SHORT'
    };
  }
  
  if (value.length > 32) {
    return {
      isValid: false,
      message: 'Machine ID cannot exceed 32 characters',
      type: 'error',
      code: 'TOO_LONG'
    };
  }
  
  return { isValid: true, type: 'success' };
}

/**
 * Validate working area dimensions
 */
export function validateWorkingArea(
  dimensions: { width: number; height: number; depth: number }
): ValidationResult {
  const { width, height, depth } = dimensions;
  const errors: string[] = [];
  
  // Check for positive values
  if (width <= 0) errors.push('Width must be greater than 0');
  if (height <= 0) errors.push('Height must be greater than 0');
  if (depth <= 0) errors.push('Depth must be greater than 0');
  
  // Check reasonable limits (in mm)
  const maxDimension = 10000; // 10 meters
  if (width > maxDimension) errors.push(`Width cannot exceed ${maxDimension}mm`);
  if (height > maxDimension) errors.push(`Height cannot exceed ${maxDimension}mm`);
  if (depth > maxDimension) errors.push(`Depth cannot exceed ${maxDimension}mm`);
  
  // Check minimum practical size
  const minDimension = 1;
  if (width < minDimension) errors.push(`Width must be at least ${minDimension}mm`);
  if (height < minDimension) errors.push(`Height must be at least ${minDimension}mm`);
  if (depth < minDimension) errors.push(`Depth must be at least ${minDimension}mm`);
  
  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors.join('; '),
      type: 'error',
      code: 'INVALID_DIMENSIONS'
    };
  }
  
  return { isValid: true, type: 'success' };
}

// ============================================================================
// CONNECTION VALIDATION
// ============================================================================

/**
 * Validate IP address
 */
export function validateIpAddress(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: 'IP address is required',
      type: 'error',
      code: 'REQUIRED'
    };
  }
  
  if (!validationPatterns.ipAddress.test(value)) {
    return {
      isValid: false,
      message: 'Please enter a valid IP address (e.g., 192.168.1.100)',
      type: 'error',
      code: 'INVALID_FORMAT'
    };
  }
  
  // Check for reserved ranges
  const parts = value.split('.').map(Number);
  if (parts[0] === 127) {
    return {
      isValid: true,
      message: 'Localhost address detected',
      type: 'info',
      code: 'LOCALHOST'
    };
  }
  
  if (parts[0] === 192 && parts[1] === 168) {
    return {
      isValid: true,
      message: 'Private network address',
      type: 'info',
      code: 'PRIVATE_NETWORK'
    };
  }
  
  return { isValid: true, type: 'success' };
}

/**
 * Validate port number
 */
export function validatePort(value: string | number): ValidationResult {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: 'Port must be a valid number',
      type: 'error',
      code: 'INVALID_NUMBER'
    };
  }
  
  if (numValue < 1 || numValue > 65535) {
    return {
      isValid: false,
      message: 'Port must be between 1 and 65535',
      type: 'error',
      code: 'OUT_OF_RANGE'
    };
  }
  
  // Check for well-known ports
  if (numValue < 1024) {
    return {
      isValid: true,
      message: 'Using well-known port (requires elevated privileges)',
      type: 'warning',
      code: 'WELL_KNOWN_PORT'
    };
  }
  
  return { isValid: true, type: 'success' };
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate G-code file name
 */
export function validateGCodeFileName(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: 'File name is required',
      type: 'error',
      code: 'REQUIRED'
    };
  }
  
  if (!validationPatterns.fileName.test(value)) {
    return {
      isValid: false,
      message: 'File name contains invalid characters',
      type: 'error',
      code: 'INVALID_CHARACTERS'
    };
  }
  
  if (!validationPatterns.gcodeExtension.test(value)) {
    return {
      isValid: false,
      message: 'File must have a valid G-code extension (.gcode, .cnc, .nc, .tap)',
      type: 'warning',
      code: 'INVALID_EXTENSION'
    };
  }
  
  return { isValid: true, type: 'success' };
}

// ============================================================================
// COMPOSITE VALIDATORS
// ============================================================================

/**
 * Create a validator function for form fields
 */
export function createValidator(
  ...validators: Array<(value: any) => ValidationResult>
) {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true, type: 'success' };
  };
}

/**
 * Create a required field validator
 */
export function required(message = 'This field is required'): (value: any) => ValidationResult {
  return (value: any) => {
    if (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return {
        isValid: false,
        message,
        type: 'error',
        code: 'REQUIRED'
      };
    }
    return { isValid: true, type: 'success' };
  };
}

/**
 * Create a range validator for numbers
 */
export function range(
  min: number, 
  max: number, 
  message?: string
): (value: any) => ValidationResult {
  return (value: any) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return {
        isValid: false,
        message: 'Must be a valid number',
        type: 'error',
        code: 'INVALID_NUMBER'
      };
    }
    
    if (num < min || num > max) {
      return {
        isValid: false,
        message: message || `Value must be between ${min} and ${max}`,
        type: 'error',
        code: 'OUT_OF_RANGE'
      };
    }
    
    return { isValid: true, type: 'success' };
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  patterns: validationPatterns,
  validateCoordinate,
  validateCoordinateSet,
  validateFeedRate,
  validateMachineId,
  validateWorkingArea,
  validateIpAddress,
  validatePort,
  validateGCodeFileName,
  createValidator,
  required,
  range,
};
