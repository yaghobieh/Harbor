import { FC, useState, useCallback, useRef } from 'react';
import {
  CodeEditor,
  Terminal,
  Button,
  Typography,
  Flex,
  Card,
  CardBody,
  Badge,
  Divider,
  BearIcons,
} from '@forgedevstack/bear';
import type { TerminalLine } from '@forgedevstack/bear';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { Logo } from '../Logo/Logo';

// ── Sandbox examples ──────────────────────────────────────────────
const EXAMPLES: Record<string, { title: string; description: string; code: string }> = {
  'marked-routes': {
    title: 'Marked routes',
    description: 'Class methods marked with @route, mounted by router()',
    code: `import { createServer, router, route, check } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';

class Users {
  @route.get('/')
  list() {
    return { users: [] };
  }

  @route.post('/')
  @check({ body: { email: { type: 'email', required: true } } })
  create(ctx: RouteCtx) {
    return { id: '1', ...(ctx.body as object) };
  }
}

const server = createServer({ port: 3000 });
server.use(router('/api/users', Users));
server.listen(3000);
console.log('Marked routes mounted at /api/users');`,
  },
  'hello-server': {
    title: 'Hello Server',
    description: 'Basic HTTP server with Harbor',
    code: `import { createServer, GET } from '@forgedevstack/harbor';

// Define a simple GET route
const hello = GET('/api/hello', async (req) => {
  return { message: 'Hello from Harbor! 🚢', timestamp: Date.now() };
});

// Create and start the server
const server = createServer({
  port: 3000,
  routes: [hello],
});

server.start();
console.log('🚢 Harbor server running on http://localhost:3000');`,
  },
  'crud-api': {
    title: 'CRUD API',
    description: 'Full REST API with validation',
    code: `import { GET, POST, PUT, DELETE } from '@forgedevstack/harbor';

const users = new Map();
let nextId = 1;

// List users
export const listUsers = GET('/api/users', async () => {
  return { users: [...users.values()], total: users.size };
});

// Create user with validation
export const createUser = POST('/api/users', async (req) => {
  const { name, email } = req.validated.body;
  const user = { id: nextId++, name, email, createdAt: new Date() };
  users.set(user.id, user);
  return { user, message: 'User created!' };
}, {
  validation: {
    body: {
      name: { type: 'string', required: true, min: 2 },
      email: { type: 'email', required: true },
    }
  }
});

// Update user
export const updateUser = PUT('/api/users/:id', async (req) => {
  const { id } = req.validated.params;
  const existing = users.get(Number(id));
  if (!existing) throw new Error('User not found');
  const updated = { ...existing, ...req.body };
  users.set(Number(id), updated);
  return { user: updated };
});

// Delete user
export const deleteUser = DELETE('/api/users/:id', async (req) => {
  const { id } = req.validated.params;
  users.delete(Number(id));
  return { deleted: true };
});

console.log('📝 CRUD API routes defined');
console.log('  GET    /api/users');
console.log('  POST   /api/users');
console.log('  PUT    /api/users/:id');
console.log('  DELETE /api/users/:id');`,
  },
  'database': {
    title: 'Database Model',
    description: 'MongoDB-style ORM with Harbor',
    code: `import { Schema, model, connect } from '@forgedevstack/harbor';

// Connect to MongoDB
await connect('mongodb://localhost:27017/myapp');
console.log('📦 Connected to MongoDB');

// Define a User schema (Mongoose-compatible!)
const userSchema = new Schema({
  email: { type: 'String', required: true, unique: true },
  name: { type: 'String', trim: true },
  role: { type: 'String', enum: ['user', 'admin'], default: 'user' },
  profile: {
    avatar: 'String',
    bio: { type: 'String', maxLength: 500 },
  }
}, { timestamps: true });

// Add a pre-save hook
userSchema.pre('save', async function(next) {
  console.log('📝 Saving user:', this.email);
  next();
});

// Create the model
const User = model('User', userSchema);

// Create a user
const john = await User.create({
  email: 'john@example.com',
  name: 'John Yaghobieh',
  role: 'admin'
});
console.log('✅ Created user:', john.name);

// Query users
const admins = await User.find({ role: 'admin' })
  .select('name email')
  .sort('-createdAt')
  .limit(10);
console.log('👥 Found', admins.length, 'admin(s)');`,
  },
  'middleware': {
    title: 'Middleware',
    description: 'Auth & logging middleware',
    code: `import { GET, HarborError } from '@forgedevstack/harbor';
import type { PreFunction, PostFunction } from '@forgedevstack/harbor';

// Auth middleware - runs BEFORE handler
const auth: PreFunction = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    throw HarborError.unauthorized('No token provided');
  }
  
  // Verify token (simulated)
  req.harborContext.user = { id: 1, role: 'admin' };
  console.log('🔐 Auth passed for user:', req.harborContext.user.id);
  next();
};

// Logging middleware - runs AFTER handler
const logger: PostFunction = async (req, res, result) => {
  const duration = Date.now() - req.startTime;
  console.log(\`📊 \${req.method} \${req.path} → \${duration}ms\`);
};

// Protected route with middleware
const dashboard = GET('/api/dashboard', async (req) => {
  return {
    user: req.harborContext.user,
    stats: { views: 1234, sales: 56 }
  };
}, {
  pre: [auth],
  post: [logger],
  timeout: 10000,
});

console.log('🛡️ Middleware chain configured');
console.log('  [auth] → [handler] → [logger]');`,
  },
  'queue-mail': {
    title: 'Queue & Mail',
    description: 'Job processing and email sending',
    code: `import { Queue } from '@forgedevstack/harbor/queue';
import { createMailer, registerTemplate } from '@forgedevstack/harbor/mail';

// ── Job Queue ──────────────────────────────
const emailQueue = new Queue('emails', {
  concurrency: 3,
  retries: 2,
});

emailQueue.on('completed', (job) => {
  console.log('✅ Email sent:', job.data.to);
});

emailQueue.on('failed', (job, error) => {
  console.log('❌ Failed:', job.data.to, error.message);
});

// ── Mail Templates ─────────────────────────
registerTemplate('welcome', \`
  <h1>Welcome, {{name}}!</h1>
  <p>Thanks for joining Harbor.</p>
  <a href="{{dashboardUrl}}">Go to Dashboard</a>
\`);

// ── Mailer ─────────────────────────────────
const mailer = createMailer({
  host: 'smtp.example.com',
  port: 587,
  auth: { user: 'noreply@example.com', pass: '***' }
});

// Add jobs to the queue
await emailQueue.add('send-welcome', {
  to: 'john@example.com',
  template: 'welcome',
  data: { name: 'John', dashboardUrl: 'https://app.example.com' }
}, { priority: 'high' });

console.log('📬 Email queued for delivery');
console.log('📊 Queue stats:', await emailQueue.getStats());`,
  },
};

