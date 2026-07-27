import type { Feature, CodeExample, ApiItem } from '@/types';

export const VERSION = '1.6.0';
export const PORTAL_VERSION = '1.0.1';
export const TITLE = 'Harbor';
export const TAGLINE = 'The Complete Node.js Backend Framework';
export const DESCRIPTION = 'Server creation, routing, MongoDB ODM, job queue, mail, caching, auth, WebSocket, scheduling, Docker, and more. Part of the ForgeStack ecosystem.';

export const FORGESTACK_TAGLINE = 'Part of the ForgeStack Ecosystem';
export const FORGESTACK_DESCRIPTION = 'Harbor works seamlessly with Bear UI, Synapse state, Compass routing, Relay HTTP, Crucible testing, and Forge CLI.';

export const STATS = [
  { value: '13+', label: 'Built-in Modules' },
  { value: 'TypeScript', label: 'First Class Support' },
  { value: 'Zero-Config', label: 'Server in Seconds' },
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
    id: 'queue',
    title: 'Job Queue',
    description: 'Priority-based job processing with retries, exponential backoff, dead letter queue, and configurable concurrency.',
    icon: 'stack',
  },
  {
    id: 'mail',
    title: 'Mail',
    description: 'Zero-dependency SMTP transport with HTML templates, provider presets (Gmail, Outlook, SendGrid, SES), and attachments.',
    icon: 'mail',
  },
  {
    id: 'routes',
    title: 'Route Management',
    description: 'Fluent API with pre/post middleware, validation, timeout handling, and automatic error responses.',
    icon: 'routes',
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'JWT, API Key, RBAC, request signing, password hashing. Protect any route in one line.',
    icon: 'shield',
  },
  {
    id: 'websocket',
    title: 'WebSocket',
    description: 'Real-time communication with rooms, broadcasting, heartbeat, and client tracking.',
    icon: 'realtime',
  },
  {
    id: 'cache',
    title: 'Caching',
    description: 'Memory and Redis cache stores with middleware support, pattern invalidation, and TTL management.',
    icon: 'cache',
  },
  {
    id: 'scheduler',
    title: 'Scheduler',
    description: 'Cron expressions, interval-based, and one-time job scheduling with lifecycle callbacks.',
    icon: 'clock',
  },
  {
    id: 'validation',
    title: 'Schema Validation',
    description: 'Mongoose-compatible schema validation. Validate params, query, body, and headers with custom validators.',
    icon: 'check',
  },
  {
    id: 'testing',
    title: 'Testing with Crucible',
    description: 'Built-in test support via @forgedevstack/crucible. Test routes, middleware, models, and queue jobs.',
    icon: 'test',
  },
  {
    id: 'docker',
    title: 'Docker Manager',
    description: 'Built-in Docker and Docker Compose management. Build, push, pull images and orchestrate containers.',
    icon: 'server',
  },
];

export const FORGESTACK_PACKAGES = [
  { name: 'Bear UI', description: 'React component library', command: 'npm i @forgedevstack/bear' },
  { name: 'Synapse', description: 'State management', command: 'npm i @forgedevstack/synapse' },
  { name: 'Compass', description: 'Type-safe routing', command: 'npm i @forgedevstack/compass' },
  { name: 'Relay', description: 'HTTP client', command: 'npm i @forgedevstack/relay' },
  { name: 'Crucible', description: 'Testing framework', command: 'npm i -D @forgedevstack/crucible' },
  { name: 'Forge CLI', description: 'Project scaffolding', command: 'npx create-forge my-app' },
];

export const EXAMPLE_TABS = [
  { id: 'routing', label: 'Routing' },
  { id: 'database', label: 'Database' },
  { id: 'queue', label: 'Queue' },
  { id: 'mail', label: 'Mail' },
  { id: 'auth', label: 'Auth' },
  { id: 'testing', label: 'Testing' },
];

