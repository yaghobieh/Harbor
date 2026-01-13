// Database Types - Mongoose-compatible type definitions

export type SchemaType = 
  | 'String' 
  | 'Number' 
  | 'Boolean' 
  | 'Date' 
  | 'ObjectId' 
  | 'Array' 
  | 'Object' 
  | 'Mixed' 
  | 'Buffer'
  | 'Decimal128'
  | 'Map'
  | 'UUID';

export interface SchemaFieldDefinition {
  type: SchemaType | SchemaFieldDefinition | SchemaFieldDefinition[];
  required?: boolean;
  default?: unknown | (() => unknown);
  unique?: boolean;
  index?: boolean;
  sparse?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number | Date;
  max?: number | Date;
  enum?: unknown[];
  match?: RegExp;
  ref?: string;
  validate?: {
    validator: (value: unknown) => boolean | Promise<boolean>;
    message?: string;
  };
  get?: (value: unknown) => unknown;
  set?: (value: unknown) => unknown;
  alias?: string;
  immutable?: boolean;
  select?: boolean;
}

export type SchemaDefinition = Record<string, SchemaType | SchemaFieldDefinition>;

export interface SchemaOptions {
  timestamps?: boolean | { createdAt?: string | boolean; updatedAt?: string | boolean };
  collection?: string;
  strict?: boolean;
  strictQuery?: boolean;
  _id?: boolean;
  id?: boolean;
  versionKey?: string | boolean;
  autoIndex?: boolean;
  autoCreate?: boolean;
  minimize?: boolean;
  toJSON?: { virtuals?: boolean; getters?: boolean };
  toObject?: { virtuals?: boolean; getters?: boolean };
}

export interface MiddlewareFunction<T = unknown> {
  (this: T, next: () => void): void | Promise<void>;
}

export interface QueryMiddlewareFunction<T = unknown> {
  (this: T, next: () => void): void | Promise<void>;
}

export interface VirtualDefinition {
  get?: () => unknown;
  set?: (value: unknown) => void;
}

export interface QueryOptions {
  lean?: boolean;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
  select?: string | Record<string, 0 | 1>;
  sort?: string | Record<string, 1 | -1 | 'asc' | 'desc'>;
  limit?: number;
  skip?: number;
  projection?: Record<string, 0 | 1>;
  session?: unknown;
  new?: boolean;
  upsert?: boolean;
  runValidators?: boolean;
}

export interface PopulateOptions {
  path: string;
  select?: string;
  model?: string;
  match?: Record<string, unknown>;
  options?: QueryOptions;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface UpdateResult {
  acknowledged: boolean;
  modifiedCount: number;
  matchedCount: number;
  upsertedCount?: number;
  upsertedId?: string;
}

export interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

export interface InsertManyResult<T> {
  acknowledged: boolean;
  insertedCount: number;
  insertedIds: Record<number, string>;
  ops: T[];
}

export interface AggregateOptions {
  allowDiskUse?: boolean;
  maxTimeMS?: number;
  readPreference?: string;
  hint?: Record<string, 1 | -1> | string;
  session?: unknown;
}

export interface IndexDefinition {
  [key: string]: 1 | -1 | 'text' | '2dsphere' | '2d' | 'hashed';
}

export interface IndexOptions {
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
  expireAfterSeconds?: number;
  name?: string;
  partialFilterExpression?: Record<string, unknown>;
}

export interface ConnectionOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  maxPoolSize?: number;
  minPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  family?: 4 | 6;
  authSource?: string;
  authMechanism?: string;
  replicaSet?: string;
  ssl?: boolean;
  tls?: boolean;
  tlsCAFile?: string;
  tlsCertificateKeyFile?: string;
  retryWrites?: boolean;
  w?: number | 'majority';
  wtimeoutMS?: number;
  journal?: boolean;
  appName?: string;
  compressors?: string[];
  directConnection?: boolean;
}

export interface ConnectionState {
  connected: boolean;
  readyState: 0 | 1 | 2 | 3; // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  host?: string;
  port?: number;
  name?: string;
}

export type HookType = 'save' | 'validate' | 'remove' | 'updateOne' | 'deleteOne' | 'deleteMany' | 'findOneAndUpdate' | 'findOneAndDelete' | 'init';
export type QueryHookType = 'find' | 'findOne' | 'findOneAndUpdate' | 'findOneAndDelete' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany' | 'countDocuments' | 'estimatedDocumentCount';

export interface Document {
  _id: string;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
  save(): Promise<this>;
  remove(): Promise<this>;
  deleteOne(): Promise<DeleteResult>;
  updateOne(update: Record<string, unknown>): Promise<UpdateResult>;
  toJSON(): Record<string, unknown>;
  toObject(): Record<string, unknown>;
  populate(path: string | PopulateOptions): Promise<this>;
  isModified(path?: string): boolean;
  isNew: boolean;
  id: string;
}

