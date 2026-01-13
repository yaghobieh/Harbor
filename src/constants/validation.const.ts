export const MONGO_FIELD_TYPES = {
  STRING: 'String',
  NUMBER: 'Number',
  BOOLEAN: 'Boolean',
  DATE: 'Date',
  OBJECT_ID: 'ObjectId',
  ARRAY: 'Array',
  OBJECT: 'Object',
  BUFFER: 'Buffer',
  MIXED: 'Mixed',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: '{field} is required',
  TYPE_MISMATCH: '{field} must be of type {type}',
  MIN_VALUE: '{field} must be at least {min}',
  MAX_VALUE: '{field} must be at most {max}',
  MIN_LENGTH: '{field} must be at least {min} characters',
  MAX_LENGTH: '{field} must be at most {max} characters',
  PATTERN: '{field} does not match the required pattern',
  ENUM: '{field} must be one of: {values}',
  INVALID_OBJECT_ID: '{field} is not a valid ObjectId',
  INVALID_EMAIL: '{field} is not a valid email address',
  INVALID_URL: '{field} is not a valid URL',
  INVALID_DATE: '{field} is not a valid date',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[\d\s-()]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

