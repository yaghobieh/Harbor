import type { HarborConfig } from '../types';

export const DEFAULT_PORT = 3000;
export const DEFAULT_HOST = 'localhost';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_BODY_LIMIT = '10mb';

export const DEFAULT_CONFIG: HarborConfig = {
  server: {
    port: DEFAULT_PORT,
    host: DEFAULT_HOST,
    cors: {
      enabled: true,
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: false,
    },
    bodyParser: {
      json: true,
      urlencoded: true,
      limit: DEFAULT_BODY_LIMIT,
    },
    trustProxy: false,
  },
  routes: {
    prefix: '',
    timeout: DEFAULT_TIMEOUT,
    defaultMiddleware: [],
  },
  validation: {
    adapter: 'mongoose',
    strictMode: true,
    sanitize: true,
  },
  errors: {
    400: {
      message: 'Bad Request',
      json: true,
      log: false,
    },
    401: {
      message: 'Unauthorized',
      json: true,
      log: true,
    },
    403: {
      message: 'Forbidden',
      json: true,
      log: true,
    },
    404: {
      message: 'Not Found',
      json: true,
      log: false,
    },
    500: {
      message: 'Internal Server Error',
      json: true,
      log: true,
    },
    default: {
      message: 'An error occurred',
      json: true,
      log: true,
    },
  },
  logger: {
    enabled: true,
    level: 'info',
    format: 'text',
    output: 'console',
  },
};

export const GRACEFUL_SHUTDOWN_TIMEOUT = 10000;

export const HEALTH_CHECK_INTERVAL = 30000;

