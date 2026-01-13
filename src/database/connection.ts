// Harbor Database Connection - Mongoose-compatible connection management
import { EventEmitter } from 'events';
import type { ConnectionOptions, ConnectionState } from './types';
import { t } from '../i18n';

type EventCallback = (...args: unknown[]) => void;

class HarborConnection extends EventEmitter {
  private _state: ConnectionState = {
    connected: false,
    readyState: 0,
  };
  private _uri: string = '';
  private _options: ConnectionOptions = {};
  private _mongoClient: unknown = null;
  private _db: unknown = null;
  private _models: Map<string, unknown> = new Map();

  get readyState(): number {
    return this._state.readyState;
  }

  get host(): string | undefined {
    return this._state.host;
  }

  get port(): number | undefined {
    return this._state.port;
  }

  get name(): string | undefined {
    return this._state.name;
  }

  get db(): unknown {
    return this._db;
  }

  get client(): unknown {
    return this._mongoClient;
  }

  get models(): Map<string, unknown> {
    return this._models;
  }

  async connect(uri: string, options?: ConnectionOptions): Promise<this> {
    if (this._state.readyState === 1) {
      console.warn('[Harbor] Already connected to MongoDB');
      return this;
    }

    this._uri = uri;
    this._options = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      ...options,
    };

    this._state.readyState = 2; // connecting
    this.emit('connecting');

    try {
      // Dynamic import of mongodb driver
      const { MongoClient } = await import('mongodb');
      
      this._mongoClient = new MongoClient(uri, this._options as any);
      await (this._mongoClient as any).connect();
      
      // Parse URI to get database name
      const urlObj = new URL(uri);
      const dbName = urlObj.pathname.slice(1) || 'test';
      
      this._db = (this._mongoClient as any).db(dbName);
      
      this._state = {
        connected: true,
        readyState: 1,
        host: urlObj.hostname,
        port: parseInt(urlObj.port) || 27017,
        name: dbName,
      };

      this.emit('connected');
      this.emit('open');
      
      console.log(`[Harbor] ${t('database.connected', { uri: `${urlObj.hostname}:${urlObj.port}/${dbName}` })}`);
      
      return this;
    } catch (error) {
      this._state.readyState = 0;
      this.emit('error', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this._state.readyState === 0) {
      console.warn('[Harbor] Already disconnected from MongoDB');
      return;
    }

    this._state.readyState = 3; // disconnecting
    this.emit('disconnecting');

    try {
      if (this._mongoClient) {
        await (this._mongoClient as any).close();
      }
      
      this._state = {
        connected: false,
        readyState: 0,
      };
      
      this._mongoClient = null;
      this._db = null;
      
      this.emit('disconnected');
      this.emit('close');
      
      console.log(`[Harbor] ${t('database.disconnected')}`);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    return this.disconnect();
  }

  async ping(): Promise<boolean> {
    if (!this._db) {
      return false;
    }
    
    try {
      await (this._db as any).command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  collection(name: string): unknown {
    if (!this._db) {
      throw new Error('[Harbor] Not connected to database');
    }
    return (this._db as any).collection(name);
  }

  async createCollection(name: string, options?: Record<string, unknown>): Promise<unknown> {
    if (!this._db) {
      throw new Error('[Harbor] Not connected to database');
    }
    return (this._db as any).createCollection(name, options);
  }

  async dropCollection(name: string): Promise<boolean> {
    if (!this._db) {
      throw new Error('[Harbor] Not connected to database');
    }
    return (this._db as any).dropCollection(name);
  }

  async listCollections(): Promise<string[]> {
    if (!this._db) {
      throw new Error('[Harbor] Not connected to database');
    }
    const collections = await (this._db as any).listCollections().toArray();
    return collections.map((c: { name: string }) => c.name);
  }

  async dropDatabase(): Promise<boolean> {
    if (!this._db) {
      throw new Error('[Harbor] Not connected to database');
    }
    return (this._db as any).dropDatabase();
  }

  // Transaction support
  async startSession(): Promise<unknown> {
    if (!this._mongoClient) {
      throw new Error('[Harbor] Not connected to database');
    }
    return (this._mongoClient as any).startSession();
  }

  async withTransaction<T>(
    fn: (session: unknown) => Promise<T>,
    options?: Record<string, unknown>
  ): Promise<T> {
    const session = await this.startSession();
    try {
      let result: T;
      await (session as any).withTransaction(async () => {
        result = await fn(session);
      }, options);
      return result!;
    } finally {
      await (session as any).endSession();
    }
  }

  // Event handlers with proper typing
  on(event: 'connected' | 'disconnected' | 'error' | 'connecting' | 'disconnecting' | 'open' | 'close', listener: EventCallback): this {
    return super.on(event, listener);
  }

  once(event: 'connected' | 'disconnected' | 'error' | 'connecting' | 'disconnecting' | 'open' | 'close', listener: EventCallback): this {
    return super.once(event, listener);
  }
}

// Singleton connection instance
export const connection = new HarborConnection();

// Connect function
export async function connect(uri: string, options?: ConnectionOptions): Promise<HarborConnection> {
  return connection.connect(uri, options);
}

// Disconnect function
export async function disconnect(): Promise<void> {
  return connection.disconnect();
}

// Export types
export { HarborConnection };
export type { ConnectionOptions, ConnectionState };

