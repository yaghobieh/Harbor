import { afterEach, describe, expect, it } from 'vitest';
import type { ErrorRequestHandler } from 'express';
import { createServer } from '../src/core/server';
import type { HarborServer } from '../src/types/server.types';

interface Layer {
  handle?: (...args: unknown[]) => unknown;
}

describe('server chain', () => {
  const servers: HarborServer[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.stop()));
  });

  it('registers httpLogger middleware and returns the same server', () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    const before = stack(server).length;
    const logs: string[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '));
    };

    try {
      const chained = server.httpLogger().httpLogger('tiny');
      expect(chained).toBe(server);
      const added = stack(server).slice(before);
      expect(added).toHaveLength(2);
      added.forEach((layer) => invokeLogger(layer.handle));
    } finally {
      console.log = original;
    }

    expect(logs.some((line) => line.includes('GET    ') && line.includes('/health'))).toBe(true);
    expect(logs.some((line) => line.includes('/health') && !line.includes('GET    '))).toBe(true);
  });

  it('mounts the error handler on listen when it was omitted', async () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    expect(errorHandlerCount(server)).toBe(0);
    server.get('/boom', (_req, _res, next) => {
      next(new Error('boom'));
    });

    await listen(server);
    expect(errorHandlerCount(server)).toBe(1);

    const response = await fetch(`http://127.0.0.1:${boundPort(server)}/boom`);
    expect(response.status).toBe(500);
    const body = await response.json() as { success: boolean };
    expect(body.success).toBe(false);
  });

  it('does not mount a second error handler on listen', async () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    server.get('/boom', (_req, _res, next) => {
      next(new Error('boom'));
    });
    const custom: ErrorRequestHandler = (_err, _req, res, _next) => {
      res.status(418).json({ success: false, custom: true });
    };
    expect(server.errorHandler(custom)).toBe(server);

    await listen(server);
    expect(errorHandlerCount(server)).toBe(1);
    const response = await fetch(`http://127.0.0.1:${boundPort(server)}/boom`);
    expect(response.status).toBe(418);
  });

  it('mounts the error handler on start when it was omitted', async () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    expect(errorHandlerCount(server)).toBe(0);
    await server.start();
    expect(errorHandlerCount(server)).toBe(1);
  });
});

function stack(server: HarborServer): Layer[] {
  const app = server.app as unknown as { _router?: { stack?: Layer[] } };
  return app._router?.stack ?? [];
}

function errorHandlerCount(server: HarborServer): number {
  return stack(server).filter((layer) => typeof layer.handle === 'function' && layer.handle.length === 4).length;
}

function invokeLogger(handle: Layer['handle']): void {
  if (!handle) throw new Error('missing logger middleware');
  const req = {
    method: 'GET',
    url: '/health',
    originalUrl: '/health',
    ip: '127.0.0.1',
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    socket: { remoteAddress: '127.0.0.1' },
    get: () => undefined,
  };
  const res = {
    statusCode: 200,
    get: () => '12',
    end() {
      return this;
    },
  };
  handle(req, res, () => undefined);
  res.end();
}

function listen(server: HarborServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(0, () => resolve());
    server.server?.on('error', reject);
  });
}

function boundPort(server: HarborServer): number {
  const address = server.server?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind a port');
  }
  return address.port;
}
