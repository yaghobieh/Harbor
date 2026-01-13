import type { Express, RequestHandler } from 'express';
import type { Server as HttpServer } from 'http';
import type { HarborConfig } from './config.types';
import type { RouteDefinition, RouteGroup } from './route.types';

export interface HarborServer {
  app: Express;
  server: HttpServer | null;
  config: HarborConfig;
  start: () => Promise<ServerInfo>;
  stop: () => Promise<void>;
  restart: () => Promise<ServerInfo>;
  addRoute: (route: RouteDefinition) => void;
  addRouteGroup: (group: RouteGroup) => void;
  addMiddleware: (middleware: RequestHandler) => void;
  getInfo: () => ServerInfo;
}

export interface ServerInfo {
  port: number;
  host: string;
  uptime: number;
  startedAt: Date | null;
  routes: RouteInfo[];
  status: ServerStatus;
}

export interface RouteInfo {
  path: string;
  method: string;
  middleware: string[];
}

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface CreateServerOptions {
  port?: number;
  host?: string;
  configPath?: string;
  autoStart?: boolean;
  onReady?: (info: ServerInfo) => void;
  onError?: (error: Error) => void;
}

export interface ServerMiddleware {
  name: string;
  handler: RequestHandler;
  priority?: number;
  paths?: string[];
}

export interface HealthCheckConfig {
  enabled: boolean;
  path?: string;
  interval?: number;
  checks?: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  latency?: number;
}

export interface GracefulShutdownConfig {
  enabled: boolean;
  timeout?: number;
  signals?: string[];
  onShutdown?: () => Promise<void>;
}

