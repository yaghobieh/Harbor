// Harbor Schema - Mongoose-compatible schema definition
import type {
  SchemaDefinition,
  SchemaFieldDefinition,
  SchemaOptions,
  SchemaType,
  MiddlewareFunction,
  VirtualDefinition,
  HookType,
  QueryHookType,
  IndexDefinition,
  IndexOptions,
} from './types';

export class Schema<T = unknown> {
  private _definition: SchemaDefinition;
  private _options: SchemaOptions;
  private _paths: Map<string, SchemaFieldDefinition> = new Map();
  private _virtuals: Map<string, VirtualDefinition> = new Map();
  private _methods: Map<string, Function> = new Map();
  private _statics: Map<string, Function> = new Map();
  private _preHooks: Map<string, MiddlewareFunction[]> = new Map();
  private _postHooks: Map<string, MiddlewareFunction[]> = new Map();
  private _indexes: Array<{ fields: IndexDefinition; options?: IndexOptions }> = [];
  private _plugins: Array<{ fn: Function; options?: unknown }> = [];

  // Public accessors for methods and statics
  methods: Record<string, Function> = {};
  statics: Record<string, Function> = {};
  virtuals: Record<string, VirtualDefinition> = {};

  constructor(definition: SchemaDefinition, options?: SchemaOptions) {
    this._definition = definition;
    this._options = {
      timestamps: false,
      strict: true,
      strictQuery: false,
      _id: true,
      id: true,
      versionKey: '__v',
      autoIndex: true,
      autoCreate: true,
      minimize: true,
      ...options,
    };

    // Parse schema definition
    this._parseDefinition(definition);

    // Add _id field if enabled
    if (this._options._id) {
      this._paths.set('_id', { type: 'ObjectId', required: false });
    }

    // Add timestamp fields if enabled
    if (this._options.timestamps) {
      const createdAtField = typeof this._options.timestamps === 'object' 
        ? (this._options.timestamps.createdAt === false ? null : (this._options.timestamps.createdAt || 'createdAt'))
        : 'createdAt';
      const updatedAtField = typeof this._options.timestamps === 'object'
        ? (this._options.timestamps.updatedAt === false ? null : (this._options.timestamps.updatedAt || 'updatedAt'))
        : 'updatedAt';

      if (createdAtField) {
        this._paths.set(createdAtField as string, { type: 'Date', required: false });
      }
      if (updatedAtField) {
        this._paths.set(updatedAtField as string, { type: 'Date', required: false });
      }
    }

    // Add version key if enabled
    if (this._options.versionKey) {
      const versionField = typeof this._options.versionKey === 'string' ? this._options.versionKey : '__v';
      this._paths.set(versionField, { type: 'Number', default: 0 });
    }

    // Proxy for methods
    this.methods = new Proxy({}, {
      set: (_, prop: string, value: Function) => {
        this._methods.set(prop, value);
        return true;
      },
      get: (_, prop: string) => {
        return this._methods.get(prop);
      },
    });

    // Proxy for statics
    this.statics = new Proxy({}, {
      set: (_, prop: string, value: Function) => {
        this._statics.set(prop, value);
        return true;
      },
      get: (_, prop: string) => {
        return this._statics.get(prop);
      },
    });
  }

