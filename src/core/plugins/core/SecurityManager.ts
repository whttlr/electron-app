/**
 * Plugin Security Manager - Handles security, sandboxing, and permissions
 */

import { EventEmitter } from 'events'
import * as crypto from 'crypto'
import { 
  PluginRegistryEntry, 
  Permission, 
  SecurityAssessment, 
  SecurityRisk,
  PermissionAssessment,
  SignatureValidation
} from '../types/plugin-types'

export interface SecurityManagerOptions {
  sandboxing: boolean
  strictMode: boolean
  maxMemory: number
  maxCpuTime: number
  allowedPaths: string[]
  blockedPaths: string[]
  logger?: any
}

interface SecurityContext {
  plugin: string
  permissions: Permission[]
  resources: SecurityResourceLimits
  violations: SecurityViolation[]
  lastCheck: Date
}

interface SecurityResourceLimits {
  maxMemory: number
  maxCpuTime: number
  maxFileSize: number
  maxNetworkRequests: number
}

interface SecurityViolation {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: Date
  context?: any
}

/**
 * Security Manager for plugins
 * Handles sandboxing, permissions, and security validation
 */
export class SecurityManager extends EventEmitter {
  private options: SecurityManagerOptions
  private logger: any

  // Security state
  private securityContexts: Map<string, SecurityContext> = new Map()
  private trustedPlugins: Set<string> = new Set()
  private blockedPlugins: Set<string> = new Set()
  private resourceMonitors: Map<string, NodeJS.Timeout> = new Map()

  // Sandbox environments
  private sandboxes: Map<string, any> = new Map()

  constructor(options: Partial<SecurityManagerOptions> = {}) {
    super()

    this.options = {
      sandboxing: true,
      strictMode: false,
      maxMemory: 128 * 1024 * 1024, // 128MB
      maxCpuTime: 5000, // 5 seconds
      allowedPaths: ['./plugins', './temp'],
      blockedPaths: ['/etc', '/var', '/usr'],
      ...options
    }

    this.logger = options.logger || console
  }

  async initialize(): Promise<void> {
    this.logger.debug('SecurityManager initialized')
  }

  async shutdown(): Promise<void> {
    // Cleanup resource monitors
    for (const timer of this.resourceMonitors.values()) {
      clearInterval(timer)
    }

    // Cleanup sandboxes
    for (const [plugin, sandbox] of this.sandboxes.entries()) {
      try {
        if (sandbox && typeof sandbox.destroy === 'function') {
          await sandbox.destroy()
        }
      } catch (error) {
        this.logger.error(`Error destroying sandbox for ${plugin}:`, error)
      }
    }

    this.securityContexts.clear()
    this.resourceMonitors.clear()
    this.sandboxes.clear()

    this.logger.debug('SecurityManager shutdown complete')
  }

  /**
   * Validate plugin security before loading
   */
  async validatePlugin(entry: PluginRegistryEntry): Promise<SecurityAssessment> {
    const name = entry.manifest.metadata.name

    try {
      this.logger.debug(`Validating security for plugin: ${name}`)

      const assessment: SecurityAssessment = {
        trustLevel: 'unknown',
        risks: [],
        permissions: [],
        signature: await this.validateSignature(entry)
      }

      // Analyze permissions
      const permissions = entry.manifest.capabilities.permissions || []
      assessment.permissions = await this.analyzePermissions(permissions)

      // Assess risks
      assessment.risks = await this.assessRisks(entry)

      // Calculate trust level
      assessment.trustLevel = this.calculateTrustLevel(assessment)

      // Check if plugin should be blocked
      if (assessment.trustLevel === 'low' || assessment.risks.some(r => r.severity === 'critical')) {
        this.blockedPlugins.add(name)
        throw new Error(`Plugin ${name} blocked due to security concerns`)
      }

      // Create security context
      await this.createSecurityContext(entry, assessment)

      this.logger.info(`Security validation complete for ${name}: ${assessment.trustLevel} trust`)
      return assessment

    } catch (error) {
      this.logger.error(`Security validation failed for ${name}:`, error)
      throw error
    }
  }

