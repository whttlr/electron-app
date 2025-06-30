/**
 * Plugin Scripting Engine - Executes JavaScript scripts for plugins
 */

import { EventEmitter } from 'events'
import * as path from 'path'
import * as fs from 'fs/promises'
import { PluginContext, PluginAPI } from '../types/plugin-types'

export interface ScriptingEngineOptions {
  maxExecutionTime: number
  maxMemory: number
  enableDebugging: boolean
  sandboxing: boolean
  allowedModules: string[]
  logger?: any
}

export interface ScriptExecutionContext {
  plugin: string
  script: string
  environment: 'isolated' | 'shared'
  variables: Record<string, any>
  imports: Record<string, any>
}

export interface ScriptExecutionResult {
  success: boolean
  result?: any
  error?: ScriptExecutionError
  executionTime: number
  memoryUsage: number
  output: string[]
}

export interface ScriptExecutionError {
  type: 'syntax' | 'runtime' | 'timeout' | 'memory' | 'security'
  message: string
  stack?: string
  line?: number
  column?: number
}

export interface ScriptDefinition {
  id: string
  name: string
  description: string
  category: string
  language: 'javascript' | 'typescript'
  source: string
  entryPoint?: string
  dependencies: string[]
  parameters: ScriptParameter[]
  metadata: {
    author: string
    version: string
    created: Date
    modified: Date
    tags: string[]
  }
}

export interface ScriptParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  default?: any
  description: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: any[]
  }
}

/**
 * Scripting Engine for plugin automation
 * Provides secure JavaScript execution environment for plugins
 */
export class ScriptingEngine extends EventEmitter {
  private options: ScriptingEngineOptions
  private logger: any

  // Script execution tracking
  private activeExecutions: Map<string, Promise<ScriptExecutionResult>> = new Map()
  private executionHistory: Map<string, ScriptExecutionResult[]> = new Map()
  private scriptLibrary: Map<string, ScriptDefinition> = new Map()

  // Sandbox environments
  private sandboxes: Map<string, any> = new Map()
  private sharedContext: Record<string, any> = {}

  constructor(options: Partial<ScriptingEngineOptions> = {}) {
    super()

    this.options = {
      maxExecutionTime: 30000, // 30 seconds
      maxMemory: 64 * 1024 * 1024, // 64MB
      enableDebugging: false,
      sandboxing: true,
      allowedModules: ['lodash', 'moment', 'axios'],
      ...options
    }

    this.logger = options.logger || console
  }

