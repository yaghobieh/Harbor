# @forgedevstack/harbor

<p align="center">
  <img src="https://forgedevstack.com/harbor-logo.svg" alt="Harbor Logo" width="120" />
</p>

<p align="center">
  <strong>Complete Node.js backend framework</strong><br/>
  MongoDB ODM • WebSocket • Scheduling • Queue • Mail • Caching • Auth • Metrics
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@forgedevstack/harbor"><img src="https://img.shields.io/npm/v/@forgedevstack/harbor.svg" alt="npm"></a>
  <a href="https://www.npmjs.com/search?q=%40forgedevstack"><img src="https://img.shields.io/npm/l/@forgedevstack/harbor.svg" alt="license"></a>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Zero-Config Server** | Create servers in seconds with Express under the hood |
| **MongoDB ODM** | Full Mongoose replacement with Schema, Model, Query |
| **Authentication** | JWT, API Key, RBAC, request signing |
| **WebSocket** | Real-time with rooms and broadcasting |
| **Scheduler** | Cron expressions and interval-based jobs |
| **Job Queue** | Priority queue with retries, backoff, dead letter |
| **Mail** | Zero-dep SMTP with templates & provider presets |
| **Rate Limiting** | Memory and Redis stores |
| **Caching** | Memory and Redis with middleware |
| **Metrics** | Prometheus-compatible endpoint |
| **Health Checks** | MongoDB, Redis, Memory, Disk checks |
| **File Uploads** | Multipart parsing with validation |
| **i18n** | Built-in translation system |

## Installation

```bash
npm install @forgedevstack/harbor
```

## Quick Start

```typescript
import { createServer, router, route } from '@forgedevstack/harbor';

const server = createServer({ port: 3000 });

const users = router('/api/users', [
  route.get('/', async () => ({ users: [] })),
  route.post('/', async (req) => ({ id: '123', ...req.body })),
  route.delete('/:id', async (req) => ({ deleted: req.params.id })),
]);

server.use(users);
server.listen(3000, () => console.log('Server running!'));
```

### Imports (ESM)

Use **named imports** from the package root (best for tree-shaking):

```typescript
import { createServer, connect, router, GET, POST, Schema, model } from '@forgedevstack/harbor';
```

**v1.6.1+** also provides a **default export** object (e.g. `import harbor from '@forgedevstack/harbor'`) with common APIs for legacy code — but prefer named imports in new apps.

## MongoDB ODM

Full Mongoose replacement:

```typescript
import { Schema, model, connect, extractDbNameFromMongoUri } from '@forgedevstack/harbor/database';

await connect('mongodb://localhost:27017/myapp');

// Use PascalCase schema types: String, Number, Date, Boolean, ObjectId (not lowercase).
const UserSchema = new Schema({
  email: { type: 'String', required: true, unique: true },
  name: { type: 'String', required: true },
  role: { type: 'String', enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: 'Date', default: () => new Date() },
});

const User = model('User', UserSchema);

// All Mongoose-like methods — create() persists with insertOne on first save
const user = await User.create({ email: 'john@example.com', name: 'John' });
const admins = await User.find({ role: 'admin' });
const found = await User.findOne({ email: 'john@example.com' });
await User.updateOne({ _id: user._id }, { role: 'admin' });
await User.deleteOne({ _id: user._id });
```

**Atlas / connection string:** The database name is taken from the path in your URI (e.g. `mongodb+srv://...@cluster.net/mydb?...` → `mydb`). Use **`extractDbNameFromMongoUri(uri)`** if you need the resolved name in logs or health checks.

**v1.6.1+ fixes:** Earlier versions could leave collections empty because new documents used **`replaceOne`** instead of **`insertOne`** on first save, or **`replaceOne`** matched zero documents and no insert ran. Use **1.6.2** if you still see empty collections after registering users.

## Authentication

### JWT

```typescript
import { JWT, jwtAuth, requireRole } from '@forgedevstack/harbor';

const jwt = new JWT({ 
  secret: process.env.JWT_SECRET!,
  expiresIn: 3600, // 1 hour
});

// Generate token
const token = jwt.sign({ userId: '123', role: 'admin' });

// Verify token
const payload = jwt.verify(token);

// Protect routes
app.use('/api', jwtAuth(jwt));
app.get('/api/admin', requireRole('admin'), adminHandler);
```

### API Key

