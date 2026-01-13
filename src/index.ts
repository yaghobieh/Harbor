// Core exports
export { createServer } from './core/server';
export { 
  createRouter, 
  RouteBuilder,
  GET, POST, PUT, PATCH, DELETE, route,
} from './core/router';
export type { RouteHandlerFn, SimpleRouteOptions } from './core/router';
export { loadConfig, defineConfig } from './core/config';
export { createErrorHandler, HarborError } from './core/errorHandler';

// Database exports (Mongoose replacement)
export { 
  Schema, 
  Model, 
  model, 
  Query, 
  HarborDocument,
  connection, 
  connect, 
  disconnect,
  Types,
} from './database';
export type {
  SchemaType,
  SchemaFieldDefinition,
  SchemaDefinition,
  SchemaOptions,
  QueryOptions as DbQueryOptions,
  PopulateOptions,
  UpdateResult as DbUpdateResult,
  DeleteResult as DbDeleteResult,
  IndexDefinition,
  IndexOptions as DbIndexOptions,
  ConnectionOptions,
  ConnectionState,
  HookType,
  QueryHookType,
} from './database';

// Validation exports
export { validateRequest, validateField, MongoValidator, createMongoSchema, validators, createParamValidator } from './validation';

// Docker exports
export { DockerManager, createDockerManager } from './docker';

// Changelog exports
export { ChangelogManager, createChangelogManager } from './changelog';

// Portal exports
export { PortalGenerator, createPortal, generateDocs } from './portal';

// i18n exports
export { t, setLocale, getLocale, getAvailableLocales, addTranslations, registerLocale } from './i18n';
export type { Locale, TranslationParams } from './i18n';

// Utils exports
export { createLogger, setGlobalLogLevel } from './utils/logger';
export { deepMerge, pick, omit } from './utils/object';
export { generateId, formatDate, sleep } from './utils/helpers';
export { httpLogger, skipFunctions, createCustomFormat } from './utils/httpLogger';
export type { HttpLogFormat, HttpLoggerOptions, HttpLogTokens } from './utils/httpLogger';

// Type exports
export type {
  // Config types
  HarborConfig,
  ServerConfig,
  CorsConfig,
  RoutesConfig,
  ValidationConfig,
  ErrorsConfig,
  LoggerConfig,
  DockerConfig,
  
  // Route types
  RouteDefinition,
  RouteOptions,
  RouteHandler,
  HttpMethod,
  PreFunction,
  PostFunction,
  HarborRequest,
  HarborResponse,
  RouteGroup,
  RouterConfig,
  RouteValidation,
  FieldValidation,
  ValidationSchema,
  RateLimitConfig,
  AuthConfig,
  CacheConfig,
  
  // Server types
  HarborServer,
  ServerInfo,
  CreateServerOptions,
  ServerStatus,
  
  // Validation types
  ValidationResult,
  ValidationError,
  MongoValidationSchema,
  MongoFieldSchema,
  ParamValidator,
  ValidationParamResult,
  
  // Docker types
  DockerManagerConfig,
  DockerContainer,
  DockerImage,
  DockerComposeConfig,
  DockerService,
  ContainerStatus,
  
  // Logger types
  Logger,
  LogLevel,
  LogEntry,
  LoggerOptions,
} from './types';

// Re-export constants
export { HTTP_STATUS, HTTP_METHODS, CONTENT_TYPES, HEADERS } from './constants';
