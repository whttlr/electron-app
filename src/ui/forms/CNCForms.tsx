/**
 * CNC-Specific Form Components
 * 
 * Complete form implementations for CNC machine configuration,
 * job setup, and operational parameters.
 */

import React from 'react';

// ============================================================================
// RE-EXPORT MACHINE SETUP FORM
// ============================================================================

// MachineSetupForm has been extracted to its own file
export { MachineSetupForm, type MachineSetupFormData, type MachineSetupFormProps } from './MachineSetupForm';

// ============================================================================
// RE-EXPORT JOB SETUP FORM
// ============================================================================

// JobSetupForm has been extracted to its own file
export { JobSetupForm, JobSetupFormData, JobSetupFormProps } from './JobSetupForm';

// ============================================================================
// RE-EXPORT QUICK JOG FORM
// ============================================================================

// QuickJogForm has been extracted to its own file
export { QuickJogForm, QuickJogFormProps } from './QuickJogForm';

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MachineSetupForm,
  JobSetupForm,
  QuickJogForm,
};

export type {
  MachineSetupFormData,
  MachineSetupFormProps,
  JobSetupFormData,
  JobSetupFormProps,
  QuickJogFormProps,
};
