import { Router, RequestHandler } from 'express';
import type {
  RouteDefinition,
  RouteOptions,
  HarborRequest,
  HarborResponse,
  HttpMethod,
  HarborConfig,
  PreFunction,
  PostFunction,
  RouteHandler,
  ValidationSchema,
} from '../types';
import { validateRequest } from '../validation';
import { createLogger } from '../utils/logger';
import { DEFAULT_CONFIG, HTTP_STATUS } from '../constants';
import { t } from '../i18n';
import { rateLimit as createRateLimit } from '../middleware/rateLimit';
import { cacheResponse } from '../cache/manager';
import { markMethod, routesFromClass, pre, after, check, timeout as timeoutMark, limit, routeCache } from './marked';
import type { HarborMethodDecorator, RouteClass } from './marked';

const logger = createLogger('router');

interface RouterOptions {
  prefix?: string;
  routes?: RouteDefinition[];
  middleware?: RequestHandler[];
}

export function createRouter(options: RouterOptions, config: HarborConfig): Router {
  const expressRouter = Router();

  if (options.middleware) {
    options.middleware.forEach((mw) => expressRouter.use(mw));
  }

  if (options.routes) {
    options.routes.forEach((routeDef) => {
      registerRoute(expressRouter, routeDef, config);
    });
  }

  return expressRouter;
}

function registerRoute(expressRouter: Router, routeDef: RouteDefinition, config: HarborConfig): void {
  const method = routeDef.method.toLowerCase() as keyof Router;
  const handlers = buildHandlerChain(routeDef, config);
  
  (expressRouter[method] as Function)(routeDef.path, ...handlers);
  
  logger.debug(t('router.registered', { method: routeDef.method, path: routeDef.path }));
}

function buildHandlerChain(routeDef: RouteDefinition, config: HarborConfig): RequestHandler[] {
  const handlers: RequestHandler[] = [];
  const options = routeDef.options ?? {};

  if (options.pre) {
    options.pre.forEach((preFn) => {
      handlers.push(wrapPreFunction(preFn));
    });
  }

  if (options.validation) {
    handlers.push(validationMiddleware(options.validation, config));
  }

  if (options.timeout) {
    handlers.push(timeoutMiddleware(options.timeout));
  }

  handlers.push(wrapHandler(routeDef.handler, options));

  return handlers;
}

function wrapPreFunction(preFn: PreFunction): RequestHandler {
  return async (req, res, next) => {
    try {
      await preFn(req as HarborRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function wrapHandler(handler: RouteHandler, options: RouteOptions): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await handler(req as HarborRequest, res as HarborResponse);

      if (options.post && options.post.length > 0) {
        for (const postFn of options.post) {
          await postFn(req as HarborRequest, res, result);
        }
      }

      if (!res.headersSent && result !== undefined) {
        res.json({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

function validationMiddleware(
  validation: NonNullable<RouteOptions['validation']>,
  config: HarborConfig
): RequestHandler {
  return async (req, res, next) => {
    try {
      const validated: HarborRequest['validated'] = {};

      if (validation.params) {
        const result = await validateRequest(validation.params, req.params, config.validation);
        if (!result.valid) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: t('validation.failed'),
              details: result.errors,
            },
          });
          return;
        }
        validated.params = result.data as Record<string, unknown>;
      }

      if (validation.query) {
        const result = await validateRequest(validation.query, req.query, config.validation);
        if (!result.valid) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: t('validation.failed'),
              details: result.errors,
            },
          });
          return;
        }
        validated.query = result.data as Record<string, unknown>;
      }

      if (validation.body) {
        const result = await validateRequest(validation.body, req.body, config.validation);
        if (!result.valid) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: t('validation.failed'),
              details: result.errors,
            },
          });
          return;
        }
        validated.body = result.data as Record<string, unknown>;
      }

      (req as HarborRequest).validated = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function timeoutMiddleware(timeout: number): RequestHandler {
  return (_req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
          success: false,
          error: {
            message: t('errors.timeout'),
          },
        });
      }
    }, timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}

export type RouteHandlerFn = (req: HarborRequest, res: HarborResponse) => unknown | Promise<unknown>;