  private _parseDefinition(definition: SchemaDefinition, prefix: string = ''): void {
    for (const [key, value] of Object.entries(definition)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        // Shorthand: { name: 'String' }
        this._paths.set(path, { type: value as SchemaType });
      } else if (typeof value === 'object' && value !== null) {
        const fieldDef = value as SchemaFieldDefinition;
        
        if ('type' in fieldDef) {
          // Full definition: { name: { type: 'String', required: true } }
          if (typeof fieldDef.type === 'string') {
            this._paths.set(path, fieldDef);
          } else if (Array.isArray(fieldDef.type)) {
            // Array type: { tags: { type: ['String'] } }
            this._paths.set(path, { ...fieldDef, type: 'Array' });
          } else if (typeof fieldDef.type === 'object') {
            // Nested schema
            this._paths.set(path, { type: 'Object' });
            this._parseDefinition(fieldDef.type as SchemaDefinition, path);
          }
        } else {
          // Nested object without type: { meta: { votes: Number } }
          this._paths.set(path, { type: 'Object' });
          this._parseDefinition(value as SchemaDefinition, path);
        }
      }
    }
  }

  // Add additional fields to schema
  add(definition: SchemaDefinition, prefix?: string): this {
    this._parseDefinition(definition, prefix);
    return this;
  }

  // Get path definition
  path(name: string): SchemaFieldDefinition | undefined {
    return this._paths.get(name);
  }

  // Get all paths
  paths(): Map<string, SchemaFieldDefinition> {
    return this._paths;
  }

  // Define virtual field
  virtual(name: string): VirtualBuilder {
    return new VirtualBuilder(this, name);
  }

  // Define instance method
  method(name: string, fn: Function): this {
    this._methods.set(name, fn);
    return this;
  }

  // Define static method
  static(name: string, fn: Function): this {
    this._statics.set(name, fn);
    return this;
  }

  // Pre hook
  pre<K extends HookType | QueryHookType>(
    hookName: K | K[],
    fn: MiddlewareFunction<T>
  ): this {
    const hooks = Array.isArray(hookName) ? hookName : [hookName];
    for (const hook of hooks) {
      const existing = this._preHooks.get(hook) || [];
      existing.push(fn as MiddlewareFunction);
      this._preHooks.set(hook, existing);
    }
    return this;
  }

  // Post hook
  post<K extends HookType | QueryHookType>(
    hookName: K | K[],
    fn: MiddlewareFunction<T>
  ): this {
    const hooks = Array.isArray(hookName) ? hookName : [hookName];
    for (const hook of hooks) {
      const existing = this._postHooks.get(hook) || [];
      existing.push(fn as MiddlewareFunction);
      this._postHooks.set(hook, existing);
    }
    return this;
  }

  // Define index
  index(fields: IndexDefinition, options?: IndexOptions): this {
    this._indexes.push({ fields, options });
    return this;
  }

  // Plugin support
  plugin(fn: (schema: Schema<T>, options?: unknown) => void, options?: unknown): this {
    this._plugins.push({ fn, options });
    fn(this, options);
    return this;
  }

  // Load class methods as schema methods
  loadClass(cls: new () => unknown): this {
    const proto = cls.prototype;
    
    // Instance methods
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      
      if (descriptor?.get) {
        // Getter -> virtual
        this._virtuals.set(name, { get: descriptor.get });
      } else if (descriptor?.set) {
        const existing = this._virtuals.get(name) || {};
        this._virtuals.set(name, { ...existing, set: descriptor.set });
      } else if (typeof descriptor?.value === 'function') {
        // Method
        this._methods.set(name, descriptor.value);
      }
    }

    // Static methods
    for (const name of Object.getOwnPropertyNames(cls)) {
      if (['length', 'prototype', 'name'].includes(name)) continue;
      const value = (cls as any)[name];
      if (typeof value === 'function') {
        this._statics.set(name, value);
      }
    }

    return this;
  }

  // Clone schema
  clone(): Schema<T> {
    const cloned = new Schema<T>({}, this._options);
    cloned._paths = new Map(this._paths);
    cloned._virtuals = new Map(this._virtuals);
    cloned._methods = new Map(this._methods);
    cloned._statics = new Map(this._statics);
    cloned._preHooks = new Map(this._preHooks);
    cloned._postHooks = new Map(this._postHooks);
    cloned._indexes = [...this._indexes];
    return cloned;
  }

  // Getters
  get options(): SchemaOptions {
    return this._options;
  }

  get definition(): SchemaDefinition {
    return this._definition;
  }

  getMethods(): Map<string, Function> {
    return this._methods;
  }

  getStatics(): Map<string, Function> {
    return this._statics;
  }

  getVirtuals(): Map<string, VirtualDefinition> {
    return this._virtuals;
  }

  getPreHooks(): Map<string, MiddlewareFunction[]> {
    return this._preHooks;
  }

  getPostHooks(): Map<string, MiddlewareFunction[]> {
    return this._postHooks;
  }

  getIndexes(): Array<{ fields: IndexDefinition; options?: IndexOptions }> {
    return this._indexes;
  }

  // Validate document against schema
  async validate(doc: Record<string, unknown>): Promise<{ valid: boolean; errors?: Array<{ path: string; message: string }> }> {
    const errors: Array<{ path: string; message: string }> = [];

    for (const [path, fieldDef] of this._paths) {
      const value = this._getNestedValue(doc, path);
      const fieldErrors = await this._validateField(path, value, fieldDef);
      errors.push(...fieldErrors);
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  private _getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj);
  }

  private async _validateField(
    path: string,
    value: unknown,
    fieldDef: SchemaFieldDefinition
  ): Promise<Array<{ path: string; message: string }>> {
    const errors: Array<{ path: string; message: string }> = [];

    // Required check
    if (fieldDef.required && (value === undefined || value === null)) {
      errors.push({ path, message: `${path} is required` });
      return errors;
    }

    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    if (!this._validateType(value, fieldDef.type as SchemaType)) {
      errors.push({ path, message: `${path} must be of type ${fieldDef.type}` });
      return errors;
    }

    // String validations
    if (fieldDef.type === 'String' && typeof value === 'string') {
      if (fieldDef.minLength && value.length < fieldDef.minLength) {
        errors.push({ path, message: `${path} must be at least ${fieldDef.minLength} characters` });
      }
      if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
        errors.push({ path, message: `${path} must be at most ${fieldDef.maxLength} characters` });
      }
      if (fieldDef.match && !fieldDef.match.test(value)) {
        errors.push({ path, message: `${path} does not match required pattern` });
      }
      if (fieldDef.enum && !fieldDef.enum.includes(value)) {
        errors.push({ path, message: `${path} must be one of: ${fieldDef.enum.join(', ')}` });
      }
    }

    // Number validations
    if (fieldDef.type === 'Number' && typeof value === 'number') {
      if (fieldDef.min !== undefined && value < (fieldDef.min as number)) {
        errors.push({ path, message: `${path} must be at least ${fieldDef.min}` });
      }
      if (fieldDef.max !== undefined && value > (fieldDef.max as number)) {
        errors.push({ path, message: `${path} must be at most ${fieldDef.max}` });
      }
    }

    // Custom validator
    if (fieldDef.validate) {
      const isValid = await fieldDef.validate.validator(value);
      if (!isValid) {
        errors.push({ path, message: fieldDef.validate.message || `${path} failed validation` });
      }
    }

    return errors;
  }

  private _validateType(value: unknown, type: SchemaType): boolean {
    switch (type) {
      case 'String':
        return typeof value === 'string';
      case 'Number':
        return typeof value === 'number' && !isNaN(value);
      case 'Boolean':
        return typeof value === 'boolean';
      case 'Date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'ObjectId':
        return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
      case 'Array':
        return Array.isArray(value);
      case 'Object':
      case 'Mixed':
        return typeof value === 'object' && value !== null;
      case 'Buffer':
        return Buffer.isBuffer(value);
      default:
        return true;
    }
  }

  // Apply transformations (lowercase, uppercase, trim)
  transformValue(path: string, value: unknown): unknown {
    const fieldDef = this._paths.get(path);
    if (!fieldDef || typeof value !== 'string') return value;

    let transformed = value;
    if (fieldDef.lowercase) transformed = transformed.toLowerCase();
    if (fieldDef.uppercase) transformed = transformed.toUpperCase();
    if (fieldDef.trim) transformed = transformed.trim();
    
    return transformed;
  }

  // Get default value for a field
  getDefault(path: string): unknown {
    const fieldDef = this._paths.get(path);
    if (!fieldDef || fieldDef.default === undefined) return undefined;
    
    return typeof fieldDef.default === 'function' ? fieldDef.default() : fieldDef.default;
  }
}

// Virtual builder helper
class VirtualBuilder {
  private schema: Schema;
  private name: string;

  constructor(schema: Schema, name: string) {
    this.schema = schema;
    this.name = name;
  }

  get(fn: () => unknown): this {
    const virtuals = this.schema.getVirtuals();
    const existing = virtuals.get(this.name) || {};
    virtuals.set(this.name, { ...existing, get: fn });
    return this;
  }

  set(fn: (value: unknown) => void): this {
    const virtuals = this.schema.getVirtuals();
    const existing = virtuals.get(this.name) || {};
    virtuals.set(this.name, { ...existing, set: fn });
    return this;
  }
}

// Export Schema class
export { Schema as default };

