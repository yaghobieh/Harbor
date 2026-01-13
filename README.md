# Harbor 🚢

**The Pipeline for Node.js Backends**

Harbor is a complete backend framework that replaces Express routing, Mongoose ODM, and more. Fast server creation, route management, MongoDB integration, validation, Docker orchestration, and automatic error handling — all in one lightweight, TypeScript-first package.

[![npm version](https://img.shields.io/npm/v/harbor.svg)](https://www.npmjs.com/package/harbor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Server Setup](#server-setup)
- [MongoDB Connection](#mongodb-connection)
- [Schema & Models](#schema--models)
- [Route Management](#route-management)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Middleware](#middleware)
- [Docker Manager](#docker-manager)
- [Configuration](#configuration)
- [i18n (Translations)](#i18n-translations)
- [API Reference](#api-reference)

## Features

- 🚀 **Fast Server Creation** - Create a production-ready server with one function call
- 🛣️ **Route Management** - Fluent API with pre/post middleware, validation, and automatic error handling
- 🍃 **MongoDB ODM** - Full Mongoose replacement with Schema, Model, and all query methods
- ✅ **Validation** - Powerful request validation with Mongoose-compatible schemas
- 🐳 **Docker Manager** - Build, push, pull images and orchestrate containers
- 🌍 **i18n Support** - Built-in internationalization for all messages
- 📝 **Morgan-like Logger** - HTTP request logging with customizable formats
- ⚙️ **Config-Driven** - Centralized configuration via `harbor.config.json`
- 📘 **TypeScript First** - Full type definitions with excellent IntelliSense

## Installation

```bash
# npm
npm install harbor

# yarn
yarn add harbor

# pnpm
pnpm add harbor
```

### Peer Dependencies

Harbor requires `mongodb` for database operations:

```bash
npm install mongodb
```

## Quick Start

### 1. Initialize Project

```bash
npx harbor init
```

This creates:
- `harbor.config.json` - Configuration file
- `src/server.ts` - Basic server setup

### 2. Create Your Server

```typescript
import { createServer, GET, POST, connect } from 'harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');

// Create server
const server = createServer({ port: 3000 });

// Add routes
server.addRoute(
  GET('/api/health', () => ({ status: 'ok', timestamp: new Date() }))
);

server.addRoute(
  POST('/api/users', async (req) => {
    const { email, name } = req.validated.body;
    return { id: '123', email, name };
  }, {
    validation: {
      body: {
        email: { type: 'email', required: true },
        name: { type: 'string', required: true, min: 2 }
      }
    }
  })
);

// Server is running at http://localhost:3000
```

### 3. Run Your Server

```bash
npx ts-node src/server.ts
```

## Server Setup

### Basic Server

```typescript
import { createServer } from 'harbor';

const server = createServer({
  port: 3000,                    // Default: 3000
  host: 'localhost',             // Default: 'localhost'
  configPath: './harbor.config.json',
  autoStart: true,               // Default: true
  onReady: (info) => console.log(`Server ready on ${info.host}:${info.port}`),
  onError: (error) => console.error('Server error:', error),
});
```

### Server Methods

```typescript
// Add routes
server.addRoute(route);
server.addRoutes([route1, route2]);

// Add middleware
server.addMiddleware(middleware);

// Get Express app instance
const app = server.getApp();

// Graceful shutdown
await server.stop();
```

## MongoDB Connection

Harbor provides a complete Mongoose replacement. All the methods you know from Mongoose are available.

### Connecting to MongoDB

```typescript
import { connect, disconnect, connection } from 'harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
});

// Connection events
connection.on('connected', () => console.log('Connected!'));
connection.on('disconnected', () => console.log('Disconnected!'));
connection.on('error', (err) => console.error('Error:', err));

// Check connection state
console.log(connection.readyState); // 0: disconnected, 1: connected, 2: connecting

// Disconnect
await disconnect();
```

### Connection Options

```typescript
await connect(uri, {
  maxPoolSize: 10,              // Maximum connections in pool
  minPoolSize: 1,               // Minimum connections
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
  authSource: 'admin',
  replicaSet: 'rs0',
  ssl: true,
  tls: true,
});
```

## Schema & Models

### Defining a Schema

```typescript
import { Schema, model } from 'harbor';

// Define schema (same as Mongoose!)
const userSchema = new Schema({
  email: {
    type: 'String',
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: 'String',
    required: true,
    minLength: 8
  },
  name: {
    type: 'String',
    required: true,
    trim: true
  },
  role: {
    type: 'String',
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  age: {
    type: 'Number',
    min: 0,
    max: 150
  },
  isActive: {
    type: 'Boolean',
    default: true
  },
  profile: {
    bio: 'String',
    avatar: 'String',
    social: {
      twitter: 'String',
      github: 'String'
    }
  },
  tags: ['String'],
  createdAt: 'Date',
  updatedAt: 'Date'
}, {
  timestamps: true,              // Auto-add createdAt/updatedAt
  collection: 'users',           // Collection name
  versionKey: '__v',             // Version key field
});
```

### Schema Types

All Mongoose schema types are supported:

- `String` - String values
- `Number` - Numeric values
- `Boolean` - true/false
- `Date` - Date objects
- `ObjectId` - MongoDB ObjectId
- `Array` - Arrays
- `Object` / `Mixed` - Any object
- `Buffer` - Binary data

### Schema Options

```typescript
const schema = new Schema(definition, {
  timestamps: true,                    // Add createdAt/updatedAt
  timestamps: { createdAt: 'created', updatedAt: 'modified' }, // Custom field names
  collection: 'myCollection',          // Collection name
  strict: true,                        // Only save schema fields
  versionKey: '__v',                   // Version key
  _id: true,                           // Add _id field
  autoIndex: true,                     // Auto-create indexes
  minimize: true,                      // Remove empty objects
});
```

### Instance Methods

```typescript
// Define instance methods
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, SECRET);
};

// Or use the method() function
userSchema.method('fullName', function() {
  return `${this.firstName} ${this.lastName}`;
});
```

### Static Methods

```typescript
// Define static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Or use the static() function
userSchema.static('findByRole', function(role: string) {
  return this.find({ role });
});
```

### Virtuals

```typescript
userSchema.virtual('fullName')
  .get(function() {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function(name: string) {
    const [firstName, lastName] = name.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
  });
```

### Middleware (Hooks)

```typescript
// Pre-save hook
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Post-save hook
userSchema.post('save', function(next) {
  console.log('User saved:', this._id);
  next();
});

// Query middleware
userSchema.pre('find', function(next) {
  // Add filter to all find queries
  this.where({ isDeleted: { $ne: true } });
  next();
});
```

### Creating a Model

```typescript
import { model } from 'harbor';

// Create model
const User = model('User', userSchema);

// With custom collection name
const User = model('User', userSchema, 'my_users');
```

## Query Methods

All Mongoose query methods are available:

### Find Documents

```typescript
// Find all
const users = await User.find();

// Find with filter
const admins = await User.find({ role: 'admin' });

// Find one
const user = await User.findOne({ email: 'john@example.com' });

// Find by ID
const user = await User.findById('507f1f77bcf86cd799439011');

// Query builder
const users = await User.find()
  .where('age').gte(18).lte(65)
  .where('role').in(['user', 'admin'])
  .select('name email role')
  .sort('-createdAt')
  .skip(0)
  .limit(10)
  .lean();

// Chain methods
const users = await User.find({ isActive: true })
  .select('name email')
  .sort({ createdAt: -1 })
  .limit(10);
```

### Create Documents

```typescript
// Create single document
const user = await User.create({
  email: 'john@example.com',
  name: 'John Doe',
  password: 'secret123'
});

// Create multiple documents
const users = await User.create([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' }
]);

// Insert many
const result = await User.insertMany([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' }
]);

// Using new + save
const user = User.new({ email: 'john@example.com', name: 'John' });
await user.save();
```

### Update Documents

```typescript
// Update one
await User.updateOne(
  { email: 'john@example.com' },
  { $set: { name: 'John Smith' } }
);

// Update many
await User.updateMany(
  { role: 'user' },
  { $set: { isActive: true } }
);

// Find and update (returns document)
const user = await User.findOneAndUpdate(
  { email: 'john@example.com' },
  { $set: { name: 'John Smith' } },
  { new: true }  // Return updated document
);

// Find by ID and update
const user = await User.findByIdAndUpdate(
  '507f1f77bcf86cd799439011',
  { name: 'New Name' },
  { new: true }
);

// Replace one
await User.replaceOne(
  { email: 'john@example.com' },
  { email: 'john@example.com', name: 'Replaced User' }
);
```

### Delete Documents

```typescript
// Delete one
await User.deleteOne({ email: 'john@example.com' });

// Delete many
await User.deleteMany({ isActive: false });

// Find and delete
const deletedUser = await User.findOneAndDelete({ email: 'john@example.com' });

// Find by ID and delete
const deletedUser = await User.findByIdAndDelete('507f1f77bcf86cd799439011');
```

### Count & Exists

```typescript
// Count documents
const count = await User.countDocuments({ role: 'admin' });

// Estimated count (faster, but approximate)
const estimated = await User.estimatedDocumentCount();

// Check if exists
const exists = await User.exists({ email: 'john@example.com' });
// Returns { _id: '...' } or null
```

### Aggregation

```typescript
const result = await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$role', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### Distinct

```typescript
const roles = await User.distinct('role');
// ['user', 'admin', 'moderator']
```

### Indexes

```typescript
// Create index
await User.createIndex({ email: 1 }, { unique: true });

// Create compound index
await User.createIndex({ name: 1, createdAt: -1 });

// List indexes
const indexes = await User.listIndexes();

// Drop index
await User.dropIndex('email_1');

// Define index in schema
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 'text' });  // Text index
```

## Route Management

### Simple Routes

```typescript
import { GET, POST, PUT, PATCH, DELETE } from 'harbor';

// GET request
const getUsers = GET('/api/users', async (req) => {
  const users = await User.find();
  return { users };
});

// POST request with validation
const createUser = POST('/api/users', async (req) => {
  const user = await User.create(req.validated.body);
  return { user };
}, {
  validation: {
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true }
    }
  }
});

// PUT request
const updateUser = PUT('/api/users/:id', async (req) => {
  const user = await User.findByIdAndUpdate(
    req.validated.params.id,
    req.validated.body,
    { new: true }
  );
  return { user };
});

// DELETE request
const deleteUser = DELETE('/api/users/:id', async (req) => {
  await User.findByIdAndDelete(req.validated.params.id);
  return { deleted: true };
});

// Add routes to server
server.addRoute(getUsers);
server.addRoute(createUser);
server.addRoute(updateUser);
server.addRoute(deleteUser);
```

### Route Options

```typescript
const route = POST('/api/users', handler, {
  // Validation
  validation: {
    body: { /* schema */ },
    params: { /* schema */ },
    query: { /* schema */ },
    headers: { /* schema */ }
  },
  
  // Middleware
  pre: [authMiddleware, rateLimitMiddleware],
  post: [logMiddleware],
  
  // Timeout
  timeout: 30000,  // 30 seconds
  
  // Metadata
  tags: ['users'],
  description: 'Create a new user'
});
```

### Route Groups

```typescript
// Group routes by prefix
const userRoutes = [
  GET('/api/users', listUsers),
  POST('/api/users', createUser),
  GET('/api/users/:id', getUser),
  PUT('/api/users/:id', updateUser),
  DELETE('/api/users/:id', deleteUser),
];

server.addRoutes(userRoutes);
```

## Validation

### Request Validation

```typescript
const route = POST('/api/users', handler, {
  validation: {
    body: {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, min: 8, max: 100 },
      age: { type: 'number', min: 0, max: 150 },
      role: { type: 'string', enum: ['user', 'admin'] },
      website: { type: 'url' },
      phone: { type: 'string', match: /^\+?[\d\s-]+$/ }
    },
    params: {
      id: { type: 'objectId', required: true }
    },
    query: {
      page: { type: 'number', default: 1 },
      limit: { type: 'number', default: 20, max: 100 }
    }
  }
});
```

### Validation Types

- `string` - String values
- `number` - Numeric values
- `boolean` - true/false
- `email` - Valid email address
- `url` - Valid URL
- `objectId` - MongoDB ObjectId
- `date` - Valid date
- `array` - Array values
- `object` - Object values

### Custom Validators

```typescript
const schema = {
  password: {
    type: 'string',
    required: true,
    validate: {
      validator: (value) => /[A-Z]/.test(value) && /[0-9]/.test(value),
      message: 'Password must contain uppercase letter and number'
    }
  }
};
```

## Error Handling

### HarborError Class

```typescript
import { HarborError } from 'harbor';

// Throw errors in your routes
const getUser = GET('/api/users/:id', async (req) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw HarborError.notFound('User not found');
  }
  
  if (!user.isActive) {
    throw HarborError.forbidden('User account is disabled');
  }
  
  return { user };
});
```

### Available Error Methods

```typescript
HarborError.badRequest(message?, details?)    // 400
HarborError.unauthorized(message?)            // 401
HarborError.forbidden(message?)               // 403
HarborError.notFound(message?)                // 404
HarborError.conflict(message?, details?)      // 409
HarborError.tooManyRequests(message?)         // 429
HarborError.internal(message?)                // 500
```

### Error Configuration

Configure error responses in `harbor.config.json`:

```json
{
  "errors": {
    "401": {
      "message": "Please log in to continue",
      "json": true,
      "log": true
    },
    "404": {
      "message": "Resource not found",
      "json": true
    },
    "500": {
      "message": "Something went wrong",
      "json": true,
      "log": true
    }
  }
}
```

## Middleware

### HTTP Logger (Morgan-like)

```typescript
import { httpLogger } from 'harbor';

// Add logging middleware
server.addMiddleware(httpLogger({ format: 'dev' }));

// Available formats: 'tiny', 'short', 'dev', 'combined', 'common'
```

### Custom Format

```typescript
server.addMiddleware(httpLogger({
  format: 'custom',
  customFormat: (tokens) => 
    `${tokens.method} ${tokens.url} ${tokens.status} - ${tokens.responseTime}ms`
}));
```

### Skip Requests

```typescript
import { httpLogger, skipFunctions } from 'harbor';

server.addMiddleware(httpLogger({
  format: 'dev',
  skip: skipFunctions.healthChecks  // Skip /health and /healthz
}));
```

### Pre/Post Route Middleware

```typescript
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw HarborError.unauthorized('No token provided');
  }
  req.user = await verifyToken(token);
  next();
};