export interface ModelStatic<T extends Document = Document> {
  new (doc?: Partial<T>): T;
  modelName: string;
  collection: { name: string };
  schema: unknown;
  
  // Query methods
  find(filter?: Record<string, unknown>, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T[]>;
  findOne(filter?: Record<string, unknown>, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T | null>;
  findById(id: string, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T | null>;
  
  // Create methods
  create(doc: Partial<T> | Partial<T>[]): Promise<T | T[]>;
  insertMany(docs: Partial<T>[], options?: { ordered?: boolean }): Promise<InsertManyResult<T>>;
  
  // Update methods
  updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Promise<UpdateResult>;
  updateMany(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Promise<UpdateResult>;
  findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Query<T | null>;
  findByIdAndUpdate(id: string, update: Record<string, unknown>, options?: QueryOptions): Query<T | null>;
  replaceOne(filter: Record<string, unknown>, replacement: Partial<T>, options?: QueryOptions): Promise<UpdateResult>;
  
  // Delete methods
  deleteOne(filter: Record<string, unknown>): Promise<DeleteResult>;
  deleteMany(filter: Record<string, unknown>): Promise<DeleteResult>;
  findOneAndDelete(filter: Record<string, unknown>, options?: QueryOptions): Query<T | null>;
  findByIdAndDelete(id: string, options?: QueryOptions): Query<T | null>;
  
  // Count methods
  countDocuments(filter?: Record<string, unknown>): Promise<number>;
  estimatedDocumentCount(): Promise<number>;
  
  // Aggregate
  aggregate<R = unknown>(pipeline: Record<string, unknown>[], options?: AggregateOptions): Promise<R[]>;
  
  // Distinct
  distinct(field: string, filter?: Record<string, unknown>): Promise<unknown[]>;
  
  // Exists
  exists(filter: Record<string, unknown>): Promise<{ _id: string } | null>;
  
  // Bulk operations
  bulkWrite(operations: BulkWriteOperation<T>[]): Promise<BulkWriteResult>;
  
  // Index methods
  createIndex(fields: IndexDefinition, options?: IndexOptions): Promise<string>;
  createIndexes(indexes: Array<{ fields: IndexDefinition; options?: IndexOptions }>): Promise<string[]>;
  listIndexes(): Promise<unknown[]>;
  dropIndex(indexName: string): Promise<void>;
  
  // Populate
  populate<P extends T>(docs: P | P[], options: PopulateOptions | PopulateOptions[]): Promise<P | P[]>;
  
  // Watch (change streams)
  watch(pipeline?: Record<string, unknown>[], options?: { fullDocument?: 'default' | 'updateLookup' }): unknown;
}

export interface Query<T> extends Promise<T> {
  select(fields: string | Record<string, 0 | 1>): Query<T>;
  sort(fields: string | Record<string, 1 | -1>): Query<T>;
  limit(n: number): Query<T>;
  skip(n: number): Query<T>;
  lean(): Query<T>;
  populate(path: string | PopulateOptions | PopulateOptions[]): Query<T>;
  where(path: string, value?: unknown): Query<T>;
  equals(value: unknown): Query<T>;
  gt(value: unknown): Query<T>;
  gte(value: unknown): Query<T>;
  lt(value: unknown): Query<T>;
  lte(value: unknown): Query<T>;
  in(values: unknown[]): Query<T>;
  nin(values: unknown[]): Query<T>;
  ne(value: unknown): Query<T>;
  regex(pattern: RegExp | string): Query<T>;
  exists(value?: boolean): Query<T>;
  or(conditions: Record<string, unknown>[]): Query<T>;
  and(conditions: Record<string, unknown>[]): Query<T>;
  nor(conditions: Record<string, unknown>[]): Query<T>;
  exec(): Promise<T>;
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2>;
}

export interface BulkWriteOperation<T> {
  insertOne?: { document: Partial<T> };
  updateOne?: { filter: Record<string, unknown>; update: Record<string, unknown>; upsert?: boolean };
  updateMany?: { filter: Record<string, unknown>; update: Record<string, unknown>; upsert?: boolean };
  deleteOne?: { filter: Record<string, unknown> };
  deleteMany?: { filter: Record<string, unknown> };
  replaceOne?: { filter: Record<string, unknown>; replacement: Partial<T>; upsert?: boolean };
}

export interface BulkWriteResult {
  ok: number;
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
  upsertedCount: number;
  insertedIds: Record<number, string>;
  upsertedIds: Record<number, string>;
}

