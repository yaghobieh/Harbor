import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import type { HarborConfig, ErrorsConfig, ErrorHandler } from '../types';
import { HTTP_STATUS, HTTP_STATUS_MESSAGES } from '../constants';
import { createLogger } from '../utils/logger';

const logger = createLogger('error');

export class HarborError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    options?: {
      code?: string;
      details?: unknown;
      isOperational?: boolean;
    }
  ) {
    super(message);
    this.name = 'HarborError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
    this.isOperational = options?.isOperational ?? true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message?: string, details?: unknown): HarborError {
    return new HarborError(
      message ?? 'Bad Request',
      HTTP_STATUS.BAD_REQUEST,
      { code: 'BAD_REQUEST', details }
    );
  }

  static unauthorized(message?: string): HarborError {
    return new HarborError(
      message ?? 'Unauthorized',
      HTTP_STATUS.UNAUTHORIZED,
      { code: 'UNAUTHORIZED' }
    );
  }

  static forbidden(message?: string): HarborError {
    return new HarborError(
      message ?? 'Forbidden',
      HTTP_STATUS.FORBIDDEN,
      { code: 'FORBIDDEN' }
    );
  }

  static notFound(message?: string): HarborError {
    return new HarborError(
      message ?? 'Not Found',
      HTTP_STATUS.NOT_FOUND,
      { code: 'NOT_FOUND' }
    );
  }

  static conflict(message?: string, details?: unknown): HarborError {
    return new HarborError(
      message ?? 'Conflict',
      HTTP_STATUS.CONFLICT,
      { code: 'CONFLICT', details }
    );
  }

  static internal(message?: string): HarborError {
    return new HarborError(
      message ?? 'Internal Server Error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { code: 'INTERNAL_ERROR', isOperational: false }
    );
  }

  static tooManyRequests(message?: string): HarborError {
    return new HarborError(
      message ?? 'Too Many Requests',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      { code: 'RATE_LIMIT_EXCEEDED' }
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

export function createErrorHandler(config: HarborConfig): ErrorRequestHandler {
  const errorsConfig = config.errors;

  return (error: Error | HarborError, req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = (error as HarborError).statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const errorConfig = getErrorConfig(statusCode, errorsConfig);

    if (errorConfig?.log !== false && config.logger.enabled) {
      logger.error(`${req.method} ${req.path} - ${error.message}`, error);
    }

    if (res.headersSent) {
      return;
    }

    if (errorConfig?.redirect) {
      res.redirect(errorConfig.redirect);
      return;
    }

    const response = buildErrorResponse(error, statusCode, errorConfig);

    if (errorConfig?.json !== false) {
      res.status(statusCode).json(response);
    } else {
      res.status(statusCode).send(response.error.message);
    }
  };
}

function getErrorConfig(statusCode: number, errorsConfig: ErrorsConfig): ErrorHandler | undefined {
  const statusKey = statusCode.toString() as keyof ErrorsConfig;
  return errorsConfig[statusKey] ?? errorsConfig.default;
}

function buildErrorResponse(
  error: Error | HarborError,
  statusCode: number,
  errorConfig?: ErrorHandler
): { success: false; error: { message: string; code?: string; statusCode: number; details?: unknown } } {
  if (error instanceof HarborError) {
    return error.toJSON() as ReturnType<typeof buildErrorResponse>;
  }

  const message = errorConfig?.message ?? error.message ?? HTTP_STATUS_MESSAGES[statusCode] ?? 'An error occurred';

  return {
    success: false,
    error: {
      message,
      statusCode,
    },
  };
}

export function notFoundHandler(config: HarborConfig): ErrorRequestHandler {
  return (req: Request, res: Response, _next: NextFunction): void => {
    const errorConfig = config.errors[404];
    
    if (config.logger.enabled && errorConfig?.log) {
      logger.warn(`404 Not Found: ${req.method} ${req.path}`);
    }

    if (errorConfig?.redirect) {
      res.redirect(errorConfig.redirect);
      return;
    }

    const message = errorConfig?.message ?? 'Not Found';

    if (errorConfig?.json !== false) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message,
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        },
      });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send(message);
    }
  };
}

