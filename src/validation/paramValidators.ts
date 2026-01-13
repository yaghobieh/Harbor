import type { ParamValidator, ValidationParamResult, TransformFunction } from '../types';
import { REGEX_PATTERNS } from '../constants';

class BaseParamValidator<T> implements ParamValidator<T> {
  protected isOptional = false;
  protected defaultValue?: T;
  protected transformFn?: TransformFunction;
  protected validateFn: (value: unknown) => ValidationParamResult<T>;

  constructor(validateFn: (value: unknown) => ValidationParamResult<T>) {
    this.validateFn = validateFn;
  }

  validate(value: unknown): ValidationParamResult<T> {
    if (value === undefined || value === null || value === '') {
      if (this.defaultValue !== undefined) {
        return { valid: true, value: this.defaultValue };
      }
      if (this.isOptional) {
        return { valid: true, value: undefined as unknown as T };
      }
      return { valid: false, error: 'Value is required' };
    }

    let processedValue = value;
    if (this.transformFn) {
      processedValue = this.transformFn(processedValue);
    }

    return this.validateFn(processedValue);
  }

  optional(): ParamValidator<T | undefined> {
    this.isOptional = true;
    return this as unknown as ParamValidator<T | undefined>;
  }

  default(defaultValue: T): ParamValidator<T> {
    this.defaultValue = defaultValue;
    return this;
  }

  transform(fn: TransformFunction): ParamValidator<T> {
    this.transformFn = fn;
    return this;
  }
}

export const validators = {
  string(): ParamValidator<string> {
    return new BaseParamValidator((value) => {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      return { valid: true, value };
    });
  },

  number(): ParamValidator<number> {
    return new BaseParamValidator((value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (typeof num !== 'number' || isNaN(num)) {
        return { valid: false, error: 'Value must be a number' };
      }
      return { valid: true, value: num };
    });
  },

  integer(): ParamValidator<number> {
    return new BaseParamValidator((value) => {
      const num = typeof value === 'string' ? parseInt(value, 10) : value;
      if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num)) {
        return { valid: false, error: 'Value must be an integer' };
      }
      return { valid: true, value: num };
    });
  },

  boolean(): ParamValidator<boolean> {
    return new BaseParamValidator((value) => {
      if (typeof value === 'boolean') {
        return { valid: true, value };
      }
      if (value === 'true') return { valid: true, value: true };
      if (value === 'false') return { valid: true, value: false };
      return { valid: false, error: 'Value must be a boolean' };
    });
  },

  email(): ParamValidator<string> {
    return new BaseParamValidator((value) => {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      if (!REGEX_PATTERNS.EMAIL.test(value)) {
        return { valid: false, error: 'Value must be a valid email' };
      }
      return { valid: true, value };
    });
  },

  objectId(): ParamValidator<string> {
    return new BaseParamValidator((value) => {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      if (!REGEX_PATTERNS.OBJECT_ID.test(value)) {
        return { valid: false, error: 'Value must be a valid ObjectId' };
      }
      return { valid: true, value };
    });
  },

  uuid(): ParamValidator<string> {
    return new BaseParamValidator((value) => {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      if (!REGEX_PATTERNS.UUID.test(value)) {
        return { valid: false, error: 'Value must be a valid UUID' };
      }
      return { valid: true, value };
    });
  },

  url(): ParamValidator<string> {
    return new BaseParamValidator((value) => {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      if (!REGEX_PATTERNS.URL.test(value)) {
        return { valid: false, error: 'Value must be a valid URL' };
      }
      return { valid: true, value };
    });
  },

  date(): ParamValidator<Date> {
    return new BaseParamValidator((value) => {
      const date = value instanceof Date ? value : new Date(value as string);
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Value must be a valid date' };
      }
      return { valid: true, value: date };
    });
  },

  array<T>(): ParamValidator<T[]> {
    return new BaseParamValidator((value) => {
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Value must be an array' };
      }
      return { valid: true, value: value as T[] };
    });
  },

  enum<T extends string>(values: readonly T[]): ParamValidator<T> {
    return new BaseParamValidator((value) => {
      if (!values.includes(value as T)) {
        return { valid: false, error: `Value must be one of: ${values.join(', ')}` };
      }
      return { valid: true, value: value as T };
    });
  },

  custom<T>(validateFn: (value: unknown) => boolean, errorMessage?: string): ParamValidator<T> {
    return new BaseParamValidator((value) => {
      if (!validateFn(value)) {
        return { valid: false, error: errorMessage ?? 'Custom validation failed' };
      }
      return { valid: true, value: value as T };
    });
  },
};

export function createParamValidator<T>(
  validateFn: (value: unknown) => ValidationParamResult<T>
): ParamValidator<T> {
  return new BaseParamValidator(validateFn);
}