  /**
   * Check if operation is permitted for plugin
   */
  async checkPermission(pluginName: string, operation: string, resource?: string): Promise<boolean> {
    const context = this.securityContexts.get(pluginName)
    if (!context) {
      this.logger.warn(`No security context for plugin: ${pluginName}`)
      return false
    }

    try {
      // Check if plugin is blocked
      if (this.blockedPlugins.has(pluginName)) {
        this.recordViolation(pluginName, {
          type: 'blocked_plugin',
          severity: 'critical',
          description: 'Attempt to use blocked plugin',
          timestamp: new Date()
        })
        return false
      }

      // Check specific permission
      const hasPermission = this.hasPermission(context, operation, resource)
      
      if (!hasPermission) {
        this.recordViolation(pluginName, {
          type: 'permission_denied',
          severity: 'medium',
          description: `Permission denied for operation: ${operation}`,
          timestamp: new Date(),
          context: { operation, resource }
        })
      }

      return hasPermission

    } catch (error) {
      this.logger.error(`Error checking permission for ${pluginName}:`, error)
      return false
    }
  }

  /**
   * Create sandbox for plugin execution
   */
  async createSandbox(pluginName: string): Promise<any> {
    if (!this.options.sandboxing) {
      return null
    }

    try {
      // Simple sandbox implementation using VM
      // In production, would use more sophisticated sandboxing
      // Note: vm2 is not available in browser context, fallback to basic sandbox
      let VM: any = null
      try {
        // Try dynamic import for Node.js environments
        const vm2 = await import('vm2')
        VM = vm2.VM
      } catch (e) {
        // Fallback for browser environments
        console.warn('vm2 not available, using basic sandbox mode')
        return this.createBasicSandbox(pluginName)
      }
      
      const sandbox = new VM({
        timeout: this.options.maxCpuTime,
        sandbox: {
          console: this.createSandboxedConsole(pluginName),
          setTimeout: this.createSandboxedTimeout(pluginName),
          setInterval: this.createSandboxedInterval(pluginName)
        },
        require: {
          external: false,
          builtin: ['crypto', 'util'],
          root: './plugins'
        }
      })

      this.sandboxes.set(pluginName, sandbox)
      return sandbox

    } catch (error) {
      this.logger.error(`Failed to create sandbox for ${pluginName}:`, error)
      throw error
    }
  }

  /**
   * Create basic sandbox for browser environments
   */
  private createBasicSandbox(pluginName: string): any {
    // Basic sandbox implementation for browser environments
    // This provides limited isolation compared to vm2
    const sandbox = {
      console: this.createSandboxedConsole(pluginName),
      setTimeout: this.createSandboxedTimeout(pluginName),
      setInterval: this.createSandboxedInterval(pluginName),
      // Add other safe global objects as needed
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp
    }

    this.sandboxes.set(pluginName, sandbox)
    return sandbox
  }

  /**
   * Monitor plugin resource usage
   */
  startResourceMonitoring(pluginName: string): void {
    const context = this.securityContexts.get(pluginName)
    if (!context) {
      return
    }

    const monitor = setInterval(() => {
      this.checkResourceUsage(pluginName, context)
    }, 1000) // Check every second

    this.resourceMonitors.set(pluginName, monitor)
  }

  /**
   * Stop resource monitoring for plugin
   */
  stopResourceMonitoring(pluginName: string): void {
    const monitor = this.resourceMonitors.get(pluginName)
    if (monitor) {
      clearInterval(monitor)
      this.resourceMonitors.delete(pluginName)
    }
  }

