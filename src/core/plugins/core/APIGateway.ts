/**
 * Plugin API Gateway - Provides controlled access to system APIs
 */

import { EventEmitter } from 'events'
import { PluginRegistryEntry, PluginContext, APILevel } from '../types/plugin-types'
import { PluginAPILevels, CoreAPI, MachineAPI, UIApi, IntegrationAPI, AutomationAPI, UtilityAPI } from '../types/api-types'

export interface APIGatewayOptions {
  enableMetrics: boolean
  rateLimiting: boolean
  requestTimeout: number
  logger?: any
}

interface APIMetrics {
  plugin: string
  method: string
  calls: number
  lastCall: Date
  averageResponseTime: number
  errors: number
}

interface RateLimit {
  plugin: string
  method: string
  calls: number
  resetTime: Date
  limit: number
}

/**
 * API Gateway for plugins
 * Controls access to system APIs based on plugin permissions and API levels
 */
export class APIGateway extends EventEmitter {
  private options: APIGatewayOptions
  private logger: any

  // Registered APIs
  private coreAPI: CoreAPI
  private machineAPI: MachineAPI
  private uiAPI: UIApi
  private integrationAPI: IntegrationAPI
  private automationAPI: AutomationAPI
  private utilityAPI: UtilityAPI

  // Plugin management
  private registeredPlugins: Map<string, { entry: PluginRegistryEntry; context: PluginContext }> = new Map()
  private apiMetrics: Map<string, APIMetrics> = new Map()
  private rateLimits: Map<string, RateLimit> = new Map()

  // API call tracking
  private activeCalls: Map<string, Promise<any>> = new Map()

  constructor(options: Partial<APIGatewayOptions> = {}) {
    super()

    this.options = {
      enableMetrics: true,
      rateLimiting: true,
      requestTimeout: 10000,
      ...options
    }

    this.logger = options.logger || console

    // Initialize API implementations
    this.initializeAPIs()
  }

  async initialize(): Promise<void> {
    this.logger.debug('APIGateway initialized')
  }

