import type {
  CacheConfig,
  HttpMethod,
  PostFunction,
  PreFunction,
  RateLimitConfig,
  RouteCtx,
  RouteDefinition,
  RouteOptions,
  RouteValidation,
  HarborRequest,
  HarborResponse,
} from '../types';
import { t } from '../i18n';

const methodMeta = new WeakMap<Function, MarkedRouteMeta>();
const classRoutes = new WeakMap<Function, Map<string, MarkedRouteMeta>>();

interface MarkedRouteMeta {
  method?: HttpMethod;
  path?: string;
  pre: PreFunction[];
  post: PostFunction[];
  validation?: RouteValidation;
  timeout?: number;
  rateLimit?: RateLimitConfig;
  cache?: CacheConfig;
}

export type HarborMethodDecorator = (
  value: (this: unknown, ctx: RouteCtx) => unknown,
  context: ClassMethodDecoratorContext
) => void;

export type RouteClass = new () => object;

function blankMeta(): MarkedRouteMeta {
  return { pre: [], post: [] };
}

function metaFor(fn: Function): MarkedRouteMeta {
  const current = methodMeta.get(fn);
  if (current) return current;
  const created = blankMeta();
  methodMeta.set(fn, created);
  return created;
}

function track(fn: Function, context: ClassMethodDecoratorContext): MarkedRouteMeta {
  const current = metaFor(fn);
  const name = String(context.name);

  context.addInitializer(function (this: unknown) {
    const ctor = context.static
      ? (this as Function)
      : (this as { constructor: Function }).constructor;
    let map = classRoutes.get(ctor);
    if (!map) {
      map = new Map();
      classRoutes.set(ctor, map);
    }
    map.set(name, metaFor(fn));
  });

  return current;
}

function asFn(value: unknown): Function {
  return value as Function;
}

export function markMethod(method: HttpMethod, path: string): HarborMethodDecorator {
  return (value, context) => {
    const meta = track(asFn(value), context);
    meta.method = method;
    meta.path = path;
  };
}

export function pre(...fns: PreFunction[]): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).pre.push(...fns);
  };
}

export function after(...fns: PostFunction[]): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).post.push(...fns);
  };
}

export function check(validation: RouteValidation): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).validation = validation;
  };
}

export function timeout(ms: number): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).timeout = ms;
  };
}

export function limit(config: RateLimitConfig): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).rateLimit = config;
  };
}

export function routeCache(config: CacheConfig): HarborMethodDecorator {
  return (value, context) => {
    track(asFn(value), context).cache = config;
  };
}

export function toRouteCtx(req: HarborRequest, res: HarborResponse): RouteCtx {
  return {
    query: (req.validated?.query ?? req.query) as RouteCtx['query'],
    body: req.validated?.body ?? req.body,
    params: (req.validated?.params ?? req.params) as RouteCtx['params'],
    headers: req.headers,
    req,
    res,
  };
}

function toOptions(meta: MarkedRouteMeta): RouteOptions | undefined {
  const options: RouteOptions = {};
  if (meta.pre.length > 0) options.pre = meta.pre;
  if (meta.post.length > 0) options.post = meta.post;
  if (meta.validation) options.validation = meta.validation;
  if (meta.timeout !== undefined) options.timeout = meta.timeout;
  if (meta.rateLimit) options.rateLimit = meta.rateLimit;
  if (meta.cache) options.cache = meta.cache;
  return Object.keys(options).length > 0 ? options : undefined;
}

export function routesFromClass(RouteClass: RouteClass): RouteDefinition[] {
  const instance = new RouteClass() as Record<string, unknown>;
  const map = classRoutes.get(RouteClass);

  if (!map || map.size === 0) {
    throw new Error(t('router.markedEmpty'));
  }

  const definitions: RouteDefinition[] = [];

  for (const [name, meta] of map) {
    if (!meta.method || meta.path === undefined) continue;
    const method = instance[name];
    if (typeof method !== 'function') continue;

    definitions.push({
      path: meta.path,
      method: meta.method,
      handler: (req, res) => method.call(instance, toRouteCtx(req, res)),
      options: toOptions(meta),
    });
  }

  if (definitions.length === 0) {
    throw new Error(t('router.markedEmpty'));
  }

  return definitions;
}
