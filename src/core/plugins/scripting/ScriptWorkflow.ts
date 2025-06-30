/**
 * Script Workflow - Manages script execution workflows and automation
 */

import { EventEmitter } from 'events'
import { ScriptingEngine, ScriptDefinition, ScriptExecutionResult, ScriptExecutionContext } from './ScriptingEngine'

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  author: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  variables: Record<string, any>
  metadata: {
    created: Date
    modified: Date
    tags: string[]
    category: string
  }
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'script' | 'condition' | 'loop' | 'parallel' | 'delay' | 'input'
  config: WorkflowStepConfig
  nextSteps: string[]
  onError?: string // Step ID to jump to on error
  timeout?: number
}

export interface WorkflowStepConfig {
  // Script step
  scriptId?: string
  parameters?: Record<string, any>

  // Condition step
  condition?: string // JavaScript expression
  trueStep?: string
  falseStep?: string

  // Loop step
  iterator?: string // Variable name for loop iterator
  items?: any[] | string // Array or variable name
  loopStep?: string

  // Parallel step
  parallelSteps?: string[]
  waitForAll?: boolean

  // Delay step
  duration?: number // milliseconds

  // Input step
  inputType?: 'text' | 'number' | 'boolean' | 'select'
  prompt?: string
  options?: any[]
  validation?: any
}

export interface WorkflowTrigger {
  id: string
  type: 'manual' | 'event' | 'schedule' | 'webhook'
  config: WorkflowTriggerConfig
  enabled: boolean
}

export interface WorkflowTriggerConfig {
  // Event trigger
  eventName?: string
  eventFilter?: Record<string, any>

  // Schedule trigger
  schedule?: string // Cron expression
  timezone?: string

  // Webhook trigger
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  currentStep?: string
  variables: Record<string, any>
  results: WorkflowStepResult[]
  error?: any
}

export interface WorkflowStepResult {
  stepId: string
  status: 'completed' | 'failed' | 'skipped'
  startedAt: Date
  completedAt: Date
  result?: any
  error?: any
  duration: number
}

/**
 * Script Workflow class
 * Manages complex script execution workflows with conditions and loops
 */
export class ScriptWorkflow extends EventEmitter {
  private scriptingEngine: ScriptingEngine
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private activeExecutions: Set<string> = new Set()
  private logger: any

  constructor(scriptingEngine: ScriptingEngine, logger?: any) {
    super()
    this.scriptingEngine = scriptingEngine
    this.logger = logger || console
  }

  /**
   * Register a workflow
   */
  async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    try {
      // Validate workflow
      await this.validateWorkflow(workflow)

      // Store workflow
      this.workflows.set(workflow.id, workflow)

      this.emit('workflow-registered', workflow)
      this.logger.debug(`Workflow registered: ${workflow.id}`)

    } catch (error) {
      this.logger.error(`Failed to register workflow ${workflow.id}:`, error)
      throw error
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string, 
    initialVariables: Record<string, any> = {},
    context: ScriptExecutionContext
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const executionId = `${workflowId}_${Date.now()}`
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      variables: { ...workflow.variables, ...initialVariables },
      results: []
    }

    this.executions.set(executionId, execution)
    this.activeExecutions.add(executionId)

    // Start execution in background
    this.performWorkflowExecution(execution, workflow, context)
      .then(() => {
        this.activeExecutions.delete(executionId)
      })
      .catch(error => {
        execution.status = 'failed'
        execution.error = error
        execution.completedAt = new Date()
        this.activeExecutions.delete(executionId)
        this.emit('workflow-failed', { execution, error })
      })

