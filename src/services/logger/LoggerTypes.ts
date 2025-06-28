export type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  source?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxEntries: number;
  showTimestamps: boolean;
}

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  log(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  getEntries(): LogEntry[];
  clear(): void;
}