const logMiddleware = async (req, res, result, next) => {
  console.log('Response:', result);
  next();
};

const route = GET('/api/profile', handler, {
  pre: [authMiddleware],
  post: [logMiddleware]
});
```

## Docker Manager

```typescript
import { createDockerManager } from 'harbor';

const docker = createDockerManager({
  imageName: 'my-app',
  tag: 'latest',
  dockerfile: './Dockerfile',
  context: '.'
});

// Build image
await docker.build();

// Push to registry
await docker.push('registry.example.com');

// Pull image
await docker.pull('nginx:latest');

// Container operations
await docker.startContainer('my-container');
await docker.stopContainer('my-container');
await docker.restartContainer('my-container');

// Docker Compose
await docker.composeUp();
await docker.composeDown();
```

## Configuration

Create `harbor.config.json` in your project root:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "cors": {
    "enabled": true,
    "origin": "*",
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
    "allowedHeaders": ["Content-Type", "Authorization"]
  },
  "logger": {
    "level": "info",
    "format": "dev"
  },
  "validation": {
    "abortEarly": false,
    "stripUnknown": true
  },
  "errors": {
    "404": { "message": "Not Found", "json": true },
    "500": { "message": "Internal Error", "json": true, "log": true }
  },
  "docker": {
    "imageName": "my-app",
    "tag": "latest"
  }
}
```

