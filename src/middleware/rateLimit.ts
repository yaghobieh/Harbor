// Rate Limiting Middleware for Harbor
import { RequestHandler } from 'express';
import { createLogger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';

const logger = createLogger('rate-limit');

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
  onLimitReached?: (req: any, res: any) => void;
  headers?: boolean;
  store?: RateLimitStore;
}

export interface RateLimitStore {
  increment(key: string): Promise<RateLimitInfo>;
  decrement(key: string): Promise<void>;
  resetKey(key: string): Promise<void>;
  get(key: string): Promise<RateLimitInfo | null>;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store (default)
class MemoryStore implements RateLimitStore {
  private hits: Map<string, RateLimitInfo> = new Map();
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), windowMs);
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const now = Date.now();
    const existing = this.hits.get(key);

    if (existing && existing.resetTime > now) {
      existing.count++;
      return existing;
    }

    const info: RateLimitInfo = {
      count: 1,
      resetTime: now + this.windowMs,
    };
    this.hits.set(key, info);
    return info;
  }

  async decrement(key: string): Promise<void> {
    const existing = this.hits.get(key);
    if (existing && existing.count > 0) {
      existing.count--;
    }
  }

  async resetKey(key: string): Promise<void> {
    this.hits.delete(key);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    return this.hits.get(key) || null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.hits.entries()) {
      if (info.resetTime <= now) {
        this.hits.delete(key);
      }
    }
  }
}

// Redis store for distributed rate limiting
export class RedisStore implements RateLimitStore {
  private client: any;
  private windowMs: number;
  private prefix: string;

  constructor(client: any, windowMs: number, prefix = 'rl:') {
    this.client = client;
    this.windowMs = windowMs;
    this.prefix = prefix;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const redisKey = this.prefix + key;
    const multi = this.client.multi();
    
    multi.incr(redisKey);
    multi.pttl(redisKey);
    
    const results = await multi.exec();
    const count = results[0][1];
    let ttl = results[1][1];

    if (ttl === -1) {
      await this.client.pexpire(redisKey, this.windowMs);
      ttl = this.windowMs;
    }

    return {
      count,
      resetTime: Date.now() + ttl,
    };
  }

  async decrement(key: string): Promise<void> {
    await this.client.decr(this.prefix + key);
  }

  async resetKey(key: string): Promise<void> {
    await this.client.del(this.prefix + key);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const redisKey = this.prefix + key;
    const [count, ttl] = await Promise.all([
      this.client.get(redisKey),
      this.client.pttl(redisKey),
    ]);

    if (count === null) return null;

    return {
      count: parseInt(count, 10),
      resetTime: Date.now() + Math.max(ttl, 0),
    };
  }
}

/**
 * Create a rate limiting middleware
 * 
 * @example
 * // Basic usage - 100 requests per 15 minutes
 * app.use(rateLimit({ max: 100 }));
 * 
 * // Per-route rate limiting
 * app.post('/api/login', rateLimit({ max: 5, windowMs: 60000 }), loginHandler);
 * 
 * // With Redis for distributed systems
 * app.use(rateLimit({ store: new RedisStore(redisClient, 900000) }));
 */
export function rateLimit(options: RateLimitOptions = {}): RequestHandler {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later.',
    statusCode = HTTP_STATUS.TOO_MANY_REQUESTS,
    keyGenerator = (req) => req.ip || req.connection?.remoteAddress || 'unknown',
    skip = () => false,
    onLimitReached,
    headers = true,
    store = new MemoryStore(windowMs),
  } = options;

  return async (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);

    try {
      const info = await store.increment(key);
      const remaining = Math.max(0, max - info.count);

      if (headers) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000));
      }

      if (info.count > max) {
        logger.warn(`Rate limit exceeded for ${key}`);
        onLimitReached?.(req, res);

        if (headers) {
          res.setHeader('Retry-After', Math.ceil((info.resetTime - Date.now()) / 1000));
        }

        return res.status(statusCode).json({
          success: false,
          error: {
            message,
            retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
          },
        });
      }

      next();
    } catch (err) {
      const error = err as Error;
      logger.error(`Rate limit error: ${error.message}`);
      next(error);
    }
  };
}

/**
 * Sliding window rate limiter for more accurate limiting
 */
export function slidingWindowRateLimit(options: RateLimitOptions = {}): RequestHandler {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    statusCode = HTTP_STATUS.TOO_MANY_REQUESTS,
    keyGenerator = (req) => req.ip || 'unknown',
    skip = () => false,
    headers = true,
  } = options;

  const requests: Map<string, number[]> = new Map();

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request timestamps array
    let timestamps = requests.get(key) || [];
    
    // Filter out old requests
    timestamps = timestamps.filter((t) => t > windowStart);
    
    // Add current request
    timestamps.push(now);
    requests.set(key, timestamps);

    const remaining = Math.max(0, max - timestamps.length);

    if (headers) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
    }

    if (timestamps.length > max) {
      logger.warn(`Sliding window rate limit exceeded for ${key}`);
      
      return res.status(statusCode).json({
        success: false,
        error: {
          message,
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    }

    next();
  };
}