  async initialize(): Promise<void> {
    try {
      // Load built-in scripts
      await this.loadBuiltinScripts()

      this.logger.debug('ScriptingEngine initialized')
    } catch (error) {
      this.logger.error('Failed to initialize ScriptingEngine:', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Wait for active executions to complete
      const activePromises = Array.from(this.activeExecutions.values())
      await Promise.allSettled(activePromises)

      // Cleanup sandboxes
      for (const [id, sandbox] of this.sandboxes.entries()) {
        try {
          if (sandbox && typeof sandbox.destroy === 'function') {
            await sandbox.destroy()
          }
        } catch (error) {
          this.logger.error(`Error destroying sandbox ${id}:`, error)
        }
      }

      this.activeExecutions.clear()
      this.executionHistory.clear()
      this.scriptLibrary.clear()
      this.sandboxes.clear()
      this.sharedContext = {}

      this.logger.debug('ScriptingEngine shutdown complete')
    } catch (error) {
      this.logger.error('Error during ScriptingEngine shutdown:', error)
      throw error
    }
  }

  /**
   * Execute a JavaScript script
   */
  async executeScript(
    scriptId: string,
    context: ScriptExecutionContext,
    parameters: Record<string, any> = {}
  ): Promise<ScriptExecutionResult> {
    const executionId = `${context.plugin}:${scriptId}:${Date.now()}`

    if (this.activeExecutions.has(executionId)) {
      throw new Error(`Script ${scriptId} is already executing`)
    }

    const execution = this.performExecution(scriptId, context, parameters)
    this.activeExecutions.set(executionId, execution)

    try {
      const result = await execution
      this.recordExecution(scriptId, result)
      return result

    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  /**
   * Execute script source directly
   */
  async executeScriptSource(
    source: string,
    context: ScriptExecutionContext,
    parameters: Record<string, any> = {}
  ): Promise<ScriptExecutionResult> {
    const tempScript: ScriptDefinition = {
      id: `temp_${Date.now()}`,
      name: 'Temporary Script',
      description: 'Dynamically executed script',
      category: 'utility',
      language: 'javascript',
      source,
      dependencies: [],
      parameters: [],
      metadata: {
        author: 'system',
        version: '1.0.0',
        created: new Date(),
        modified: new Date(),
        tags: ['temporary']
      }
    }

    this.scriptLibrary.set(tempScript.id, tempScript)

    try {
      return await this.executeScript(tempScript.id, context, parameters)
    } finally {
      this.scriptLibrary.delete(tempScript.id)
    }
  }

  /**
   * Register a script in the library
   */
  async registerScript(script: ScriptDefinition): Promise<void> {
    try {
      // Validate script
      await this.validateScript(script)

      // Store in library
      this.scriptLibrary.set(script.id, script)

      this.emit('script-registered', script)
      this.logger.debug(`Script registered: ${script.id}`)

    } catch (error) {
      this.logger.error(`Failed to register script ${script.id}:`, error)
      throw error
    }
  }

  /**
   * Get script from library
   */
  getScript(scriptId: string): ScriptDefinition | undefined {
    return this.scriptLibrary.get(scriptId)
  }

  /**
   * List all scripts
   */
  listScripts(): ScriptDefinition[] {
    return Array.from(this.scriptLibrary.values())
  }

  /**
   * Search scripts by criteria
   */
  searchScripts(criteria: {
    category?: string
    author?: string
    keyword?: string
    tags?: string[]
  }): ScriptDefinition[] {
    return this.listScripts().filter(script => {
      if (criteria.category && script.category !== criteria.category) {
        return false
      }

      if (criteria.author && script.metadata.author !== criteria.author) {
        return false
      }

      if (criteria.keyword) {
        const searchTerm = criteria.keyword.toLowerCase()
        const searchText = [
          script.name,
          script.description,
          ...script.metadata.tags
        ].join(' ').toLowerCase()
        
        if (!searchText.includes(searchTerm)) {
          return false
        }
      }

      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some(tag => 
          script.metadata.tags.includes(tag)
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Get execution history for script
   */
  getExecutionHistory(scriptId: string): ScriptExecutionResult[] {
    return this.executionHistory.get(scriptId) || []
  }

  /**
   * Get scripting engine diagnostics
   */
  getDiagnostics(): any {
    return {
      totalScripts: this.scriptLibrary.size,
      activeExecutions: this.activeExecutions.size,
      sandboxes: this.sandboxes.size,
      scriptCategories: this.getScriptCategories(),
      recentExecutions: this.getRecentExecutions(10),
      memoryUsage: process.memoryUsage(),
      options: this.options
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Perform script execution
   */
  private async performExecution(
    scriptId: string,
    context: ScriptExecutionContext,
    parameters: Record<string, any>
  ): Promise<ScriptExecutionResult> {
    const startTime = Date.now()
    const script = this.scriptLibrary.get(scriptId)
    
    if (!script) {
      throw new Error(`Script ${scriptId} not found`)
    }

    try {
      this.logger.debug(`Executing script: ${scriptId}`)

      // Validate parameters
      this.validateParameters(script, parameters)

      // Prepare execution environment
      const environment = await this.prepareEnvironment(script, context, parameters)

      // Execute script
      const result = await this.runScript(script, environment)

      const executionTime = Date.now() - startTime

      return {
        success: true,
        result,
        executionTime,
        memoryUsage: this.getMemoryUsage(),
        output: environment.output || []
      }

    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        error: this.createExecutionError(error),
        executionTime,
        memoryUsage: this.getMemoryUsage(),
        output: []
      }
    }
  }

  /**
   * Validate script definition
   */
  private async validateScript(script: ScriptDefinition): Promise<void> {
    const errors: string[] = []

    if (!script.id) {
      errors.push('Script ID is required')
    }

    if (!script.name) {
      errors.push('Script name is required')
    }

    if (!script.source) {
      errors.push('Script source is required')
    }

    if (!['javascript', 'typescript'].includes(script.language)) {
      errors.push('Invalid script language')
    }

    // Syntax validation
    try {
      new Function(script.source)
    } catch (syntaxError) {
      errors.push(`Syntax error: ${syntaxError.message}`)
    }

    if (errors.length > 0) {
      throw new Error(`Script validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Validate script parameters
   */
  private validateParameters(script: ScriptDefinition, parameters: Record<string, any>): void {
    for (const param of script.parameters) {
      const value = parameters[param.name]

      if (param.required && (value === undefined || value === null)) {
        throw new Error(`Required parameter missing: ${param.name}`)
      }

      if (value !== undefined && !this.validateParameterType(value, param)) {
        throw new Error(`Invalid parameter type for ${param.name}: expected ${param.type}`)
      }

      if (param.validation && !this.validateParameterValue(value, param.validation)) {
        throw new Error(`Parameter validation failed for ${param.name}`)
      }
    }
  }

  /**
   * Validate parameter type
   */
  private validateParameterType(value: any, param: ScriptParameter): boolean {
    switch (param.type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'array':
        return Array.isArray(value)
      default:
        return false
    }
  }

  /**
   * Validate parameter value
   */
  private validateParameterValue(value: any, validation: any): boolean {
    if (validation.min !== undefined && value < validation.min) {
      return false
    }

    if (validation.max !== undefined && value > validation.max) {
      return false
    }

    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        return false
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      return false
    }

    return true
  }

  /**
   * Prepare script execution environment
   */
  private async prepareEnvironment(
    script: ScriptDefinition,
    context: ScriptExecutionContext,
    parameters: Record<string, any>
  ): Promise<any> {
    const environment = {
      script,
      context,
      parameters,
      output: [] as string[],
      console: this.createSandboxedConsole(context.plugin),
      api: context.variables.api || {},
      utils: this.createUtilities(),
      imports: await this.loadDependencies(script.dependencies)
    }

    // Add shared or isolated variables
    if (context.environment === 'shared') {
      Object.assign(environment, this.sharedContext)
    }

    Object.assign(environment, context.variables)

    return environment
  }

  /**
   * Run script in sandbox
   */
  private async runScript(script: ScriptDefinition, environment: any): Promise<any> {
    if (this.options.sandboxing) {
      return await this.runInSandbox(script, environment)
    } else {
      return await this.runDirect(script, environment)
    }
  }

  /**
   * Run script in sandbox (secure)
   */
  private async runInSandbox(script: ScriptDefinition, environment: any): Promise<any> {
    try {
      // Use VM2 for secure sandboxing (Node.js only)
      let VM: any = null
      try {
        const vm2 = await import('vm2')
        VM = vm2.VM
      } catch (e) {
        // Fallback for browser environments
        console.warn('vm2 not available, using basic script execution')
        return this.runBasicScript(script, environment)
      }

      const vm = new VM({
        timeout: this.options.maxExecutionTime,
        sandbox: environment,
        require: {
          external: false,
          builtin: this.options.allowedModules,
          root: './plugins'
        }
      })

      // Execute script
      const result = vm.run(script.source)
      return result

    } catch (error) {
      throw error
    }
  }

  /**
   * Run script with basic browser-compatible execution
   */
  private async runBasicScript(script: ScriptDefinition, environment: any): Promise<any> {
    try {
      // Basic script execution for browser environments
      // This provides limited security compared to vm2
      const func = new Function(...Object.keys(environment), script.source)
      
      // Execute with timeout
      return await Promise.race([
        new Promise((resolve, reject) => {
          try {
            const result = func(...Object.values(environment))
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Script execution timeout')), this.options.maxExecutionTime)
        })
      ])
    } catch (error) {
      throw error
    }
  }

  /**
   * Run script directly (development mode)
   */
  private async runDirect(script: ScriptDefinition, environment: any): Promise<any> {
    // Create function with environment as context
    const func = new Function(...Object.keys(environment), script.source)
    
    // Execute with timeout
    return await Promise.race([
      new Promise((resolve, reject) => {
        try {
          const result = func(...Object.values(environment))
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Script execution timeout'))
        }, this.options.maxExecutionTime)
      })
    ])
  }

  /**
   * Create sandboxed console
   */
  private createSandboxedConsole(pluginName: string) {
    return {
      log: (...args: any[]) => {
        this.logger.info(`[${pluginName}:script]`, ...args)
      },
      warn: (...args: any[]) => {
        this.logger.warn(`[${pluginName}:script]`, ...args)
      },
      error: (...args: any[]) => {
        this.logger.error(`[${pluginName}:script]`, ...args)
      },
      debug: (...args: any[]) => {
        this.logger.debug(`[${pluginName}:script]`, ...args)
      }
    }
  }

  /**
   * Create utility functions
   */
  private createUtilities() {
    return {
      // Math utilities
      math: {
        round: (value: number, decimals: number = 0) => 
          Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals),
        clamp: (value: number, min: number, max: number) => 
          Math.max(min, Math.min(max, value)),
        interpolate: (start: number, end: number, factor: number) => 
          start + (end - start) * factor
      },

      // String utilities
      string: {
        format: (template: string, values: Record<string, any>) => {
          return template.replace(/\{(\w+)\}/g, (match, key) => values[key] || match)
        },
        slugify: (text: string) => {
          return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
      },

      // Array utilities
      array: {
        chunk: (array: any[], size: number) => {
          const chunks = []
          for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size))
          }
          return chunks
        },
        unique: (array: any[]) => [...new Set(array)]
      },

      // Date utilities
      date: {
        now: () => new Date(),
        format: (date: Date, format: string) => date.toISOString(),
        add: (date: Date, amount: number, unit: string) => {
          const result = new Date(date)
          switch (unit) {
            case 'seconds':
              result.setSeconds(result.getSeconds() + amount)
              break
            case 'minutes':
              result.setMinutes(result.getMinutes() + amount)
              break
            case 'hours':
              result.setHours(result.getHours() + amount)
              break
            case 'days':
              result.setDate(result.getDate() + amount)
              break
          }
          return result
        }
      }
    }
  }

  /**
   * Load script dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<Record<string, any>> {
    const imports: Record<string, any> = {}

    for (const dep of dependencies) {
      try {
        if (this.options.allowedModules.includes(dep)) {
          if (typeof require !== 'undefined') {
            imports[dep] = require(dep)
          } else {
            console.warn(`Module ${dep} not available in browser environment`)
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to load dependency ${dep}:`, error)
      }
    }

    return imports
  }

  /**
   * Create execution error
   */
  private createExecutionError(error: any): ScriptExecutionError {
    if (error.name === 'SyntaxError') {
      return {
        type: 'syntax',
        message: error.message,
        stack: error.stack
      }
    }

    if (error.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Script execution timeout',
        stack: error.stack
      }
    }

    if (error.message?.includes('memory')) {
      return {
        type: 'memory',
        message: 'Memory limit exceeded',
        stack: error.stack
      }
    }

    return {
      type: 'runtime',
      message: error.message || error.toString(),
      stack: error.stack
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed
  }

  /**
   * Record script execution
   */
  private recordExecution(scriptId: string, result: ScriptExecutionResult): void {
    if (!this.executionHistory.has(scriptId)) {
      this.executionHistory.set(scriptId, [])
    }

    const history = this.executionHistory.get(scriptId)!
    history.push(result)

    // Limit history size
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    this.emit('script-executed', { scriptId, result })
  }

  /**
   * Load built-in scripts
   */
  private async loadBuiltinScripts(): Promise<void> {
    // Built-in utility scripts
    const builtinScripts: ScriptDefinition[] = [
      {
        id: 'math-calculator',
        name: 'Math Calculator',
        description: 'Evaluate mathematical expressions',
        category: 'utility',
        language: 'javascript',
        source: `
          // Mathematical expression evaluator
          const expression = parameters.expression || '0';
          const result = eval(expression);
          return { expression, result };
        `,
        dependencies: [],
        parameters: [
          {
            name: 'expression',
            type: 'string',
            required: true,
            description: 'Mathematical expression to evaluate'
          }
        ],
        metadata: {
          author: 'system',
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
          tags: ['math', 'utility', 'builtin']
        }
      },

      {
        id: 'coordinate-transformer',
        name: 'Coordinate Transformer',
        description: 'Transform coordinates between different systems',
        category: 'cnc',
        language: 'javascript',
        source: `
          const { from, to, coordinates } = parameters;
          
          // Simple coordinate transformation
          let result = { ...coordinates };
          
          if (from === 'machine' && to === 'work') {
            result.x = coordinates.x - (context.workOffset?.x || 0);
            result.y = coordinates.y - (context.workOffset?.y || 0);
            result.z = coordinates.z - (context.workOffset?.z || 0);
          } else if (from === 'work' && to === 'machine') {
            result.x = coordinates.x + (context.workOffset?.x || 0);
            result.y = coordinates.y + (context.workOffset?.y || 0);
            result.z = coordinates.z + (context.workOffset?.z || 0);
          }
          
          return { from, to, original: coordinates, transformed: result };
        `,
        dependencies: [],
        parameters: [
          {
            name: 'from',
            type: 'string',
            required: true,
            description: 'Source coordinate system'
          },
          {
            name: 'to',
            type: 'string',
            required: true,
            description: 'Target coordinate system'
          },
          {
            name: 'coordinates',
            type: 'object',
            required: true,
            description: 'Coordinates to transform'
          }
        ],
        metadata: {
          author: 'system',
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
          tags: ['cnc', 'coordinates', 'builtin']
        }
      }
    ]

    for (const script of builtinScripts) {
      await this.registerScript(script)
    }
  }

  /**
   * Get script categories
   */
  private getScriptCategories(): Record<string, number> {
    const categories: Record<string, number> = {}
    
    for (const script of this.scriptLibrary.values()) {
      categories[script.category] = (categories[script.category] || 0) + 1
    }
    
    return categories
  }

  /**
   * Get recent executions
   */
  private getRecentExecutions(limit: number = 10): any[] {
    const executions: any[] = []
    
    for (const [scriptId, history] of this.executionHistory.entries()) {
      for (const result of history.slice(-5)) {
        executions.push({
          scriptId,
          success: result.success,
          executionTime: result.executionTime,
          timestamp: new Date()
        })
      }
    }
    
    return executions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
}