# @forgestack/harbor

<p align="center">
  <img src="https://forgedevstack.com/harbor-logo.svg" alt="Harbor Logo" width="120" />
</p>

<p align="center">
  <strong>Complete Node.js backend framework</strong><br/>
  MongoDB ODM • WebSocket • Scheduling • Queue • Mail • Caching • Auth • Metrics
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@forgestack/harbor"><img src="https://img.shields.io/npm/v/@forgestack/harbor.svg" alt="npm"></a>
  <a href="https://www.npmjs.com/search?q=%40forgedevstack"><img src="https://img.shields.io/npm/l/@forgestack/harbor.svg" alt="license"></a>
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
npm install @forgestack/harbor
```

## Quick Start

```typescript
import { createServer, router, route } from '@forgestack/harbor';

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
import { createServer, connect, router, GET, POST, Schema, model } from '@forgestack/harbor';
```

**v1.6.1+** also provides a **default export** object (e.g. `import harbor from '@forgestack/harbor'`) with common APIs for legacy code — but prefer named imports in new apps.

## MongoDB ODM

Full Mongoose replacement:

```typescript
import { Schema, model, connect, extractDbNameFromMongoUri } from '@forgestack/harbor/database';

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
import { JWT, jwtAuth, requireRole } from '@forgestack/harbor';

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
import { apiKeyAuth, generateApiKey } from '@forgestack/harbor';

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
import { createWebSocketServer } from '@forgestack/harbor';

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

## Scheduler

```typescript
import { createScheduler } from '@forgestack/harbor';

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
import { createQueue } from '@forgestack/harbor';

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
import { createMailer, createMailerFromProvider, registerTemplate } from '@forgestack/harbor';

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
import { rateLimit, slidingWindowRateLimit, RedisStore } from '@forgestack/harbor';

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
import { cache, cacheResponse, createCache, RedisCache } from '@forgestack/harbor';

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
} from '@forgestack/harbor';

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
import { upload } from '@forgestack/harbor';

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

## CLI

```bash
# Initialize new project
npx @forgestack/harbor init my-api

# With template
npx @forgestack/harbor init my-api --template default

# Generate files
npx @forgestack/harbor generate model User
npx @forgestack/harbor generate controller User
npx @forgestack/harbor generate route users
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
import { createServer, router, route } from '@forgestack/harbor';

// Database
import { Schema, model, connect } from '@forgestack/harbor/database';

// Middleware
import { rateLimit, healthCheck, upload } from '@forgestack/harbor/middleware';

// Auth
import { JWT, jwtAuth, apiKeyAuth } from '@forgestack/harbor/auth';

// Cache
import { cache, cacheResponse } from '@forgestack/harbor/cache';

// Queue
import { createQueue } from '@forgestack/harbor/queue';

// Mail
import { createMailer, createMailerFromProvider } from '@forgestack/harbor/mail';

// Scheduler
import { createScheduler } from '@forgestack/harbor/scheduler';

// WebSocket
import { createWebSocketServer } from '@forgestack/harbor/websocket';
```

## License

MIT © [John Yaghobieh](https://forgedevstack.com)
