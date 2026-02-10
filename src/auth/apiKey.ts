import { RequestHandler } from 'express';
import { randomBytes } from 'crypto';
import { createLogger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';
import type { ApiKeyOptions } from './types';

const logger = createLogger('auth');

export function apiKeyAuth(options: ApiKeyOptions): RequestHandler {
  const { header = 'X-API-Key', query = 'api_key', validator } = options;

  return async (req, res, next) => {
    const key = req.get(header) || req.query[query] as string;

    if (!key) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'API key required' },
      });
    }

    try {
      const result = await validator(key);
      
      if (result === false) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: 'Invalid API key' },
        });
      }

      if (typeof result === 'object') {
        if (!result.valid) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: { message: 'Invalid API key' },
          });
        }
        (req as any).apiKey = result.data;
      }

      next();
    } catch (err) {
      const error = err as Error;
      logger.error(`API key validation error: ${error.message}`);
      next(error);
    }
  };
}

export function generateApiKey(length = 32): string {
  return randomBytes(length).toString('hex');
}

