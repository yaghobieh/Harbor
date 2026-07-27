import { RequestHandler } from 'express';
import { createLogger } from '../utils/logger';
import { MemoryCache } from './stores';
import type { CacheStore, CacheOptions } from './types';

const logger = createLogger('cache');

export class CacheManager {
  private store: CacheStore;
  private defaultTtl: number;

  constructor(store: CacheStore = new MemoryCache(), defaultTtl = 3600000) {
    this.store = store;
    this.defaultTtl = defaultTtl;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.store.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.store.set(key, value, ttl || this.defaultTtl);
  }

  async del(key: string): Promise<void> {
    return this.store.del(key);
  }

  async getOrSet<T>(key: string, factory: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async wrap<T>(key: string, fn: () => T | Promise<T>, ttl?: number): Promise<T> {
    return this.getOrSet(key, fn, ttl);
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.store.keys();
    const matching = keys.filter((k) => new RegExp(pattern).test(k));
    await Promise.all(matching.map((k) => this.store.del(k)));
  }

  async clear(): Promise<void> {
    return this.store.clear();
  }

  async stats(): Promise<{ size: number; keys: string[] }> {
    return {
      size: await this.store.size(),
      keys: await this.store.keys(),
    };
  }
}

export const cache = new CacheManager();

export function cacheResponse(options: CacheOptions = {}): RequestHandler {
  const {
    ttl = 60000,
    keyGenerator = (req: any) => `${req.method}:${req.originalUrl}`,
    shouldCache = (req: any, res: any) => req.method === 'GET' && res.statusCode === 200,
    onHit,
    onMiss,
  } = options;

  return async (req, res, next) => {
    const key = keyGenerator(req);

    const cached = await cache.get<{ body: any; headers: Record<string, string> }>(key);
    
    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      onHit?.(key);
      
      Object.entries(cached.headers).forEach(([k, v]) => {
        res.setHeader(k, v);
      });
      res.setHeader('X-Cache', 'HIT');
      
      return res.json(cached.body);
    }

    logger.debug(`Cache miss: ${key}`);
    onMiss?.(key);

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (shouldCache(req, res)) {
        const headers: Record<string, string> = {};
        res.getHeaderNames().forEach((name) => {
          const value = res.getHeader(name);
          if (value) {
            headers[name] = String(value);
          }
        });

        cache.set(key, { body, headers }, ttl).catch((err) => {
          logger.error(`Failed to cache response: ${err}`);
        });
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return cache.getOrSet(key, () => fn(...args), ttl);
  }) as T;
}

export function createCache(store?: CacheStore, defaultTtl?: number): CacheManager {
  return new CacheManager(store, defaultTtl);
}

