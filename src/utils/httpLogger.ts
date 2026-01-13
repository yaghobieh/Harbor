import type { RequestHandler, Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';
import { t } from '../i18n';

const logger = createLogger('http');

export type HttpLogFormat = 'tiny' | 'short' | 'dev' | 'combined' | 'common' | 'custom';

export interface HttpLoggerOptions {
  format?: HttpLogFormat;
  skip?: (req: Request, res: Response) => boolean;
  immediate?: boolean;
  customFormat?: (tokens: HttpLogTokens) => string;
  colorize?: boolean;
}

export interface HttpLogTokens {
  method: string;
  url: string;
  status: number;
  statusColor: string;
  responseTime: number;
  contentLength: string;
  remoteAddr: string;
  date: string;
  httpVersion: string;
  userAgent: string;
  referrer: string;
}

const STATUS_COLORS = {
  info: '\x1b[36m',    // Cyan for 1xx
  success: '\x1b[32m', // Green for 2xx
  redirect: '\x1b[36m',// Cyan for 3xx
  clientError: '\x1b[33m', // Yellow for 4xx
  serverError: '\x1b[31m', // Red for 5xx
  reset: '\x1b[0m',
};

function getStatusColor(status: number): string {
  if (status >= 500) return STATUS_COLORS.serverError;
  if (status >= 400) return STATUS_COLORS.clientError;
  if (status >= 300) return STATUS_COLORS.redirect;
  if (status >= 200) return STATUS_COLORS.success;
  return STATUS_COLORS.info;
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: '\x1b[32m',    // Green
    POST: '\x1b[34m',   // Blue
    PUT: '\x1b[33m',    // Yellow
    PATCH: '\x1b[35m',  // Magenta
    DELETE: '\x1b[31m', // Red
    OPTIONS: '\x1b[36m',// Cyan
    HEAD: '\x1b[36m',   // Cyan
  };
  return colors[method] ?? '\x1b[0m';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getTokens(req: Request, res: Response, startTime: number): HttpLogTokens {
  const responseTime = Date.now() - startTime;
  const status = res.statusCode;
  const contentLength = res.get('content-length') ?? '0';

  return {
    method: req.method,
    url: req.originalUrl || req.url,
    status,
    statusColor: getStatusColor(status),
    responseTime,
    contentLength: formatBytes(parseInt(contentLength, 10) || 0),
    remoteAddr: req.ip || req.socket.remoteAddress || '-',
    date: new Date().toISOString(),
    httpVersion: `HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}`,
    userAgent: req.get('user-agent') ?? '-',
    referrer: req.get('referrer') ?? '-',
  };
}

// Format presets (like Morgan)
const FORMATS: Record<HttpLogFormat, (tokens: HttpLogTokens, colorize: boolean) => string> = {
  tiny: (t, c) => {
    const method = c ? `${getMethodColor(t.method)}${t.method}${STATUS_COLORS.reset}` : t.method;
    const status = c ? `${t.statusColor}${t.status}${STATUS_COLORS.reset}` : String(t.status);
    return `${method} ${t.url} ${status} ${t.responseTime}ms`;
  },

  short: (t, c) => {
    const method = c ? `${getMethodColor(t.method)}${t.method}${STATUS_COLORS.reset}` : t.method;
    const status = c ? `${t.statusColor}${t.status}${STATUS_COLORS.reset}` : String(t.status);
    return `${t.remoteAddr} ${method} ${t.url} ${status} ${t.responseTime}ms - ${t.contentLength}`;
  },

  dev: (t, c) => {
    const method = c ? `${getMethodColor(t.method)}${t.method.padEnd(7)}${STATUS_COLORS.reset}` : t.method.padEnd(7);
    const status = c ? `${t.statusColor}${t.status}${STATUS_COLORS.reset}` : String(t.status);
    const time = t.responseTime < 100 
      ? `${t.responseTime}ms` 
      : t.responseTime < 1000 
        ? `\x1b[33m${t.responseTime}ms${STATUS_COLORS.reset}`
        : `\x1b[31m${t.responseTime}ms${STATUS_COLORS.reset}`;
    return `${method} ${t.url} ${status} ${c ? time : `${t.responseTime}ms`} - ${t.contentLength}`;
  },

  combined: (t) => {
    return `${t.remoteAddr} - - [${t.date}] "${t.method} ${t.url} ${t.httpVersion}" ${t.status} ${t.contentLength} "${t.referrer}" "${t.userAgent}"`;
  },

  common: (t) => {
    return `${t.remoteAddr} - - [${t.date}] "${t.method} ${t.url} ${t.httpVersion}" ${t.status} ${t.contentLength}`;
  },

  custom: () => '', // Handled separately
};

/**
 * Create an HTTP request logger middleware (Morgan-like)
 */
export function httpLogger(options: HttpLoggerOptions = {}): RequestHandler {
  const {
    format = 'dev',
    skip,
    immediate = false,
    customFormat,
    colorize = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Log immediately if configured
    if (immediate) {
      logger.info(t('http.requestStart', { method: req.method, url: req.url }));
    }

    // Store original end function
    const originalEnd = res.end;

    // Override end to log after response
    res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
      res.end = originalEnd;
      const result = res.end(chunk, encoding, callback);

      // Skip logging if skip function returns true
      if (skip && skip(req, res)) {
        return result;
      }

      // Get tokens
      const tokens = getTokens(req, res, startTime);

      // Format log message
      let message: string;
      if (format === 'custom' && customFormat) {
        message = customFormat(tokens);
      } else {
        message = FORMATS[format](tokens, colorize);
      }

      // Log based on status code
      if (tokens.status >= 500) {
        logger.error(message);
      } else if (tokens.status >= 400) {
        logger.warn(message);
      } else {
        logger.info(message);
      }

      return result;
    };

    next();
  };
}

/**
 * Predefined skip functions
 */
export const skipFunctions = {
  /** Skip successful responses */
  successOnly: (req: Request, res: Response): boolean => res.statusCode < 400,
  
  /** Skip health check endpoints */
  healthChecks: (req: Request): boolean => 
    req.url === '/health' || req.url === '/healthz' || req.url === '/ready',
  
  /** Skip static files */
  staticFiles: (req: Request): boolean => 
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.url),
  
  /** Skip based on custom paths */
  paths: (paths: string[]) => (req: Request): boolean => 
    paths.some(p => req.url.startsWith(p)),
};

/**
 * Create a custom format function
 */
export function createCustomFormat(
  formatFn: (tokens: HttpLogTokens) => string
): (tokens: HttpLogTokens) => string {
  return formatFn;
}

// Export default formats for reference
export const formats = {
  tiny: ':method :url :status :response-time ms',
  short: ':remote-addr :method :url :status :response-time ms - :content-length',
  dev: ':method :url :status :response-time ms - :content-length',
  combined: ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"',
  common: ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :content-length',
};