```typescript
import { apiKeyAuth, generateApiKey } from '@forgedevstack/harbor';

const key = generateApiKey(); // Generate a secure API key

app.use(apiKeyAuth({
  header: 'X-API-Key',
  validator: async (key) => {
    const apiKey = await db.apiKeys.findOne({ key, active: true });
    return apiKey ? { valid: true, data: apiKey } : false;
  },
}));
```

## WebSocket

```typescript
import { createWebSocketServer } from '@forgedevstack/harbor';

const wss = createWebSocketServer({
  path: '/ws',
  onConnection: (client) => {
    console.log('Client connected:', client.id);
    wss.join(client, 'lobby');
  },
  onMessage: (client, data) => {
    wss.broadcastToRoom('lobby', { user: client.id, message: data });
  },
  onClose: (client) => {
    console.log('Client disconnected:', client.id);
  },
});

// Attach to server
await wss.attach(server.server);

// Broadcasting
wss.broadcast({ type: 'announcement', text: 'Hello everyone!' });
wss.broadcastToRoom('lobby', { type: 'chat', text: 'Hello lobby!' });
wss.send(clientId, { type: 'private', text: 'Just for you' });
```

## WebSocket Hub (v1.6.3+)

`WsHub` builds on the same HTTP server with upgrade-level auth, typed message envelopes (`{ event, payload }`), rooms, per-connection context, heartbeat cleanup, and a pluggable pub/sub adapter for multi-instance fan-out (in-memory by default, Redis-compatible contract).

```typescript
import { createServer } from '@forgedevstack/harbor';
import { createWsHub } from '@forgedevstack/harbor/ws';

const server = createServer();
server.listen(3000);

const hub = createWsHub({
  path: '/chat',
  authenticate: async (request) => {
    const token = new URL(request.url ?? '', 'http://localhost').searchParams.get('token');
    const user = await verifyToken(token);
    if (!user) return { accept: false, status: 401 };
    return { accept: true, context: { userId: user.id } };
  },
  onConnection: (connection) => {
    void hub.join(connection, 'lobby');
  },
  onMessage: (connection, message) => {
    if (message.event === 'chat:send') {
      void hub.broadcastToRoom('lobby', 'chat:new', {
        from: connection.context.userId,
        text: message.payload,
      });
    }
  },
});

await hub.attach(server.server!);

// Rooms and messaging
await hub.join(connection, 'room:42');
await hub.leave(connection, 'room:42');
await hub.broadcastToRoom('room:42', 'chat:new', { text: 'Hello room' });
await hub.broadcast('announcement', 'Deploy complete');
hub.sendTo(connectionId, 'private', { text: 'Just for you' });
```

Multi-instance fan-out uses `WsPubSubAdapter`. The default `MemoryPubSubAdapter` stays in-process; for multi-instance fan-out use the built-in Redis adapter (`ioredis` peer):

```typescript
import Redis from 'ioredis';
import { createWsHub, createRedisPubSubAdapter } from '@forgedevstack/harbor/ws';

const redis = new Redis(process.env.REDIS_URL!);
const adapter = createRedisPubSubAdapter({ client: redis });
const hub = createWsHub({ adapter });
```

`createRedisPubSubAdapter` duplicates the client for subscribe (or accepts an explicit `subscriber`). Optional `channelPrefix` namespaces Redis channels.

## Scheduler

```typescript
import { createScheduler } from '@forgedevstack/harbor';

const scheduler = createScheduler({
  onJobComplete: (job, duration) => console.log(`${job.name} took ${duration}ms`),
});

// Cron expression (daily at midnight)
scheduler.cron('cleanup', '0 0 * * *', async () => {
  await db.logs.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
});

// Every 5 minutes
scheduler.every('5m', 'healthCheck', async () => {
  await pingServices();
});

// One-time job
scheduler.at(new Date('2026-01-20'), 'reminder', async () => {
  await sendReminder();
});

scheduler.start();
```

## Job Queue

Event-driven job processing with retries, priorities, and dead letter:

