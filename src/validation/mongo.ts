import type {
  MongoValidationSchema,
  MongoFieldSchema,
  ValidationResult,
  ValidationError,
} from '../types';
import { REGEX_PATTERNS, VALIDATION_MESSAGES } from '../constants';

export class MongoValidator {
  private schema: MongoValidationSchema;
  private customAdapter: unknown;

  constructor(schema: MongoValidationSchema, customAdapter?: unknown) {
    this.schema = schema;
    this.customAdapter = customAdapter;
  }

  async validate<T = Record<string, unknown>>(
    data: unknown
  ): Promise<ValidationResult<T>> {
    if (this.customAdapter && typeof (this.customAdapter as any).validate === 'function') {
      return (this.customAdapter as any).validate(this.schema, data);
    }

    const errors: ValidationError[] = [];
    const validated: Record<string, unknown> = {};
    const inputData = (data ?? {}) as Record<string, unknown>;

    for (const [field, fieldSchema] of Object.entries(this.schema)) {
      const value = inputData[field];
      const result = this.validateField(field, value, fieldSchema);

      if (!result.valid) {
        errors.push(...(result.errors ?? []));
      } else {
        validated[field] = result.value;
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data: validated as T };
  }

  private validateField(
    field: string,
    value: unknown,
    schema: MongoFieldSchema
  ): { valid: boolean; value?: unknown; errors?: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (value === undefined || value === null) {
      if (schema.required) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED',
        });
        return { valid: false, errors };
      }

      if (schema.default !== undefined) {
        return { valid: true, value: schema.default };
      }

      return { valid: true, value: undefined };
    }

    let processedValue = value;

    if (schema.transform) {
      processedValue = schema.transform(processedValue);
    }

    if (!this.validateType(processedValue, schema.type)) {
      errors.push({
        field,
        message: `${field} must be of type ${schema.type}`,
        code: 'TYPE_MISMATCH',
      });
      return { valid: false, errors };
    }

    if (schema.type === 'String' && typeof processedValue === 'string') {
      if (schema.minLength !== undefined && processedValue.length < schema.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${schema.minLength} characters`,
          code: 'MIN_LENGTH',
        });
      }

      if (schema.maxLength !== undefined && processedValue.length > schema.maxLength) {
        errors.push({
          field,
          message: `${field} must be at most ${schema.maxLength} characters`,
          code: 'MAX_LENGTH',
        });
      }

      if (schema.match && !schema.match.test(processedValue)) {
        errors.push({
          field,
          message: `${field} does not match the required pattern`,
          code: 'PATTERN',
        });
      }
    }

    if (schema.type === 'Number' && typeof processedValue === 'number') {
      if (schema.min !== undefined && processedValue < schema.min) {
        errors.push({
          field,
          message: `${field} must be at least ${schema.min}`,
          code: 'MIN_VALUE',
        });
      }

      if (schema.max !== undefined && processedValue > schema.max) {
        errors.push({
          field,
          message: `${field} must be at most ${schema.max}`,
          code: 'MAX_VALUE',
        });
      }
    }

    if (schema.type === 'ObjectId' && typeof processedValue === 'string') {
      if (!REGEX_PATTERNS.OBJECT_ID.test(processedValue)) {
        errors.push({
          field,
          message: `${field} is not a valid ObjectId`,
          code: 'INVALID_OBJECT_ID',
        });
      }
    }

    if (schema.enum && !schema.enum.includes(processedValue)) {
      errors.push({
        field,
        message: `${field} must be one of: ${schema.enum.join(', ')}`,
        code: 'ENUM',
      });
    }

    if (schema.validate) {
      const customResult = schema.validate.validator(processedValue);
      if (customResult === false) {
        errors.push({
          field,
          message: schema.validate.message ?? `${field} failed custom validation`,
          code: 'CUSTOM_VALIDATION',
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, value: processedValue };
  }

  private validateType(value: unknown, type: MongoFieldSchema['type']): boolean {
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
        return typeof value === 'string' && REGEX_PATTERNS.OBJECT_ID.test(value);
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

  getSchema(): MongoValidationSchema {
    return this.schema;
  }
}

export function createMongoSchema(schema: MongoValidationSchema): MongoValidator {
  return new MongoValidator(schema);
}

