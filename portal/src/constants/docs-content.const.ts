import { EXTRA_DOCS } from './docs-extra.const';
import { MORE_DOCS } from './docs-more.const';

// Documentation Content for all pages

interface DocContentSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  filename?: string;
}

export interface DocContent {
  title: string;
  description: string;
  sections: DocContentSection[];
}

export const DOCS_CONTENT: Record<string, DocContent> = {
  'quick-start': {
    title: 'Quick Start',
    description: 'Get up and running with Harbor in under 5 minutes.',
    sections: [
      {
        id: 'install',
        title: 'Installation',
        content: 'Install Harbor using npm, yarn, or pnpm:',
        code: `# npm
npm install harbor

# yarn
yarn add harbor

# pnpm
pnpm add harbor`,
        filename: 'terminal',
      },
      {
        id: 'peer-deps',
        title: 'Peer Dependencies',
        content: 'For database operations, install the MongoDB driver:',
        code: `npm install mongodb`,
        filename: 'terminal',
      },
      {
        id: 'first-server',
        title: 'Your First Server',
        content: 'Create a new file called `server.ts` and add the following code:',
        code: `import { createServer, connect, GET, POST } from '@forgedevstack/harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');

// Create server
const server = createServer({ port: 3000 });

// Add a simple route
server.addRoute(
  GET('/api/health', () => ({
    status: 'ok',
    timestamp: new Date()
  }))
);

// Server is running at http://localhost:3000`,
        filename: 'server.ts',
      },
      {
        id: 'run',
        title: 'Run Your Server',
        content: 'Start your server with:',
        code: `npx ts-node server.ts

# Output:
# [Harbor] Server started on http://localhost:3000`,
        filename: 'terminal',
      },
    ],
  },

  'installation': {
    title: 'Installation',
    description: 'Detailed installation guide for Harbor.',
    sections: [
      {
        id: 'requirements',
        title: 'Requirements',
        content: `Before installing Harbor, make sure you have:

- **Node.js 18+** - Harbor requires Node.js 18 or higher
- **TypeScript 5+** - Recommended for best experience
- **MongoDB** - If using database features`,
      },
      {
        id: 'npm',
        title: 'Installing with npm',
        content: 'The recommended way to install Harbor:',
        code: `npm install harbor`,
        filename: 'terminal',
      },
      {
        id: 'mongodb',
        title: 'MongoDB Driver',
        content: `If you're using Harbor's database features (Schema, Model, etc.), install the MongoDB driver:

The MongoDB driver is a peer dependency, meaning you can use any compatible version:`,
        code: `npm install mongodb`,
        filename: 'terminal',
      },
      {
        id: 'project-structure',
        title: 'Recommended Project Structure',
        content: 'Here is a recommended project structure for a Harbor application:',
        code: `my-app/
├── src/
│   ├── models/           # Database models
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── posts.ts
│   ├── middleware/       # Custom middleware
│   │   └── auth.ts
│   ├── config/           # Configuration
│   │   └── index.ts
│   └── server.ts         # Main entry point
├── harbor.config.json    # Harbor configuration
├── package.json
└── tsconfig.json`,
        filename: 'project-structure',
      },
      {
        id: 'cli-init',
        title: 'Using the CLI',
        content: 'Harbor includes a CLI to quickly scaffold a new project:',
        code: `npx harbor init

# This creates:
# - harbor.config.json
# - src/server.ts
# - Basic project structure`,
        filename: 'terminal',
      },
    ],
  },

  'templates': {
    title: 'Project Templates',
    description: 'A ready-to-run Harbor API. Download it from the sandbox, or create it with the CLI.',
    sections: [
      {
        id: 'download',
        title: 'Download',
        content: 'The sandbox serves the same files that live in `templates/default` in this repo. The zip is named `harbor-starter.zip`. Unzip it, install, and start.',
        code: `npm install
npm run dev

# GET http://localhost:3000/api/health
# GET http://localhost:3000/api/users`,
        filename: 'terminal',
      },
      {
        id: 'create-command',
        title: 'Create with the CLI',
        content: '`harbor create` copies that starter into a new folder and writes `harbor.config.json`.',
        code: `npx @forgedevstack/harbor create my-api
cd my-api
npm install
npm run dev`,
        filename: 'terminal',
      },
      {
        id: 'project-structure',
        title: 'What you get',
        content: `The starter keeps users in memory, so it runs without MongoDB.

\`\`\`
my-api/
├── src/server.ts
├── src/routes/health.ts
├── src/routes/users.ts
├── src/controllers/user.controller.ts
├── src/services/user.service.ts
├── package.json
├── tsconfig.json
├── .env.example
└── harbor.config.json
\`\`\`

\`src/routes/users.ts\` only marks the route and calls \`UserController\`. The controller calls \`UserService\`. \`@check\` stays on the route method.`,
      },
      {
        id: 'init-template',
        title: 'Existing folder',
        content: '`harbor init` writes a one-file server. `harbor init --template` copies the full starter into the current folder.',
        code: `harbor init
harbor init --template`,
        filename: 'terminal',
      },
    ],
  },

  'cli': {
    title: 'CLI',
    description: 'npx @forgedevstack/harbor create prints the HARBOR wordmark, then writes a project you can run.',
    sections: [
      {
        id: 'create',
        title: 'Create',
        content: 'Both forms print the same logo, then copy the starter into a new folder.',
        code: `npx @forgedevstack/harbor create my-api
npx @forgedevstack/harbor --create my-api`,
        filename: 'terminal',
      },
      {
        id: 'logo',
        title: 'What you see',
        content: 'Create, init, version, and help print this wordmark in a fuchsia-to-violet gradient, then the version.',
        code: `██╗  ██╗ █████╗ ██████╗ ██████╗  ██████╗ ██████╗
██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
███████║███████║██████╔╝██████╔╝██║   ██║██████╔╝
██╔══██║██╔══██║██╔══██╗██╔══██╗██║   ██║██╔══██╗
██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝

  ⚓  Harbor CLI
  Node.js backends   v1.6.5`,
        filename: 'terminal',
      },
      {
        id: 'commands',
        title: 'Other commands',
        content: '`init` writes a one-file server in the current folder. `init --template` copies the full starter, including the controller and the service.',
        code: `npx @forgedevstack/harbor init
npx @forgedevstack/harbor init --template
npx @forgedevstack/harbor version
npx @forgedevstack/harbor help`,
        filename: 'terminal',
      },
    ],
  },

  'schemas': {
    title: 'Schemas',
    description: 'Everything in Harbor starts with a Schema. Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.',
    sections: [
      {
        id: 'defining-schema',
        title: 'Defining Your Schema',
        content: `A schema defines the structure of documents in a MongoDB collection. It's similar to Mongoose schemas but uses string types for better clarity:`,
        code: `import { Schema } from '@forgedevstack/harbor';

const blogSchema = new Schema({
  title: 'String',                    // Shorthand for { type: 'String' }
  author: 'String',
  body: 'String',
  comments: [{                        // Array of subdocuments
    body: 'String',
    date: 'Date'
  }],
  date: { 
    type: 'Date', 
    default: () => new Date()         // Default value function
  },
  hidden: 'Boolean',
  meta: {                             // Nested object
    votes: 'Number',
    favs: 'Number'
  }
});`,
        filename: 'models/Blog.ts',
      },
      {
        id: 'schema-types',
        title: 'Schema Types',
        content: `Harbor supports all standard MongoDB types:

| Type | Description |
|------|-------------|
| String | String values |
| Number | Numeric values (integers and floats) |
| Boolean | true/false |
| Date | JavaScript Date objects |
| ObjectId | MongoDB ObjectId |
| Array | Arrays of any type |
| Object / Mixed | Any object structure |
| Buffer | Binary data |
| Decimal128 | High-precision decimals |
| Map | ES6 Map objects |`,
        code: `const schema = new Schema({
  name: 'String',
  age: 'Number',
  isActive: 'Boolean',
  birthday: 'Date',
  userId: 'ObjectId',
  tags: ['String'],           // Array of strings
  metadata: 'Mixed',          // Any object
  data: 'Buffer'
});`,
        filename: 'schema-types.ts',
      },
      {
        id: 'field-options',
        title: 'Field Options',
        content: 'Each field can have various options for validation and behavior:',
        code: `const userSchema = new Schema({
  email: {
    type: 'String',
    required: true,           // Field is required
    unique: true,             // Must be unique in collection
    lowercase: true,          // Convert to lowercase
    trim: true,               // Trim whitespace
    match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/  // Regex validation
  },
  password: {
    type: 'String',
    required: true,
    minLength: 8,             // Minimum length
    maxLength: 100,           // Maximum length
    select: false             // Don't include in queries by default
  },
  age: {
    type: 'Number',
    min: 0,                   // Minimum value
    max: 150,                 // Maximum value
    default: 0                // Default value
  },
  role: {
    type: 'String',
    enum: ['user', 'admin', 'moderator'],  // Allowed values
    default: 'user'
  },
  createdAt: {
    type: 'Date',
    immutable: true,          // Cannot be changed after creation
    default: () => new Date()
  }
});`,
        filename: 'models/User.ts',
      },
      {
        id: 'custom-validation',
        title: 'Custom Validators',
        content: 'Add custom validation logic to any field:',
        code: `const userSchema = new Schema({
  phone: {
    type: 'String',
    validate: {
      validator: (value) => {
        // Custom validation logic
        return /^\\+?[1-9]\\d{1,14}$/.test(value);
      },
      message: 'Please enter a valid phone number'
    }
  },
  password: {
    type: 'String',
    required: true,
    validate: {
      validator: async (value) => {
        // Async validation
        const hasUppercase = /[A-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*]/.test(value);
        return hasUppercase && hasNumber && hasSpecial;
      },
      message: 'Password must contain uppercase, number, and special character'
    }
  }
});`,
        filename: 'custom-validation.ts',
      },
      {
        id: 'schema-options',
        title: 'Schema Options',
        content: 'Configure schema behavior with options:',
        code: `const userSchema = new Schema({
  name: 'String',
  email: 'String'
}, {
  // Add createdAt and updatedAt timestamps
  timestamps: true,
  
  // Custom timestamp field names
  // timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  
  // Collection name (default: lowercase plural of model name)
  collection: 'users',
  
  // Only allow schema-defined fields
  strict: true,
  
  // Version key field name (false to disable)
  versionKey: '__v',
  
  // Auto-create collection
  autoCreate: true,
  
  // Auto-create indexes
  autoIndex: true,
  
  // Include _id field (default: true)
  _id: true,
  
  // Include id virtual (default: true)
  id: true
});`,
        filename: 'schema-options.ts',
      },
      {
        id: 'nested-schemas',
        title: 'Nested Schemas',
        content: 'Define nested structures and subdocuments:',
        code: `// Define a subdocument schema
const addressSchema = new Schema({
  street: 'String',
  city: 'String',
  state: 'String',
  zip: 'String',
  country: { type: 'String', default: 'USA' }
}, { _id: false });  // No _id for subdocuments

// Use in parent schema
const userSchema = new Schema({
  name: 'String',
  email: 'String',
  
  // Single nested document
  address: addressSchema,
  
  // Array of nested documents
  addresses: [addressSchema],
  
  // Inline nested object
  profile: {
    bio: 'String',
    avatar: 'String',
    social: {
      twitter: 'String',
      github: 'String',
      linkedin: 'String'
    }
  }
});`,
        filename: 'nested-schemas.ts',
      },
    ],
  },

  'connections': {
    title: 'Connections',
    description: 'Learn how to connect to MongoDB using Harbor.',
    sections: [
      {
        id: 'basic-connection',
        title: 'Basic Connection',
        content: 'Connect to MongoDB using the `connect` function:',
        code: `import { connect, connection } from '@forgedevstack/harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');

// The connection is now established
console.log('Connected to:', connection.name);  // 'myapp'`,
        filename: 'connect.ts',
      },
      {
        id: 'connection-options',
        title: 'Connection Options',
        content: 'Pass options to customize the connection:',
        code: `await connect('mongodb://localhost:27017/myapp', {
  // Pool size
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeouts
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  
  // Write concern
  w: 'majority',
  wtimeoutMS: 10000,
  journal: true,
  
  // Retry
  retryWrites: true,
  
  // SSL/TLS
  ssl: true,
  tls: true,
  tlsCAFile: '/path/to/ca.pem',
  
  // Auth
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256',
  
  // Replica set
  replicaSet: 'rs0',
  
  // App name (for monitoring)
  appName: 'my-harbor-app'
});`,
        filename: 'connection-options.ts',
      },
      {
        id: 'connection-events',
        title: 'Connection Events',
        content: 'Listen to connection events for monitoring and error handling:',
        code: `import { connection } from '@forgedevstack/harbor';

// Connected successfully
connection.on('connected', () => {
  console.log('MongoDB connected!');
});

// Connection error
connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Disconnected
connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Reconnecting
connection.on('connecting', () => {
  console.log('Reconnecting to MongoDB...');
});

// Close event (when disconnect() is called)
connection.on('close', () => {
  console.log('Connection closed');
});`,
        filename: 'connection-events.ts',
      },
      {
        id: 'connection-state',
        title: 'Connection State',
        content: `Check the current connection state:

| State | Value | Description |
|-------|-------|-------------|
| Disconnected | 0 | Not connected |
| Connected | 1 | Successfully connected |
| Connecting | 2 | Connection in progress |
| Disconnecting | 3 | Disconnection in progress |`,
        code: `import { connection } from '@forgedevstack/harbor';

// Check connection state
console.log(connection.readyState);  // 0, 1, 2, or 3

// Connection properties
console.log(connection.host);   // 'localhost'
console.log(connection.port);   // 27017
console.log(connection.name);   // 'myapp'

// Check if connected
if (connection.readyState === 1) {
  console.log('Database is connected');
}

// Ping the database
const isAlive = await connection.ping();
console.log('Database ping:', isAlive);  // true or false`,
        filename: 'connection-state.ts',
      },
      {
        id: 'disconnect',
        title: 'Disconnecting',
        content: 'Properly close the connection when shutting down:',
        code: `import { disconnect, connection } from '@forgedevstack/harbor';

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  
  await disconnect();
  
  console.log('Database disconnected');
  process.exit(0);
});

// Or use connection.close()
await connection.close();`,
        filename: 'disconnect.ts',
      },
    ],
  },

  'models': {
    title: 'Models',
    description: 'Models are fancy constructors compiled from Schema definitions. An instance of a model is called a document.',
    sections: [
      {
        id: 'creating-model',
        title: 'Creating a Model',
        content: 'Use the `model` function to compile a schema into a Model:',
        code: `import { Schema, model } from '@forgedevstack/harbor';

// Define schema
const userSchema = new Schema({
  name: { type: 'String', required: true },
  email: { type: 'String', required: true, unique: true },
  age: 'Number'
});

// Create model
const User = model('User', userSchema);

// The model is ready to use!
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});`,
        filename: 'models/User.ts',
      },
      {
        id: 'collection-name',
        title: 'Collection Name',
        content: `By default, Harbor lowercases and pluralizes your model name. You can override this:`,
        code: `// Default: 'users' collection
const User = model('User', userSchema);

// Custom collection name
const User = model('User', userSchema, 'app_users');

// Or via schema options
const userSchema = new Schema({ /* ... */ }, {
  collection: 'app_users'
});`,
        filename: 'collection-name.ts',
      },
      {
        id: 'instance-methods',
        title: 'Instance Methods',
        content: 'Add custom methods to documents:',
        code: `const userSchema = new Schema({
  firstName: 'String',
  lastName: 'String',
  password: 'String'
});

// Method 1: Using methods object
userSchema.methods.fullName = function() {
  return this.firstName + ' ' + this.lastName;
};

// Method 2: Using method() function
userSchema.method('comparePassword', async function(candidatePassword) {
  // Compare passwords
  return await bcrypt.compare(candidatePassword, this.password);
});

const User = model('User', userSchema);

// Usage
const user = await User.findOne({ email: 'john@example.com' });
console.log(user.fullName());  // 'John Doe'

const isValid = await user.comparePassword('secret123');
console.log(isValid);  // true or false`,
        filename: 'instance-methods.ts',
      },
      {
        id: 'static-methods',
        title: 'Static Methods',
        content: 'Add custom static methods to the Model:',
        code: `const userSchema = new Schema({
  email: 'String',
  role: 'String',
  isActive: 'Boolean'
});

// Method 1: Using statics object
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Method 2: Using static() function
userSchema.static('findAdmins', function() {
  return this.find({ role: 'admin', isActive: true });
});

const User = model('User', userSchema);

// Usage
const user = await User.findByEmail('john@example.com');
const admins = await User.findAdmins();`,
        filename: 'static-methods.ts',
      },
    ],
  },

  'queries': {
    title: 'Queries',
    description: 'Harbor models provide several static helper functions for CRUD operations. Each of these functions returns a Query object.',
    sections: [
      {
        id: 'finding-documents',
        title: 'Finding Documents',
        content: `Use find, findOne, and findById to query documents:`,
        code: `import { User } from './models/User';

// Find all documents
const allUsers = await User.find();

// Find with filter
const admins = await User.find({ role: 'admin' });

// Find one document
const user = await User.findOne({ email: 'john@example.com' });

// Find by ID
const user = await User.findById('507f1f77bcf86cd799439011');

// Find with projection (select specific fields)
const user = await User.findOne(
  { email: 'john@example.com' },
  { name: 1, email: 1, _id: 0 }  // Include name, email; exclude _id
);`,
        filename: 'find-queries.ts',
      },
      {
        id: 'query-builder',
        title: 'Query Builder',
        content: 'Chain query methods for complex queries:',
        code: `// Select specific fields
const users = await User.find()
  .select('name email role');

// Or exclude fields
const users = await User.find()
  .select('-password -__v');

// Sort results
const users = await User.find()
  .sort('name');            // Ascending
  
const users = await User.find()
  .sort('-createdAt');      // Descending

const users = await User.find()
  .sort({ name: 1, age: -1 });  // Object syntax

// Limit and skip (pagination)
const page = 1;
const limit = 20;
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);

// Lean (return plain objects, not documents)
const users = await User.find().lean();`,
        filename: 'query-builder.ts',
      },
      {
        id: 'query-conditions',
        title: 'Query Conditions',
        content: 'Build complex query conditions:',
        code: `// Using where()
const users = await User.find()
  .where('age').gte(18).lte(65)
  .where('role').equals('user');

// Comparison operators
const users = await User.find()
  .where('age').gt(18)      // Greater than
  .where('age').gte(18)     // Greater than or equal
  .where('age').lt(65)      // Less than
  .where('age').lte(65)     // Less than or equal
  .where('role').ne('admin'); // Not equal

// Array operators
const users = await User.find()
  .where('role').in(['user', 'moderator'])    // In array
  .where('status').nin(['banned', 'deleted']); // Not in array

// Regex
const users = await User.find()
  .where('name').regex(/^John/i);  // Names starting with 'John'

// Exists
const users = await User.find()
  .where('deletedAt').exists(false);  // Field doesn't exist

// OR conditions
const users = await User.find().or([
  { role: 'admin' },
  { role: 'moderator' }
]);

// AND conditions
const users = await User.find().and([
  { isActive: true },
  { isVerified: true }
]);`,
        filename: 'query-conditions.ts',
      },
      {
        id: 'update-queries',
        title: 'Update Queries',
        content: 'Various ways to update documents:',
        code: `// Update one document
await User.updateOne(
  { email: 'john@example.com' },
  { name: 'John Smith' }
);

// Update with operators
await User.updateOne(
  { email: 'john@example.com' },
  { 
    $set: { name: 'John Smith' },
    $inc: { loginCount: 1 },
    $push: { tags: 'premium' }
  }
);

// Update many documents
await User.updateMany(
  { isActive: false },
  { $set: { status: 'inactive' } }
);

// Find and update (returns the document)
const user = await User.findOneAndUpdate(
  { email: 'john@example.com' },
  { $set: { lastLogin: new Date() } },
  { new: true }  // Return updated document
);

// Find by ID and update
const user = await User.findByIdAndUpdate(
  '507f1f77bcf86cd799439011',
  { name: 'Updated Name' },
  { new: true, upsert: true }  // Create if doesn't exist
);`,
        filename: 'update-queries.ts',
      },
      {
        id: 'delete-queries',
        title: 'Delete Queries',
        content: 'Remove documents from the collection:',
        code: `// Delete one document
await User.deleteOne({ email: 'john@example.com' });

// Delete many documents
await User.deleteMany({ isActive: false });

// Find and delete (returns the deleted document)
const deletedUser = await User.findOneAndDelete({ email: 'john@example.com' });
console.log('Deleted:', deletedUser.name);

// Find by ID and delete
const deletedUser = await User.findByIdAndDelete('507f1f77bcf86cd799439011');

// Delete all documents (use with caution!)
await User.deleteMany({});`,
        filename: 'delete-queries.ts',
      },
      {
        id: 'aggregation',
        title: 'Aggregation',
        content: 'Perform complex data transformations:',
        code: `// Aggregation pipeline
const result = await User.aggregate([
  // Stage 1: Filter
  { $match: { isActive: true } },
  
  // Stage 2: Group by role
  { 
    $group: { 
      _id: '$role', 
      count: { $sum: 1 },
      avgAge: { $avg: '$age' }
    } 
  },
  
  // Stage 3: Sort by count
  { $sort: { count: -1 } },
  
  // Stage 4: Limit results
  { $limit: 10 }
]);

// Result: [{ _id: 'user', count: 150, avgAge: 28.5 }, ...]`,
        filename: 'aggregation.ts',
      },
    ],
  },

  'middleware': {
    title: 'Middleware (Hooks)',
    description: 'Middleware are functions which are passed control during execution of asynchronous functions. Middleware is specified on the schema level.',
    sections: [
      {
        id: 'pre-hooks',
        title: 'Pre Hooks',
        content: 'Pre middleware functions are executed before the hooked method:',
        code: `const userSchema = new Schema({
  email: 'String',
  password: 'String',
  createdAt: 'Date'
});

// Pre-save: runs before document.save()
userSchema.pre('save', async function(next) {
  // Hash password before saving
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Set createdAt for new documents
  if (this.isNew) {
    this.createdAt = new Date();
  }
  
  next();
});

// Pre-validate: runs before validation
userSchema.pre('validate', function(next) {
  this.email = this.email.toLowerCase().trim();
  next();
});

// Pre-remove
userSchema.pre('remove', async function(next) {
  // Clean up related data
  await Post.deleteMany({ author: this._id });
  next();
});`,
        filename: 'pre-hooks.ts',
      },
      {
        id: 'post-hooks',
        title: 'Post Hooks',
        content: 'Post middleware functions are executed after the hooked method:',
        code: `// Post-save: runs after document.save()
userSchema.post('save', function(next) {
  console.log('User saved:', this._id);
  
  // Send welcome email for new users
  if (this.isNew) {
    sendWelcomeEmail(this.email);
  }
  
  next();
});

// Post-find: runs after queries
userSchema.post('find', function(docs, next) {
  console.log('Found', docs.length, 'users');
  next();
});

// Post-findOne
userSchema.post('findOne', function(doc, next) {
  if (doc) {
    console.log('Found user:', doc.email);
  }
  next();
});`,
        filename: 'post-hooks.ts',
      },
      {
        id: 'query-middleware',
        title: 'Query Middleware',
        content: 'Middleware for query operations:',
        code: `// Pre-find: modify all find queries
userSchema.pre('find', function(next) {
  // Automatically exclude soft-deleted documents
  this.where({ deletedAt: { $exists: false } });
  next();
});

// Pre-findOne: modify findOne queries
userSchema.pre('findOne', function(next) {
  this.where({ isActive: true });
  next();
});

// Pre-updateOne
userSchema.pre('updateOne', function(next) {
  // Always update 'updatedAt' field
  this.set({ updatedAt: new Date() });
  next();
});

// Pre-findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});`,
        filename: 'query-middleware.ts',
      },
    ],
  },

  'validation': {
    title: 'Validation',
    description: 'Harbor provides built-in validators, custom validation, and request validation for your routes.',
    sections: [
      {
        id: 'built-in-validators',
        title: 'Built-in Validators',
        content: 'Schema fields come with built-in validation:',
        code: `const userSchema = new Schema({
  // Required validator
  name: { type: 'String', required: true },
  
  // String validators
  email: {
    type: 'String',
    required: [true, 'Email is required'],
    minLength: [5, 'Email too short'],
    maxLength: [100, 'Email too long'],
    match: [/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, 'Invalid email format']
  },
  
  // Number validators
  age: {
    type: 'Number',
    min: [0, 'Age cannot be negative'],
    max: [150, 'Invalid age']
  },
  
  // Enum validator
  role: {
    type: 'String',
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  }
});`,
        filename: 'built-in-validators.ts',
      },
      {
        id: 'request-validation',
        title: 'Request Validation',
        content: 'Validate incoming request data in routes:',
        code: `import { POST, GET } from '@forgedevstack/harbor';

// Validate body, params, query, and headers
const createUser = POST('/api/users', async (req) => {
  // Access validated data
  const { email, name, age } = req.validated.body;
  
  return { user: { email, name, age } };
}, {
  validation: {
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true, min: 2, max: 50 },
      age: { type: 'number', min: 0, max: 150 }
    }
  }
});

// Validate query parameters
const listUsers = GET('/api/users', async (req) => {
  const { page, limit, role } = req.validated.query;
  
  return { page, limit, role };
}, {
  validation: {
    query: {
      page: { type: 'number', default: 1, min: 1 },
      limit: { type: 'number', default: 20, max: 100 },
      role: { type: 'string', enum: ['user', 'admin'] }
    }
  }
});`,
        filename: 'request-validation.ts',
      },
    ],
  },

  'routes': {
    title: 'Routes',
    description: 'Define API routes with an array, or mark class methods with @route. Both use the same router.',
    sections: [
      {
        id: 'marked-routes',
        title: 'Marked routes',
        content: 'Put @route.get (or post, put, patch, del) on a class method. The method receives one ctx object and returns data. router() mounts the class on a prefix. @check, @pre, @timeout, @limit, and @route.cache use the validation, middleware, timeout, rate limit, and cache Harbor already has. Delete uses @route.del because delete is a reserved word.',
        code: `import { createServer, router, route, check, pre } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';

class Users {
  @route.get('/')
  list() {
    return { users: [] };
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
    return { id: '1', ...body };
  }

  @route.del('/:id')
  @pre((req, res, next) => {
    if (!req.header('authorization')) {
      res.status(401).json({ success: false });
      return;
    }
    next();
  })
  remove(ctx: RouteCtx) {
    return { deleted: ctx.params.id };
  }
}

const server = createServer({ port: 3000 });
server.use(router('/api/users', Users));`,
        filename: 'users.routes.ts',
      },
      {
        id: 'basic-routes',
        title: 'Basic Routes',
        content: 'Use the route helper functions to create routes:',
        code: `import { createServer, GET, POST, PUT, DELETE } from '@forgedevstack/harbor';

const server = createServer({ port: 3000 });

// GET request
server.addRoute(
  GET('/api/users', async (req) => {
    const users = await User.find();
    return { users };
  })
);

// POST request
server.addRoute(
  POST('/api/users', async (req) => {
    const user = await User.create(req.body);
    return { user };
  })
);

// PUT request
server.addRoute(
  PUT('/api/users/:id', async (req) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return { user };
  })
);

// DELETE request
server.addRoute(
  DELETE('/api/users/:id', async (req) => {
    await User.findByIdAndDelete(req.params.id);
    return { deleted: true };
  })
);`,
        filename: 'basic-routes.ts',
      },
      {
        id: 'route-options',
        title: 'Route Options',
        content: 'Configure routes with validation, middleware, and more:',
        code: `import { POST, GET } from '@forgedevstack/harbor';

const createUser = POST('/api/users', async (req) => {
  const { email, name } = req.validated.body;
  const user = await User.create({ email, name });
  return { user };
}, {
  // Validation
  validation: {
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true, min: 2 }
    }
  },
  
  // Pre-middleware (runs before handler)
  pre: [authMiddleware, rateLimitMiddleware],
  
  // Post-middleware (runs after handler)
  post: [loggingMiddleware],
  
  // Timeout in milliseconds
  timeout: 30000,
  
  // Tags for documentation
  tags: ['users'],
  
  // Description for documentation
  description: 'Create a new user'
});`,
        filename: 'route-options.ts',
      },
    ],
  },

  'errors': {
    title: 'Error Handling',
    description: 'Handle errors consistently across your Harbor application.',
    sections: [
      {
        id: 'harbor-error',
        title: 'HarborError Class',
        content: 'Throw HarborError to return consistent error responses:',
        code: `import { GET, HarborError } from '@forgedevstack/harbor';

const getUser = GET('/api/users/:id', async (req) => {
  const user = await User.findById(req.params.id);
  
  // Not found error
  if (!user) {
    throw HarborError.notFound('User not found');
  }
  
  // Authorization error
  if (!user.isActive) {
    throw HarborError.forbidden('Account is disabled');
  }
  
  return { user };
});

// Available error methods:
// HarborError.badRequest(message?, details?)   // 400
// HarborError.unauthorized(message?)           // 401
// HarborError.forbidden(message?)              // 403
// HarborError.notFound(message?)               // 404
// HarborError.conflict(message?, details?)     // 409
// HarborError.tooManyRequests(message?)        // 429
// HarborError.internal(message?)               // 500`,
        filename: 'harbor-error.ts',
      },
      {
        id: 'error-config',
        title: 'Error Configuration',
        content: 'Configure error responses in harbor.config.json:',
        code: `{
  "errors": {
    "400": {
      "message": "Bad Request",
      "json": true,
      "log": true
    },
    "401": {
      "message": "Please login to continue",
      "json": true,
      "log": true
    },
    "403": {
      "message": "Access denied",
      "json": true
    },
    "404": {
      "message": "Resource not found",
      "json": true
    },
    "500": {
      "message": "Something went wrong",
      "json": true,
      "log": true,
      "stack": false
    }
  }
}`,
        filename: 'harbor.config.json',
      },
    ],
  },

  'server': {
    title: 'Creating a Server',
    description: 'Create and configure your Harbor server.',
    sections: [
      {
        id: 'create-server',
        title: 'createServer',
        content: 'Create a new server instance:',
        code: `import { createServer } from '@forgedevstack/harbor';

const server = createServer({
  // Port to listen on
  port: 3000,
  
  // Host to bind to
  host: 'localhost',
  
  // Path to config file
  configPath: './harbor.config.json',
  
  // Auto-start the server (default: true)
  autoStart: true,
  
  // Callback when server is ready
  onReady: (info) => {
    console.log('Server running at http://' + info.host + ':' + info.port);
  },
  
  // Callback on error
  onError: (error) => {
    console.error('Server error:', error);
    process.exit(1);
  }
});`,
        filename: 'create-server.ts',
      },
      {
        id: 'server-methods',
        title: 'Server Methods',
        content: 'Methods available on the server instance:',
        code: `// Add a single route
server.addRoute(route);

// Add multiple routes
server.addRoutes([route1, route2, route3]);

// Add middleware
server.addMiddleware(middleware);

// Get the underlying Express app
const app = server.getApp();

// Stop the server gracefully
await server.stop();

// Get server info
const info = server.getInfo();
console.log(info);  // { host: 'localhost', port: 3000, status: 'running' }`,
        filename: 'server-methods.ts',
      },
    ],
  },

  'docker': {
    title: 'Docker Manager',
    description: 'Manage Docker containers and images with Harbor.',
    sections: [
      {
        id: 'docker-manager',
        title: 'Creating Docker Manager',
        content: 'Create and configure a Docker manager:',
        code: `import { createDockerManager } from '@forgedevstack/harbor';

const docker = createDockerManager({
  composePath: './docker-compose.yml',
  projectName: 'my-app',
  registry: 'ghcr.io/myorg'
});`,
        filename: 'docker-manager.ts',
      },
      {
        id: 'docker-compose',
        title: 'Docker Compose',
        content: 'Manage Docker Compose services:',
        code: `// Start all services
await docker.composeUp();

// Start specific services
await docker.composeUp(['web', 'db']);

// Stop all services
await docker.composeDown();

// Stop and remove volumes
await docker.composeDown(true);

// View logs
const logs = await docker.composeLogs('web');
console.log(logs);

// Execute command in container
const output = await docker.exec('web', 'npm run migrate');`,
        filename: 'docker-compose.ts',
      },
    ],
  },

  'i18n': {
    title: 'Internationalization (i18n)',
    description: 'Harbor includes built-in i18n support for all messages.',
    sections: [
      {
        id: 'set-locale',
        title: 'Setting Locale',
        content: 'Set the language for all Harbor messages:',
        code: `import { setLocale, getLocale, getAvailableLocales } from '@forgedevstack/harbor';

// Set to Hebrew
setLocale('he');

// Get current locale
console.log(getLocale());  // 'he'

// Get available locales
console.log(getAvailableLocales());  // ['en', 'he']`,
        filename: 'set-locale.ts',
      },
      {
        id: 'translations',
        title: 'Using Translations',
        content: 'Use the `t` function to get translated messages:',
        code: `import { t, setLocale } from '@forgedevstack/harbor';

setLocale('he');

// Simple translation
console.log(t('server.started'));
// Output: 'השרת פועל'

// Translation with parameters
console.log(t('server.started', { host: 'localhost', port: 3000 }));
// Output: 'השרת פועל בכתובת http://localhost:3000'`,
        filename: 'translations.ts',
      },
      {
        id: 'custom-translations',
        title: 'Adding Custom Translations',
        content: 'Add your own translations:',
        code: `import { addTranslations } from '@forgedevstack/harbor';

// Add English translations
addTranslations('en', {
  'app.welcome': 'Welcome to my app!',
  'app.goodbye': 'Goodbye, {name}!'
});

// Add Hebrew translations
addTranslations('he', {
  'app.welcome': 'ברוכים הבאים לאפליקציה שלי!',
  'app.goodbye': 'להתראות, {name}!'
});

// Use them
import { t } from '@forgedevstack/harbor';
console.log(t('app.goodbye', { name: 'John' }));`,
        filename: 'custom-translations.ts',
      },
    ],
  },

  'queue': {
    title: 'Job Queue',
    description: 'Priority-based asynchronous job processing with retries, exponential backoff, dead letter queue, delayed jobs, and real-time events.',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        content: `Harbor's Job Queue allows you to offload heavy or async work — email sending, image processing, PDF generation — to a background queue with full control over concurrency, retries, and priorities.

Key features:
- **Priority-based processing** — critical, high, medium, normal, low
- **Retries with exponential backoff** — configurable per job or globally
- **Dead Letter Queue** — permanently failed jobs are captured
- **Delayed jobs** — schedule jobs to run after a delay
- **Bulk operations** — add many jobs at once
- **Pause / Resume** — control queue processing at runtime
- **Real-time stats** — track pending, active, completed, failed counts`,
      },
      {
        id: 'basic-usage',
        title: 'Basic Usage',
        content: 'Create a queue, register a processor, and start processing:',
        code: `import { createQueue } from '@forgedevstack/harbor/queue';

interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

// Create a typed queue
const emailQueue = createQueue<EmailJob>('emails', {
  concurrency: 5,
  maxRetries: 3,
  retryDelay: 1000,
  backoffStrategy: 'exponential',
});

// Register a job processor
emailQueue.process(async (job) => {
  console.log(\`Sending email to \${job.data.to}\`);
  // Your email sending logic here
  await sendEmail(job.data.to, job.data.subject, job.data.body);
});

// Listen to events
emailQueue.on('job:completed', (job) => {
  console.log(\`Job \${job.id} completed\`);
});

emailQueue.on('job:failed', (job, error) => {
  console.error(\`Job \${job.id} failed: \${error.message}\`);
});

// Add jobs
emailQueue.add({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: '<h1>Welcome to our platform</h1>',
});

// Add a high priority job
emailQueue.add({
  to: 'admin@example.com',
  subject: 'Alert',
  body: 'Server is running hot',
}, { priority: 'high' });

// Add a delayed job (runs after 60 seconds)
emailQueue.add({
  to: 'user@example.com',
  subject: 'Follow up',
  body: 'How was your experience?',
}, { delay: 60000 });

// Start the queue
emailQueue.start();`,
        filename: 'queue-example.ts',
      },
      {
        id: 'bulk-operations',
        title: 'Bulk Operations & Stats',
        content: 'Add multiple jobs at once and inspect queue statistics:',
        code: `// Add many jobs in one call
emailQueue.addBulk([
  { data: { to: 'a@test.com', subject: 'Hi A', body: '...' } },
  { data: { to: 'b@test.com', subject: 'Hi B', body: '...' }, options: { priority: 'high' } },
  { data: { to: 'c@test.com', subject: 'Hi C', body: '...' }, options: { delay: 30000 } },
]);

// Get real-time queue stats
const stats = emailQueue.getStats();
console.log(stats);
// { total: 10, pending: 3, active: 2, completed: 4, failed: 0, delayed: 1 }

// Get all failed jobs
const failedJobs = emailQueue.getJobs('failed');

// Pause and resume
emailQueue.pause();
// ... do maintenance ...
emailQueue.resume();

// Stop completely
emailQueue.stop();`,
        filename: 'queue-bulk.ts',
      },
      {
        id: 'with-server',
        title: 'Queue with Harbor Server',
        content: 'Common pattern: trigger queue jobs from API routes:',
        code: `import { createServer, router, POST, GET } from '@forgedevstack/harbor';
import { createQueue } from '@forgedevstack/harbor/queue';

const invoiceQueue = createQueue<{ orderId: string; userId: string }>('invoices', {
  concurrency: 3,
  maxRetries: 5,
});

invoiceQueue.process(async (job) => {
  const { orderId, userId } = job.data;
  const pdf = await generateInvoicePDF(orderId);
  await uploadToStorage(pdf);
  await notifyUser(userId, pdf.url);
});

invoiceQueue.start();

const server = createServer({ port: 3000 });

const api = router('/api', [
  POST('/orders', async (req) => {
    const order = await Order.create(req.body);
    // Offload heavy work to queue
    invoiceQueue.add({ orderId: order.id, userId: req.user.id });
    return { order, message: 'Invoice is being generated' };
  }),

  GET('/queue/stats', async () => {
    return invoiceQueue.getStats();
  }),
]);

server.use(api);`,
        filename: 'queue-server.ts',
      },
    ],
  },

  'mail': {
    title: 'Mail',
    description: 'Zero-dependency SMTP mail service with HTML templates, provider presets, attachments, and priority support.',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        content: `Harbor's Mail module lets you send emails without any third-party email library. It speaks raw SMTP using Node.js \`net\` and \`tls\` modules.

Key features:
- **Zero external dependencies** — built on native Node.js sockets
- **Provider presets** — Gmail, Outlook, SendGrid, AWS SES
- **HTML templates** — register reusable templates with \`{{variable}}\` interpolation
- **Attachments** — files with content IDs for inline embedding
- **Priority** — high, normal, low email priority headers
- **STARTTLS / TLS** — secure connections out of the box`,
      },
      {
        id: 'basic-usage',
        title: 'Basic Usage',
        content: 'Send a plain text email:',
        code: `import { createMailer, SmtpTransport } from '@forgedevstack/harbor/mail';

const mailer = createMailer({
  transport: new SmtpTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: { user: 'you@example.com', pass: 'your-password' },
  }),
  defaults: { from: 'noreply@example.com' },
});

// Send plain text
await mailer.send({
  to: 'user@example.com',
  subject: 'Hello from Harbor',
  text: 'This is a test email sent from Harbor Mail.',
});

// Send HTML
await mailer.send({
  to: 'user@example.com',
  subject: 'HTML Email',
  html: '<h1>Hello</h1><p>This is <strong>HTML</strong> content.</p>',
});`,
        filename: 'mail-basic.ts',
      },
      {
        id: 'providers',
        title: 'Provider Presets',
        content: 'Use pre-configured settings for popular email services:',
        code: `import { createMailerFromProvider } from '@forgedevstack/harbor/mail';

// Gmail (use App Password, not your main password)
const gmail = createMailerFromProvider('gmail', {
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

await gmail.send({
  to: 'recipient@example.com',
  subject: 'From Gmail via Harbor',
  text: 'Sent using Harbor Mail with Gmail preset.',
});

// Outlook
const outlook = createMailerFromProvider('outlook', {
  auth: { user: process.env.OUTLOOK_USER!, pass: process.env.OUTLOOK_PASS! },
});

// SendGrid
const sendgrid = createMailerFromProvider('sendgrid', {
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY! },
});

// AWS SES
const ses = createMailerFromProvider('aws_ses', {
  auth: { user: process.env.SES_KEY!, pass: process.env.SES_SECRET! },
});`,
        filename: 'mail-providers.ts',
      },
      {
        id: 'templates',
        title: 'HTML Templates',
        content: 'Register and use reusable email templates with variable interpolation:',
        code: `import {
  registerTemplate,
  registerTemplates,
  renderTemplate,
  renderNamedTemplate,
  escapeHtml,
} from '@forgedevstack/harbor/mail';

// Register a single template
registerTemplate('welcome', \`
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Welcome, {{name}}!</h1>
    <p>Thank you for joining <strong>{{appName}}</strong>.</p>
    <p>Your account is now active. Get started:</p>
    <a href="{{dashboardUrl}}" style="
      display: inline-block;
      padding: 12px 24px;
      background: #0066cc;
      color: white;
      border-radius: 8px;
      text-decoration: none;
    ">Go to Dashboard</a>
    <p style="color: #666; margin-top: 20px;">
      Best regards,<br/>The {{appName}} Team
    </p>
  </div>
\`);

// Register multiple templates at once
registerTemplates({
  'password-reset': '<h1>Reset Password</h1><p>Click <a href="{{resetUrl}}">here</a>.</p>',
  'invoice': '<h1>Invoice #{{invoiceId}}</h1><p>Amount: \${{amount}}</p>',
});

// Use template when sending
await mailer.send({
  to: 'john@example.com',
  subject: 'Welcome to ForgeStack!',
  template: {
    name: 'welcome',
    data: {
      name: 'John',
      appName: 'ForgeStack',
      dashboardUrl: 'https://app.forgedevstack.com/dashboard',
    },
  },
});

// Render template manually (e.g. for previews)
const html = renderNamedTemplate('invoice', {
  invoiceId: 'INV-001',
  amount: '99.99',
});`,
        filename: 'mail-templates.ts',
      },
      {
        id: 'attachments',
        title: 'Attachments & Priority',
        content: 'Attach files and set email priority:',
        code: `await mailer.send({
  to: 'client@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p><img src="cid:logo@company" />',
  priority: 'high',
  attachments: [
    {
      filename: 'invoice.pdf',
      path: './invoices/INV-001.pdf',
      contentType: 'application/pdf',
    },
    {
      filename: 'logo.png',
      path: './assets/logo.png',
      cid: 'logo@company', // Embed inline
    },
  ],
  headers: {
    'X-Campaign-ID': 'welcome-2026',
  },
});`,
        filename: 'mail-attachments.ts',
      },
      {
        id: 'queue-integration',
        title: 'Mail + Queue Integration',
        content: 'Combine Mail with Job Queue for reliable email delivery:',
        code: `import { createQueue } from '@forgedevstack/harbor/queue';
import { createMailerFromProvider, registerTemplate } from '@forgedevstack/harbor/mail';

registerTemplate('order-confirmation', \`
  <h1>Order Confirmed!</h1>
  <p>Hi {{name}}, your order #{{orderId}} has been confirmed.</p>
  <p>Total: \${{total}}</p>
\`);

interface MailJob {
  to: string;
  templateName: string;
  templateData: Record<string, string>;
}

const mailQueue = createQueue<MailJob>('mail-queue', {
  concurrency: 10,
  maxRetries: 5,
  retryDelay: 2000,
  backoffStrategy: 'exponential',
});

const mailer = createMailerFromProvider('gmail', {
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

mailQueue.process(async (job) => {
  await mailer.send({
    to: job.data.to,
    subject: 'Order Confirmation',
    template: {
      name: job.data.templateName,
      data: job.data.templateData,
    },
  });
});

mailQueue.start();

// In your route handler:
mailQueue.add({
  to: 'customer@example.com',
  templateName: 'order-confirmation',
  templateData: { name: 'Jane', orderId: 'ORD-42', total: '149.99' },
});`,
        filename: 'mail-queue-integration.ts',
      },
    ],
  },

  'testing': {
    title: 'Testing with Crucible',
    description: 'Test your Harbor server, routes, models, and queue jobs using @forgedevstack/crucible — the ForgeStack testing framework.',
    sections: [
      {
        id: 'setup',
        title: 'Setup',
        content: `Install Crucible as a dev dependency:`,
        code: `npm install -D @forgedevstack/crucible`,
        filename: 'terminal',
      },
      {
        id: 'test-routes',
        title: 'Testing API Routes',
        content: 'Use Crucible\'s server module to test your Harbor API endpoints:',
        code: `import { describe, it, expect, beforeAll, afterAll } from '@forgedevstack/crucible';
import { request, assertResponse, createMockServer } from '@forgedevstack/crucible/server';

describe('User API', () => {
  let server: any;

  beforeAll(async () => {
    server = await startTestServer(); // Your Harbor server
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /api/users returns user list', async () => {
    const res = await request('http://localhost:3000')
      .get('/api/users')
      .header('Authorization', 'Bearer test-token')
      .send();

    assertResponse(res)
      .status(200)
      .hasHeader('content-type')
      .bodyContains('users');
  });

  it('POST /api/users creates a user', async () => {
    const res = await request('http://localhost:3000')
      .post('/api/users')
      .json({ email: 'test@example.com', name: 'Test User' })
      .send();

    assertResponse(res)
      .status(201)
      .bodyContains('email');
  });

  it('POST /api/users rejects invalid data', async () => {
    const res = await request('http://localhost:3000')
      .post('/api/users')
      .json({ email: 'invalid' })
      .send();

    assertResponse(res)
      .status(400);
  });
});`,
        filename: 'routes.test.ts',
      },
      {
        id: 'mock-server',
        title: 'Mock Server',
        content: 'Create a mock server to test code that makes HTTP calls (e.g. external API wrappers):',
        code: `import { describe, it, expect } from '@forgedevstack/crucible';
import { createMockServer } from '@forgedevstack/crucible/server';

describe('External API Client', () => {
  it('handles mock responses', async () => {
    const mock = createMockServer();

    mock.on('GET', '/api/v1/products', {
      status: 200,
      body: { products: [{ id: 1, name: 'Widget' }] },
    });

    mock.on('POST', '/api/v1/orders', {
      status: 201,
      body: { orderId: 'ORD-123' },
    });

    mock.start();

    // Your code now hits the mock instead of real API
    const products = await fetch('/api/v1/products').then(r => r.json());
    expect(products.products).toHaveLength(1);

    const order = await fetch('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({ productId: 1 }),
    }).then(r => r.json());
    expect(order.orderId).toBe('ORD-123');

    mock.stop();
  });
});`,
        filename: 'mock-server.test.ts',
      },
      {
        id: 'test-queue',
        title: 'Testing Queue Jobs',
        content: 'Test your queue processors and job flows:',
        code: `import { describe, it, expect, spy } from '@forgedevstack/crucible';
import { createQueue } from '@forgedevstack/harbor/queue';

describe('Invoice Queue', () => {
  it('processes jobs and calls handler', async () => {
    const handler = spy.fn();
    const queue = createQueue('test-invoices', {
      concurrency: 1,
      maxRetries: 0,
    });

    queue.process(async (job) => {
      handler(job.data);
    });

    queue.add({ orderId: 'ORD-1' });
    queue.start();

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(handler.callCount).toBe(1);
    expect(handler.calls[0][0]).toEqual({ orderId: 'ORD-1' });

    queue.stop();
  });

  it('retries failed jobs', async () => {
    let attempts = 0;
    const queue = createQueue('retry-test', {
      concurrency: 1,
      maxRetries: 2,
      retryDelay: 100,
      backoffStrategy: 'fixed',
    });

    queue.process(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Not ready');
    });

    queue.add({ task: 'retry-me' });
    queue.start();

    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(attempts).toBe(3); // 1 initial + 2 retries
    queue.stop();
  });
});`,
        filename: 'queue.test.ts',
      },
      {
        id: 'run-tests',
        title: 'Running Tests',
        content: 'Run your tests with Crucible or use Forge CLI:',
        code: `# Run with tsx (recommended)
npx tsx --test src/**/*.test.ts

# Or add to package.json
# "scripts": { "test": "tsx --test src/**/*.test.ts" }
npm test

# Using Forge CLI
npx forge test`,
        filename: 'terminal',
      },
    ],
  },

  'forgestack': {
    title: 'ForgeStack Ecosystem',
    description: 'Harbor is part of the ForgeStack ecosystem — a complete set of tools for building modern full-stack applications.',
    sections: [
      {
        id: 'what-is-forgestack',
        title: 'What is ForgeStack?',
        content: `ForgeStack is a unified ecosystem of TypeScript libraries designed to work together seamlessly:

- **Harbor** — Node.js backend framework (you are here)
- **Bear UI** — React component library with 60+ components
- **Synapse** — Signal-based state management
- **Compass** — Type-safe client-side routing
- **Relay** — Zero-dependency HTTP client
- **Crucible** — Full-stack testing framework
- **Anvil** — Developer utilities and debugger
- **Grid Table** — Advanced data table
- **Forge Form** — Form management
- **Forge Query** — Data fetching hooks
- **Forge Auth** — OAuth authentication

Every package is built with TypeScript first, zero (or minimal) dependencies, and designed to work together.`,
      },
      {
        id: 'forge-cli',
        title: 'Forge CLI',
        content: 'The fastest way to start a new Harbor project:',
        code: `# Create a new full-stack project
npx create-forge my-app

# The CLI will ask:
# - Project type: React / Server / Full-Stack
# - Include packages: Bear, Synapse, Harbor, Relay, Crucible...
# - Package manager: npm / pnpm / yarn / bun

# For a server-only project:
npx create-forge my-api --template server

# The generated server includes:
# - Harbor with Express
# - MongoDB ODM setup
# - JWT authentication
# - User routes & controllers
# - Docker files
# - Crucible for testing

# Add packages to an existing project:
npx forge add harbor
npx forge add crucible --scope both
npx forge add relay`,
        filename: 'terminal',
      },
      {
        id: 'full-stack-example',
        title: 'Full-Stack Example',
        content: 'A real full-stack app using Harbor (backend) + Bear + Relay (frontend):',
        code: `// ── server/index.ts ──
import { createServer, router, GET, POST } from '@forgedevstack/harbor';
import { connect, Schema, model } from '@forgedevstack/harbor/database';
import { jwtAuth, JWT } from '@forgedevstack/harbor/auth';
import { createQueue } from '@forgedevstack/harbor/queue';
import { createMailerFromProvider } from '@forgedevstack/harbor/mail';

await connect(process.env.MONGO_URI!);

const User = model('User', new Schema({
  email: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true },
  password: { type: 'string', required: true },
}));

const mailQueue = createQueue('mail', { concurrency: 5 });
mailQueue.process(async (job) => {
  const mailer = createMailerFromProvider('gmail', {
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  await mailer.send(job.data);
});
mailQueue.start();

const server = createServer({ port: 4000 });

const api = router('/api', [
  POST('/register', async (req) => {
    const user = await User.create(req.body);
    const token = JWT.sign({ id: user.id, role: 'user' });
    mailQueue.add({
      to: user.email,
      subject: 'Welcome!',
      html: '<h1>Welcome to our app!</h1>',
    });
    return { user, token };
  }),

  GET('/me', async (req) => {
    return { user: req.user };
  }, { pre: [jwtAuth()] }),
]);

server.use(api);

// ── client/App.tsx ──
import { useRelay } from '@forgedevstack/relay/react';
import { Button, Card, Input } from '@forgedevstack/bear';

function Register() {
  const { post, loading, error } = useRelay('/api/register');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await post({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
    });
    localStorage.setItem('token', res.data.token);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Input name="name" placeholder="Name" />
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit" loading={loading}>Register</Button>
        {error && <p>{error.message}</p>}
      </form>
    </Card>
  );
}`,
        filename: 'full-stack.ts',
      },
    ],
  },

  'forge-cli': {
    title: 'Forge CLI',
    description: 'Use the Forge CLI to scaffold Harbor projects with all the ecosystem packages pre-configured.',
    sections: [
      {
        id: 'create-project',
        title: 'Creating a Project',
        content: 'The Forge CLI generates a complete project structure with Harbor configured:',
        code: `# Interactive mode
npx create-forge my-project

# Quick mode with defaults
npx create-forge my-project --yes

# Server-only template
npx create-forge my-api --template server

# Full-stack monorepo
npx create-forge my-app --template fullstack`,
        filename: 'terminal',
      },
      {
        id: 'generated-server',
        title: 'Generated Server Structure',
        content: 'A generated server project includes:',
        code: `my-api/
  src/
    index.ts              # Harbor server entry point
    routes/
      user.routes.ts      # Example CRUD routes
    controllers/
      user.controller.ts  # Route handlers
    models/
      user.model.ts       # MongoDB schemas
    middleware/
      auth.middleware.ts   # JWT authentication
  package.json            # With @forgedevstack/harbor
  tsconfig.json
  Dockerfile
  docker-compose.yml
  .env.example`,
        filename: 'project-structure',
      },
      {
        id: 'add-packages',
        title: 'Adding Packages',
        content: 'Add ForgeStack packages to an existing project:',
        code: `# Add Harbor to any Node.js project
npx forge add harbor

# Add Crucible for testing (prompts for scope: client/server/both)
npx forge add crucible --scope both

# Add Relay HTTP client
npx forge add relay

# Add authentication
npx forge add forge-auth`,
        filename: 'terminal',
      },
    ],
  },
  ...EXTRA_DOCS,
  ...MORE_DOCS,
};