export interface SimpleRouteOptions {
  pre?: PreFunction[];
  post?: PostFunction[];
  validation?: {
    params?: ValidationSchema;
    query?: ValidationSchema;
    body?: ValidationSchema;
    headers?: ValidationSchema;
  };
  timeout?: number;
}

/**
 * Create a router with routes - no express import needed!
 * 
 * @example
 * // Style 1: Using GET, POST helpers
 * const userRoutes = router('/api/users', [
 *   GET('/', async () => ({ users: [] })),
 *   GET('/:id', async (req) => ({ user: req.params.id })),
 *   POST('/', async (req) => ({ id: '123', ...req.body })),
 * ]);
 * 
 * // Style 2: Using route.get, route.post
 * const userRoutes = router('/api/users', [
 *   route.get('/', async () => ({ users: [] })),
 *   route.post('/', async (req) => ({ ...req.body })),
 * ]);
 * 
 * server.use(userRoutes);
 *
 * // Style 3: @route on class methods — same router, one ctx argument
 * class Users {
 *   @route.get('/')
 *   list(ctx: RouteCtx) {
 *     return { users: [] };
 *   }
 * }
 * server.use(router('/api/users', Users));
 */
export function router(
  basePath: string,
  routes: RouteDefinition[] | RouteClass,
  options?: { middleware?: RequestHandler[] }
): Router {
  const expressRouter = Router();
  const definitions = Array.isArray(routes) ? routes : routesFromClass(routes);

  if (options?.middleware) {
    options.middleware.forEach((mw) => expressRouter.use(mw));
  }

  definitions.forEach((routeDef) => {
    const fullPath = routeDef.path === '/' ? '' : routeDef.path;
    const method = routeDef.method.toLowerCase() as keyof Router;
    
    const handlers = buildSimpleHandlerChain(routeDef);
    
    (expressRouter[method] as Function)(fullPath, ...handlers);
    
    logger.debug(t('router.registered', { method: routeDef.method, path: `${basePath}${fullPath}` }));
  });

  const parentRouter = Router();
  parentRouter.use(basePath, expressRouter);

  return parentRouter;
}

function buildSimpleHandlerChain(routeDef: RouteDefinition): RequestHandler[] {
  const handlers: RequestHandler[] = [];
  const options = routeDef.options ?? {};

  if (options.rateLimit) {
    handlers.push(createRateLimit({
      windowMs: options.rateLimit.windowMs,
      max: options.rateLimit.max,
      message: options.rateLimit.message,
    }));
  }

  if (options.cache) {
    const cacheKey = options.cache.key;
    handlers.push(cacheResponse({
      ttl: options.cache.ttl,
      keyGenerator: typeof cacheKey === 'function'
        ? (req) => cacheKey(req as HarborRequest)
        : cacheKey
          ? () => cacheKey
          : undefined,
    }));
  }

  if (options.pre) {
    options.pre.forEach((preFn) => {
      handlers.push(wrapPreFunction(preFn));
    });
  }

  if (options.validation) {
    handlers.push(validationMiddleware(options.validation, DEFAULT_CONFIG));
  }

  if (options.timeout) {
    handlers.push(timeoutMiddleware(options.timeout));
  }

  handlers.push(wrapSimpleHandler(routeDef.handler, options));

  return handlers;
}

