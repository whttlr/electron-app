import { LogEntry, LogLevel, LoggerConfig, Logger } from './LoggerTypes';

class LoggerService implements Logger {
  private entries: LogEntry[] = [];
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxEntries: 1000,
      showTimestamps: true,
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'log', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      data,
      source: 'jog-controls'
    };
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const timestamp = this.config.showTimestamps 
      ? `[${entry.timestamp.toISOString()}] ` 
      : '';
    
    const logMessage = `${timestamp}${entry.message}`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.data || '');
        break;
      case 'info':
        console.info(logMessage, entry.data || '');
        break;
      case 'log':
        console.log(logMessage, entry.data || '');
        break;
      case 'warn':
        console.warn(logMessage, entry.data || '');
        break;
      case 'error':
        console.error(logMessage, entry.data || '');
        break;
    }
  }

  private storeEntry(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.entries.push(entry);
    
    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  private logMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, data);
    this.writeToConsole(entry);
    this.storeEntry(entry);
  }

  debug(message: string, data?: any): void {
    this.logMessage('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.logMessage('info', message, data);
  }

  log(message: string, data?: any): void {
    this.logMessage('log', message, data);
  }

  warn(message: string, data?: any): void {
    this.logMessage('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.logMessage('error', message, data);
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export singleton instance
export const logger = new LoggerService();

// Export individual logging functions for convenience
export const { debug, info, log, warn, error } = logger;