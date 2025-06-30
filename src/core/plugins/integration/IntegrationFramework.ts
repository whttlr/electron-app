/**
 * Plugin Integration Framework - Manages external system integrations
 */

import { EventEmitter } from 'events'
import { PluginContext } from '../types/plugin-types'

export interface IntegrationAdapter {
  id: string
  name: string
  type: AdapterType
  version: string
  description: string
  
  // Lifecycle methods
  initialize(config: any): Promise<void>
  shutdown(): Promise<void>
  
  // Health checking
  isHealthy(): Promise<boolean>
  getStatus(): Promise<AdapterStatus>
  
  // Connection management
  connect(credentials: any): Promise<ConnectionResult>
  disconnect(): Promise<void>
  
  // Data operations (implemented by specific adapters)
  execute(operation: AdapterOperation): Promise<AdapterResult>
}

export type AdapterType = 
  | 'database' 
  | 'http_api' 
  | 'file_system' 
  | 'messaging' 
  | 'cloud_storage'
  | 'authentication'
  | 'notification'
  | 'monitoring'
  | 'hardware'
  | 'custom'

export interface AdapterStatus {
  connected: boolean
  lastActivity: Date
  connectionCount: number
  errorCount: number
  latency?: number
  metadata?: Record<string, any>
}

export interface ConnectionResult {
  success: boolean
  connectionId: string
  metadata?: Record<string, any>
  error?: string
}

export interface AdapterOperation {
  type: string
  parameters: Record<string, any>
  timeout?: number
  retries?: number
}

export interface AdapterResult {
  success: boolean
  data?: any
  error?: AdapterError
  metadata?: {
    executionTime: number
    connectionId?: string
    operationType: string
  }
}

export interface AdapterError {
  code: string
  message: string
  details?: any
  retryable: boolean
}

export interface IntegrationDefinition {
  id: string
  name: string
  description: string
  adapterId: string
  config: IntegrationConfig
  credentials: IntegrationCredentials
  mappings: DataMapping[]
  triggers: IntegrationTrigger[]
  metadata: {
    pluginId: string
    created: Date
    modified: Date
    version: string
    tags: string[]
  }
}

export interface IntegrationConfig {
  endpoint?: string
  timeout: number
  retries: number
  batchSize?: number
  rateLimit?: {
    requests: number
    window: number // milliseconds
  }
  caching?: {
    enabled: boolean
    ttl: number // seconds
  }
  monitoring?: {
    enabled: boolean
    healthCheckInterval: number
  }
}

export interface IntegrationCredentials {
  type: 'none' | 'api_key' | 'oauth2' | 'basic_auth' | 'token' | 'certificate'
  data: Record<string, any>
  encrypted: boolean
}

export interface DataMapping {
  id: string
  name: string
  source: DataMappingField
  target: DataMappingField
  transformation?: DataTransformation
}

export interface DataMappingField {
  path: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date'
  required: boolean
  default?: any
}

export interface DataTransformation {
  type: 'script' | 'template' | 'function'
  config: any
}

export interface IntegrationTrigger {
  id: string
  type: 'webhook' | 'polling' | 'event' | 'schedule'
  config: IntegrationTriggerConfig
  enabled: boolean
}

export interface IntegrationTriggerConfig {
  // Webhook trigger
  endpoint?: string
  method?: string
  headers?: Record<string, string>
  
  // Polling trigger  
  interval?: number
  query?: any
  
  // Event trigger
  eventName?: string
  eventFilter?: Record<string, any>
  
  // Schedule trigger
  schedule?: string // Cron expression
  timezone?: string
}

export interface IntegrationExecution {
  id: string
  integrationId: string
  operation: AdapterOperation
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  result?: AdapterResult
  error?: any
}

/**
 * Integration Framework class
 * Manages external system integrations through adapters
 */
export class IntegrationFramework extends EventEmitter {
  private adapters: Map<string, IntegrationAdapter> = new Map()
  private integrations: Map<string, IntegrationDefinition> = new Map()
  private executions: Map<string, IntegrationExecution> = new Map()
  private connections: Map<string, any> = new Map()
  private healthChecks: Map<string, NodeJS.Timeout> = new Map()
  private logger: any

  constructor(logger?: any) {
    super()
    this.logger = logger || console
  }

