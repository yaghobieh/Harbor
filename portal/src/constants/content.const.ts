import type { Feature, CodeExample, ApiItem } from '@/types';

export const VERSION = '1.3.1';
export const TITLE = 'Harbor';
export const TAGLINE = 'The Pipeline for Node.js Backends';
export const DESCRIPTION = 'Fast server creation, route management, MongoDB ODM (Mongoose replacement), Docker orchestration, and automatic error handling. All in one lightweight package.';

export const STATS = [
  { value: 'MongoDB', label: 'Full ODM Support' },
  { value: 'TypeScript', label: 'First Class Support' },
  { value: 'Express', label: 'Compatible' },
];

export const FEATURES: Feature[] = [
  {
    id: 'server',
    title: 'Fast Server Creation',
    description: 'Create a production-ready Express server with just a port number. CORS, body parsing, and error handling included.',
    icon: 'bolt',
  },
  {
    id: 'database',
    title: 'MongoDB ODM',
    description: 'Complete Mongoose replacement with Schema, Model, queries (find, findOne, create, update, delete) and middleware hooks.',
    icon: 'database',
  },
  {
    id: 'routes',
    title: 'Route Management',
    description: 'Fluent API with pre/post middleware, validation, timeout handling, and automatic error responses.',
    icon: 'routes',
  },
  {
    id: 'validation',
    title: 'Schema Validation',
    description: 'Mongoose-compatible schema validation. Validate params, query, body, and headers with custom validators.',
    icon: 'shield',
  },
  {
    id: 'docker',
    title: 'Docker Manager',
    description: 'Built-in Docker and Docker Compose management. Build, push, pull images and orchestrate containers.',
    icon: 'server',
  },
  {
    id: 'typescript',
    title: 'TypeScript First',
    description: 'Full type definitions with intellisense. Catch errors at compile time, not runtime.',
    icon: 'code',
  },
];

export const EXAMPLE_TABS = [
  { id: 'routing', label: 'Route Builder' },
  { id: 'database', label: 'Database' },
  { id: 'validation', label: 'Validation' },
  { id: 'error', label: 'Error Handling' },
  { id: 'middleware', label: 'Middleware' },
  { id: 'docker', label: 'Docker' },
];

export const API_ITEMS: ApiItem[] = [
  {
    name: 'connect(uri, options)',
    type: 'function',
    description: 'Connect to MongoDB database. Returns a promise that resolves when connected.',
    signature: `import { connect, connection } from 'harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
});

// Connection events
connection.on('connected', () => console.log('Connected!'));
connection.on('error', (err) => console.error(err));

// Check state
console.log(connection.readyState); // 1 = connected`,
  },
  {
    name: 'Schema(definition, options)',
    type: 'class',
    description: 'Define the structure of your documents with Mongoose-compatible schema syntax.',
    signature: `import { Schema, model } from 'harbor';

const userSchema = new Schema({
  email: { type: 'String', required: true, unique: true },
  password: { type: 'String', required: true, minLength: 8 },
  name: { type: 'String', trim: true },
  role: { type: 'String', enum: ['user', 'admin'], default: 'user' },
  profile: {
    avatar: 'String',
    bio: 'String'
  }
}, { timestamps: true });

// Add methods, statics, hooks
userSchema.methods.comparePassword = function(pwd) { /* ... */ };
userSchema.pre('save', async function(next) { /* ... */ });

const User = model('User', userSchema);`,
  },
  {
    name: 'Model Query Methods',
    type: 'function',
    description: 'All Mongoose query methods are available: find, findOne, findById, create, update, delete, and more.',
    signature: `// Find documents
const users = await User.find({ role: 'admin' });
const user = await User.findOne({ email: 'john@example.com' });
const user = await User.findById('507f1f77bcf86cd799439011');

// Create
const user = await User.create({ email: 'john@example.com', name: 'John' });

// Update
await User.updateOne({ email: 'john@example.com' }, { name: 'John Doe' });
const user = await User.findByIdAndUpdate(id, update, { new: true });

// Delete
await User.deleteOne({ email: 'john@example.com' });
await User.findByIdAndDelete(id);

// Query builder
const users = await User.find()
  .where('age').gte(18)
  .select('name email')
  .sort('-createdAt')
  .limit(10)
  .lean();`,
  },
  {
    name: 'createServer(options)',
    type: 'function',
    description: 'Creates a new Harbor server instance with Express under the hood.',
    signature: `const server = createServer({
  port?: number,           // Default: 3000
  host?: string,           // Default: 'localhost'
  configPath?: string,     // Path to harbor.config.json
  autoStart?: boolean,     // Default: true
  onReady?: (info) => void,
  onError?: (error) => void
});`,
  },
  {
    name: 'GET / POST / PUT / PATCH / DELETE',
    type: 'function',
    description: 'Simple route definition functions - no .build() needed!',
    signature: `// Simple usage - just pass your handler function
const route = GET('/api/users', async (req) => {
  return { users: [] };
});

// With options
const route = POST('/api/users', handler, {
  validation: { body: { email: { type: 'email', required: true } } },
  pre: [authMiddleware],
  timeout: 5000
});`,
  },
  {
    name: 'HarborError',
    type: 'class',
    description: 'Custom error class for consistent API error responses.',
    signature: `HarborError.badRequest(message?, details?)    // 400
HarborError.unauthorized(message?)           // 401
HarborError.forbidden(message?)               // 403
HarborError.notFound(message?)                // 404
HarborError.conflict(message?, details?)       // 409
HarborError.tooManyRequests(message?)         // 429
HarborError.internal(message?)                // 500`,
  },
  {
    name: 'httpLogger(options)',
    type: 'function',
    description: 'Morgan-like HTTP request logger middleware.',
    signature: `import { httpLogger } from 'harbor';

// Use like Morgan
app.use(httpLogger({ format: 'dev' }));

// Available formats: 'tiny', 'short', 'dev', 'combined', 'common'
// Custom format:
app.use(httpLogger({
  format: 'custom',
  customFormat: (tokens) => \`\${tokens.method} \${tokens.url} \${tokens.status}\`
}));`,
  },
  {
    name: 'setLocale(locale)',
    type: 'function',
    description: 'Set the language for all Harbor messages (i18n support).',
    signature: `import { setLocale, t } from 'harbor';

// Set to Hebrew
setLocale('he');

// Use translations
console.log(t('server.started', { host: 'localhost', port: 3000 }));
// Output: השרת פועל בכתובת http://localhost:3000`,
  },
];

export const QUICK_START_CODE = `import { createServer, connect, GET, POST, httpLogger } from 'harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');

const server = createServer({ port: 3000 });

// Add HTTP logging (Morgan-like)
server.addMiddleware(httpLogger({ format: 'dev' }));

// Simple route - just pass your handler function!
server.addRoute(
  GET('/health', () => ({ status: 'ok', timestamp: new Date() }))
);

// Route with validation
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

// Server is running at http://localhost:3000`;

