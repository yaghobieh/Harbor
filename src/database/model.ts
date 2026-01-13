// Harbor Model - Mongoose-compatible model and query builder
import { Schema } from './schema';
import { connection } from './connection';
import type {
  QueryOptions,
  UpdateResult,
  DeleteResult,
  IndexDefinition,
  IndexOptions,
  AggregateOptions,
  PopulateOptions,
  BulkWriteOperation,
  BulkWriteResult,
} from './types';
import { ObjectId } from 'mongodb';

// Query builder class
export class Query<T> implements PromiseLike<T> {
  private _model: Model<any>;
  private _operation: 'find' | 'findOne' | 'findOneAndUpdate' | 'findOneAndDelete';
  private _filter: Record<string, unknown> = {};
  private _projection: Record<string, 0 | 1> | null = null;
  private _options: QueryOptions = {};
  private _update: Record<string, unknown> | null = null;
  private _currentPath: string | null = null;

  constructor(
    model: Model<any>,
    operation: 'find' | 'findOne' | 'findOneAndUpdate' | 'findOneAndDelete',
    filter?: Record<string, unknown>,
    update?: Record<string, unknown>
  ) {
    this._model = model;
    this._operation = operation;
    this._filter = filter || {};
    this._update = update || null;
  }

  select(fields: string | Record<string, 0 | 1>): Query<T> {
    if (typeof fields === 'string') {
      this._projection = {};
      for (const field of fields.split(' ')) {
        if (field.startsWith('-')) {
          (this._projection as any)[field.slice(1)] = 0;
        } else if (field) {
          (this._projection as any)[field] = 1;
        }
      }
    } else {
      this._projection = fields;
    }
    return this;
  }

  sort(fields: string | Record<string, 1 | -1>): Query<T> {
    if (typeof fields === 'string') {
      const sortObj: Record<string, 1 | -1> = {};
      for (const field of fields.split(' ')) {
        if (field.startsWith('-')) {
          sortObj[field.slice(1)] = -1;
        } else if (field) {
          sortObj[field] = 1;
        }
      }
      this._options.sort = sortObj;
    } else {
      this._options.sort = fields;
    }
    return this;
  }

  limit(n: number): Query<T> {
    this._options.limit = n;
    return this;
  }

  skip(n: number): Query<T> {
    this._options.skip = n;
    return this;
  }

  lean(): Query<T> {
    this._options.lean = true;
    return this;
  }

  populate(path: string | PopulateOptions | PopulateOptions[]): Query<T> {
    this._options.populate = path;
    return this;
  }

  where(path: string, value?: unknown): Query<T> {
    this._currentPath = path;
    if (value !== undefined) {
      this._filter[path] = value;
    }
    return this;
  }

  equals(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = value;
    }
    return this;
  }

  gt(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { ...this._filter[this._currentPath] as object, $gt: value };
    }
    return this;
  }

  gte(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { ...this._filter[this._currentPath] as object, $gte: value };
    }
    return this;
  }

  lt(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { ...this._filter[this._currentPath] as object, $lt: value };
    }
    return this;
  }

  lte(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { ...this._filter[this._currentPath] as object, $lte: value };
    }
    return this;
  }

  in(values: unknown[]): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { $in: values };
    }
    return this;
  }

  nin(values: unknown[]): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { $nin: values };
    }
    return this;
  }

  ne(value: unknown): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { $ne: value };
    }
    return this;
  }

  regex(pattern: RegExp | string): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { $regex: pattern };
    }
    return this;
  }

  exists(value: boolean = true): Query<T> {
    if (this._currentPath) {
      this._filter[this._currentPath] = { $exists: value };
    }
    return this;
  }

  or(conditions: Record<string, unknown>[]): Query<T> {
    this._filter.$or = conditions;
    return this;
  }

  and(conditions: Record<string, unknown>[]): Query<T> {
    this._filter.$and = conditions;
    return this;
  }

  nor(conditions: Record<string, unknown>[]): Query<T> {
    this._filter.$nor = conditions;
    return this;
  }

  async exec(): Promise<T> {
    const collection = this._model.getCollection();
    
    switch (this._operation) {
      case 'find': {
        let cursor = collection.find(this._filter, { projection: this._projection });
        if (this._options.sort) cursor = cursor.sort(this._options.sort as any);
        if (this._options.skip) cursor = cursor.skip(this._options.skip);
        if (this._options.limit) cursor = cursor.limit(this._options.limit);
        const docs = await cursor.toArray();
        
        if (this._options.lean) {
          return docs as T;
        }
        return docs.map((doc: any) => this._model.hydrate(doc)) as T;
      }
      
      case 'findOne': {
        const doc = await collection.findOne(this._filter, { projection: this._projection });
        if (!doc) return null as T;
        
        if (this._options.lean) {
          return doc as T;
        }
        return this._model.hydrate(doc) as T;
      }
      
      case 'findOneAndUpdate': {
        const result = await collection.findOneAndUpdate(
          this._filter,
          this._update,
          { 
            returnDocument: this._options.new ? 'after' : 'before',
            upsert: this._options.upsert,
            projection: this._projection,
          }
        );
        if (!result) return null as T;
        
        if (this._options.lean) {
          return result as T;
        }
        return this._model.hydrate(result) as T;
      }
      
      case 'findOneAndDelete': {
        const result = await collection.findOneAndDelete(this._filter, {
          projection: this._projection,
        });
        if (!result) return null as T;
        
        if (this._options.lean) {
          return result as T;
        }
        return this._model.hydrate(result) as T;
      }
      
      default:
        throw new Error(`Unknown operation: ${this._operation}`);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    return this.exec().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this.exec().finally(onfinally);
  }

  [Symbol.toStringTag] = 'Query';
}