  async initialize(): Promise<void> {
    this.logger.debug('IntegrationFramework initialized')
  }

  async shutdown(): Promise<void> {
    try {
      // Stop health checks
      for (const timer of this.healthChecks.values()) {
        clearInterval(timer)
      }

      // Shutdown all adapters
      for (const [id, adapter] of this.adapters.entries()) {
        try {
          await adapter.shutdown()
        } catch (error) {
          this.logger.error(`Error shutting down adapter ${id}:`, error)
        }
      }

      this.adapters.clear()
      this.integrations.clear()
      this.executions.clear()
      this.connections.clear()
      this.healthChecks.clear()

      this.logger.debug('IntegrationFramework shutdown complete')
    } catch (error) {
      this.logger.error('Error during IntegrationFramework shutdown:', error)
      throw error
    }
  }

  /**
   * Register an integration adapter
   */
  async registerAdapter(adapter: IntegrationAdapter): Promise<void> {
    try {
      // Initialize adapter
      await adapter.initialize({})

      // Store adapter
      this.adapters.set(adapter.id, adapter)

      // Start health monitoring
      this.startHealthMonitoring(adapter.id)

      this.emit('adapter-registered', adapter)
      this.logger.info(`Integration adapter registered: ${adapter.id}`)

    } catch (error) {
      this.logger.error(`Failed to register adapter ${adapter.id}:`, error)
      throw error
    }
  }

  /**
   * Create an integration
   */
  async createIntegration(definition: IntegrationDefinition): Promise<void> {
    try {
      // Validate integration
      await this.validateIntegration(definition)

      // Get adapter
      const adapter = this.adapters.get(definition.adapterId)
      if (!adapter) {
        throw new Error(`Adapter ${definition.adapterId} not found`)
      }

      // Test connection
      const connectionResult = await this.testConnection(definition)
      if (!connectionResult.success) {
        throw new Error(`Connection test failed: ${connectionResult.error}`)
      }

      // Store integration
      this.integrations.set(definition.id, definition)

      // Set up triggers
      await this.setupTriggers(definition)

      this.emit('integration-created', definition)
      this.logger.info(`Integration created: ${definition.id}`)

    } catch (error) {
      this.logger.error(`Failed to create integration ${definition.id}:`, error)
      throw error
    }
  }

  /**
   * Execute integration operation
   */
  async executeIntegration(
    integrationId: string,
    operation: AdapterOperation,
    context?: PluginContext
  ): Promise<string> {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    const adapter = this.adapters.get(integration.adapterId)
    if (!adapter) {
      throw new Error(`Adapter ${integration.adapterId} not found`)
    }

    const executionId = `${integrationId}_${Date.now()}`
    
    const execution: IntegrationExecution = {
      id: executionId,
      integrationId,
      operation,
      status: 'pending',
      startedAt: new Date()
    }

    this.executions.set(executionId, execution)

    // Execute in background
    this.performExecution(execution, integration, adapter, context)
      .catch(error => {
        execution.status = 'failed'
        execution.error = error
        execution.completedAt = new Date()
        this.emit('execution-failed', { execution, error })
      })

    this.emit('execution-started', execution)
    return executionId
  }

  /**
   * Get integration by ID
   */
  getIntegration(integrationId: string): IntegrationDefinition | undefined {
    return this.integrations.get(integrationId)
  }

  /**
   * List all integrations
   */
  listIntegrations(): IntegrationDefinition[] {
    return Array.from(this.integrations.values())
  }

  /**
   * Get integrations by plugin
   */
  getIntegrationsByPlugin(pluginId: string): IntegrationDefinition[] {
    return this.listIntegrations().filter(integration => 
      integration.metadata.pluginId === pluginId
    )
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): IntegrationExecution | undefined {
    return this.executions.get(executionId)
  }

  /**
   * Get adapter status
   */
  async getAdapterStatus(adapterId: string): Promise<AdapterStatus | undefined> {
    const adapter = this.adapters.get(adapterId)
    return adapter ? await adapter.getStatus() : undefined
  }

  /**
   * List all adapters
   */
  listAdapters(): IntegrationAdapter[] {
    return Array.from(this.adapters.values())
  }

