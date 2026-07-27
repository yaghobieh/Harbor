/**
 * Default export for `import harbor from '@forgedevstack/harbor'` and CJS `require()`.
 * Prefer named imports in ESM: `import { createServer, connect } from '@forgedevstack/harbor'`.
 */
import { createServer } from './core/server';
import {
  createRouter,
  router,
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  route,
} from './core/router';
import { loadConfig, defineConfig } from './core/config';
import { createErrorHandler, HarborError } from './core/errorHandler';
import {
  Schema,
  Model,
  model,
  Query,
  HarborDocument,
  connection,
  connect,
  disconnect,
  Types,
  extractDbNameFromMongoUri,
} from './database';
import { validateRequest } from './validation';
import { httpLogger } from './utils/httpLogger';

const harbor = {
  createServer,
  createRouter,
  router,
  route,
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  loadConfig,
  defineConfig,
  createErrorHandler,
  HarborError,
  Schema,
  Model,
  model,
  Query,
  HarborDocument,
  connection,
  connect,
  disconnect,
  Types,
  extractDbNameFromMongoUri,
  validateRequest,
  httpLogger,
};

export default harbor;
