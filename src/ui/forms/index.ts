/**
 * UI Forms Public API
 * 
 * Exports form components and utilities for CNC control applications
 */

// Configuration
export { defaultFormConfig, getFormConfig } from './config';
export type { FormConfig } from './config';

// CNC Forms
export { default as CNCForms } from './CNCForms';
export { JobSetupForm, JobSetupFormData, JobSetupFormProps } from './JobSetupForm';

// Form utilities
export { useFormValidation } from './utils/validation-hooks';
export { useAutoSave } from './utils/auto-save-hooks';
export { useFormState } from './utils/form-state-hooks';
export { validateCoordinates } from './utils/cnc-validators';
export { validateFeedRate } from './utils/cnc-validators';
export { validateSpindleSpeed } from './utils/cnc-validators';

// Form types
export type { 
  JogControlsFormData,
  MachineSetupFormData,
  WorkspaceConfigFormData,
  ToolConfigFormData,
  SafetySettingsFormData,
  FormValidationResult,
  FormValidationRule
} from './types';
export type { JobSetupFormData, JobSetupFormProps } from './JobSetupForm';