    this.emit('workflow-started', execution)
    return executionId
  }

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId)
  }

  /**
   * Cancel workflow execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`)
    }

    if (execution.status !== 'running') {
      throw new Error(`Execution ${executionId} is not running`)
    }

    execution.status = 'cancelled'
    execution.completedAt = new Date()
    this.activeExecutions.delete(executionId)

    this.emit('workflow-cancelled', execution)
    this.logger.info(`Workflow execution cancelled: ${executionId}`)
  }

  /**
   * List all workflows
   */
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId)
  }

  /**
   * List active executions
   */
  listActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions)
      .map(id => this.executions.get(id))
      .filter(Boolean) as WorkflowExecution[]
  }

  // === PRIVATE METHODS ===

  /**
   * Perform workflow execution
   */
  private async performWorkflowExecution(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    context: ScriptExecutionContext
  ): Promise<void> {
    try {
      this.logger.debug(`Starting workflow execution: ${execution.id}`)

      // Find first step
      const firstStep = workflow.steps[0]
      if (!firstStep) {
        throw new Error('Workflow has no steps')
      }

      // Execute workflow
      await this.executeStep(execution, workflow, firstStep, context)

      // Mark as completed
      execution.status = 'completed'
      execution.completedAt = new Date()

      this.emit('workflow-completed', execution)
      this.logger.info(`Workflow execution completed: ${execution.id}`)

    } catch (error) {
      execution.status = 'failed'
      execution.error = error
      execution.completedAt = new Date()
      
      this.logger.error(`Workflow execution failed: ${execution.id}`, error)
      throw error
    }
  }

  /**
   * Execute a workflow step
   */
  private async executeStep(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    step: WorkflowStep,
    context: ScriptExecutionContext
  ): Promise<void> {
    const startTime = Date.now()
    execution.currentStep = step.id

    this.logger.debug(`Executing step: ${step.id} (${step.type})`)

    try {
      let result: any
      let nextStepIds: string[] = []

      switch (step.type) {
        case 'script':
          result = await this.executeScriptStep(step, execution, context)
          nextStepIds = step.nextSteps
          break

        case 'condition':
          nextStepIds = await this.executeConditionStep(step, execution)
          break

        case 'loop':
          await this.executeLoopStep(step, execution, workflow, context)
          nextStepIds = step.nextSteps
          break

        case 'parallel':
          await this.executeParallelStep(step, execution, workflow, context)
          nextStepIds = step.nextSteps
          break

        case 'delay':
          await this.executeDelayStep(step)
          nextStepIds = step.nextSteps
          break

        case 'input':
          result = await this.executeInputStep(step, execution)
          nextStepIds = step.nextSteps
          break

        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      // Record step result
      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        status: 'completed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        result,
        duration: Date.now() - startTime
      }

      execution.results.push(stepResult)

      // Execute next steps
      for (const nextStepId of nextStepIds) {
        const nextStep = workflow.steps.find(s => s.id === nextStepId)
        if (nextStep) {
          await this.executeStep(execution, workflow, nextStep, context)
        }
      }

    } catch (error) {
      // Record step error
      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        status: 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        error,
        duration: Date.now() - startTime
      }

      execution.results.push(stepResult)

      // Handle error step
      if (step.onError) {
        const errorStep = workflow.steps.find(s => s.id === step.onError)
        if (errorStep) {
          await this.executeStep(execution, workflow, errorStep, context)
          return
        }
      }

      throw error
    }
  }

  /**
   * Execute script step
   */
  private async executeScriptStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    context: ScriptExecutionContext
  ): Promise<any> {
    if (!step.config.scriptId) {
      throw new Error('Script step missing scriptId')
    }

    const parameters = {
      ...step.config.parameters,
      ...execution.variables
    }

    const scriptContext: ScriptExecutionContext = {
      ...context,
      variables: {
        ...context.variables,
        workflow: execution,
        step
      }
    }

    const result = await this.scriptingEngine.executeScript(
      step.config.scriptId,
      scriptContext,
      parameters
    )

    if (!result.success) {
      throw new Error(`Script execution failed: ${result.error?.message}`)
    }

    // Update execution variables with result
    if (result.result && typeof result.result === 'object') {
      Object.assign(execution.variables, result.result)
    }

    return result.result
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<string[]> {
    if (!step.config.condition) {
      throw new Error('Condition step missing condition expression')
    }

    try {
      // Evaluate condition with execution variables
      const func = new Function('variables', `return ${step.config.condition}`)
      const result = func(execution.variables)

      if (result) {
        return step.config.trueStep ? [step.config.trueStep] : []
      } else {
        return step.config.falseStep ? [step.config.falseStep] : []
      }

    } catch (error) {
      throw new Error(`Condition evaluation failed: ${error.message}`)
    }
  }

  /**
   * Execute loop step
   */
  private async executeLoopStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    context: ScriptExecutionContext
  ): Promise<void> {
    if (!step.config.items || !step.config.loopStep) {
      throw new Error('Loop step missing items or loopStep')
    }

    let items: any[]
    
    if (Array.isArray(step.config.items)) {
      items = step.config.items
    } else if (typeof step.config.items === 'string') {
      items = execution.variables[step.config.items] || []
    } else {
      throw new Error('Invalid items configuration for loop step')
    }

    const loopStep = workflow.steps.find(s => s.id === step.config.loopStep)
    if (!loopStep) {
      throw new Error(`Loop step not found: ${step.config.loopStep}`)
    }

    const iteratorVar = step.config.iterator || 'item'

    for (let i = 0; i < items.length; i++) {
      // Set iterator variables
      execution.variables[iteratorVar] = items[i]
      execution.variables[`${iteratorVar}_index`] = i

      // Execute loop step
      await this.executeStep(execution, workflow, loopStep, context)
    }

    // Clean up iterator variables
    delete execution.variables[iteratorVar]
    delete execution.variables[`${iteratorVar}_index`]
  }

  /**
   * Execute parallel step
   */
  private async executeParallelStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    context: ScriptExecutionContext
  ): Promise<void> {
    if (!step.config.parallelSteps) {
      throw new Error('Parallel step missing parallelSteps')
    }

    const parallelSteps = step.config.parallelSteps
      .map(stepId => workflow.steps.find(s => s.id === stepId))
      .filter(Boolean) as WorkflowStep[]

    if (parallelSteps.length === 0) {
      return
    }

    const promises = parallelSteps.map(async parallelStep => {
      try {
        await this.executeStep(execution, workflow, parallelStep, context)
      } catch (error) {
        if (step.config.waitForAll) {
          throw error
        }
        // If not waiting for all, log error but continue
        this.logger.error(`Parallel step ${parallelStep.id} failed:`, error)
      }
    })

    if (step.config.waitForAll) {
      await Promise.all(promises)
    } else {
      await Promise.allSettled(promises)
    }
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(step: WorkflowStep): Promise<void> {
    const duration = step.config.duration || 1000

    await new Promise(resolve => setTimeout(resolve, duration))
  }

  /**
   * Execute input step (placeholder - would integrate with UI)
   */
  private async executeInputStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<any> {
    // In a real implementation, this would prompt the user for input
    // For now, we'll use default values or variables
    
    const inputType = step.config.inputType || 'text'
    const prompt = step.config.prompt || 'Please enter a value:'
    
    this.logger.info(`Input requested: ${prompt} (type: ${inputType})`)
    
    // Return a placeholder value based on type
    switch (inputType) {
      case 'text':
        return 'user_input'
      case 'number':
        return 42
      case 'boolean':
        return true
      case 'select':
        return step.config.options?.[0] || null
      default:
        return null
    }
  }

  /**
   * Validate workflow definition
   */
  private async validateWorkflow(workflow: WorkflowDefinition): Promise<void> {
    const errors: string[] = []

    // Basic validation
    if (!workflow.id) {
      errors.push('Workflow ID is required')
    }

    if (!workflow.name) {
      errors.push('Workflow name is required')
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step')
    }

    // Step validation
    for (const step of workflow.steps) {
      if (!step.id) {
        errors.push('Step ID is required')
      }

      if (!step.type) {
        errors.push(`Step ${step.id} missing type`)
      }

      // Validate step-specific configuration
      switch (step.type) {
        case 'script':
          if (!step.config.scriptId) {
            errors.push(`Script step ${step.id} missing scriptId`)
          }
          break

        case 'condition':
          if (!step.config.condition) {
            errors.push(`Condition step ${step.id} missing condition`)
          }
          break

        case 'loop':
          if (!step.config.items || !step.config.loopStep) {
            errors.push(`Loop step ${step.id} missing items or loopStep`)
          }
          break

        case 'parallel':
          if (!step.config.parallelSteps) {
            errors.push(`Parallel step ${step.id} missing parallelSteps`)
          }
          break
      }
    }

    // Check for circular references
    if (this.hasCircularReferences(workflow)) {
      errors.push('Workflow contains circular references')
    }

    if (errors.length > 0) {
      throw new Error(`Workflow validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Check for circular references in workflow
   */
  private hasCircularReferences(workflow: WorkflowDefinition): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCircularReferencesDFS = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true // Circular reference found
      }

      if (visited.has(stepId)) {
        return false // Already processed
      }

      visited.add(stepId)
      recursionStack.add(stepId)

      const step = workflow.steps.find(s => s.id === stepId)
      if (step) {
        for (const nextStepId of step.nextSteps) {
          if (hasCircularReferencesDFS(nextStepId)) {
            return true
          }
        }
      }

      recursionStack.delete(stepId)
      return false
    }

    // Check all steps
    for (const step of workflow.steps) {
      if (!visited.has(step.id)) {
        if (hasCircularReferencesDFS(step.id)) {
          return true
        }
      }
    }

    return false
  }
}