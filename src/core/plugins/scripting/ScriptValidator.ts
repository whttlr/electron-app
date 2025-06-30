/**
 * Script Validator - Validates script safety and structure
 */

import { ScriptDefinition, ScriptParameter } from './ScriptingEngine'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface ValidationError {
  type: 'syntax' | 'security' | 'structure' | 'dependency'
  message: string
  line?: number
  column?: number
  severity: 'error' | 'warning'
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning'
  suggestion?: string
}

export interface SecurityCheck {
  name: string
  description: string
  pattern: RegExp
  riskLevel: 'low' | 'medium' | 'high'
  category: 'dangerous_api' | 'file_system' | 'network' | 'eval' | 'prototype'
}

/**
 * Script Validator class
 * Validates scripts for safety, security, and correctness
 */
export class ScriptValidator {
  private securityChecks: SecurityCheck[]

  constructor() {
    this.initializeSecurityChecks()
  }

  /**
   * Validate a script definition
   */
  async validateScript(script: ScriptDefinition): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      // Structure validation
      this.validateStructure(script, errors)

      // Syntax validation
      await this.validateSyntax(script, errors)

      // Security validation
      this.validateSecurity(script, errors, warnings)

      // Parameter validation
      this.validateParameters(script, errors, warnings)

      // Dependency validation
      this.validateDependencies(script, errors, warnings)

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(errors, warnings)

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        riskLevel
      }

    } catch (error) {
      errors.push({
        type: 'structure',
        message: `Validation error: ${error.message}`,
        severity: 'error'
      })

      return {
        valid: false,
        errors,
        warnings,
        riskLevel: 'high'
      }
    }
  }

  /**
   * Quick security scan of script source
   */
  scanSecurity(source: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const check of this.securityChecks) {
      const matches = source.match(check.pattern)
      if (matches) {
        const error: ValidationError = {
          type: 'security',
          message: `Security concern: ${check.description}`,
          severity: check.riskLevel === 'high' ? 'error' : 'warning'
        }

        if (check.riskLevel === 'high') {
          errors.push(error)
        } else {
          warnings.push({
            ...error,
            severity: 'warning',
            suggestion: `Consider removing or securing: ${matches[0]}`
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      riskLevel: this.calculateRiskLevel(errors, warnings)
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Validate script structure
   */
  private validateStructure(script: ScriptDefinition, errors: ValidationError[]): void {
    // Required fields
    if (!script.id) {
      errors.push({
        type: 'structure',
        message: 'Script ID is required',
        severity: 'error'
      })
    }

    if (!script.name) {
      errors.push({
        type: 'structure',
        message: 'Script name is required',
        severity: 'error'
      })
    }

    if (!script.source) {
      errors.push({
        type: 'structure',
        message: 'Script source is required',
        severity: 'error'
      })
    }

    if (!script.category) {
      errors.push({
        type: 'structure',
        message: 'Script category is required',
        severity: 'error'
      })
    }

    // ID validation
    if (script.id && !/^[a-z0-9\-_]+$/.test(script.id)) {
      errors.push({
        type: 'structure',
        message: 'Script ID must contain only lowercase letters, numbers, hyphens, and underscores',
        severity: 'error'
      })
    }

    // Language validation
    if (!['javascript', 'typescript'].includes(script.language)) {
      errors.push({
        type: 'structure',
        message: 'Script language must be javascript or typescript',
        severity: 'error'
      })
    }

    // Source length validation
    if (script.source && script.source.length > 100000) {
      errors.push({
        type: 'structure',
        message: 'Script source exceeds maximum length (100KB)',
        severity: 'error'
      })
    }
  }

  /**
   * Validate script syntax
   */
  private async validateSyntax(script: ScriptDefinition, errors: ValidationError[]): Promise<void> {
    try {
      if (script.language === 'javascript') {
        // Basic JavaScript syntax check
        new Function(script.source)
      } else if (script.language === 'typescript') {
        // TypeScript validation would require TypeScript compiler
        // For now, just do basic JavaScript check
        new Function(script.source)
      }
    } catch (syntaxError: any) {
      errors.push({
        type: 'syntax',
        message: `Syntax error: ${syntaxError.message}`,
        line: this.extractLineNumber(syntaxError),
        severity: 'error'
      })
    }
  }

  /**
   * Validate script security
   */
  private validateSecurity(
    script: ScriptDefinition, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    const source = script.source

    for (const check of this.securityChecks) {
      const matches = source.match(check.pattern)
      if (matches) {
        const error: ValidationError = {
          type: 'security',
          message: `${check.description}`,
          severity: check.riskLevel === 'high' ? 'error' : 'warning'
        }

        if (check.riskLevel === 'high') {
          errors.push(error)
        } else {
          warnings.push({
            ...error,
            severity: 'warning',
            suggestion: `Review usage of: ${matches[0]}`
          })
        }
      }
    }

    // Additional security checks
    this.checkForDangerousPatterns(source, errors, warnings)
  }

  /**
   * Validate script parameters
   */
  private validateParameters(
    script: ScriptDefinition, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (script.parameters.length > 20) {
      errors.push({
        type: 'structure',
        message: 'Too many parameters (maximum 20)',
        severity: 'error'
      })
    }

    for (const param of script.parameters) {
      if (!param.name) {
        errors.push({
          type: 'structure',
          message: 'Parameter name is required',
          severity: 'error'
        })
      }

      if (!['string', 'number', 'boolean', 'object', 'array'].includes(param.type)) {
        errors.push({
          type: 'structure',
          message: `Invalid parameter type: ${param.type}`,
          severity: 'error'
        })
      }

      if (param.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param.name)) {
        errors.push({
          type: 'structure',
          message: `Invalid parameter name: ${param.name}`,
          severity: 'error'
        })
      }
    }

    // Check for duplicate parameter names
    const paramNames = script.parameters.map(p => p.name)
    const duplicates = paramNames.filter((name, index) => paramNames.indexOf(name) !== index)
    
    if (duplicates.length > 0) {
      errors.push({
        type: 'structure',
        message: `Duplicate parameter names: ${duplicates.join(', ')}`,
        severity: 'error'
      })
    }
  }

  /**
   * Validate script dependencies
   */
  private validateDependencies(
    script: ScriptDefinition, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (script.dependencies.length > 10) {
      errors.push({
        type: 'dependency',
        message: 'Too many dependencies (maximum 10)',
        severity: 'error'
      })
    }

    const allowedModules = ['lodash', 'moment', 'uuid', 'crypto']
    
    for (const dep of script.dependencies) {
      if (!allowedModules.includes(dep)) {
        warnings.push({
          type: 'dependency',
          message: `Dependency not in allowed list: ${dep}`,
          severity: 'warning',
          suggestion: 'Ensure this module is safe and approved'
        })
      }
    }
  }

  /**
   * Check for dangerous code patterns
   */
  private checkForDangerousPatterns(
    source: string, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    // Check for eval usage
    if (/\beval\s*\(/.test(source)) {
      errors.push({
        type: 'security',
        message: 'Use of eval() is prohibited',
        severity: 'error'
      })
    }

    // Check for Function constructor
    if (/new\s+Function\s*\(/.test(source)) {
      errors.push({
        type: 'security',
        message: 'Use of Function constructor is prohibited',
        severity: 'error'
      })
    }

    // Check for infinite loops
    if (/while\s*\(\s*true\s*\)/.test(source) || /for\s*\(\s*;;\s*\)/.test(source)) {
      warnings.push({
        type: 'security',
        message: 'Potential infinite loop detected',
        severity: 'warning',
        suggestion: 'Add proper exit conditions or timeout handling'
      })
    }

    // Check for large arrays/objects
    if (/new\s+Array\s*\(\s*\d{6,}\s*\)/.test(source)) {
      warnings.push({
        type: 'security',
        message: 'Large array allocation detected',
        severity: 'warning',
        suggestion: 'Consider memory limitations'
      })
    }
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(errors: ValidationError[], warnings: ValidationWarning[]): 'low' | 'medium' | 'high' {
    const highRiskErrors = errors.filter(e => e.type === 'security').length
    const mediumRiskWarnings = warnings.filter(w => w.type === 'security').length

    if (highRiskErrors > 0) {
      return 'high'
    }

    if (errors.length > 0 || mediumRiskWarnings > 2) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Extract line number from syntax error
   */
  private extractLineNumber(error: any): number | undefined {
    const match = error.message.match(/line (\d+)/i)
    return match ? parseInt(match[1], 10) : undefined
  }

  /**
   * Initialize security checks
   */
  private initializeSecurityChecks(): void {
    this.securityChecks = [
      {
        name: 'eval_usage',
        description: 'Use of eval() function',
        pattern: /\beval\s*\(/g,
        riskLevel: 'high',
        category: 'eval'
      },
      {
        name: 'function_constructor',
        description: 'Use of Function constructor',
        pattern: /new\s+Function\s*\(/g,
        riskLevel: 'high',
        category: 'eval'
      },
      {
        name: 'process_access',
        description: 'Access to process object',
        pattern: /\bprocess\./g,
        riskLevel: 'high',
        category: 'dangerous_api'
      },
      {
        name: 'global_access',
        description: 'Access to global object',
        pattern: /\bglobal\./g,
        riskLevel: 'high',
        category: 'dangerous_api'
      },
      {
        name: 'require_usage',
        description: 'Use of require() function',
        pattern: /\brequire\s*\(/g,
        riskLevel: 'medium',
        category: 'file_system'
      },
      {
        name: 'file_system',
        description: 'File system operations',
        pattern: /\bfs\.|readFile|writeFile|unlink/g,
        riskLevel: 'high',
        category: 'file_system'
      },
      {
        name: 'network_requests',
        description: 'Network requests',
        pattern: /\bfetch\(|XMLHttpRequest|axios\.|http\.|https\./g,
        riskLevel: 'medium',
        category: 'network'
      },
      {
        name: 'prototype_pollution',
        description: 'Potential prototype pollution',
        pattern: /__proto__|constructor\.prototype/g,
        riskLevel: 'high',
        category: 'prototype'
      },
      {
        name: 'console_override',
        description: 'Console object modification',
        pattern: /console\s*=/g,
        riskLevel: 'medium',
        category: 'dangerous_api'
      },
      {
        name: 'timeout_manipulation',
        description: 'Timer manipulation',
        pattern: /clearTimeout|clearInterval/g,
        riskLevel: 'low',
        category: 'dangerous_api'
      }
    ]
  }
}