// ── Simulated output engine ─────────────────────────────────────
function simulateExecution(code: string): TerminalLine[] {
  const lines: TerminalLine[] = [];
  let lineId = 0;

  const addLine = (type: TerminalLine['type'], content: string) => {
    lines.push({
      id: String(++lineId),
      type,
      content,
      timestamp: new Date(),
    });
  };

  addLine('system', '🚢 Harbor Sandbox v1.6.5');
  addLine('system', '──────────────────────────────────');

  // Extract console.log statements
  const logRegex = /console\.log\(([^)]+)\)/g;
  let match;
  const logStatements: string[] = [];

  while ((match = logRegex.exec(code)) !== null) {
    try {
      let logContent = match[1];
      logContent = logContent.replace(/`([^`]*)`/g, (_, str) => {
        return str.replace(/\$\{[^}]+\}/g, '<value>');
      });
      logContent = logContent
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/,\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      logStatements.push(logContent);
    } catch {
      logStatements.push(match[1]);
    }
  }

  const imports = code.match(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]/g);
  if (imports) {
    imports.forEach(imp => {
      const pkgMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
      if (pkgMatch) {
        addLine('info', `📦 Loading ${pkgMatch[1]}...`);
      }
    });
    addLine('success', '✓ All modules loaded');
    addLine('system', '');
  }

  if (code.includes('createServer')) {
    addLine('info', '🔧 Initializing server...');
  }
  if (code.includes('.start()')) {
    addLine('success', '✓ Server started');
  }
  if (code.includes('connect(')) {
    addLine('info', '🔌 Connecting to database...');
    addLine('success', '✓ Database connected');
  }
  if (code.includes('Schema')) {
    addLine('info', '📋 Registering schemas...');
  }
  if (code.includes('model(')) {
    addLine('success', '✓ Models compiled');
  }
  if (code.includes('Queue')) {
    addLine('info', '📬 Initializing job queue...');
    addLine('success', '✓ Queue ready');
  }
  if (code.includes('createMailer')) {
    addLine('info', '📧 Configuring mailer...');
    addLine('success', '✓ SMTP connection established');
  }

  addLine('system', '');

  logStatements.forEach(log => {
    if (log.includes('❌') || log.includes('error') || log.includes('Error')) {
      addLine('error', log);
    } else if (log.includes('✅') || log.includes('✓') || log.includes('Created') || log.includes('passed')) {
      addLine('success', log);
    } else if (log.includes('⚡') || log.includes('🔐') || log.includes('📊') || log.includes('📝') || log.includes('📬')) {
      addLine('info', log);
    } else if (log.includes('⚠') || log.includes('Warning')) {
      addLine('warning', log);
    } else {
      addLine('output', log);
    }
  });

  addLine('system', '');
  addLine('success', '──────────────────────────────────');
  addLine('success', '✓ Execution completed in ' + (Math.random() * 200 + 50).toFixed(0) + 'ms');

  return lines;
}

export const Sandbox: FC = () => {
  const [activeExample, setActiveExample] = useState('marked-routes');
  const [code, setCode] = useState(EXAMPLES['marked-routes'].code);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: '0', type: 'system', content: '🚢 Harbor Sandbox — Click "Run" to execute your code' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setTerminalLines([
      { id: 'loading', type: 'system', content: '⏳ Compiling TypeScript...' },
    ]);

    setTimeout(() => {
      const output = simulateExecution(code);
      setTerminalLines(output);
      setIsRunning(false);
    }, 800);
  }, [code]);

  const handleExampleChange = (exampleKey: string) => {
    setActiveExample(exampleKey);
    setCode(EXAMPLES[exampleKey].code);
    setTerminalLines([
      { id: '0', type: 'system', content: `🚢 Loaded example: ${EXAMPLES[exampleKey].title}` },
      { id: '1', type: 'info', content: EXAMPLES[exampleKey].description },
      { id: '2', type: 'system', content: 'Click "Run" to execute' },
    ]);
  };

  const handleTerminalCommand = (command: string) => {
    if (command === 'run' || command === 'execute') {
      handleRun();
    } else if (command === 'clear') {
      setTerminalLines([
        { id: '0', type: 'system', content: '🚢 Terminal cleared' },
      ]);
    } else if (command === 'help') {
      setTerminalLines(prev => [
        ...prev,
        { id: String(Date.now()), type: 'input', content: `$ ${command}` },
        { id: String(Date.now() + 1), type: 'info', content: 'Available commands:' },
        { id: String(Date.now() + 2), type: 'output', content: '  run      - Execute the current code' },
        { id: String(Date.now() + 3), type: 'output', content: '  clear    - Clear terminal output' },
        { id: String(Date.now() + 4), type: 'output', content: '  help     - Show this help message' },
        { id: String(Date.now() + 5), type: 'output', content: '  examples - List available examples' },
      ]);
    } else if (command === 'examples') {
      const exampleLines: TerminalLine[] = Object.entries(EXAMPLES).map(([key, ex], i) => ({
        id: String(Date.now() + i),
        type: 'output' as const,
        content: `  ${key.padEnd(15)} - ${ex.title}`,
      }));
      setTerminalLines(prev => [
        ...prev,
        { id: String(Date.now()), type: 'input', content: `$ ${command}` },
        { id: String(Date.now() + 100), type: 'info', content: 'Available examples:' },
        ...exampleLines,
      ]);
    } else {
      setTerminalLines(prev => [
        ...prev,
        { id: String(Date.now()), type: 'input', content: `$ ${command}` },
        { id: String(Date.now() + 1), type: 'error', content: `Command not found: ${command}. Type "help" for available commands.` },
      ]);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm bg-opacity-90"
        style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <Flex align="center" justify="between">
            <Flex align="center" gap={4}>
              <Link to="/" className="flex items-center gap-2">
                <Logo size="sm" />
                <Typography variant="h5" className="font-bold">Harbor</Typography>
              </Link>
              <Badge variant="secondary">
                <Flex align="center" gap={1}>
                  <BearIcons.TerminalIcon size="xs" />
                  Sandbox
                </Flex>
              </Badge>
            </Flex>

            <Flex align="center" gap={3}>
              <Button
                variant="harbor"
                size="sm"
                onClick={handleRun}
                loading={isRunning}
                leftIcon={<BearIcons.PlayIcon size="xs" />}
              >
                Run
              </Button>
              <ThemeToggle />
              <Link to="/">
                <Button variant="ghost" size="sm" leftIcon={<BearIcons.ArrowLeftIcon size="xs" />}>
                  Back
                </Button>
              </Link>
            </Flex>
          </Flex>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4">
        {/* Example Selector */}
        <Card variant="ghost" padding="sm" radius="xl" className="mb-4">
          <CardBody>
            <Flex align="center" gap={3} wrap="wrap">
              <Typography variant="caption" className="opacity-50 font-semibold uppercase">
                Examples:
              </Typography>
              {Object.entries(EXAMPLES).map(([key, example]) => (
                <Button
                  key={key}
                  variant={activeExample === key ? 'harbor' : 'ghost'}
                  size="xs"
                  onClick={() => handleExampleChange(key)}
                >
                  {example.title}
                </Button>
              ))}
            </Flex>
          </CardBody>
        </Card>

        {/* Editor + Terminal Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Code Editor */}
          <Card variant="outlined" padding="none" radius="xl" className="overflow-hidden flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Flex align="center" gap={2}>
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <Typography variant="caption" className="ml-3 font-mono opacity-50">
                  {EXAMPLES[activeExample]?.title || 'editor'}.ts
                </Typography>
              </Flex>
              <Badge variant="info" className="text-xs">
                <Flex align="center" gap={1}>
                  <BearIcons.CodeIcon size="xs" />
                  TypeScript
                </Flex>
              </Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="typescript"
                showLineNumbers
                highlightActiveLine
                autoCloseBrackets
                autoIndent
                tabSize={2}
                fontSize={13}
                height="100%"
              />
            </div>
          </Card>

          {/* Terminal Output */}
          <Card variant="outlined" padding="none" radius="xl" className="overflow-hidden flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Flex align="center" gap={2}>
                <BearIcons.TerminalIcon size="xs" className="opacity-50" />
                <Typography variant="caption" className="font-mono opacity-50">
                  Terminal
                </Typography>
                {isRunning && (
                  <Badge variant="warning" className="text-xs animate-pulse">
                    Running...
                  </Badge>
                )}
              </Flex>
              <Button
                variant="ghost"
                size="xs"
                leftIcon={<BearIcons.CloseIcon size="xs" />}
                onClick={() => setTerminalLines([
                  { id: '0', type: 'system', content: '🚢 Terminal cleared' },
                ])}
              >
                Clear
              </Button>
            </div>
            <div ref={terminalRef} className="flex-1 overflow-hidden">
              <Terminal
                lines={terminalLines}
                onCommand={handleTerminalCommand}
                prompt="harbor $"
                title="Harbor Terminal"
                showHeader={false}
                height="100%"
                theme="dark"
                autoScroll
              />
            </div>
          </Card>
        </div>

        {/* Tips */}
        <Card variant="ghost" padding="sm" radius="xl" className="mt-4">
          <CardBody>
            <Flex align="center" gap={6} wrap="wrap" justify="center">
              <Typography variant="caption" className="opacity-40">
                <Flex align="center" gap={1}>
                  <BearIcons.InfoIcon size="xs" />
                  Edit code on the left, click <strong>Run</strong> to see output
                </Flex>
              </Typography>
              <Divider orientation="vertical" className="h-4 opacity-20" />
              <Typography variant="caption" className="opacity-40">
                Type <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>help</code> in terminal for commands
              </Typography>
              <Divider orientation="vertical" className="h-4 opacity-20" />
              <Typography variant="caption" className="opacity-40">
                <Flex align="center" gap={1}>
                  <BearIcons.EditIcon size="xs" />
                  Try editing the code and running again!
                </Flex>
              </Typography>
            </Flex>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
