export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, data?: Record<string, unknown>) => void;
  setLevel: (level: LogLevel) => void;
  setContext: (context: string) => Logger;
  child: (context: string) => Logger;
}

export interface LoggerOptions {
  level: LogLevel;
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
  prefix?: string;
  colorize?: boolean;
}

export interface LogFormatter {
  format: (entry: LogEntry) => string;
}

export interface LogTransport {
  log: (entry: LogEntry) => void;
  flush?: () => Promise<void>;
  close?: () => Promise<void>;
}

