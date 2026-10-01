import { check, createServer, pre, route, router } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';

const users = new Map<string, { id: string; name: string; email: string }>();

class Users {
  @route.get('/')
  list() {
    return { users: [...users.values()] };
  }

  @route.post('/')
  @check({
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true, min: 2 },
    },
  })
  create(ctx: RouteCtx) {
    const body = ctx.body as { email: string; name: string };
    const id = String(users.size + 1);
    const user = { id, email: body.email, name: body.name };
    users.set(id, user);
    return { user };
  }

  @route.get('/:id')
  one(ctx: RouteCtx) {
    const user = users.get(String(ctx.params.id));
    if (!user) {
      ctx.res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }
    return { user };
  }

  @route.del('/:id')
  @pre((req, res, next) => {
    const token = req.header('x-lab-token');
    if (token !== 'lab') {
      res.status(401).json({ success: false, error: { message: 'Send x-lab-token: lab' } });
      return;
    }
    next();
  })
  remove(ctx: RouteCtx) {
    const id = String(ctx.params.id);
    const existed = users.delete(id);
    return { deleted: existed, id };
  }
}

export function createLabServer(port = 0) {
  const server = createServer({ port, host: '127.0.0.1' });
  server.use(router('/api/users', Users));
  return server;
}

const isDirectRun = process.argv[1]?.endsWith('server.ts');

if (isDirectRun) {
  const port = Number(process.env.PORT ?? 4391);
  const server = createLabServer(port);
  server.listen(port, () => {
    console.log(`Harbor lab on http://127.0.0.1:${port}`);
    console.log('GET /api/users');
    console.log('POST /api/users  { "name", "email" }');
    console.log('DELETE /api/users/:id  header x-lab-token: lab');
  });
}
