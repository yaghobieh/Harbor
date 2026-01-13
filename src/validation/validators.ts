import type {
  ValidationSchema,
  FieldValidation,
  ValidationResult,
  ValidationError,
  ValidationConfig,
} from '../types';
import { VALIDATION_MESSAGES, REGEX_PATTERNS } from '../constants';

export async function validateRequest<T = Record<string, unknown>>(
  schema: ValidationSchema,
  data: unknown,
  config: ValidationConfig
): Promise<ValidationResult<T>> {
  const errors: ValidationError[] = [];
  const validated: Record<string, unknown> = {};
  const inputData = (data ?? {}) as Record<string, unknown>;

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const value = inputData[field];
    const result = await validateField(field, value, fieldSchema, config);

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

export async function validateField(
  field: string,
  value: unknown,
  schema: FieldValidation,
  config: ValidationConfig
): Promise<{ valid: boolean; value?: unknown; errors?: ValidationError[] }> {
  const errors: ValidationError[] = [];

  if (value === undefined || value === null || value === '') {
    if (schema.required) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.REQUIRED, { field }),
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

  if (config.sanitize) {
    processedValue = sanitizeValue(processedValue, schema.type);
  }

  const typeValid = validateType(processedValue, schema.type);
  if (!typeValid) {
    errors.push({
      field,
      message: formatMessage(VALIDATION_MESSAGES.TYPE_MISMATCH, { field, type: schema.type }),
      code: 'TYPE_MISMATCH',
    });
    return { valid: false, errors };
  }

  if (schema.type === 'string' && typeof processedValue === 'string') {
    if (schema.min !== undefined && processedValue.length < schema.min) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.MIN_LENGTH, { field, min: schema.min }),
        code: 'MIN_LENGTH',
      });
    }

    if (schema.max !== undefined && processedValue.length > schema.max) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.MAX_LENGTH, { field, max: schema.max }),
        code: 'MAX_LENGTH',
      });
    }

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(processedValue)) {
        errors.push({
          field,
          message: formatMessage(VALIDATION_MESSAGES.PATTERN, { field }),
          code: 'PATTERN',
        });
      }
    }
  }

  if (schema.type === 'number' && typeof processedValue === 'number') {
    if (schema.min !== undefined && processedValue < schema.min) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.MIN_VALUE, { field, min: schema.min }),
        code: 'MIN_VALUE',
      });
    }

    if (schema.max !== undefined && processedValue > schema.max) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.MAX_VALUE, { field, max: schema.max }),
        code: 'MAX_VALUE',
      });
    }
  }

  if (schema.type === 'email' && typeof processedValue === 'string') {
    if (!REGEX_PATTERNS.EMAIL.test(processedValue)) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.INVALID_EMAIL, { field }),
        code: 'INVALID_EMAIL',
      });
    }
  }

  if (schema.type === 'objectId' && typeof processedValue === 'string') {
    if (!REGEX_PATTERNS.OBJECT_ID.test(processedValue)) {
      errors.push({
        field,
        message: formatMessage(VALIDATION_MESSAGES.INVALID_OBJECT_ID, { field }),
        code: 'INVALID_OBJECT_ID',
      });
    }
  }

  if (schema.enum && !schema.enum.includes(processedValue)) {
    errors.push({
      field,
      message: formatMessage(VALIDATION_MESSAGES.ENUM, { field, values: schema.enum.join(', ') }),
      code: 'ENUM',
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, value: processedValue };
}

function validateType(value: unknown, type: FieldValidation['type']): boolean {
  switch (type) {
    case 'string':
    case 'email':
    case 'objectId':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'date':
      return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
    default:
      return true;
  }
}

function sanitizeValue(value: unknown, type: FieldValidation['type']): unknown {
  if (type === 'string' && typeof value === 'string') {
    return value.trim();
  }

  if (type === 'number' && typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parsed;
  }

  if (type === 'boolean') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return value;
}

function formatMessage(template: string, params: Record<string, unknown>): string {
  let message = template;
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(`{${key}}`, String(value));
  }
  return message;
}

