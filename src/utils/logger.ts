import type { Logger, LogLevel, LogEntry, LoggerOptions } from '../types';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  silent: '',
};

const RESET = '\x1b[0m';

let globalLogLevel: LogLevel = 'info';
let globalEnabled = true;

export function setGlobalLogLevel(level: LogLevel): void {
  globalLogLevel = level;
}

export function setGlobalLogging(enabled: boolean): void {
  globalEnabled = enabled;
}

export function createLogger(context?: string, options?: Partial<LoggerOptions>): Logger {
  const loggerContext = context ?? 'harbor';
  const loggerOptions: LoggerOptions = {
    level: options?.level ?? globalLogLevel,
    format: options?.format ?? 'text',
    output: options?.output ?? 'console',
    colorize: options?.colorize ?? true,
    prefix: options?.prefix,
    filePath: options?.filePath,
  };

  function shouldLog(level: LogLevel): boolean {
    if (!globalEnabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[loggerOptions.level];
  }

  function formatEntry(entry: LogEntry): string {
    if (loggerOptions.format === 'json') {
      return JSON.stringify({
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        context: entry.context,
        message: entry.message,
        data: entry.data,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        } : undefined,
      });
    }

    const timestamp = entry.timestamp.toISOString();
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? `[${entry.context}]` : '';
    
    let message = `${timestamp} ${levelStr} ${contextStr} ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      message += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      message += `\n${entry.error.stack ?? entry.error.message}`;
    }

    if (loggerOptions.colorize) {
      const color = LOG_COLORS[entry.level];
      message = `${color}${message}${RESET}`;
    }

    return message;
  }

  function log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: loggerContext,
      data,
      error,
    };

    const formatted = formatEntry(entry);

    if (loggerOptions.output === 'console' || loggerOptions.output === 'both') {
      switch (level) {
        case 'debug':
        case 'info':
          console.log(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    }
  }

  const logger: Logger = {
    debug(message: string, data?: Record<string, unknown>): void {
      log('debug', message, data);
    },

    info(message: string, data?: Record<string, unknown>): void {
      log('info', message, data);
    },

    warn(message: string, data?: Record<string, unknown>): void {
      log('warn', message, data);
    },

    error(message: string, error?: Error, data?: Record<string, unknown>): void {
      log('error', message, data, error);
    },

    setLevel(level: LogLevel): void {
      loggerOptions.level = level;
    },

    setContext(newContext: string): Logger {
      return createLogger(newContext, loggerOptions);
    },

    child(childContext: string): Logger {
      const fullContext = loggerContext ? `${loggerContext}:${childContext}` : childContext;
      return createLogger(fullContext, loggerOptions);
    },
  };

  return logger;
}

