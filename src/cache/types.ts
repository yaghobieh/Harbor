export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  keyGenerator?: (req: unknown) => string;
  shouldCache?: (req: unknown, res: unknown) => boolean;
  onHit?: (key: string) => void;
  onMiss?: (key: string) => void;
}

export interface CacheEntry<T = unknown> {
  value: T;
  expires: number;
  createdAt: number;
}

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

