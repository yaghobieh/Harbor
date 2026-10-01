import type { DocContent } from './docs-content.const';

export const EXTRA_DOCS: Record<string, DocContent> = {
  config: {
    title: 'Configuration',
    description: 'Harbor reads harbor.config.json from the project root, then lets createServer override it.',
    sections: [
      {
        id: 'file',
        title: 'harbor.config.json',
        content: 'The CLI writes this file when you create a project. `loadConfig` and `defineConfig` read the same shape.',
        code: `{
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": { "enabled": true, "origin": "*" }
  },
  "database": { "uri": "mongodb://localhost:27017/myapp" },
  "logger": { "level": "info" },
  "errors": { "showStack": false }
}`,
        filename: 'harbor.config.json',
      },
      {
        id: 'override',
        title: 'Override in code',
        content: 'Pass `port` and `host` to `createServer`. Those values win over the file. `configPath` points at a different file.',
        code: `import { createServer } from '@forgedevstack/harbor';

const server = createServer({
  port: Number(process.env.PORT ?? 3000),
  host: '0.0.0.0',
});`,
        filename: 'server.ts',
      },
    ],
  },
  database: {
    title: 'MongoDB ODM',
    description: 'Schema, model, and connect live on the database subpath. MongoDB is an optional peer.',
    sections: [
      {
        id: 'connect',
        title: 'Connect',
        content: 'Install `mongodb`, then connect before you query. The starter project does not need a database.',
        code: `import { connect, Schema, model } from '@forgedevstack/harbor/database';

await connect('mongodb://localhost:27017/myapp');

const User = model('User', new Schema({
  email: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true },
}));

const created = await User.create({ email: 'ada@harbor.dev', name: 'Ada' });
const all = await User.find();`,
        filename: 'db.ts',
      },
    ],
  },
  'marked-routes': {
    title: 'Marked routes',
    description: 'Put @route on a class method and mount the class with router(). No reflect-metadata.',
    sections: [
      {
        id: 'class',
        title: 'Class and mount',
        content: 'The method receives one `ctx`. A returned value is wrapped as `{ success, data }`. Delete is `@route.del` because `delete` is a reserved word.',
        code: `import { createServer, router, route, check } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';

class Users {
  @route.get('/')
  list() {
    return { users: [] };
  }

  @route.post('/')
  @check({ body: { email: { type: 'email', required: true } } })
  create(ctx: RouteCtx) {
    return { id: '1', ...(ctx.body as object) };
  }

  @route.del('/:id')
  remove(ctx: RouteCtx) {
    return { deleted: true, id: ctx.params.id };
  }
}

const server = createServer({ port: 3000 });
server.use(router('/api/users', Users));
server.listen(3000);`,
        filename: 'users.ts',
      },
      {
        id: 'policies',
        title: 'Policies on a method',
        content: '`@check`, `@pre`, `@after`, `@timeout`, `@limit`, and `@route.cache` sit on the same method. Array routes (`route.get(path, handler)`) stay available.',
      },
    ],
  },
  'route-context': {
    title: 'Route context',
    description: 'A marked method takes one argument, RouteCtx.',
    sections: [
      {
        id: 'fields',
        title: 'Fields',
        content: '`query`, `body`, `params`, and `headers` are the parsed request. `req` and `res` are the underlying Express objects when you need status codes or headers. Validated data is preferred when `@check` ran.',
        code: `import type { RouteCtx } from '@forgedevstack/harbor';

function create(ctx: RouteCtx) {
  const email = (ctx.body as { email?: string }).email;
  ctx.res.setHeader('x-request', 'harbor');
  return { email, id: ctx.params.id };
}`,
        filename: 'handler.ts',
      },
    ],
  },
  responses: {
    title: 'Responses',
    description: 'Returned values become the Harbor envelope. Throw or write the response yourself for errors.',
    sections: [
      {
        id: 'envelope',
        title: 'Envelope',
        content: 'Return a plain object. Harbor sends `{ success: true, data: that object }`.',
        code: `// return { users: [] }
// { "success": true, "data": { "users": [] } }`,
        filename: 'response.json',
      },
      {
        id: 'manual',
        title: 'Manual status',
        content: 'Write `ctx.res` and return nothing when the status is not 200.',
        code: `one(ctx: RouteCtx) {
  const user = users.get(String(ctx.params.id));
  if (!user) {
    ctx.res.status(404).json({ success: false, error: { message: 'User not found' } });
    return;
  }
  return { user };
}`,
        filename: 'users.ts',
      },
    ],
  },
  auth: {
    title: 'Authentication',
    description: 'JWT helpers and route guards. The secret stays in the environment.',
    sections: [
      {
        id: 'jwt',
        title: 'JWT',
        content: '`JWT` signs and verifies. `jwtAuth` reads the bearer token. `requireRole` checks the payload.',
        code: `import { JWT, jwtAuth, requireRole } from '@forgedevstack/harbor';

const jwt = new JWT({
  secret: process.env.JWT_SECRET!,
  expiresIn: 3600,
});

const token = jwt.sign({ userId: '123', role: 'admin' });
const payload = jwt.verify(token);

app.use('/api', jwtAuth(jwt));
app.get('/api/admin', requireRole('admin'), adminHandler);`,
        filename: 'auth.ts',
      },
    ],
  },
  'api-keys': {
    title: 'API keys',
    description: 'Check a header against your own store.',
    sections: [
      {
        id: 'header',
        title: 'Header check',
        content: '`generateApiKey` makes a random key. `apiKeyAuth` calls your validator for each request.',
        code: `import { apiKeyAuth, generateApiKey } from '@forgedevstack/harbor';

const key = generateApiKey();

app.use(apiKeyAuth({
  header: 'X-API-Key',
  validator: async (presented) => {
    const row = await db.apiKeys.findOne({ key: presented, active: true });
    return row ? { valid: true, data: row } : false;
  },
}));`,
        filename: 'api-key.ts',
      },
    ],
  },
  'rate-limit': {
    title: 'Rate limiting',
    description: 'Count requests in a window. Memory is the default store. Redis is optional.',
    sections: [
      {
        id: 'memory',
        title: 'Memory window',
        content: '`max` is the number of hits. `windowMs` is the window. Put a tighter limit on login.',
        code: `import { rateLimit } from '@forgedevstack/harbor';

app.use(rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
}));

app.post('/login', rateLimit({ max: 5, windowMs: 60_000 }), loginHandler);`,
        filename: 'limit.ts',
      },
      {
        id: 'marked',
        title: 'On a marked method',
        content: '`@limit` uses the same idea on one route. `@route.limit` is the same decorator.',
        code: `@route.post('/login')
@limit({ max: 5, windowMs: 60_000 })
login(ctx: RouteCtx) {
  return { ok: true };
}`,
        filename: 'login.ts',
      },
    ],
  },
  websocket: {
    title: 'WebSocket',
    description: 'Attach a socket server to the HTTP server Harbor already started.',
    sections: [
      {
        id: 'rooms',
        title: 'Rooms',
        content: '`createWebSocketServer` gives you connection, message, and close callbacks, plus room broadcast.',
        code: `import { createWebSocketServer } from '@forgedevstack/harbor';

const wss = createWebSocketServer({
  path: '/ws',
  onConnection: (client) => wss.join(client, 'lobby'),
  onMessage: (client, data) => {
    wss.broadcastToRoom('lobby', { user: client.id, message: data });
  },
});

await wss.attach(server.server);`,
        filename: 'ws.ts',
      },
    ],
  },
  'ws-hub': {
    title: 'WebSocket hub',
    description: 'Typed events, upgrade auth, and a pub/sub adapter for more than one process.',
    sections: [
      {
        id: 'hub',
        title: 'createWsHub',
        content: 'Messages are `{ event, payload }`. Import the hub from `@forgedevstack/harbor/ws`.',
        code: `import { createWsHub } from '@forgedevstack/harbor/ws';

const hub = createWsHub({
  path: '/chat',
  authenticate: async (request) => {
    const token = new URL(request.url ?? '', 'http://localhost').searchParams.get('token');
    if (!token) return { accept: false, status: 401 };
    return { accept: true, context: { userId: '1' } };
  },
  onMessage: (connection, message) => {
    if (message.event === 'chat:send') {
      void hub.broadcastToRoom('lobby', 'chat:new', message.payload);
    }
  },
});

await hub.attach(server.server!);`,
        filename: 'hub.ts',
      },
      {
        id: 'redis',
        title: 'Redis fan-out',
        content: '`createRedisPubSubAdapter` needs the optional `ioredis` peer. It duplicates the client for subscribe unless you pass `subscriber`.',
        code: `import { createRedisPubSubAdapter, createWsHub } from '@forgedevstack/harbor/ws';
import Redis from 'ioredis';

const adapter = createRedisPubSubAdapter({ client: new Redis(process.env.REDIS_URL!) });
const hub = createWsHub({ adapter });`,
        filename: 'redis-hub.ts',
      },
    ],
  },
  cache: {
    title: 'Caching',
    description: 'Memory cache by default. Redis is optional. Response cache can sit on one route.',
    sections: [
      {
        id: 'get-or-set',
        title: 'getOrSet',
        content: 'The third argument is TTL in milliseconds.',
        code: `import { cache, cacheResponse } from '@forgedevstack/harbor';

const products = await cache.getOrSet('products', async () => {
  return await db.products.find();
}, 60_000);

await cache.invalidate('products:*');

app.get('/api/products', cacheResponse({ ttl: 60_000 }), handler);`,
        filename: 'cache.ts',
      },
      {
        id: 'route-cache',
        title: 'Marked cache',
        content: '`@route.cache` caches that method’s response. The root export `cache` is the cache manager, so the decorator is `route.cache`.',
      },
    ],
  },
  scheduler: {
    title: 'Scheduler',
    description: 'Cron, interval, and one-shot jobs in the same process.',
    sections: [
      {
        id: 'jobs',
        title: 'Jobs',
        content: 'Call `start()` after you register jobs.',
        code: `import { createScheduler } from '@forgedevstack/harbor';

const scheduler = createScheduler();

scheduler.cron('cleanup', '0 0 * * *', async () => {
  await db.logs.deleteMany({ createdAt: { $lt: cutoff } });
});

scheduler.every('5m', 'ping', async () => {
  await pingServices();
});

scheduler.start();`,
        filename: 'scheduler.ts',
      },
    ],
  },
  health: {
    title: 'Health checks',
    description: 'One route that runs the checks you list and reports status.',
    sections: [
      {
        id: 'checks',
        title: 'Checks',
        content: 'Mongo, Redis, memory, disk, and a custom function are included. Mongo and Redis peers are optional.',
        code: `import { healthCheck, mongoHealthCheck, memoryHealthCheck } from '@forgedevstack/harbor';

app.get('/health', healthCheck({
  checks: [
    mongoHealthCheck(db.connection),
    memoryHealthCheck(512),
  ],
}));`,
        filename: 'health.ts',
      },
    ],
  },
  metrics: {
    title: 'Metrics',
    description: 'A Prometheus scrape endpoint built from request middleware.',
    sections: [
      {
        id: 'prometheus',
        title: 'Scrape',
        content: 'Mount the middleware first, then expose `metricsEndpoint`.',
        code: `import { metricsMiddleware, metricsEndpoint } from '@forgedevstack/harbor';

app.use(metricsMiddleware());
app.get('/metrics', metricsEndpoint());`,
        filename: 'metrics.ts',
      },
    ],
  },
  'http-logger': {
    title: 'HTTP logger',
    description: 'A Morgan-style request log. Formats include dev, short, tiny, combined, and common.',
    sections: [
      {
        id: 'format',
        title: 'Format',
        content: '`dev` is the default. Pass the middleware to `server.use` or `app.use`.',
        code: `import { httpLogger } from '@forgedevstack/harbor';

server.use(httpLogger({ format: 'dev' }));`,
        filename: 'logger.ts',
      },
    ],
  },
  upload: {
    title: 'File uploads',
    description: 'Multipart parsing with a size cap and an allow-list of mime types.',
    sections: [
      {
        id: 'disk',
        title: 'Disk',
        content: '`dest` is the folder. `req.file` is one file. `req.files` is the list when the limit allows more than one.',
        code: `import { upload } from '@forgedevstack/harbor';

app.post('/upload', upload({
  dest: './uploads',
  limits: { fileSize: 10 * 1024 * 1024 },
  allowedMimeTypes: ['image/jpeg', 'image/png'],
}), (req, res) => {
  res.json({ uploaded: true, file: req.file });
});`,
        filename: 'upload.ts',
      },
    ],
  },
  'streaming-uploads': {
    title: 'Streaming uploads',
    description: 'Files are piped to a storage adapter. They are not buffered as one blob.',
    sections: [
      {
        id: 'local',
        title: 'Local disk',
        content: 'Import from `@forgedevstack/harbor/upload`. Too-large files respond 413. A mime that is not allowed responds 415.',
        code: `import { streamUpload, LocalDiskStorageAdapter } from '@forgedevstack/harbor/upload';
import type { UploadRequest } from '@forgedevstack/harbor/upload';

const storage = new LocalDiskStorageAdapter({
  directory: './uploads',
  baseUrl: 'https://cdn.example.com/files',
});

app.post('/upload', streamUpload({
  storage,
  limits: { maxFileSizeBytes: 10_485_760, maxFiles: 5 },
  allowedMimeTypes: ['image/jpeg', 'image/png'],
}), (req, res) => {
  res.json({ files: (req as UploadRequest).uploads });
});`,
        filename: 'stream.ts',
      },
      {
        id: 's3',
        title: 'S3, R2, MinIO',
        content: '`createS3StorageAdapter` signs PutObject with SigV4 and does not use the AWS SDK. It also implements remove, exists, and a presigned GET.',
        code: `import { createS3StorageAdapter, streamUpload } from '@forgedevstack/harbor/upload';

const storage = createS3StorageAdapter({
  bucket: 'avatars',
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});`,
        filename: 's3.ts',
      },
    ],
  },
};
