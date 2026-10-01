import { FC } from 'react';
import {
  Typography,
  GradientText,
  CodeBlock,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@forgedevstack/bear';
import { EXAMPLE_TABS } from '@/constants';

const EXAMPLES: Record<string, { filename: string; code: string }> = {
  routing: {
    filename: 'routes/users.ts',
    code: `import { GET, POST, DELETE } from '@forgedevstack/harbor';

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
  marked: {
    filename: 'routes/Users.ts',
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
    return { id: '1', email: body.email, name: body.name };
  }

  @route.del('/:id')
  @pre((req, res, next) => {
    if (!req.header('authorization')) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    next();
  })
  remove(ctx: RouteCtx) {
    return { deleted: ctx.params.id };
  }
}

const server = createServer({ port: 3000 });
server.use(router('/api/users', Users));
server.listen(3000);`,
  },
  database: {
    filename: 'models/User.ts',
    code: `import { Schema, model, connect } from '@forgedevstack/harbor';

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

// Create model
const User = model('User', userSchema);

// Query methods (all Mongoose methods work!)
const users = await User.find({ role: 'admin' });
const user = await User.findOne({ email: 'john@example.com' });

// Create, Update, Delete
await User.create({ email: 'john@example.com', name: 'John' });
await User.updateOne({ email: 'john@example.com' }, { name: 'John Doe' });
await User.deleteOne({ email: 'john@example.com' });`,
  },
  validation: {
    filename: 'validation/userSchema.ts',
    code: `import { createMongoSchema, validators } from '@forgedevstack/harbor';

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
    code: `import { GET, HarborError } from '@forgedevstack/harbor';

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
});`,
  },
  middleware: {
    filename: 'middleware/auth.ts',
    code: `import { GET, HarborError } from '@forgedevstack/harbor';
import type { PreFunction, PostFunction } from '@forgedevstack/harbor';

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
    code: `import { createDockerManager } from '@forgedevstack/harbor';

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

// Build and push images
await docker.buildImage('my-app', 'v1.0.0');
await docker.pushImage('my-app', 'v1.0.0');

// Execute commands in container
const output = await docker.exec('web', 'npm run migrate');`,
  },
};

export const CodeExamples: FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  return (
    <section id="examples" className={embedded ? 'mt-10' : 'py-32 relative'}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto px-6'}>
        <div className={embedded ? 'mb-6' : 'text-center mb-16'}>
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
              Code Examples
            </GradientText>
          </Typography>
          <Typography className="text-xl opacity-50">
            Real-world patterns for common use cases
          </Typography>
        </div>

        <Tabs defaultTab="routing" variant="pills">
          <TabList className="flex gap-2 overflow-x-auto pb-2 mb-8 md:flex-wrap md:justify-center">
            {EXAMPLE_TABS.map((tab) => (
              <Tab key={tab.id} id={tab.id}>
                {tab.label}
              </Tab>
            ))}
          </TabList>

          {Object.entries(EXAMPLES).map(([key, example]) => (
            <TabPanel key={key} tabId={key} className="max-w-4xl mx-auto">
              <CodeBlock
                code={example.code}
                title={example.filename}
                language="typescript"
                copyable
                showLineNumbers
              />
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