  /**
   * Get security diagnostics
   */
  getDiagnostics(): any {
    return {
      totalPlugins: this.securityContexts.size,
      trustedPlugins: this.trustedPlugins.size,
      blockedPlugins: this.blockedPlugins.size,
      activeMonitors: this.resourceMonitors.size,
      recentViolations: this.getRecentViolations(),
      sandboxes: this.sandboxes.size
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Validate plugin signature
   */
  private async validateSignature(entry: PluginRegistryEntry): Promise<SignatureValidation> {
    // Placeholder implementation - would integrate with actual signing system
    return {
      signed: false,
      valid: false,
      issuer: undefined,
      timestamp: undefined,
      algorithm: undefined
    }
  }

  /**
   * Analyze plugin permissions
   */
  private async analyzePermissions(permissions: Permission[]): Promise<PermissionAssessment[]> {
    return permissions.map(permission => {
      const assessment: PermissionAssessment = {
        permission,
        justified: this.isPermissionJustified(permission),
        risk: this.assessPermissionRisk(permission),
        reason: this.getPermissionReason(permission)
      }
      return assessment
    })
  }

  /**
   * Assess security risks
   */
  private async assessRisks(entry: PluginRegistryEntry): Promise<SecurityRisk[]> {
    const risks: SecurityRisk[] = []

    // Check for high-risk permissions
    const permissions = entry.manifest.capabilities.permissions || []
    for (const permission of permissions) {
      if (this.isHighRiskPermission(permission)) {
        risks.push({
          type: 'high_risk_permission',
          severity: 'high',
          description: `Plugin requests high-risk permission: ${permission.type}`,
          mitigation: 'Review permission necessity'
        })
      }
    }

    // Check for suspicious features
    const features = entry.manifest.capabilities.features || []
    for (const feature of features) {
      if (this.isSuspiciousFeature(feature)) {
        risks.push({
          type: 'suspicious_feature',
          severity: 'medium',
          description: `Potentially suspicious feature: ${feature.type}`,
          mitigation: 'Manual review recommended'
        })
      }
    }

    // Check for unsigned plugin
    if (!entry.verified) {
      risks.push({
        type: 'unsigned_plugin',
        severity: 'medium',
        description: 'Plugin is not digitally signed',
        mitigation: 'Enable sandboxing and monitor closely'
      })
    }

    return risks
  }

  /**
   * Calculate trust level based on assessment
   */
  private calculateTrustLevel(assessment: SecurityAssessment): 'high' | 'medium' | 'low' | 'unknown' {
    if (assessment.risks.some(r => r.severity === 'critical')) {
      return 'low'
    }

    if (assessment.signature.signed && assessment.signature.valid) {
      return 'high'
    }

    if (assessment.risks.some(r => r.severity === 'high')) {
      return 'low'
    }

    if (assessment.risks.length === 0) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Create security context for plugin
   */
  private async createSecurityContext(entry: PluginRegistryEntry, assessment: SecurityAssessment): Promise<void> {
    const name = entry.manifest.metadata.name

    const context: SecurityContext = {
      plugin: name,
      permissions: entry.manifest.capabilities.permissions || [],
      resources: {
        maxMemory: this.options.maxMemory,
        maxCpuTime: this.options.maxCpuTime,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxNetworkRequests: 100
      },
      violations: [],
      lastCheck: new Date()
    }

    this.securityContexts.set(name, context)
  }

  /**
   * Check if plugin has specific permission
   */
  private hasPermission(context: SecurityContext, operation: string, resource?: string): boolean {
    for (const permission of context.permissions) {
      if (this.matchesPermission(permission, operation, resource)) {
        return true
      }
    }
    return false
  }

  /**
   * Check if permission matches operation
   */
  private matchesPermission(permission: Permission, operation: string, resource?: string): boolean {
    // Simple matching logic - would be more sophisticated in production
    return permission.scope === operation || permission.scope === '*'
  }

  /**
   * Record security violation
   */
  private recordViolation(pluginName: string, violation: SecurityViolation): void {
    const context = this.securityContexts.get(pluginName)
    if (context) {
      context.violations.push(violation)
      
      // Limit violation history
      if (context.violations.length > 100) {
        context.violations = context.violations.slice(-100)
      }
    }

    this.emit('security-violation', pluginName, violation)
    this.logger.warn(`Security violation in ${pluginName}:`, violation)

    // Block plugin if too many critical violations
    if (violation.severity === 'critical') {
      this.blockedPlugins.add(pluginName)
    }
  }

  /**
   * Check resource usage for plugin
   */
  private checkResourceUsage(pluginName: string, context: SecurityContext): void {
    try {
      // Get memory usage (placeholder - would use actual metrics)
      const memoryUsage = process.memoryUsage().heapUsed // Simplified

      if (memoryUsage > context.resources.maxMemory) {
        this.recordViolation(pluginName, {
          type: 'memory_limit_exceeded',
          severity: 'high',
          description: `Memory usage exceeded: ${memoryUsage} > ${context.resources.maxMemory}`,
          timestamp: new Date(),
          context: { memoryUsage, limit: context.resources.maxMemory }
        })
      }

      context.lastCheck = new Date()

    } catch (error) {
      this.logger.error(`Error checking resource usage for ${pluginName}:`, error)
    }
  }

  /**
   * Create sandboxed console for plugin
   */
  private createSandboxedConsole(pluginName: string) {
    return {
      log: (...args: any[]) => this.logger.info(`[${pluginName}]`, ...args),
      warn: (...args: any[]) => this.logger.warn(`[${pluginName}]`, ...args),
      error: (...args: any[]) => this.logger.error(`[${pluginName}]`, ...args),
      debug: (...args: any[]) => this.logger.debug(`[${pluginName}]`, ...args)
    }
  }

  /**
   * Create sandboxed setTimeout for plugin
   */
  private createSandboxedTimeout(pluginName: string) {
    return (callback: Function, delay: number) => {
      if (delay > this.options.maxCpuTime) {
        this.recordViolation(pluginName, {
          type: 'timeout_limit_exceeded',
          severity: 'medium',
          description: `setTimeout delay exceeded limit: ${delay} > ${this.options.maxCpuTime}`,
          timestamp: new Date()
        })
        delay = this.options.maxCpuTime
      }
      return setTimeout(callback, delay)
    }
  }

  /**
   * Create sandboxed setInterval for plugin
   */
  private createSandboxedInterval(pluginName: string) {
    return (callback: Function, interval: number) => {
      if (interval < 100) { // Prevent excessive intervals
        this.recordViolation(pluginName, {
          type: 'excessive_interval',
          severity: 'medium',
          description: `setInterval too frequent: ${interval}ms`,
          timestamp: new Date()
        })
        interval = 100
      }
      return setInterval(callback, interval)
    }
  }

  /**
   * Check if permission is justified
   */
  private isPermissionJustified(permission: Permission): boolean {
    // Placeholder - would have more sophisticated justification logic
    return true
  }

  /**
   * Assess permission risk level
   */
  private assessPermissionRisk(permission: Permission): 'high' | 'medium' | 'low' {
    const highRiskTypes = ['file_system', 'network', 'system']
    const highRiskLevels = ['admin', 'execute']

    if (highRiskTypes.includes(permission.type) && highRiskLevels.includes(permission.level)) {
      return 'high'
    }

    if (highRiskTypes.includes(permission.type) || highRiskLevels.includes(permission.level)) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Get permission justification reason
   */
  private getPermissionReason(permission: Permission): string | undefined {
    return permission.description
  }

  /**
   * Check if permission is high-risk
   */
  private isHighRiskPermission(permission: Permission): boolean {
    return this.assessPermissionRisk(permission) === 'high'
  }

  /**
   * Check if feature is suspicious
   */
  private isSuspiciousFeature(feature: any): boolean {
    const suspiciousTypes = ['network_scanner', 'file_monitor', 'process_monitor']
    return suspiciousTypes.includes(feature.type)
  }

  /**
   * Get recent security violations
   */
  private getRecentViolations(): SecurityViolation[] {
    const recent: SecurityViolation[] = []
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    for (const context of this.securityContexts.values()) {
      for (const violation of context.violations) {
        if (violation.timestamp > oneHourAgo) {
          recent.push(violation)
        }
      }
    }

    return recent.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}