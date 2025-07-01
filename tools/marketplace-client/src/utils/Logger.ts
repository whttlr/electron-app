import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  context?: string
}

export interface LoggerOptions {
  verbose?: boolean
  debug?: boolean
  silent?: boolean
  logFile?: string
  colorOutput?: boolean
  includeTimestamp?: boolean
}

export class Logger {
  private options: LoggerOptions
  private logFile?: string

  constructor(options: LoggerOptions = {}) {
    this.options = {
      verbose: false,
      debug: false,
      silent: false,
      colorOutput: true,
      includeTimestamp: true,
      ...options
    }

    if (this.options.logFile) {
      this.setupLogFile(this.options.logFile)
    }
  }

  /**
   * Log debug message (only shown in debug mode)
   */
  debug(message: string, data?: any): void {
    if (!this.options.debug) return
    this.log('debug', message, data)
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  /**
   * Log success message
   */
  success(message: string, data?: any): void {
    this.log('success', message, data)
  }

  /**
   * Check if debug mode is enabled
   */
  isDebug(): boolean {
    return this.options.debug === true
  }

  /**
   * Check if verbose mode is enabled
   */
  isVerbose(): boolean {
    return this.options.verbose === true
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    return new ContextLogger(this, context)
  }

  /**
   * Log structured data
   */
  logStructured(data: any, level: LogLevel = 'info'): void {
    if (this.options.silent) return

    if (typeof data === 'object') {
      this.log(level, 'Structured data:', data)
    } else {
      this.log(level, String(data))
    }
  }

  /**
   * Log with progress indicator
   */
  progress(message: string, current: number, total: number): void {
    if (this.options.silent) return

    const percentage = Math.round((current / total) * 100)
    const progressBar = this.createProgressBar(percentage)
    
    process.stdout.write(`\r${message} ${progressBar} ${percentage}%`)
    
    if (current === total) {
      process.stdout.write('\n')
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (this.options.silent) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    // Console output
    this.writeToConsole(entry)

    // File output
    if (this.logFile) {
      this.writeToFile(entry)
    }
  }

  /**
   * Write log entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    let output = ''

    // Add timestamp
    if (this.options.includeTimestamp) {
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      output += this.options.colorOutput ? chalk.gray(`[${timestamp}]`) : `[${timestamp}]`
      output += ' '
    }

    // Add level indicator
    if (this.options.colorOutput) {
      switch (entry.level) {
        case 'debug':
          output += chalk.magenta('DEBUG')
          break
        case 'info':
          output += chalk.blue('INFO')
          break
        case 'warn':
          output += chalk.yellow('WARN')
          break
        case 'error':
          output += chalk.red('ERROR')
          break
        case 'success':
          output += chalk.green('SUCCESS')
          break
      }
    } else {
      output += entry.level.toUpperCase()
    }

    output += ' '

    // Add message
    if (this.options.colorOutput) {
      switch (entry.level) {
        case 'error':
          output += chalk.red(entry.message)
          break
        case 'warn':
          output += chalk.yellow(entry.message)
          break
        case 'success':
          output += chalk.green(entry.message)
          break
        default:
          output += entry.message
      }
    } else {
      output += entry.message
    }

    // Write to appropriate stream
    if (entry.level === 'error') {
      console.error(output)
    } else {
      console.log(output)
    }

    // Add structured data if present
    if (entry.data !== undefined) {
      if (typeof entry.data === 'object') {
        console.log(JSON.stringify(entry.data, null, 2))
      } else {
        console.log(String(entry.data))
      }
    }
  }

  /**
   * Write log entry to file
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.logFile) return

    try {
      const logLine = JSON.stringify(entry) + '\n'
      await fs.appendFile(this.logFile, logLine)
    } catch (error) {
      // Silently fail file logging to avoid recursion
    }
  }

  /**
   * Setup log file
   */
  private setupLogFile(logFile: string): void {
    this.logFile = path.resolve(logFile)
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile)
    fs.ensureDirSync(logDir)
  }

  /**
   * Create progress bar visualization
   */
  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    
    if (this.options.colorOutput) {
      return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
    } else {
      return '█'.repeat(filled) + '░'.repeat(empty)
    }
  }

  /**
   * Format error for logging
   */
  static formatError(error: Error): { message: string; stack?: string; code?: string } {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code
    }
  }

  /**
   * Create default logger for the application
   */
  static createDefault(): Logger {
    const logDir = path.join(os.homedir(), '.cnc-marketplace', 'logs')
    const logFile = path.join(logDir, `marketplace-${new Date().toISOString().split('T')[0]}.log`)
    
    return new Logger({
      logFile,
      colorOutput: process.stdout.isTTY,
      includeTimestamp: true
    })
  }
}

/**
 * Context logger that adds context to all log messages
 */
class ContextLogger extends Logger {
  private parentLogger: Logger
  private context: string

  constructor(parentLogger: Logger, context: string) {
    super(parentLogger['options'])
    this.parentLogger = parentLogger
    this.context = context
  }

  debug(message: string, data?: any): void {
    this.parentLogger.debug(`[${this.context}] ${message}`, data)
  }

  info(message: string, data?: any): void {
    this.parentLogger.info(`[${this.context}] ${message}`, data)
  }

  warn(message: string, data?: any): void {
    this.parentLogger.warn(`[${this.context}] ${message}`, data)
  }

  error(message: string, data?: any): void {
    this.parentLogger.error(`[${this.context}] ${message}`, data)
  }

  success(message: string, data?: any): void {
    this.parentLogger.success(`[${this.context}] ${message}`, data)
  }
}

/**
 * Performance logger for timing operations
 */
export class PerformanceLogger {
  private logger: Logger
  private timers: Map<string, number> = new Map()

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): void {
    this.timers.set(name, Date.now())
    this.logger.debug(`Timer started: ${name}`)
  }

  /**
   * End timing and log duration
   */
  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      this.logger.warn(`Timer not found: ${name}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(name)
    
    this.logger.debug(`Timer ended: ${name} (${duration}ms)`)
    return duration
  }

  /**
   * Log operation timing
   */
  async time<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    try {
      const result = await operation()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }
}