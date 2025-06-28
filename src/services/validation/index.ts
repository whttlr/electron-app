// Public API exports for the validation module
export { ValidationService } from './ValidationService';
export * from './ValidationTypes';

// Create singleton instance
import { ValidationService } from './ValidationService';
export const validationService = new ValidationService();