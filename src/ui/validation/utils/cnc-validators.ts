/**
 * CNC Validation Utilities
 * 
 * Validation functions specific to CNC operations
 */

import { getValidationConfig } from '../config';

/**
 * Coordinate validation result
 */
interface CoordinateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates CNC coordinates against machine limits
 */
export function validateCoordinates(
  coordinates: { x: number; y: number; z: number },
  bounds?: { 
    x: { min: number; max: number }; 
    y: { min: number; max: number }; 
    z: { min: number; max: number }; 
  }
): CoordinateValidationResult {
  const config = getValidationConfig();
  const limits = bounds || config.cnc.coordinates.defaultBounds;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate X coordinate
  if (coordinates.x < limits.x.min || coordinates.x > limits.x.max) {
    errors.push(`X coordinate ${coordinates.x} is outside limits (${limits.x.min} to ${limits.x.max})`);
  }
  
  // Validate Y coordinate
  if (coordinates.y < limits.y.min || coordinates.y > limits.y.max) {
    errors.push(`Y coordinate ${coordinates.y} is outside limits (${limits.y.min} to ${limits.y.max})`);
  }
  
  // Validate Z coordinate
  if (coordinates.z < limits.z.min || coordinates.z > limits.z.max) {
    errors.push(`Z coordinate ${coordinates.z} is outside limits (${limits.z.min} to ${limits.z.max})`);
  }
  
  // Check for precision warnings
  const precision = config.cnc.coordinates.precision;
  const checkPrecision = (value: number, axis: string) => {
    const factor = Math.pow(10, precision);
    const rounded = Math.round(value * factor) / factor;
    if (Math.abs(value - rounded) > 0.0001) {
      warnings.push(`${axis} coordinate precision exceeds ${precision} decimal places`);
    }
  };
  
  checkPrecision(coordinates.x, 'X');
  checkPrecision(coordinates.y, 'Y');
  checkPrecision(coordinates.z, 'Z');
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates feed rate against machine capabilities
 */
export function validateFeedRate(
  feedRate: number,
  machineType: 'mill' | 'lathe' | 'router' = 'mill'
): { isValid: boolean; errors: string[] } {
  const config = getValidationConfig();
  const limits = config.cnc.feedRate.limits[machineType];
  
  const errors: string[] = [];
  
  if (feedRate < limits.min) {
    errors.push(`Feed rate ${feedRate} is below minimum (${limits.min})`);
  }
  
  if (feedRate > limits.max) {
    errors.push(`Feed rate ${feedRate} exceeds maximum (${limits.max})`);
  }
  
  if (feedRate <= 0) {
    errors.push('Feed rate must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates spindle speed against machine capabilities
 */
export function validateSpindleSpeed(
  spindleSpeed: number,
  machineType: 'mill' | 'lathe' | 'router' = 'mill'
): { isValid: boolean; errors: string[] } {
  const config = getValidationConfig();
  const limits = config.cnc.spindleSpeed.limits[machineType];
  
  const errors: string[] = [];
  
  if (spindleSpeed < limits.min) {
    errors.push(`Spindle speed ${spindleSpeed} is below minimum (${limits.min})`);
  }
  
  if (spindleSpeed > limits.max) {
    errors.push(`Spindle speed ${spindleSpeed} exceeds maximum (${limits.max})`);
  }
  
  if (spindleSpeed <= 0) {
    errors.push('Spindle speed must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates tool parameters
 */
export function validateTool(
  tool: {
    number: number;
    diameter: number;
    length: number;
    material: string;
  },
  machineType: 'mill' | 'lathe' | 'router' = 'mill'
): { isValid: boolean; errors: string[] } {
  const config = getValidationConfig();
  const toolConfig = config.cnc.tools;
  
  const errors: string[] = [];
  
  // Validate tool number
  if (tool.number < toolConfig.toolNumber.min || tool.number > toolConfig.toolNumber.max) {
    errors.push(`Tool number ${tool.number} is outside valid range (${toolConfig.toolNumber.min}-${toolConfig.toolNumber.max})`);
  }
  
  // Validate tool diameter
  if (tool.diameter < toolConfig.diameter.min || tool.diameter > toolConfig.diameter.max) {
    errors.push(`Tool diameter ${tool.diameter} is outside valid range (${toolConfig.diameter.min}-${toolConfig.diameter.max})`);
  }
  
  // Validate tool length
  if (tool.length < toolConfig.length.min || tool.length > toolConfig.length.max) {
    errors.push(`Tool length ${tool.length} is outside valid range (${toolConfig.length.min}-${toolConfig.length.max})`);
  }
  
  // Validate tool material
  if (!toolConfig.materials.includes(tool.material)) {
    errors.push(`Tool material "${tool.material}" is not supported. Valid materials: ${toolConfig.materials.join(', ')}`);
  }
  
  // Check compatibility with machine type
  const compatibleMaterials = toolConfig.compatibility[machineType];
  if (compatibleMaterials && !compatibleMaterials.includes(tool.material)) {
    errors.push(`Tool material "${tool.material}" is not compatible with ${machineType}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}