## i18n (Translations)

```typescript
import { setLocale, t, addTranslations } from 'harbor';

// Set locale
setLocale('he');

// Use translations
console.log(t('server.started', { host: 'localhost', port: 3000 }));
// Output (Hebrew): השרת פועל בכתובת http://localhost:3000

// Add custom translations
addTranslations('en', {
  'custom.message': 'Hello, {name}!'
});
```

### Available Locales

- `en` - English (default)
- `he` - Hebrew

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `createServer(options)` | Create a Harbor server |
| `connect(uri, options)` | Connect to MongoDB |
| `disconnect()` | Disconnect from MongoDB |
| `Schema(definition, options)` | Create a schema |
| `model(name, schema)` | Create a model |
| `GET/POST/PUT/PATCH/DELETE(path, handler, options)` | Create routes |

### Model Methods

| Method | Description |
|--------|-------------|
| `find(filter)` | Find documents |
| `findOne(filter)` | Find one document |
| `findById(id)` | Find by ID |
| `create(doc)` | Create document(s) |
| `updateOne(filter, update)` | Update one |
| `updateMany(filter, update)` | Update many |
| `deleteOne(filter)` | Delete one |
| `deleteMany(filter)` | Delete many |
| `findOneAndUpdate(filter, update, options)` | Find and update |
| `findOneAndDelete(filter)` | Find and delete |
| `countDocuments(filter)` | Count documents |
| `aggregate(pipeline)` | Aggregation pipeline |

### Query Methods

| Method | Description |
|--------|-------------|
| `.select(fields)` | Select fields |
| `.sort(fields)` | Sort results |
| `.limit(n)` | Limit results |
| `.skip(n)` | Skip results |
| `.lean()` | Return plain objects |
| `.where(path)` | Add condition |
| `.gt/gte/lt/lte(value)` | Comparison operators |
| `.in/nin(values)` | Array operators |
| `.regex(pattern)` | Regex match |

## License

MIT © Harbor Contributors

---

**Happy Sailing! 🚢**
