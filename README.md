# @forgestack/harbor

<p align="center">
  <img src="https://forgestack.dev/harbor-logo.svg" alt="Harbor Logo" width="120" />
</p>

<p align="center">
  <strong>Complete Node.js backend framework</strong><br/>
  MongoDB ODM • WebSocket • Scheduling • Caching • Auth • Metrics
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@forgestack/harbor"><img src="https://img.shields.io/npm/v/@forgestack/harbor.svg" alt="npm"></a>
  <a href="https://github.com/yaghobieh/ForgeStack"><img src="https://img.shields.io/github/stars/yaghobieh/ForgeStack.svg" alt="stars"></a>
  <a href="https://github.com/yaghobieh/ForgeStack/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@forgestack/harbor.svg" alt="license"></a>
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

## MongoDB ODM

Full Mongoose replacement:

```typescript
import { Schema, model, connect } from '@forgestack/harbor/database';

await connect('mongodb://localhost:27017/myapp');

const UserSchema = new Schema({
  email: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true },
  role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: 'date', default: () => new Date() },
});

const User = model('User', UserSchema);

// All Mongoose-like methods
const user = await User.create({ email: 'john@example.com', name: 'John' });
const admins = await User.find({ role: 'admin' });
const found = await User.findOne({ email: 'john@example.com' });
await User.updateOne({ _id: user._id }, { role: 'admin' });
await User.deleteOne({ _id: user._id });
```

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

// Scheduler
import { createScheduler } from '@forgestack/harbor/scheduler';

// WebSocket
import { createWebSocketServer } from '@forgestack/harbor/websocket';
```

## License

MIT © [John Yaghobieh](https://github.com/yaghobieh)
