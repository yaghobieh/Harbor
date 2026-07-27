import type { CacheStore, CacheEntry } from './types';

export class MemoryCache implements CacheStore {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expires && entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) {
        this.cache.delete(oldest);
      }
    }

    const entry: CacheEntry = {
      value,
      expires: ttl ? Date.now() + ttl : 0,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }
}

export class RedisCache implements CacheStore {
  private client: any;
  private prefix: string;
  private defaultTtl: number;

  constructor(client: any, prefix = 'cache:', defaultTtl = 3600) {
    this.client = client;
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(this.prefix + key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return data as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    const expiry = ttl || this.defaultTtl;
    
    await this.client.setex(this.prefix + key, Math.ceil(expiry / 1000), data);
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = await this.client.keys(this.prefix + '*');
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.client.exists(this.prefix + key)) === 1;
  }

  async keys(): Promise<string[]> {
    const keys = await this.client.keys(this.prefix + '*');
    return keys.map((k: string) => k.slice(this.prefix.length));
  }

  async size(): Promise<number> {
    const keys = await this.client.keys(this.prefix + '*');
    return keys.length;
  }
}