  async shutdown(): Promise<void> {
    // Wait for active calls to complete or timeout
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000))
    const callsPromise = Promise.all(this.activeCalls.values())
    
    await Promise.race([callsPromise, timeoutPromise])

    this.registeredPlugins.clear()
    this.apiMetrics.clear()
    this.rateLimits.clear()
    this.activeCalls.clear()

    this.logger.debug('APIGateway shutdown complete')
  }

  /**
   * Register a plugin with the API gateway
   */
  async registerPlugin(entry: PluginRegistryEntry, context: PluginContext): Promise<void> {
    const name = entry.manifest.metadata.name
    const apiLevel = entry.manifest.capabilities.apiLevel

    try {
      // Store plugin registration
      this.registeredPlugins.set(name, { entry, context })

      // Create API proxy for plugin
      const apiProxy = this.createAPIProxy(name, apiLevel)
      context.api = apiProxy

      this.logger.debug(`Plugin registered with API gateway: ${name} (level: ${apiLevel})`)

    } catch (error) {
      this.logger.error(`Failed to register plugin with API gateway: ${name}`, error)
      throw error
    }
  }

  /**
   * Unregister a plugin from the API gateway
   */
  async unregisterPlugin(name: string): Promise<void> {
    try {
      this.registeredPlugins.delete(name)
      
      // Clean up metrics and rate limits
      this.cleanupPluginData(name)

      this.logger.debug(`Plugin unregistered from API gateway: ${name}`)

    } catch (error) {
      this.logger.error(`Failed to unregister plugin from API gateway: ${name}`, error)
      throw error
    }
  }

  /**
   * Get API diagnostics
   */
  getDiagnostics(): any {
    return {
      registeredPlugins: this.registeredPlugins.size,
      totalAPICalls: Array.from(this.apiMetrics.values()).reduce((sum, m) => sum + m.calls, 0),
      activeRateLimits: this.rateLimits.size,
      activeCalls: this.activeCalls.size,
      topAPIUsers: this.getTopAPIUsers(),
      recentErrors: this.getRecentErrors()
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Initialize API implementations
   */
  private initializeAPIs(): void {
    // Core API implementation
    this.coreAPI = {
      machine: this.createCoreMachineAPI(),
      safety: this.createCoreSafetyAPI(),
      data: this.createCoreDataAPI(),
      events: this.createCoreEventsAPI()
    }

    // Machine API implementation
    this.machineAPI = {
      gcode: this.createGCodeAPI(),
      tools: this.createToolsAPI(),
      coordinates: this.createCoordinatesAPI(),
      control: this.createMachineControlAPI()
    }

    // UI API implementation
    this.uiAPI = {
      components: this.createUIComponentsAPI(),
      dashboard: this.createDashboardAPI(),
      navigation: this.createNavigationAPI(),
      dialogs: this.createDialogsAPI()
    }

    // Integration API implementation
    this.integrationAPI = {
      http: this.createHTTPAPI(),
      database: this.createDatabaseAPI(),
      files: this.createFilesAPI(),
      messaging: this.createMessagingAPI()
    }

    // Automation API implementation
    this.automationAPI = {
      workflows: this.createWorkflowAPI(),
      triggers: this.createTriggerAPI(),
      actions: this.createActionAPI(),
      scheduler: this.createSchedulerAPI()
    }

    // Utility API implementation
    this.utilityAPI = {
      math: this.createMathAPI(),
      string: this.createStringAPI(),
      date: this.createDateAPI(),
      validation: this.createValidationAPI()
    }
  }

  /**
   * Create API proxy for specific plugin and API level
   */
  private createAPIProxy(pluginName: string, apiLevel: APILevel): any {
    const proxy: any = {}

    // Add APIs based on level
    switch (apiLevel) {
      case 'core':
        proxy.core = this.wrapAPI(pluginName, 'core', this.coreAPI)
        // Fall through to include lower level APIs
      case 'machine':
        proxy.machine = this.wrapAPI(pluginName, 'machine', this.machineAPI)
        // Fall through
      case 'ui':
        proxy.ui = this.wrapAPI(pluginName, 'ui', this.uiAPI)
        // Fall through
      case 'integration':
        proxy.integration = this.wrapAPI(pluginName, 'integration', this.integrationAPI)
        // Fall through
      case 'automation':
        proxy.automation = this.wrapAPI(pluginName, 'automation', this.automationAPI)
        // Fall through
      case 'utility':
        proxy.utility = this.wrapAPI(pluginName, 'utility', this.utilityAPI)
        break
    }

    return proxy
  }

  /**
   * Wrap API with permission checking, metrics, and rate limiting
   */
  private wrapAPI(pluginName: string, namespace: string, api: any): any {
    const wrapped: any = {}

    for (const [key, value] of Object.entries(api)) {
      if (typeof value === 'function') {
        wrapped[key] = this.wrapAPIMethod(pluginName, `${namespace}.${key}`, value)
      } else if (typeof value === 'object' && value !== null) {
        wrapped[key] = this.wrapAPI(pluginName, `${namespace}.${key}`, value)
      } else {
        wrapped[key] = value
      }
    }

    return wrapped
  }

  /**
   * Wrap individual API method with controls
   */
  private wrapAPIMethod(pluginName: string, methodName: string, method: Function): Function {
    return async (...args: any[]) => {
      const callId = `${pluginName}:${methodName}:${Date.now()}`

      try {
        // Check rate limits
        if (this.options.rateLimiting && !this.checkRateLimit(pluginName, methodName)) {
          throw new Error(`Rate limit exceeded for ${methodName}`)
        }

        // Record metrics
        const startTime = Date.now()
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API call timeout')), this.options.requestTimeout)
        })

        // Execute API call
        const methodPromise = method.apply(this, args)
        this.activeCalls.set(callId, methodPromise)

        const result = await Promise.race([methodPromise, timeoutPromise])

        // Record successful call
        this.recordAPICall(pluginName, methodName, Date.now() - startTime, false)

        return result

      } catch (error) {
        // Record failed call
        this.recordAPICall(pluginName, methodName, Date.now() - Date.now(), true)
        this.logger.error(`API call failed: ${pluginName}.${methodName}`, error)
        throw error

      } finally {
        this.activeCalls.delete(callId)
      }
    }
  }

  /**
   * Check rate limits for plugin method
   */
  private checkRateLimit(pluginName: string, methodName: string): boolean {
    if (!this.options.rateLimiting) {
      return true
    }

    const key = `${pluginName}:${methodName}`
    const now = new Date()
    let rateLimit = this.rateLimits.get(key)

    if (!rateLimit) {
      rateLimit = {
        plugin: pluginName,
        method: methodName,
        calls: 0,
        resetTime: new Date(now.getTime() + 60000), // 1 minute window
        limit: 100 // 100 calls per minute default
      }
      this.rateLimits.set(key, rateLimit)
    }

    // Reset if time window expired
    if (now > rateLimit.resetTime) {
      rateLimit.calls = 0
      rateLimit.resetTime = new Date(now.getTime() + 60000)
    }

    // Check limit
    if (rateLimit.calls >= rateLimit.limit) {
      return false
    }

    rateLimit.calls++
    return true
  }

  /**
   * Record API call metrics
   */
  private recordAPICall(pluginName: string, methodName: string, responseTime: number, isError: boolean): void {
    if (!this.options.enableMetrics) {
      return
    }

    const key = `${pluginName}:${methodName}`
    let metrics = this.apiMetrics.get(key)

    if (!metrics) {
      metrics = {
        plugin: pluginName,
        method: methodName,
        calls: 0,
        lastCall: new Date(),
        averageResponseTime: 0,
        errors: 0
      }
      this.apiMetrics.set(key, metrics)
    }

    metrics.calls++
    metrics.lastCall = new Date()
    metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.calls - 1) + responseTime) / metrics.calls

    if (isError) {
      metrics.errors++
    }
  }

  /**
   * Clean up data for unregistered plugin
   */
  private cleanupPluginData(pluginName: string): void {
    // Remove metrics
    for (const [key, metrics] of this.apiMetrics.entries()) {
      if (metrics.plugin === pluginName) {
        this.apiMetrics.delete(key)
      }
    }

    // Remove rate limits
    for (const [key, rateLimit] of this.rateLimits.entries()) {
      if (rateLimit.plugin === pluginName) {
        this.rateLimits.delete(key)
      }
    }
  }

  /**
   * Get top API users by call count
   */
  private getTopAPIUsers(): any[] {
    const userStats = new Map<string, number>()

    for (const metrics of this.apiMetrics.values()) {
      const current = userStats.get(metrics.plugin) || 0
      userStats.set(metrics.plugin, current + metrics.calls)
    }

    return Array.from(userStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([plugin, calls]) => ({ plugin, calls }))
  }

  /**
   * Get recent API errors
   */
  private getRecentErrors(): any[] {
    return Array.from(this.apiMetrics.values())
      .filter(m => m.errors > 0)
      .sort((a, b) => b.lastCall.getTime() - a.lastCall.getTime())
      .slice(0, 10)
      .map(m => ({
        plugin: m.plugin,
        method: m.method,
        errors: m.errors,
        lastCall: m.lastCall
      }))
  }

  // === API IMPLEMENTATIONS (Stubs) ===
  // These would be implemented to delegate to actual system components

  private createCoreMachineAPI(): any {
    return {
      connect: async (config: any) => ({ id: 'conn1', status: 'connected', config, lastActivity: new Date() }),
      disconnect: async () => {},
      sendCommand: async (command: string) => ({ success: true, data: 'ok', timestamp: new Date() }),
      getStatus: async () => ({ connected: true, position: { x: 0, y: 0, z: 0 } }),
      subscribe: (event: string, callback: Function) => ({ id: 'sub1', event, unsubscribe: () => {} }),
      emergencyStop: async () => {}
    }
  }

  private createCoreSafetyAPI(): any {
    return {
      emergencyStop: async () => {},
      validateCommand: (command: string) => ({ valid: true, errors: [], warnings: [] }),
      checkBoundaries: (position: any) => ({ withinBounds: true, violations: [] }),
      setSafetyLimits: async (limits: any) => {},
      getSafetyStatus: async () => ({ emergencyStop: false, safetyLimitsActive: true, boundaryCheckEnabled: true })
    }
  }

  private createCoreDataAPI(): any {
    return {
      log: (level: string, message: string, data?: any) => this.logger[level]?.(message, data),
      store: async (key: string, value: any) => {},
      retrieve: async (key: string) => null,
      subscribe: (pattern: string, callback: Function) => ({ id: 'sub1', event: pattern, unsubscribe: () => {} }),
      query: async (query: any) => ({ data: [], total: 0, hasMore: false })
    }
  }

  private createCoreEventsAPI(): any {
    return {
      emit: (event: string, data?: any) => this.emit(`plugin-event:${event}`, data),
      on: (event: string, callback: Function) => ({ id: 'sub1', event, unsubscribe: () => {} }),
      off: (event: string, callback: Function) => {},
      once: (event: string, callback: Function) => ({ id: 'sub1', event, unsubscribe: () => {} }),
      removeAllListeners: (event?: string) => {}
    }
  }

  private createGCodeAPI(): any {
    return {
      parse: (gcode: string) => ({ lines: [], metadata: { totalLines: 0, estimatedTime: 0, boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } }, toolChanges: 0 }, errors: [] }),
      validate: (gcode: string) => ({ valid: true, errors: [], warnings: [] }),
      optimize: (gcode: string) => ({ original: gcode, optimized: gcode, improvements: [], timeSaved: 0 }),
      simulate: (gcode: string) => ({ path: [], time: 0, distance: 0, toolpaths: [] }),
      execute: async (gcode: string) => ({ success: true, linesExecuted: 0, executionTime: 0, finalPosition: { x: 0, y: 0, z: 0 }, errors: [] })
    }
  }

  private createToolsAPI(): any {
    return {
      getLibrary: async () => ({ tools: [], categories: [], activeTool: undefined }),
      addTool: async (tool: any) => {},
      updateTool: async (id: string, tool: any) => {},
      deleteTool: async (id: string) => {},
      measureTool: async (id: string) => ({ tool: id, diameter: 0, length: 0, runout: 0, timestamp: new Date(), method: 'manual' }),
      setActiveTool: async (id: string) => {}
    }
  }

  private createCoordinatesAPI(): any {
    return {
      getPosition: async () => ({ x: 0, y: 0, z: 0 }),
      setWorkOffset: async (wcs: string, offset: any) => {},
      getWorkOffset: async (wcs: string) => ({ x: 0, y: 0, z: 0 }),
      transformCoordinates: (from: string, to: string, pos: any) => pos,
      getActiveWCS: async () => 'G54',
      setActiveWCS: async (wcs: string) => {}
    }
  }

  private createMachineControlAPI(): any {
    return {
      jog: async (axis: string, distance: number) => {},
      home: async (axes?: string[]) => {},
      probe: async (direction: string, distance: number) => ({ success: true, position: { x: 0, y: 0, z: 0 }, contact: true, timestamp: new Date() }),
      setFeedrate: async (feedrate: number) => {},
      setSpindleSpeed: async (rpm: number) => {},
      coolantOn: async (type?: string) => {},
      coolantOff: async () => {}
    }
  }

  private createUIComponentsAPI(): any {
    return {
      register: (name: string, component: any) => {},
      unregister: (name: string) => {},
      render: (name: string, props: any, container: Element) => {},
      update: (name: string, props: any) => {},
      destroy: (name: string) => {},
      list: () => []
    }
  }

  private createDashboardAPI(): any {
    return {
      addWidget: (widget: any) => {},
      removeWidget: (id: string) => {},
      updateWidget: (id: string, data: any) => {},
      createPanel: (panel: any) => {},
      removePanel: (id: string) => {},
      getLayout: () => ({ panels: [], widgets: [], settings: { theme: 'default', compact: false, animations: true, autoSave: true } }),
      setLayout: (layout: any) => {}
    }
  }

  private createNavigationAPI(): any {
    return {
      addMenuItem: (item: any) => {},
      removeMenuItem: (id: string) => {},
      addToolbarButton: (button: any) => {},
      removeToolbarButton: (id: string) => {},
      navigate: (path: string) => {},
      getCurrentPath: () => '/'
    }
  }

  private createDialogsAPI(): any {
    return {
      showModal: async (modal: any) => null,
      closeModal: (id: string) => {},
      showNotification: (notification: any) => {},
      showAlert: async (alert: any) => true,
      showConfirm: async (confirm: any) => true
    }
  }

  private createHTTPAPI(): any {
    return {
      request: async (config: any) => ({ status: 200, statusText: 'OK', headers: {}, data: null }),
      get: async (url: string, config?: any) => ({ status: 200, statusText: 'OK', headers: {}, data: null }),
      post: async (url: string, data?: any, config?: any) => ({ status: 200, statusText: 'OK', headers: {}, data: null }),
      put: async (url: string, data?: any, config?: any) => ({ status: 200, statusText: 'OK', headers: {}, data: null }),
      delete: async (url: string, config?: any) => ({ status: 200, statusText: 'OK', headers: {}, data: null }),
      webhook: (endpoint: string, handler: Function) => ({ id: 'webhook1', endpoint, unregister: () => {} })
    }
  }

  private createDatabaseAPI(): any {
    return {
      query: async (sql: string, params?: any[]) => ({ rows: [], fields: [], rowCount: 0, command: sql }),
      transaction: async (operations: any[]) => ({ success: true, results: [], error: undefined }),
      subscribe: (table: string, callback: Function) => ({ id: 'sub1', channel: table, unsubscribe: () => {} }),
      backup: async () => ({ success: true, filename: 'backup.sql', size: 0, timestamp: new Date() }),
      restore: async (backup: string) => ({ success: true, restoredTables: [], timestamp: new Date() })
    }
  }

  private createFilesAPI(): any {
    return {
      read: async (path: string) => '',
      write: async (path: string, data: any) => {},
      exists: async (path: string) => false,
      list: async (path: string) => [],
      watch: (path: string, callback: Function) => ({ id: 'watch1', path, stop: () => {} }),
      upload: async (file: any) => ({ success: true, path: '', size: 0, checksum: '' }),
      download: async (path: string) => ({ success: true, data: Buffer.alloc(0), contentType: '', size: 0 })
    }
  }

  private createMessagingAPI(): any {
    return {
      send: async (channel: string, message: any) => {},
      subscribe: (channel: string, handler: Function) => ({ id: 'sub1', channel, unsubscribe: () => {} }),
      publish: async (topic: string, data: any) => {},
      createQueue: async (name: string, options?: any) => ({
        name,
        push: async (message: any) => {},
        pop: async () => null,
        peek: async () => null,
        size: async () => 0,
        clear: async () => {}
      })
    }
  }

  private createWorkflowAPI(): any {
    return {
      create: async (workflow: any) => 'workflow1',
      start: async (id: string, input?: any) => ({ id: 'exec1', workflowId: id, status: 'running', startedAt: new Date(), input, output: undefined, error: undefined, steps: [] }),
      stop: async (executionId: string) => {},
      pause: async (executionId: string) => {},
      resume: async (executionId: string) => {},
      getStatus: async (executionId: string) => ({ execution: {} as any, progress: 0, currentStep: undefined, timeRemaining: undefined }),
      list: async () => []
    }
  }

  private createTriggerAPI(): any {
    return {
      register: async (trigger: any) => 'trigger1',
      unregister: async (id: string) => {},
      enable: async (id: string) => {},
      disable: async (id: string) => {},
      list: async () => [],
      getHistory: async (id: string) => []
    }
  }

  private createActionAPI(): any {
    return {
      register: (action: any) => {},
      unregister: (name: string) => {},
      execute: async (name: string, parameters: any) => ({ success: true, data: undefined, error: undefined, metrics: undefined }),
      list: () => [],
      validate: (name: string, parameters: any) => ({ valid: true, errors: [], warnings: [] })
    }
  }

  private createSchedulerAPI(): any {
    return {
      schedule: async (job: any) => 'job1',
      unschedule: async (id: string) => {},
      pause: async (id: string) => {},
      resume: async (id: string) => {},
      list: async () => [],
      getHistory: async (id: string) => []
    }
  }

  private createMathAPI(): any {
    return {
      calculate: (expression: string) => 0,
      round: (value: number, decimals: number) => Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals),
      clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
      interpolate: (start: number, end: number, factor: number) => start + (end - start) * factor,
      distance: (p1: any, p2: any) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2))
    }
  }

  private createStringAPI(): any {
    return {
      format: (template: string, values: any) => template,
      sanitize: (text: string) => text,
      hash: (text: string, algorithm = 'sha256') => 'hash',
      encode: (text: string, encoding: string) => text,
      decode: (text: string, encoding: string) => text
    }
  }

  private createDateAPI(): any {
    return {
      now: () => new Date(),
      format: (date: Date, format: string) => date.toISOString(),
      parse: (dateString: string, format?: string) => new Date(dateString),
      add: (date: Date, amount: number, unit: string) => new Date(date.getTime() + amount),
      diff: (date1: Date, date2: Date, unit: string) => date2.getTime() - date1.getTime()
    }
  }

  private createValidationAPI(): any {
    return {
      validate: (value: any, schema: any) => ({ valid: true, errors: [], warnings: [] }),
      sanitize: (value: any, rules: any) => value,
      createSchema: (definition: any) => ({ type: 'object', properties: {}, rules: [] })
    }
  }
}