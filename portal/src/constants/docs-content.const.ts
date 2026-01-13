// Documentation Content for all pages

export interface DocContent {
  title: string;
  description: string;
  sections: DocSection[];
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  filename?: string;
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
        code: `import { createServer, connect, GET, POST } from 'harbor';

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
    description: 'Scaffold a complete Node.js backend project with Harbor CLI.',
    sections: [
      {
        id: 'create-command',
        title: 'Creating a Project',
        content: 'Use the `harbor create` command to scaffold a new project with the full boilerplate:',
        code: `harbor create my-api

# Output:
# 🚢 Creating Harbor project: my-api
# 📁 Copying project files...
# ✅ Project created successfully!
#
# 🚀 Next steps:
#    cd my-api
#    npm install
#    cp .env.example .env
#    npm run dev`,
        filename: 'terminal',
      },
      {
        id: 'init-template',
        title: 'Initialize with Template',
        content: 'You can also initialize an existing directory with the template using `--template` flag:',
        code: `# Initialize current directory with full template
harbor init --template

# Or specify a template name (default is the only one currently)
harbor init --template default`,
        filename: 'terminal',
      },
      {
        id: 'project-structure',
        title: 'Project Structure',
        content: `The template creates a well-organized project with the following structure:

\`\`\`
my-api/
├── server.ts           # Application entry point
├── routes/             # Route definitions
│   ├── index.ts
│   └── user.routes.ts
├── controllers/        # Request handlers
│   ├── index.ts
│   └── user.controller.ts
├── services/           # Business logic
│   ├── index.ts
│   └── user.service.ts
├── models/             # Database models (Harbor ODM)
│   ├── index.ts
│   └── user.model.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── index.ts
│   ├── logger.ts
│   ├── asyncHandler.ts
│   ├── response.ts
│   └── validation.ts
├── constants/          # App constants & config
│   ├── index.ts
│   ├── config.ts
│   └── http.ts
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .env.example
└── harbor.config.json
\`\`\``,
      },
      {
        id: 'server-entry',
        title: 'Server Entry Point',
        content: 'The `server.ts` file is pre-configured with Harbor:',
        code: `import { createServer, connect, httpLogger } from 'harbor';
import { routes } from './routes';
import { config } from './constants';

async function bootstrap() {
  // Create server with Harbor
  const app = createServer({
    port: config.PORT,
    cors: true,
    helmet: true,
    json: true,
  });

  // HTTP request logging
  app.use(httpLogger({ format: 'dev' }));

  // Connect to MongoDB (optional)
  if (config.MONGODB_URI) {
    await connect(config.MONGODB_URI, { dbName: config.DB_NAME });
    console.log('📦 Connected to MongoDB');
  }

  // Register all routes
  app.use('/api', routes);

  // Start server
  app.listen(config.PORT, () => {
    console.log(\`🚀 Server running on http://localhost:\${config.PORT}\`);
  });
}

bootstrap().catch(console.error);`,
        filename: 'server.ts',
      },
      {
        id: 'routes-example',
        title: 'Routes Example',
        content: 'Routes are organized in the `routes/` directory with a central index:',
        code: `// routes/user.routes.ts
import { Router } from 'express';
import { GET, POST, PUT, DELETE } from 'harbor';
import { UserController } from '../controllers';

export const userRoutes = Router();

// GET /api/users - Get all users
userRoutes.get('/', GET(UserController.getAll));

// POST /api/users - Create new user
userRoutes.post('/', POST(UserController.create));

// PUT /api/users/:id - Update user
userRoutes.put('/:id', PUT(UserController.update));

// DELETE /api/users/:id - Delete user
userRoutes.delete('/:id', DELETE(UserController.delete));`,
        filename: 'routes/user.routes.ts',
      },
      {
        id: 'model-example',
        title: 'Model Example',
        content: 'Models use Harbor ODM (Mongoose-compatible):',
        code: `// models/user.model.ts
import { Schema, model } from 'harbor/database';

const userSchema = new Schema({
  email: { type: 'string', required: true, unique: true },
  name: { type: 'string', required: true },
  password: { type: 'string', required: true, select: false },
  role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
  isActive: { type: 'boolean', default: true },
}, {
  timestamps: true,
  collection: 'users',
});

export const User = model('User', userSchema);`,
        filename: 'models/user.model.ts',
      },
      {
        id: 'scripts',
        title: 'Available Scripts',
        content: `The template includes pre-configured scripts:

| Script | Description |
|--------|-------------|
| \`npm run dev\` | Start development server with hot reload |
| \`npm run build\` | Build for production |
| \`npm start\` | Start production server |
| \`npm run lint\` | Run ESLint |
| \`npm run lint:fix\` | Fix ESLint errors |
| \`npm test\` | Run tests with Vitest |`,
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
        code: `import { Schema } from 'harbor';

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
        code: `import { connect, connection } from 'harbor';

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
        code: `import { connection } from 'harbor';

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
        code: `import { connection } from 'harbor';

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
        code: `import { disconnect, connection } from 'harbor';

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
        code: `import { Schema, model } from 'harbor';

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
        code: `import { POST, GET } from 'harbor';

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
    description: 'Define API routes using Harbor\'s simple route helpers.',
    sections: [
      {
        id: 'basic-routes',
        title: 'Basic Routes',
        content: 'Use the route helper functions to create routes:',
        code: `import { createServer, GET, POST, PUT, DELETE } from 'harbor';

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
        code: `import { POST, GET } from 'harbor';

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
        code: `import { GET, HarborError } from 'harbor';

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
        code: `import { createServer } from 'harbor';

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
        code: `import { createDockerManager } from 'harbor';

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
        code: `import { setLocale, getLocale, getAvailableLocales } from 'harbor';

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
        code: `import { t, setLocale } from 'harbor';

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
        code: `import { addTranslations } from 'harbor';

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
import { t } from 'harbor';
console.log(t('app.goodbye', { name: 'John' }));`,
        filename: 'custom-translations.ts',
      },
    ],
  },
};