// Document class
export class HarborDocument {
  [key: string]: unknown;
  
  _id: string;
  __v?: number;
  isNew: boolean = true;

  private _model: Model<any>;
  private _original: Record<string, unknown> = {};
  private _modified: Set<string> = new Set();

  constructor(model: Model<any>, doc?: Record<string, unknown>) {
    this._model = model;
    this._id = doc?._id?.toString() || new ObjectId().toString();
    
    if (doc) {
      for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') {
          this._id = value?.toString() || this._id;
        } else {
          (this as any)[key] = value;
        }
      }
      this._original = { ...doc };
      this.isNew = false;
    }

    // Apply defaults
    const schema = model.schema;
    for (const [path] of schema.paths()) {
      if ((this as any)[path] === undefined) {
        const defaultValue = schema.getDefault(path);
        if (defaultValue !== undefined) {
          (this as any)[path] = defaultValue;
        }
      }
    }

    // Apply virtuals
    for (const [name, virtual] of schema.getVirtuals()) {
      Object.defineProperty(this, name, {
        get: virtual.get,
        set: virtual.set,
        enumerable: true,
      });
    }

    // Apply instance methods
    for (const [name, method] of schema.getMethods()) {
      (this as any)[name] = method.bind(this);
    }
  }

  get id(): string {
    return this._id;
  }

  isModified(path?: string): boolean {
    if (!path) return this._modified.size > 0;
    return this._modified.has(path);
  }

  markModified(path: string): void {
    this._modified.add(path);
  }

  async save(): Promise<this> {
    const schema = this._model.schema;
    
    // Run pre save hooks
    await this._model.runPreHooks('save', this);

    // Validate
    const validation = await schema.validate(this.toObject());
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(', ')}`);
      (error as any).errors = validation.errors;
      throw error;
    }

    // Handle timestamps
    const now = new Date();
    if (schema.options.timestamps) {
      const createdAtField = typeof schema.options.timestamps === 'object' 
        ? (schema.options.timestamps.createdAt || 'createdAt') 
        : 'createdAt';
      const updatedAtField = typeof schema.options.timestamps === 'object'
        ? (schema.options.timestamps.updatedAt || 'updatedAt')
        : 'updatedAt';

      if (this.isNew && createdAtField) {
        (this as any)[createdAtField as string] = now;
      }
      if (updatedAtField) {
        (this as any)[updatedAtField as string] = now;
      }
    }

    const collection = this._model.getCollection();
    const docData = this.toObject();

    if (this.isNew) {
      await collection.insertOne({ _id: new ObjectId(this._id), ...docData });
      this.isNew = false;
    } else {
      // Increment version
      if (schema.options.versionKey) {
        const versionField = typeof schema.options.versionKey === 'string' ? schema.options.versionKey : '__v';
        (this as any)[versionField] = ((this as any)[versionField] || 0) + 1;
      }
      
      await collection.replaceOne({ _id: new ObjectId(this._id) }, docData);
    }

    this._original = { ...docData };
    this._modified.clear();

    // Run post save hooks
    await this._model.runPostHooks('save', this);

    return this;
  }

  async remove(): Promise<this> {
    await this._model.runPreHooks('remove', this);
    
    const collection = this._model.getCollection();
    await collection.deleteOne({ _id: new ObjectId(this._id) });
    
    await this._model.runPostHooks('remove', this);
    
    return this;
  }

  async deleteOne(): Promise<DeleteResult> {
    await this._model.runPreHooks('deleteOne', this);
    
    const collection = this._model.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(this._id) });
    
    await this._model.runPostHooks('deleteOne', this);
    
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }

  async updateOne(update: Record<string, unknown>): Promise<UpdateResult> {
    await this._model.runPreHooks('updateOne', this);
    
    const collection = this._model.getCollection();
    const result = await collection.updateOne({ _id: new ObjectId(this._id) }, update);
    
    await this._model.runPostHooks('updateOne', this);
    
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  async populate(path: string | PopulateOptions): Promise<this> {
    // Population logic would go here
    // For now, return self
    return this;
  }

  toObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = { _id: this._id };
    const schema = this._model.schema;

    for (const [path] of schema.paths()) {
      if (path !== '_id' && (this as any)[path] !== undefined) {
        obj[path] = (this as any)[path];
      }
    }

    return obj;
  }

  toJSON(): Record<string, unknown> {
    return this.toObject();
  }
}

// Model class
export class Model<T extends HarborDocument = HarborDocument> {
  private _name: string;
  private _schema: Schema;
  private _collectionName: string;

  static models: Map<string, Model<any>> = new Map();

  constructor(name: string, schema: Schema, collectionName?: string) {
    this._name = name;
    this._schema = schema;
    this._collectionName = collectionName || name.toLowerCase() + 's';

    // Apply static methods
    for (const [methodName, method] of schema.getStatics()) {
      (this as any)[methodName] = method.bind(this);
    }

    Model.models.set(name, this);
  }

  get modelName(): string {
    return this._name;
  }

  get schema(): Schema {
    return this._schema;
  }

  get collection(): { name: string } {
    return { name: this._collectionName };
  }

  getCollection(): any {
    if (!connection.db) {
      throw new Error('[Harbor] Not connected to database. Call harbor.connect() first.');
    }
    return (connection.db as any).collection(this._collectionName);
  }

  // Create a new document instance
  new(doc?: Partial<T>): T {
    return new HarborDocument(this, doc as Record<string, unknown>) as T;
  }

  // Hydrate a plain object into a document
  hydrate(doc: Record<string, unknown>): T {
    const document = new HarborDocument(this, doc);
    document.isNew = false;
    return document as T;
  }

  // Query methods
  find(filter?: Record<string, unknown>, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T[]> {
    const query = new Query<T[]>(this, 'find', filter);
    if (projection) query.select(projection);
    if (options?.sort) query.sort(options.sort as any);
    if (options?.limit) query.limit(options.limit);
    if (options?.skip) query.skip(options.skip);
    if (options?.lean) query.lean();
    return query;
  }

  findOne(filter?: Record<string, unknown>, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T | null> {
    const query = new Query<T | null>(this, 'findOne', filter);
    if (projection) query.select(projection);
    if (options?.lean) query.lean();
    return query;
  }

  findById(id: string, projection?: Record<string, 0 | 1>, options?: QueryOptions): Query<T | null> {
    return this.findOne({ _id: new ObjectId(id) }, projection, options);
  }

  // Create methods
  async create(doc: Partial<T> | Partial<T>[]): Promise<T | T[]> {
    if (Array.isArray(doc)) {
      const results: T[] = [];
      for (const d of doc) {
        const document = this.new(d);
        await document.save();
        results.push(document as T);
      }
      return results;
    }

    const document = this.new(doc);
    await document.save();
    return document as T;
  }

  async insertMany(docs: Partial<T>[], options?: { ordered?: boolean }): Promise<{ insertedCount: number; insertedIds: string[] }> {
    const collection = this.getCollection();
    const documentsToInsert = docs.map(doc => {
      const id = new ObjectId();
      return { _id: id, ...doc };
    });

    const result = await collection.insertMany(documentsToInsert, { ordered: options?.ordered ?? true });
    
    return {
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds).map((id: any) => id.toString()),
    };
  }

  // Update methods
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Promise<UpdateResult> {
    await this.runPreHooks('updateOne', null);
    
    const collection = this.getCollection();
    const updateDoc = update.$set || update.$unset || update.$inc ? update : { $set: update };
    
    const result = await collection.updateOne(filter, updateDoc, { upsert: options?.upsert });
    
    await this.runPostHooks('updateOne', null);
    
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId?.toString(),
    };
  }

  async updateMany(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Promise<UpdateResult> {
    await this.runPreHooks('updateMany', null);
    
    const collection = this.getCollection();
    const updateDoc = update.$set || update.$unset || update.$inc ? update : { $set: update };
    
    const result = await collection.updateMany(filter, updateDoc, { upsert: options?.upsert });
    
    await this.runPostHooks('updateMany', null);
    
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>, options?: QueryOptions): Query<T | null> {
    const query = new Query<T | null>(this, 'findOneAndUpdate', filter, update);
    if (options?.new) (query as any)._options.new = true;
    if (options?.upsert) (query as any)._options.upsert = true;
    if (options?.lean) query.lean();
    return query;
  }

  findByIdAndUpdate(id: string, update: Record<string, unknown>, options?: QueryOptions): Query<T | null> {
    return this.findOneAndUpdate({ _id: new ObjectId(id) }, update, options);
  }

  async replaceOne(filter: Record<string, unknown>, replacement: Partial<T>, options?: QueryOptions): Promise<UpdateResult> {
    const collection = this.getCollection();
    const result = await collection.replaceOne(filter, replacement, { upsert: options?.upsert });
    
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  // Delete methods
  async deleteOne(filter: Record<string, unknown>): Promise<DeleteResult> {
    await this.runPreHooks('deleteOne', null);
    
    const collection = this.getCollection();
    const result = await collection.deleteOne(filter);
    
    await this.runPostHooks('deleteOne', null);
    
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }

  async deleteMany(filter: Record<string, unknown>): Promise<DeleteResult> {
    await this.runPreHooks('deleteMany', null);
    
    const collection = this.getCollection();
    const result = await collection.deleteMany(filter);
    
    await this.runPostHooks('deleteMany', null);
    
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }

  findOneAndDelete(filter: Record<string, unknown>, options?: QueryOptions): Query<T | null> {
    const query = new Query<T | null>(this, 'findOneAndDelete', filter);
    if (options?.lean) query.lean();
    return query;
  }

  findByIdAndDelete(id: string, options?: QueryOptions): Query<T | null> {
    return this.findOneAndDelete({ _id: new ObjectId(id) }, options);
  }

  // Count methods
  async countDocuments(filter?: Record<string, unknown>): Promise<number> {
    const collection = this.getCollection();
    return collection.countDocuments(filter || {});
  }

  async estimatedDocumentCount(): Promise<number> {
    const collection = this.getCollection();
    return collection.estimatedDocumentCount();
  }

  // Aggregate
  async aggregate<R = unknown>(pipeline: Record<string, unknown>[], options?: AggregateOptions): Promise<R[]> {
    const collection = this.getCollection();
    return collection.aggregate(pipeline, options).toArray();
  }

  // Distinct
  async distinct(field: string, filter?: Record<string, unknown>): Promise<unknown[]> {
    const collection = this.getCollection();
    return collection.distinct(field, filter || {});
  }

  // Exists
  async exists(filter: Record<string, unknown>): Promise<{ _id: string } | null> {
    const doc = await this.findOne(filter).select({ _id: 1 }).lean();
    return doc ? { _id: (doc as any)._id.toString() } : null;
  }

  // Bulk operations
  async bulkWrite(operations: BulkWriteOperation<T>[]): Promise<BulkWriteResult> {
    const collection = this.getCollection();
    const result = await collection.bulkWrite(operations as any);
    
    return {
      ok: result.ok,
      insertedCount: result.insertedCount,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      deletedCount: result.deletedCount,
      upsertedCount: result.upsertedCount,
      insertedIds: result.insertedIds || {},
      upsertedIds: result.upsertedIds || {},
    };
  }

  // Index methods
  async createIndex(fields: IndexDefinition, options?: IndexOptions): Promise<string> {
    const collection = this.getCollection();
    return collection.createIndex(fields, options);
  }

  async createIndexes(indexes: Array<{ fields: IndexDefinition; options?: IndexOptions }>): Promise<string[]> {
    const collection = this.getCollection();
    const indexSpecs = indexes.map(idx => ({ key: idx.fields, ...idx.options }));
    return collection.createIndexes(indexSpecs);
  }

  async listIndexes(): Promise<unknown[]> {
    const collection = this.getCollection();
    return collection.listIndexes().toArray();
  }

  async dropIndex(indexName: string): Promise<void> {
    const collection = this.getCollection();
    await collection.dropIndex(indexName);
  }

  // Populate
  async populate<P extends T>(docs: P | P[], options: PopulateOptions | PopulateOptions[]): Promise<P | P[]> {
    // Population logic would go here
    return docs;
  }

  // Watch (change streams)
  watch(pipeline?: Record<string, unknown>[], options?: { fullDocument?: 'default' | 'updateLookup' }): unknown {
    const collection = this.getCollection();
    return collection.watch(pipeline, options);
  }

  // Hook execution
  async runPreHooks(hookName: string, context: unknown): Promise<void> {
    const hooks = this._schema.getPreHooks().get(hookName) || [];
    for (const hook of hooks) {
      await new Promise<void>((resolve, reject) => {
        try {
          const result = hook.call(context, resolve);
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  }

  async runPostHooks(hookName: string, context: unknown): Promise<void> {
    const hooks = this._schema.getPostHooks().get(hookName) || [];
    for (const hook of hooks) {
      await new Promise<void>((resolve, reject) => {
        try {
          const result = hook.call(context, resolve);
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
  }
}

// Model factory function
export function model<T extends HarborDocument = HarborDocument>(
  name: string,
  schema: Schema,
  collectionName?: string
): Model<T> {
  // Check if model already exists
  const existing = Model.models.get(name);
  if (existing) {
    return existing as Model<T>;
  }

  return new Model<T>(name, schema, collectionName);
}

