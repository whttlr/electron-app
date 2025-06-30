/**
 * Plugin Scripting Engine - Public API exports
 */

// Core engine
export { ScriptingEngine } from './ScriptingEngine'
export type {
  ScriptingEngineOptions,
  ScriptExecutionContext,
  ScriptExecutionResult,
  ScriptExecutionError,
  ScriptDefinition,
  ScriptParameter
} from './ScriptingEngine'

// Validation
export { ScriptValidator } from './ScriptValidator'
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SecurityCheck
} from './ScriptValidator'

// Workflow management
export { ScriptWorkflow } from './ScriptWorkflow'
export type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepConfig,
  WorkflowTrigger,
  WorkflowTriggerConfig,
  WorkflowExecution,
  WorkflowStepResult
} from './ScriptWorkflow'

// Configuration
import scriptingConfig from './config'
export { scriptingConfig }