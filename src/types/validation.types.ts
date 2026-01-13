export interface MongoValidationSchema {
  [field: string]: MongoFieldSchema;
}

export interface MongoFieldSchema {
  type: MongoFieldType;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  default?: unknown;
  ref?: string;
  enum?: unknown[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  match?: RegExp;
  validate?: CustomValidator;
  transform?: TransformFunction;
}

export type MongoFieldType = 
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'ObjectId'
  | 'Array'
  | 'Object'
  | 'Buffer'
  | 'Mixed';

export interface CustomValidator {
  validator: (value: unknown) => boolean | Promise<boolean>;
  message?: string;
}

export type TransformFunction = (value: unknown) => unknown;

export interface ValidationContext {
  field: string;
  value: unknown;
  schema: MongoFieldSchema;
  data: Record<string, unknown>;
}

export interface ValidatorFunction {
  (context: ValidationContext): boolean | Promise<boolean>;
}

export interface ValidatorRegistry {
  register: (name: string, validator: ValidatorFunction) => void;
  get: (name: string) => ValidatorFunction | undefined;
  has: (name: string) => boolean;
  remove: (name: string) => boolean;
}

export interface SanitizeOptions {
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  escape?: boolean;
  stripHtml?: boolean;
  maxLength?: number;
}

export interface ParamValidator<T = unknown> {
  validate: (value: unknown) => ValidationParamResult<T>;
  optional: () => ParamValidator<T | undefined>;
  default: (defaultValue: T) => ParamValidator<T>;
  transform: (fn: TransformFunction) => ParamValidator<T>;
}

export interface ValidationParamResult<T = unknown> {
  valid: boolean;
  value?: T;
  error?: string;
}

export interface ObjectIdValidator {
  isValid: (id: string) => boolean;
  toObjectId: (id: string) => unknown;
}

