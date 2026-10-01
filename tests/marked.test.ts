import { afterEach, describe, expect, it } from 'vitest';
import { createServer } from '../src/core/server';
import { pre, route, router, routesFromClass } from '../src/core';
import type { HarborServer } from '../src/types/server.types';
import type { RouteCtx } from '../src/types/route.types';

class Users {
  @route.get('/')
  @pre((req, _res, next) => {
    req.harborContext = { ...(req.harborContext ?? {}), seen: true };
    next();
  })
  list(ctx: RouteCtx) {
    return {
      users: [{ id: ctx.params.id ?? 'all' }],
      seen: ctx.req.harborContext?.seen === true,
    };
  }

  @route.post('/')
  @route.check({
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true, min: 2 },
    },
  })
  create(ctx: RouteCtx) {
    const body = ctx.body as { email: string; name: string };
    return { id: '1', email: body.email, name: body.name };
  }

  @route.get('/limited')
  @route.limit({ windowMs: 60_000, max: 1 })
  limited() {
    return { ok: true };
  }

  @route.del('/:id')
  remove(ctx: RouteCtx) {
    return { deleted: ctx.params.id };
  }
}

describe('marked routes', () => {
  const servers: HarborServer[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.stop()));
  });

  it('collects @route methods into the same route definitions', () => {
    const definitions = routesFromClass(Users);
    expect(definitions.map((definition) => `${definition.method} ${definition.path}`)).toEqual([
      'GET /',
      'POST /',
      'GET /limited',
      'DELETE /:id',
    ]);
    expect(definitions[1]?.options?.validation?.body?.email).toEqual({ type: 'email', required: true });
    expect(definitions[2]?.options?.rateLimit).toEqual({ windowMs: 60_000, max: 1 });
  });

  it('calls the method with ctx outside of HTTP', () => {
    const users = new Users();
    const result = users.list({
      query: {},
      body: undefined,
      params: { id: '7' },
      headers: {},
      req: { harborContext: { seen: true } },
      res: {},
    } as RouteCtx);

    expect(result).toEqual({ users: [{ id: '7' }], seen: true });
  });

  it('serves a marked class from router()', async () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    server.use(router('/api/users', Users));
    await server.start();
    const port = listenPort(server);

    const listed = await fetch(`http://127.0.0.1:${port}/api/users`);
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({
      success: true,
      data: { users: [{ id: 'all' }], seen: true },
    });

    const invalid = await fetch(`http://127.0.0.1:${port}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', name: 'A' }),
    });
    expect(invalid.status).toBe(400);

    const created = await fetch(`http://127.0.0.1:${port}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ada@harbor.dev', name: 'Ada' }),
    });
    expect(created.status).toBe(200);
    expect(await created.json()).toEqual({
      success: true,
      data: { id: '1', email: 'ada@harbor.dev', name: 'Ada' },
    });

    const first = await fetch(`http://127.0.0.1:${port}/api/users/limited`);
    const second = await fetch(`http://127.0.0.1:${port}/api/users/limited`);
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
  });

  it('still mounts route arrays', async () => {
    const server = createServer({ port: 0, host: '127.0.0.1' });
    servers.push(server);
    server.use(router('/api/health', [
      route.get('/', async () => ({ ok: true })),
    ]));
    await server.start();
    const port = listenPort(server);
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    expect(await response.json()).toEqual({ success: true, data: { ok: true } });
  });

  it('rejects a class with no @route methods', () => {
    class Empty {}
    expect(() => routesFromClass(Empty)).toThrow(/@route/);
  });
});

function listenPort(server: HarborServer): number {
  const address = server.server?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind a port');
  }
  return address.port;
}