  /**
   * Get framework diagnostics
   */
  getDiagnostics(): any {
    const adapters = this.listAdapters()
    const integrations = this.listIntegrations()
    
    return {
      adapters: {
        total: adapters.length,
        byType: this.groupAdaptersByType(adapters),
        healthy: adapters.filter(a => a.isHealthy()).length
      },
      integrations: {
        total: integrations.length,
        byPlugin: this.groupIntegrationsByPlugin(integrations),
        byAdapter: this.groupIntegrationsByAdapter(integrations)
      },
      executions: {
        active: Array.from(this.executions.values()).filter(e => 
          e.status === 'running' || e.status === 'pending'
        ).length,
        total: this.executions.size
      },
      connections: this.connections.size
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Perform integration execution
   */
  private async performExecution(
    execution: IntegrationExecution,
    integration: IntegrationDefinition,
    adapter: IntegrationAdapter,
    context?: PluginContext
  ): Promise<void> {
    try {
      execution.status = 'running'
      this.logger.debug(`Executing integration: ${execution.id}`)

      // Apply data mappings to operation parameters
      const mappedOperation = await this.applyDataMappings(
        execution.operation,
        integration.mappings,
        'input'
      )

      // Execute operation with adapter
      const result = await adapter.execute(mappedOperation)

      // Apply data mappings to result
      if (result.success && result.data) {
        result.data = await this.applyDataMappings(
          result.data,
          integration.mappings,
          'output'
        )
      }

      execution.result = result
      execution.status = result.success ? 'completed' : 'failed'
      execution.completedAt = new Date()

      if (result.success) {
        this.emit('execution-completed', execution)
      } else {
        this.emit('execution-failed', { execution, error: result.error })
      }

      this.logger.info(`Integration execution ${execution.status}: ${execution.id}`)

    } catch (error) {
      execution.status = 'failed'
      execution.error = error
      execution.completedAt = new Date()
      
      this.logger.error(`Integration execution failed: ${execution.id}`, error)
      throw error
    }
  }

  /**
   * Validate integration definition
   */
  private async validateIntegration(definition: IntegrationDefinition): Promise<void> {
    const errors: string[] = []

    if (!definition.id) {
      errors.push('Integration ID is required')
    }

    if (!definition.name) {
      errors.push('Integration name is required')
    }

    if (!definition.adapterId) {
      errors.push('Adapter ID is required')
    }

    if (!this.adapters.has(definition.adapterId)) {
      errors.push(`Adapter ${definition.adapterId} not found`)
    }

    if (!definition.metadata.pluginId) {
      errors.push('Plugin ID is required')
    }

    // Validate config
    if (!definition.config.timeout || definition.config.timeout < 0) {
      errors.push('Invalid timeout configuration')
    }

    if (!definition.config.retries || definition.config.retries < 0) {
      errors.push('Invalid retries configuration')
    }

    // Validate credentials
    if (!['none', 'api_key', 'oauth2', 'basic_auth', 'token', 'certificate'].includes(definition.credentials.type)) {
      errors.push('Invalid credential type')
    }

    if (errors.length > 0) {
      throw new Error(`Integration validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Test integration connection
   */
  private async testConnection(definition: IntegrationDefinition): Promise<ConnectionResult> {
    const adapter = this.adapters.get(definition.adapterId)
    if (!adapter) {
      return {
        success: false,
        connectionId: '',
        error: 'Adapter not found'
      }
    }

    try {
      return await adapter.connect(definition.credentials.data)
    } catch (error) {
      return {
        success: false,
        connectionId: '',
        error: error.message
      }
    }
  }

  /**
   * Setup integration triggers
   */
  private async setupTriggers(definition: IntegrationDefinition): Promise<void> {
    for (const trigger of definition.triggers) {
      if (!trigger.enabled) {
        continue
      }

      try {
        switch (trigger.type) {
          case 'schedule':
            await this.setupScheduleTrigger(definition.id, trigger)
            break
          case 'webhook':
            await this.setupWebhookTrigger(definition.id, trigger)
            break
          case 'polling':
            await this.setupPollingTrigger(definition.id, trigger)
            break
          case 'event':
            await this.setupEventTrigger(definition.id, trigger)
            break
        }
      } catch (error) {
        this.logger.error(`Failed to setup trigger ${trigger.id}:`, error)
      }
    }
  }

  /**
   * Setup schedule trigger
   */
  private async setupScheduleTrigger(integrationId: string, trigger: IntegrationTrigger): Promise<void> {
    // Implementation would integrate with a cron scheduler
    this.logger.debug(`Schedule trigger setup for ${integrationId}: ${trigger.config.schedule}`)
  }

  /**
   * Setup webhook trigger
   */
  private async setupWebhookTrigger(integrationId: string, trigger: IntegrationTrigger): Promise<void> {
    // Implementation would register webhook endpoint
    this.logger.debug(`Webhook trigger setup for ${integrationId}: ${trigger.config.endpoint}`)
  }

  /**
   * Setup polling trigger
   */
  private async setupPollingTrigger(integrationId: string, trigger: IntegrationTrigger): Promise<void> {
    // Implementation would start polling timer
    this.logger.debug(`Polling trigger setup for ${integrationId}: ${trigger.config.interval}ms`)
  }

  /**
   * Setup event trigger
   */
  private async setupEventTrigger(integrationId: string, trigger: IntegrationTrigger): Promise<void> {
    // Implementation would subscribe to events
    this.logger.debug(`Event trigger setup for ${integrationId}: ${trigger.config.eventName}`)
  }

  /**
   * Apply data mappings
   */
  private async applyDataMappings(
    data: any,
    mappings: DataMapping[],
    direction: 'input' | 'output'
  ): Promise<any> {
    let result = { ...data }

    for (const mapping of mappings) {
      try {
        const sourceValue = this.getValueByPath(result, mapping.source.path)
        if (sourceValue !== undefined) {
          const transformedValue = await this.applyTransformation(
            sourceValue,
            mapping.transformation
          )
          this.setValueByPath(result, mapping.target.path, transformedValue)
        }
      } catch (error) {
        this.logger.error(`Data mapping failed for ${mapping.id}:`, error)
      }
    }

    return result
  }

  /**
   * Apply data transformation
   */
  private async applyTransformation(value: any, transformation?: DataTransformation): Promise<any> {
    if (!transformation) {
      return value
    }

    switch (transformation.type) {
      case 'script':
        // Execute transformation script
        return value // Placeholder
        
      case 'template':
        // Apply template transformation
        return value // Placeholder
        
      case 'function':
        // Apply function transformation
        return value // Placeholder
        
      default:
        return value
    }
  }

  /**
   * Get value by dot-notation path
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * Set value by dot-notation path
   */
  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)
    
    target[lastKey] = value
  }

  /**
   * Start health monitoring for adapter
   */
  private startHealthMonitoring(adapterId: string): void {
    const interval = setInterval(async () => {
      try {
        const adapter = this.adapters.get(adapterId)
        if (adapter) {
          const healthy = await adapter.isHealthy()
          if (!healthy) {
            this.emit('adapter-unhealthy', adapterId)
            this.logger.warn(`Adapter ${adapterId} is unhealthy`)
          }
        }
      } catch (error) {
        this.logger.error(`Health check failed for adapter ${adapterId}:`, error)
      }
    }, 30000) // Check every 30 seconds

    this.healthChecks.set(adapterId, interval)
  }

  /**
   * Group adapters by type
   */
  private groupAdaptersByType(adapters: IntegrationAdapter[]): Record<string, number> {
    const groups: Record<string, number> = {}
    
    for (const adapter of adapters) {
      groups[adapter.type] = (groups[adapter.type] || 0) + 1
    }
    
    return groups
  }

  /**
   * Group integrations by plugin
   */
  private groupIntegrationsByPlugin(integrations: IntegrationDefinition[]): Record<string, number> {
    const groups: Record<string, number> = {}
    
    for (const integration of integrations) {
      const pluginId = integration.metadata.pluginId
      groups[pluginId] = (groups[pluginId] || 0) + 1
    }
    
    return groups
  }

  /**
   * Group integrations by adapter
   */
  private groupIntegrationsByAdapter(integrations: IntegrationDefinition[]): Record<string, number> {
    const groups: Record<string, number> = {}
    
    for (const integration of integrations) {
      groups[integration.adapterId] = (groups[integration.adapterId] || 0) + 1
    }
    
    return groups
  }
}