```typescript
import { createQueue } from '@forgedevstack/harbor';

const emailQueue = createQueue<{ to: string; subject: string }>('emails', {
  concurrency: 3,
  defaultMaxRetries: 5,
  baseRetryDelay: 2000,
}, {
  onJobComplete: (job) => console.log(`Email sent to ${job.data.to}`),
  onJobFailed: (job, err) => console.error(`Email failed: ${err.message}`),
  onJobDead: (job) => console.error(`Email permanently failed: ${job.id}`),
});

// Register processor
emailQueue.process(async (job) => {
  await sendEmail(job.data.to, job.data.subject);
  return { sent: true };
});

// Add jobs
emailQueue.add({ to: 'user@example.com', subject: 'Welcome!' });
emailQueue.add({ to: 'vip@example.com', subject: 'VIP Access' }, { priority: 'high' });
emailQueue.add({ to: 'later@example.com', subject: 'Reminder' }, { delay: 60000 });

// Bulk add
emailQueue.addBulk([
  { data: { to: 'a@test.com', subject: 'Hi A' } },
  { data: { to: 'b@test.com', subject: 'Hi B' }, options: { priority: 'critical' } },
]);

// Start processing
emailQueue.start();

// Get stats
const stats = emailQueue.stats();
// { pending: 0, active: 2, completed: 10, failed: 1, dead: 0, avgDuration: 230 }
```

## Mail

Zero-dependency email sending with SMTP, templates, and provider presets:

```typescript
import { createMailer, createMailerFromProvider, registerTemplate } from '@forgedevstack/harbor';

// Quick setup with provider preset (Gmail, Outlook, SendGrid, SES)
const mailer = createMailerFromProvider('gmail', {
  user: 'you@gmail.com',
  pass: 'app-specific-password',
}, 'you@gmail.com');

// Send simple email
await mailer.send({
  to: 'user@example.com',
  subject: 'Hello from Harbor!',
  html: '<h1>Welcome</h1><p>Thanks for signing up.</p>',
  text: 'Welcome! Thanks for signing up.',
});

// Register templates
registerTemplate({
  name: 'welcome',
  subject: 'Welcome to {{appName}}, {{name}}!',
  html: '<h1>Hello {{name}}</h1><p>Welcome to {{appName}}.</p>',
  text: 'Hello {{name}}, welcome to {{appName}}.',
});

// Send with template
await mailer.sendTemplate('welcome', {
  name: 'John',
  appName: 'MyApp',
}, {
  to: 'john@example.com',
});

// With attachments
await mailer.send({
  to: 'user@example.com',
  subject: 'Your Report',
  html: '<p>Please find your report attached.</p>',
  attachments: [{
    filename: 'report.pdf',
    content: pdfBuffer,
    contentType: 'application/pdf',
  }],
});

// Custom SMTP config
const customMailer = createMailer({
  transport: {
    host: 'smtp.mycompany.com',
    port: 587,
    secure: false,
    auth: { user: 'noreply@mycompany.com', pass: 'password' },
  },
  defaultFrom: { name: 'MyApp', email: 'noreply@mycompany.com' },
});
```

## Rate Limiting

```typescript
import { rateLimit, slidingWindowRateLimit, RedisStore } from '@forgedevstack/harbor';

// Memory store (default)
app.use(rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
}));

// Strict for login
app.post('/login', rateLimit({ max: 5, windowMs: 60000 }), loginHandler);

// Redis store for distributed systems
const redisStore = new RedisStore(redisClient, 15 * 60 * 1000);
app.use(rateLimit({ store: redisStore }));
```

## Caching

```typescript
import { cache, cacheResponse, createCache, RedisCache } from '@forgedevstack/harbor';

// Manual caching
const products = await cache.getOrSet('products', async () => {
  return await db.products.find();
}, 60000); // 1 minute TTL

// Delete cache
await cache.del('products');

// Invalidate by pattern
await cache.invalidate('products:*');

// Middleware caching
app.get('/api/products', cacheResponse({ ttl: 60000 }), handler);

// Redis cache
const redisCache = createCache(new RedisCache(redisClient), 3600000);
```

## Metrics & Health Checks

```typescript
import {
  metricsMiddleware,
  metricsEndpoint,
  healthCheck,
  mongoHealthCheck,
  redisHealthCheck,
  memoryHealthCheck,
} from '@forgedevstack/harbor';

// Collect metrics
app.use(metricsMiddleware());

// Prometheus scrape endpoint
app.get('/metrics', metricsEndpoint());

// Health check endpoint
app.get('/health', healthCheck({
  checks: [
    mongoHealthCheck(db.connection),
    redisHealthCheck(redisClient),
    memoryHealthCheck(512), // Max 512MB heap
  ],
}));
```

