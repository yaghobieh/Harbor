import { FC, useState } from 'react';
import { GradientText } from '../GradientText/GradientText';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { EXAMPLE_TABS } from '@/constants';

const EXAMPLES: Record<string, { filename: string; code: string }> = {
  routing: {
    filename: 'routes/users.ts',
    code: `import { GET, POST, DELETE } from 'harbor';

// GET /api/users - List all users (No .build() needed!)
export const listUsers = GET('/api/users', async (req) => {
  const { page, limit } = req.validated.query;
  return { users: [], page, limit, total: 0 };
}, {
  validation: {
    query: {
      page: { type: 'number', default: 1 },
      limit: { type: 'number', default: 20, max: 100 }
    }
  }
});

// POST /api/users - Create a user
export const createUser = POST('/api/users', async (req, res) => {
  const userData = req.validated.body;
  res.success({ id: '123', ...userData }, 201);
}, {
  validation: {
    body: {
      email: { type: 'email', required: true },
      name: { type: 'string', required: true, min: 2 }
    }
  }
});

// DELETE /api/users/:id
export const deleteUser = DELETE('/api/users/:id', async (req) => {
  const { id } = req.validated.params;
  return { deleted: true };
}, {
  validation: { params: { id: { type: 'objectId', required: true } } },
  timeout: 5000
});`,
  },
  database: {
    filename: 'models/User.ts',
    code: `import { Schema, model, connect } from 'harbor';

// Connect to MongoDB (like mongoose.connect)
await connect('mongodb://localhost:27017/myapp');

// Define Schema (same syntax as Mongoose!)
const userSchema = new Schema({
  email: { type: 'String', required: true, unique: true, lowercase: true },
  password: { type: 'String', required: true, minLength: 8 },
  name: { type: 'String', trim: true },
  role: { type: 'String', enum: ['user', 'admin'], default: 'user' },
  profile: {
    avatar: 'String',
    bio: 'String'
  }
}, { timestamps: true });

// Pre-save hook (just like Mongoose)
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Create model
const User = model('User', userSchema);

// Query methods (all Mongoose methods work!)
const users = await User.find({ role: 'admin' });
const user = await User.findOne({ email: 'john@example.com' });
const user = await User.findById('507f1f77bcf86cd799439011');

// Create, Update, Delete
await User.create({ email: 'john@example.com', name: 'John' });
await User.updateOne({ email: 'john@example.com' }, { name: 'John Doe' });
await User.deleteOne({ email: 'john@example.com' });

// Query builder chain
const admins = await User.find()
  .where('role').equals('admin')
  .select('name email')
  .sort('-createdAt')
  .limit(10)
  .lean();`,
  },
  validation: {
    filename: 'validation/userSchema.ts',
    code: `import { createMongoSchema, validators } from 'harbor';

// MongoDB-style schema validation
export const userSchema = createMongoSchema({
  email: {
    type: 'String',
    required: true,
    unique: true,
    match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  },
  password: {
    type: 'String',
    required: true,
    minLength: 8,
    validate: {
      validator: (v) => /[A-Z]/.test(v) && /[0-9]/.test(v),
      message: 'Password must contain uppercase and number'
    }
  },
  role: {
    type: 'String',
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  }
});

// Validate data
const result = await userSchema.validate(userData);
if (!result.valid) {
  console.log(result.errors);
}

// Individual validators (chain-able)
const emailValidator = validators.email();
const roleValidator = validators.enum(['user', 'admin']).default('user');`,
  },
  error: {
    filename: 'routes/protected.ts',
    code: `import { GET, HarborError } from 'harbor';

export const protectedRoute = GET('/api/admin/dashboard', async (req) => {
  // Check authentication
  if (!req.user) {
    throw HarborError.unauthorized('Please login to continue');
  }

  // Check authorization
  if (req.user.role !== 'admin') {
    throw HarborError.forbidden('Admin access required');
  }

  // Resource not found
  const resource = await findResource(req.params.id);
  if (!resource) {
    throw HarborError.notFound('Resource not found');
  }

  return { dashboard: 'data' };
});

// Errors are auto-handled based on harbor.config.json:
// {
//   "errors": {
//     "401": { "message": "Unauthorized", "json": true, "log": true },
//     "403": { "message": "Forbidden", "json": true },
//     "404": { "message": "Not Found", "json": true }
//   }
// }`,
  },
  middleware: {
    filename: 'middleware/auth.ts',
    code: `import { GET, HarborError } from 'harbor';
import type { PreFunction, PostFunction } from 'harbor';

// Pre-function: Runs BEFORE the handler
const authMiddleware: PreFunction = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    throw HarborError.unauthorized();
  }
  
  req.harborContext.user = await verifyToken(token);
  next();
};

// Post-function: Runs AFTER the handler
const analyticsMiddleware: PostFunction = async (req, res, result) => {
  await trackEvent({
    path: req.path,
    duration: Date.now() - req.startTime,
    userId: req.harborContext.user?.id
  });
};

// Use in routes - pass as options
const protectedRoute = GET('/api/profile', async (req) => {
  return req.harborContext.user;
}, {
  pre: [authMiddleware],
  post: [analyticsMiddleware],
  timeout: 10000
});`,
  },
  docker: {
    filename: 'scripts/deploy.ts',
    code: `import { createDockerManager } from 'harbor';

const docker = createDockerManager({
  composePath: './docker-compose.yml',
  projectName: 'my-app',
  registry: 'ghcr.io/myorg'
});

// List all containers
const containers = await docker.listContainers();

// Docker Compose operations
await docker.composeUp();           // Start all services
await docker.composeDown();         // Stop all services
await docker.composeDown(true);     // Stop and remove volumes

// View logs
const logs = await docker.composeLogs('web');

// Container management
await docker.startContainer('my-container');
await docker.stopContainer('my-container');

// Build and push images
await docker.buildImage('my-app', 'v1.0.0');
await docker.pushImage('my-app', 'v1.0.0');

// Execute commands in container
const output = await docker.exec('web', 'npm run migrate');`,
  },
};

export const CodeExamples: FC = () => {
  const [activeTab, setActiveTab] = useState('routing');

  const activeExample = EXAMPLES[activeTab];

  return (
    <section id="examples" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText>Code Examples</GradientText>
          </h2>
          <p className="text-xl text-gray-400">
            Real-world patterns for common use cases
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {EXAMPLE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-harbor-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="max-w-4xl mx-auto">
          <CodeBlock
            code={activeExample.code}
            filename={activeExample.filename}
            className="shadow-[0_0_30px_rgba(192,38,211,0.2)]"
          />
        </div>
      </div>
    </section>
  );
};