export const API_ITEMS: ApiItem[] = [
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
    name: 'createQueue(name, options, events)',
    type: 'function',
    description: 'Creates a new job queue with priority processing, retries, and dead letter queue.',
    signature: `import { createQueue } from '@forgedevstack/harbor/queue';

const queue = createQueue<{ to: string }>('emails', {
  concurrency: 3,
  defaultMaxRetries: 5,
  baseRetryDelay: 2000,
}, {
  onJobComplete: (job) => console.log('Done:', job.id),
  onJobFailed: (job, err) => console.error(err),
  onJobDead: (job) => console.error('Dead:', job.id),
});

queue.process(async (job) => {
  await sendEmail(job.data.to);
});

queue.add({ to: 'user@test.com' }, { priority: 'high' });
queue.start();`,
  },
  {
    name: 'createMailer(options) / createMailerFromProvider(provider, auth)',
    type: 'function',
    description: 'Creates a mailer for sending emails via SMTP. Use provider presets for Gmail, Outlook, SendGrid, SES.',
    signature: `import { createMailerFromProvider, registerTemplate } from '@forgedevstack/harbor/mail';

const mailer = createMailerFromProvider('gmail', {
  user: 'you@gmail.com',
  pass: 'app-password',
}, 'you@gmail.com');

registerTemplate({
  name: 'welcome',
  subject: 'Welcome {{name}}!',
  html: '<h1>Hello {{name}}</h1><p>Welcome to {{app}}.</p>',
});

await mailer.sendTemplate('welcome', { name: 'John', app: 'MyApp' }, {
  to: 'john@test.com',
});`,
  },
  {
    name: 'Schema(definition, options)',
    type: 'class',
    description: 'Define the structure of your documents with Mongoose-compatible schema syntax.',
    signature: `import { Schema, model } from '@forgedevstack/harbor/database';

const userSchema = new Schema({
  email: { type: 'String', required: true, unique: true },
  password: { type: 'String', required: true, minLength: 8 },
  role: { type: 'String', enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function(next) { /* hash password */ });
const User = model('User', userSchema);`,
  },
  {
    name: 'GET / POST / PUT / PATCH / DELETE',
    type: 'function',
    description: 'Simple route definition functions.',
    signature: `const route = GET('/api/users', async (req) => {
  return { users: [] };
});

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
];

export const QUICK_START_CODE = `import { createServer, router, GET, POST } from '@forgedevstack/harbor';
import { connect, Schema, model } from '@forgedevstack/harbor/database';
import { createQueue } from '@forgedevstack/harbor/queue';
import { createMailerFromProvider } from '@forgedevstack/harbor/mail';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');

// Define a model
const User = model('User', new Schema({
  email: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true },
}));

// Create a job queue
const emailQueue = createQueue('welcome-emails', { concurrency: 2 });
emailQueue.process(async (job) => {
  const mailer = createMailerFromProvider('gmail', {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  });
  await mailer.send({
    to: job.data.email,
    subject: 'Welcome!',
    html: '<h1>Welcome to our app!</h1>',
  });
});
emailQueue.start();

// Create server with routes
const server = createServer({ port: 3000 });

const users = router('/api/users', [
  GET('/', async () => {
    const allUsers = await User.find();
    return { users: allUsers };
  }),
  POST('/', async (req) => {
    const user = await User.create(req.body);
    emailQueue.add({ email: user.email });
    return { user };
  }),
]);

server.use(users);
server.listen(3000, () => console.log('Server running!'));`;

export const NAV_ITEMS = [
  { id: 'docs', label: 'Docs', href: '/docs/quick-start', isLink: true },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'examples', label: 'Examples', href: '#examples' },
  { id: 'api', label: 'API', href: '#api' },
  { id: 'forgestack', label: 'ForgeStack', href: 'https://forgedevstack.com', external: true },
  { id: 'npm', label: 'npm', href: 'https://www.npmjs.com/search?q=%40forgedevstack', external: true },
];

export const FOOTER_LINKS = [
  { label: 'ForgeStack', href: 'https://forgedevstack.com' },
  { label: 'npm', href: 'https://www.npmjs.com/search?q=%40forgedevstack' },
  { label: 'Harbor', href: 'https://www.npmjs.com/package/@forgedevstack/harbor' },
  { label: 'Forge CLI', href: 'https://www.npmjs.com/package/create-forge' },
];
