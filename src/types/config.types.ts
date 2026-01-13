import type { LogLevel } from './logger.types';

export interface HarborConfig {
  server: ServerConfig;
  routes: RoutesConfig;
  validation: ValidationConfig;
  errors: ErrorsConfig;
  logger: LoggerConfig;
  docker?: DockerConfig;
}

export interface ServerConfig {
  port: number;
  host?: string;
  cors?: CorsConfig;
  bodyParser?: BodyParserConfig;
  trustProxy?: boolean;
}

export interface CorsConfig {
  enabled: boolean;
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

export interface BodyParserConfig {
  json?: boolean;
  urlencoded?: boolean;
  limit?: string;
}

export interface RoutesConfig {
  prefix?: string;
  timeout?: number;
  defaultMiddleware?: string[];
}

export interface ValidationConfig {
  adapter: 'mongoose' | 'custom';
  strictMode?: boolean;
  sanitize?: boolean;
  customAdapter?: ValidationAdapter;
}

export interface ValidationAdapter {
  validate: <T>(schema: unknown, data: unknown) => Promise<ValidationResult<T>>;
  sanitize?: (data: unknown) => unknown;
}

export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorsConfig {
  400?: ErrorHandler;
  401?: ErrorHandler;
  403?: ErrorHandler;
  404?: ErrorHandler;
  500?: ErrorHandler;
  default?: ErrorHandler;
}

export interface ErrorHandler {
  message?: string;
  redirect?: string;
  template?: string;
  json?: boolean;
  log?: boolean;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  format?: 'json' | 'text';
  output?: 'console' | 'file' | 'both';
  filePath?: string;
}

export interface DockerConfig {
  enabled: boolean;
  compose?: string;
  registry?: string;
  imageName?: string;
}

