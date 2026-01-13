import type { Request, Response, NextFunction, RequestHandler } from 'express';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
  options?: RouteOptions;
}

export interface RouteOptions {
  pre?: PreFunction[];
  post?: PostFunction[];
  validation?: RouteValidation;
  timeout?: number;
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
  cache?: CacheConfig;
}

export type PreFunction = (
  req: HarborRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type PostFunction = (
  req: HarborRequest,
  res: Response,
  result: unknown
) => void | Promise<void>;

export type RouteHandler = (
  req: HarborRequest,
  res: HarborResponse
) => unknown | Promise<unknown>;

export interface RouteValidation {
  params?: ValidationSchema;
  query?: ValidationSchema;
  body?: ValidationSchema;
  headers?: ValidationSchema;
}

export type ValidationSchema = Record<string, FieldValidation>;

export interface FieldValidation {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'objectId';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  default?: unknown;
  transform?: (value: unknown) => unknown;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export interface AuthConfig {
  required: boolean;
  roles?: string[];
  permissions?: string[];
}

export interface CacheConfig {
  ttl: number;
  key?: string | ((req: HarborRequest) => string);
}

export interface HarborRequest extends Request {
  validated?: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  };
  startTime?: number;
  harborContext?: Record<string, unknown>;
}

export interface HarborResponse extends Response {
  success: <T>(data: T, statusCode?: number) => void;
  error: (message: string, statusCode?: number, details?: unknown) => void;
}

export interface RouteGroup {
  prefix: string;
  middleware?: RequestHandler[];
  routes: RouteDefinition[];
}

export interface RouterConfig {
  prefix?: string;
  middleware?: RequestHandler[];
  errorHandler?: ErrorHandlerFunction;
}

export type ErrorHandlerFunction = (
  error: Error,
  req: HarborRequest,
  res: Response,
  next: NextFunction
) => void;