function wrapSimpleHandler(handler: RouteHandler, options: RouteOptions): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await handler(req as HarborRequest, res as HarborResponse);

      if (options.post && options.post.length > 0) {
        for (const postFn of options.post) {
          await postFn(req as HarborRequest, res, result);
        }
      }

      if (!res.headersSent && result !== undefined) {
        res.json({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

function createRoute(
  method: HttpMethod,
  path: string,
  handler: RouteHandlerFn,
  options?: SimpleRouteOptions
): RouteDefinition {
  return {
    path,
    method,
    handler,
    options: options ? {
      pre: options.pre,
      post: options.post,
      validation: options.validation,
      timeout: options.timeout,
    } : undefined,
  };
}

/**
 * Define a GET route
 */
export function GET(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition {
  return createRoute('GET', path, handler, options);
}

/**
 * Define a POST route
 */
export function POST(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition {
  return createRoute('POST', path, handler, options);
}

/**
 * Define a PUT route
 */
export function PUT(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition {
  return createRoute('PUT', path, handler, options);
}

/**
 * Define a PATCH route
 */
export function PATCH(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition {
  return createRoute('PATCH', path, handler, options);
}

/**
 * Define a DELETE route
 */
export function DELETE(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition {
  return createRoute('DELETE', path, handler, options);
}

/**
 * Route helper object - alternative syntax
 * 
 * @example
 * const userRoutes = router('/api/users', [
 *   route.get('/', async () => ({ users: [] })),
 *   route.post('/', async (req) => ({ ...req.body })),
 *   route.put('/:id', async (req) => ({ id: req.params.id })),
 *   route.delete('/:id', async (req) => ({ deleted: true })),
 * ]);
 */
function routeMethod(method: HttpMethod) {
  function define(path: string, handler: RouteHandlerFn, options?: SimpleRouteOptions): RouteDefinition;
  function define(path: string): HarborMethodDecorator;
  function define(
    path: string,
    handler?: RouteHandlerFn,
    options?: SimpleRouteOptions
  ): RouteDefinition | HarborMethodDecorator {
    if (typeof handler === 'function') {
      return createRoute(method, path, handler, options);
    }
    return markMethod(method, path);
  }
  return define;
}

const deleteRoute = routeMethod('DELETE');

export const route = {
  get: routeMethod('GET'),
  post: routeMethod('POST'),
  put: routeMethod('PUT'),
  patch: routeMethod('PATCH'),
  delete: deleteRoute,
  del: deleteRoute,
  options: routeMethod('OPTIONS'),
  head: routeMethod('HEAD'),
  pre,
  after,
  check,
  timeout: timeoutMark,
  limit,
  cache: routeCache,
};

export class RouteBuilder {
  private _route: Partial<RouteDefinition> = {};
  private _options: RouteOptions = {};

  static create(): RouteBuilder {
    return new RouteBuilder();
  }

  path(path: string): this {
    this._route.path = path;
    return this;
  }

  method(method: HttpMethod): this {
    this._route.method = method;
    return this;
  }

  get(path: string): this {
    return this.method('GET').path(path);
  }

  post(path: string): this {
    return this.method('POST').path(path);
  }

  put(path: string): this {
    return this.method('PUT').path(path);
  }

  patch(path: string): this {
    return this.method('PATCH').path(path);
  }

  delete(path: string): this {
    return this.method('DELETE').path(path);
  }

  handler(handler: RouteHandler): RouteDefinition {
    this._route.handler = handler;
    
    if (!this._route.path || !this._route.method || !this._route.handler) {
      throw new Error(t('router.missingRequired'));
    }

    return {
      path: this._route.path,
      method: this._route.method,
      handler: this._route.handler,
      options: Object.keys(this._options).length > 0 ? this._options : undefined,
    };
  }

  pre(...fns: PreFunction[]): this {
    this._options.pre = [...(this._options.pre ?? []), ...fns];
    return this;
  }

  postFn(...fns: PostFunction[]): this {
    this._options.post = [...(this._options.post ?? []), ...fns];
    return this;
  }

  validate(validation: RouteOptions['validation']): this {
    this._options.validation = validation;
    return this;
  }

  timeout(ms: number): this {
    this._options.timeout = ms;
    return this;
  }

  rateLimit(config: RouteOptions['rateLimit']): this {
    this._options.rateLimit = config;
    return this;
  }

  auth(config: RouteOptions['auth']): this {
    this._options.auth = config;
    return this;
  }

  cache(config: RouteOptions['cache']): this {
    this._options.cache = config;
    return this;
  }

  build(): RouteDefinition {
    if (!this._route.path || !this._route.method || !this._route.handler) {
      throw new Error(t('router.missingRequired'));
    }

    return {
      path: this._route.path,
      method: this._route.method,
      handler: this._route.handler,
      options: Object.keys(this._options).length > 0 ? this._options : undefined,
    };
  }
}
