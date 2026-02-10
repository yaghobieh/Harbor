// Core exports
export { createServer } from './core/server';
export { 
  createRouter, 
  router,
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

// Middleware exports
export {
  rateLimit,
  slidingWindowRateLimit,
  RedisStore as RateLimitRedisStore,
  healthCheck,
  mongoHealthCheck,
  redisHealthCheck,
  memoryHealthCheck,
  diskHealthCheck,
  customHealthCheck,
  metricsMiddleware,
  metricsEndpoint,
  defaultRegistry,
  upload,
  validateFileType,
  mimeToExtension,
} from './middleware';
export type {
  RateLimitOptions,
  RateLimitStore,
  RateLimitInfo,
  HealthOptions,
  HealthCheck,
  HealthCheckResult,
  HealthStatus,
  MetricsOptions,
  UploadOptions,
  UploadedFile,
} from './middleware';

// WebSocket exports
export {
  WebSocketManager,
  createWebSocketServer,
} from './websocket';
export type {
  WebSocketOptions,
  HarborWebSocket,
  Room,
} from './websocket';

// Scheduler exports
export {
  Scheduler,
  createScheduler,
} from './scheduler';
export type {
  Job,
  SchedulerOptions,
} from './scheduler';

// Cache exports
export {
  CacheManager,
  MemoryCache,
  RedisCache,
  cache,
  cacheResponse,
  cached,
  createCache,
} from './cache';
export type {
  CacheOptions,
  CacheStore,
  CacheEntry,
} from './cache';

// Auth exports
export {
  JWT,
  jwtAuth,
  apiKeyAuth,
  requireRole,
  requirePermission,
  verifySignature,
  generateApiKey,
  hashPassword,
  verifyPassword,
  createJwt,
} from './auth';
export type {
  JwtOptions,
  JwtPayload,
  ApiKeyOptions,
  RbacOptions,
  SigningOptions,
  Role,
  Permission,
} from './auth';

// Docker exports
export { DockerManager, createDockerManager } from './docker';

// Changelog exports
export { ChangelogManager, createChangelogManager } from './changelog';

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
