import express, { Express, RequestHandler } from 'express';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import type {
  HarborServer,
  ServerInfo,
  CreateServerOptions,
  ServerStatus,
  HarborConfig,
  RouteDefinition,
  RouteGroup,
} from '../types';
import { loadConfig } from './config';
import { createRouter } from './router';
import { createErrorHandler } from './errorHandler';
import { createLogger } from '../utils/logger';
import { GRACEFUL_SHUTDOWN_TIMEOUT } from '../constants/defaults.const';

const logger = createLogger('server');

export function createServer(options: CreateServerOptions = {}): HarborServer {
  const config = loadConfig(options.configPath);
  const app = express();
  let server: HttpServer | null = null;
  let status: ServerStatus = 'stopped';
  let startedAt: Date | null = null;
  const routes: RouteDefinition[] = [];

  applyMiddleware(app, config);

  const harborServer: HarborServer = {
    app,
    server,
    config,

    async start(): Promise<ServerInfo> {
      if (status === 'running') {
        logger.warn('Server is already running');
        return harborServer.getInfo();
      }

      status = 'starting';
      const port = options.port ?? config.server.port;
      const host = options.host ?? config.server.host ?? 'localhost';

      return new Promise((resolve, reject) => {
        try {
          server = createHttpServer(app);
          harborServer.server = server;

          server.listen(port, host, () => {
            status = 'running';
            startedAt = new Date();
            
            const info = harborServer.getInfo();
            logger.info(`Server started on http://${host}:${port}`);
            
            options.onReady?.(info);
            resolve(info);
          });

          server.on('error', (error) => {
            status = 'error';
            logger.error('Server error', error);
            options.onError?.(error);
            reject(error);
          });

          setupGracefulShutdown(harborServer);
        } catch (error) {
          status = 'error';
          reject(error);
        }
      });
    },

    async stop(): Promise<void> {
      if (!server || status === 'stopped') {
        return;
      }

      status = 'stopping';
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          server?.close();
          resolve();
        }, GRACEFUL_SHUTDOWN_TIMEOUT);

        server!.close((error) => {
          clearTimeout(timeout);
          if (error) {
            logger.error('Error stopping server', error);
            reject(error);
          } else {
            status = 'stopped';
            startedAt = null;
            logger.info('Server stopped');
            resolve();
          }
        });
      });
    },

    async restart(): Promise<ServerInfo> {
      await harborServer.stop();
      return harborServer.start();
    },

    addRoute(route: RouteDefinition): void {
      routes.push(route);
      const router = createRouter({ routes: [route] }, config);
      app.use(router);
    },

    addRouteGroup(group: RouteGroup): void {
      routes.push(...group.routes);
      const router = createRouter({ 
        prefix: group.prefix, 
        routes: group.routes,
        middleware: group.middleware,
      }, config);
      app.use(group.prefix, router);
    },

    addMiddleware(middleware: RequestHandler): void {
      app.use(middleware);
    },

    getInfo(): ServerInfo {
      const port = options.port ?? config.server.port;
      const host = options.host ?? config.server.host ?? 'localhost';
      
      return {
        port,
        host,
        uptime: startedAt ? Date.now() - startedAt.getTime() : 0,
        startedAt,
        routes: routes.map((r) => ({
          path: r.path,
          method: r.method,
          middleware: [],
        })),
        status,
      };
    },
  };

  if (options.autoStart !== false) {
    harborServer.start().catch((error) => {
      logger.error('Failed to auto-start server', error);
    });
  }

  return harborServer;
}

function applyMiddleware(app: Express, config: HarborConfig): void {
  if (config.server.bodyParser?.json) {
    app.use(express.json({ limit: config.server.bodyParser.limit }));
  }

  if (config.server.bodyParser?.urlencoded) {
    app.use(express.urlencoded({ 
      extended: true, 
      limit: config.server.bodyParser.limit 
    }));
  }

  if (config.server.cors?.enabled) {
    app.use(corsMiddleware(config.server.cors));
  }

  app.use(requestEnhancer());

  const errorHandler = createErrorHandler(config);
  app.use(errorHandler);
}

function corsMiddleware(corsConfig: NonNullable<HarborConfig['server']['cors']>): RequestHandler {
  return (req, res, next) => {
    const origin = corsConfig.origin;
    
    if (origin === true || origin === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      const requestOrigin = req.headers.origin;
      if (requestOrigin && origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      corsConfig.methods?.join(', ') ?? 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );

    if (corsConfig.allowedHeaders) {
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    } else {
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (corsConfig.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

function requestEnhancer(): RequestHandler {
  return (req, res, next) => {
    (req as any).startTime = Date.now();
    (req as any).harborContext = {};

    (res as any).success = function <T>(data: T, statusCode = 200) {
      res.status(statusCode).json({
        success: true,
        data,
      });
    };

    (res as any).error = function (message: string, statusCode = 500, details?: unknown) {
      res.status(statusCode).json({
        success: false,
        error: {
          message,
          details,
        },
      });
    };

    next();
  };
}

function setupGracefulShutdown(server: HarborServer): void {
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      await server.stop();
      process.exit(0);
    });
  });
}