## File Uploads

```typescript
import { upload } from '@forgedevstack/harbor';

app.post('/upload', upload({
  dest: './uploads',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png'],
}), (req, res) => {
  console.log(req.file); // { path, originalName, mimeType, size }
  res.json({ uploaded: true });
});

// Multiple files
app.post('/gallery', upload({ limits: { files: 10 } }), (req, res) => {
  console.log(req.files); // Array of uploaded files
});

// Memory storage (for processing)
app.post('/process', upload({ storage: 'memory' }), (req, res) => {
  const buffer = req.file.buffer;
  // Process buffer...
});
```

## Streaming Uploads (v1.6.3+)

`streamUpload` parses multipart/form-data as a stream — files never buffer fully in memory. Files flow into a `StorageAdapter` (`save(stream, meta) -> { key, url }`). Built-in adapters: local disk and S3/R2/MinIO (SigV4, zero AWS SDK).

```typescript
import { streamUpload, LocalDiskStorageAdapter, createS3StorageAdapter } from '@forgedevstack/harbor/upload';
import type { UploadRequest } from '@forgedevstack/harbor/upload';

const storage = new LocalDiskStorageAdapter({
  directory: './uploads',
  baseUrl: 'https://cdn.example.com/files',
});

app.post(
  '/upload',
  streamUpload({
    storage,
    limits: { maxFileSizeBytes: 10485760, maxFiles: 5 },
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  }),
  (req, res) => {
    const { uploads } = req as UploadRequest;
    res.json({ files: uploads?.map(({ key, url, size }) => ({ key, url, size })) });
  }
);
```

Size violations respond with `413`, disallowed mime types with `415`, and form fields are merged into `req.body`. For S3, R2, or MinIO:

```typescript
import { createS3StorageAdapter, streamUpload } from '@forgedevstack/harbor/upload';

const storage = createS3StorageAdapter({
  bucket: 'avatars',
  region: 'auto',
  endpoint: 'https://<account>.r2.cloudflarestorage.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  publicUrlBase: 'https://cdn.example.com',
  keyPrefix: 'uploads',
});

app.post('/upload', streamUpload({ storage }), (req, res) => {
  res.json({ files: (req as UploadRequest).uploads });
});
```

`S3StorageAdapter` streams each file through a temp path, then PutObject with SigV4 (`UNSIGNED-PAYLOAD`). It also implements `remove`, `exists` (HEAD), and `getSignedUrl` (query-string SigV4).

## CLI

```bash
# Initialize new project
npx @forgedevstack/harbor init my-api

# With template
npx @forgedevstack/harbor init my-api --template default

# Generate files
npx @forgedevstack/harbor generate model User
npx @forgedevstack/harbor generate controller User
npx @forgedevstack/harbor generate route users
```

## Configuration

Create `harbor.config.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost",
    "cors": {
      "enabled": true,
      "origin": "*"
    }
  },
  "database": {
    "uri": "mongodb://localhost:27017/myapp"
  },
  "logger": {
    "level": "info"
  },
  "errors": {
    "showStack": false
  }
}
```

## Subpath Imports

```typescript
// Core
import { createServer, router, route } from '@forgedevstack/harbor';

// Database
import { Schema, model, connect } from '@forgedevstack/harbor/database';

// Middleware
import { rateLimit, healthCheck, upload } from '@forgedevstack/harbor/middleware';

// Auth
import { JWT, jwtAuth, apiKeyAuth } from '@forgedevstack/harbor/auth';

// Cache
import { cache, cacheResponse } from '@forgedevstack/harbor/cache';

// Queue
import { createQueue } from '@forgedevstack/harbor/queue';

// Mail
import { createMailer, createMailerFromProvider } from '@forgedevstack/harbor/mail';

// Scheduler
import { createScheduler } from '@forgedevstack/harbor/scheduler';

// WebSocket
import { createWebSocketServer } from '@forgedevstack/harbor/websocket';

// WebSocket Hub (rooms, auth, pub/sub)
import { createWsHub, MemoryPubSubAdapter } from '@forgedevstack/harbor/ws';

// Streaming uploads
import { streamUpload, LocalDiskStorageAdapter } from '@forgedevstack/harbor/upload';
```

## License

MIT © [John Yaghobieh](https://forgedevstack.com)
