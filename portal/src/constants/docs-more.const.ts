import type { DocContent } from './docs-content.const';

export const MORE_DOCS: Record<string, DocContent> = {
  layers: {
    title: 'Controllers and services',
    description: 'The route method can be one line. Validation stays on the method. Work moves to a controller, then a service.',
    sections: [
      {
        id: 'route',
        title: 'Route',
        content: '`@check` has to sit on the method Harbor mounts. The body of the method only forwards `ctx`.',
        code: `import { check, route } from '@forgedevstack/harbor';
import type { RouteCtx } from '@forgedevstack/harbor';
import { UserController } from '../controllers/user.controller';

export class Users {
  @route.post('/')
  @check({
    body: {
      name: { type: 'string', required: true, min: 2 },
      email: { type: 'email', required: true },
    },
  })
  create(ctx: RouteCtx) {
    return UserController.create(ctx);
  }
}`,
        filename: 'routes/users.ts',
      },
      {
        id: 'controller',
        title: 'Controller',
        content: 'Read `ctx`, call the service, return the object Harbor wraps as `{ success, data }`.',
        code: `import type { RouteCtx } from '@forgedevstack/harbor';
import { UserService } from '../services/user.service';

export const UserController = {
  create(ctx: RouteCtx) {
    const body = ctx.body as { name: string; email: string };
    return { user: UserService.create(body) };
  },
};`,
        filename: 'controllers/user.controller.ts',
      },
      {
        id: 'service',
        title: 'Service',
        content: 'The service does not know about HTTP. It takes the fields and returns a user.',
        code: `export const UserService = {
  create(input: { name: string; email: string }) {
    const id = String(users.size + 1);
    const user = { id, name: input.name, email: input.email };
    users.set(id, user);
    return user;
  },
};`,
        filename: 'services/user.service.ts',
      },
    ],
  },
  hooks: {
    title: 'Hooks',
    description: '@pre runs before the method. @after runs after it. Both are the same functions as route.pre and route.after.',
    sections: [
      {
        id: 'pre',
        title: 'Before',
        content: 'Stop the chain by writing the response and returning. Call `next()` to continue.',
        code: `import { pre, route } from '@forgedevstack/harbor';

class Users {
  @route.del('/:id')
  @pre((req, res, next) => {
    if (!req.header('authorization')) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    next();
  })
  remove() {
    return { deleted: true };
  }
}`,
        filename: 'hooks.ts',
      },
      {
        id: 'after',
        title: 'After',
        content: '`@after` receives the request, response, and the value the method returned.',
        code: `import { after, route } from '@forgedevstack/harbor';

class Users {
  @route.get('/')
  @after((_req, _res, result) => {
    console.log('listed', result);
  })
  list() {
    return { users: [] };
  }
}`,
        filename: 'after.ts',
      },
    ],
  },
  timeout: {
    title: 'Timeout',
    description: '@timeout cancels a marked method that runs longer than the given milliseconds.',
    sections: [
      {
        id: 'ms',
        title: 'On a method',
        content: 'The number is milliseconds. Array routes take the same limit as `timeout` in the route options.',
        code: `import { route, timeout } from '@forgedevstack/harbor';

class Reports {
  @route.get('/slow')
  @timeout(2000)
  build() {
    return { ok: true };
  }
}`,
        filename: 'timeout.ts',
      },
    ],
  },
  cors: {
    title: 'CORS',
    description: 'Turn CORS on in harbor.config.json. createServer applies it before your routes.',
    sections: [
      {
        id: 'config',
        title: 'Config',
        content: '`origin` is a string or a list. `credentials` echoes the request origin when you need cookies.',
        code: `{
  "server": {
    "cors": {
      "enabled": true,
      "origin": "https://app.example.com",
      "credentials": true,
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
      "allowedHeaders": ["content-type", "authorization"]
    }
  }
}`,
        filename: 'harbor.config.json',
      },
    ],
  },
  indexes: {
    title: 'Indexes',
    description: 'Call index() on a schema before you compile the model.',
    sections: [
      {
        id: 'unique',
        title: 'Unique email',
        content: 'The field map is the index key. Pass `{ unique: true }` when two users cannot share an email.',
        code: `import { Schema, model } from '@forgedevstack/harbor/database';

const userSchema = new Schema({
  email: { type: 'string', required: true },
  name: { type: 'string', required: true },
});

userSchema.index({ email: 1 }, { unique: true });

export const User = model('User', userSchema);`,
        filename: 'user.model.ts',
      },
    ],
  },
  passwords: {
    title: 'Passwords',
    description: 'hashPassword and verifyPassword use HMAC-SHA512 and a random salt. They do not store the password.',
    sections: [
      {
        id: 'hash',
        title: 'Hash and check',
        content: 'Store `hash` and `salt`. Pass both back into `verifyPassword`.',
        code: `import { hashPassword, verifyPassword } from '@forgedevstack/harbor';

const { hash, salt } = hashPassword('correct horse');
const ok = verifyPassword('correct horse', hash, salt);`,
        filename: 'password.ts',
      },
    ],
  },
  roles: {
    title: 'Roles',
    description: 'requireRole and requirePermission read req.user. Put them after jwtAuth or apiKeyAuth.',
    sections: [
      {
        id: 'role',
        title: 'Role',
        content: 'A missing user is 401. A user with the wrong role is 403.',
        code: `import { jwtAuth, requireRole, requirePermission } from '@forgedevstack/harbor';

app.use('/api', jwtAuth(jwt));
app.get('/api/admin', requireRole('admin'), adminHandler);
app.post('/api/posts', requirePermission('posts:write'), writeHandler);`,
        filename: 'roles.ts',
      },
    ],
  },
  signing: {
    title: 'Request signing',
    description: 'verifySignature checks an HMAC of the body. A timestamp header rejects old requests.',
    sections: [
      {
        id: 'hmac',
        title: 'HMAC',
        content: 'Default header is `X-Signature`. Default timestamp header is `X-Timestamp`. `maxAge` is milliseconds.',
        code: `import { verifySignature } from '@forgedevstack/harbor';

app.post('/webhooks/stripe', verifySignature({
  secret: process.env.WEBHOOK_SECRET!,
  maxAge: 300_000,
}), handler);`,
        filename: 'signing.ts',
      },
    ],
  },
  'mail-templates': {
    title: 'Mail templates',
    description: 'Placeholders are {{name}}. registerTemplate stores them. sendTemplate fills them and sends.',
    sections: [
      {
        id: 'template',
        title: 'Register and send',
        content: 'Providers are gmail, outlook, sendgrid, ses, and custom.',
        code: `import { createMailerFromProvider, registerTemplate } from '@forgedevstack/harbor/mail';

registerTemplate({
  name: 'welcome',
  subject: 'Welcome, {{name}}',
  html: '<h1>Hello {{name}}</h1>',
});

const mailer = createMailerFromProvider('gmail', {
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
}, 'noreply@example.com');

await mailer.sendTemplate('welcome', { name: 'Ada' }, {
  to: 'ada@harbor.dev',
});`,
        filename: 'mail.ts',
      },
    ],
  },
  logger: {
    title: 'Logger',
    description: 'createLogger writes a named logger. setGlobalLogLevel changes every logger.',
    sections: [
      {
        id: 'levels',
        title: 'Levels',
        content: 'Levels are debug, info, warn, error, and silent.',
        code: `import { createLogger, setGlobalLogLevel } from '@forgedevstack/harbor';

setGlobalLogLevel('info');

const log = createLogger('users');
log.info('created', { id: '1' });
log.error('failed', new Error('db down'));`,
        filename: 'log.ts',
      },
    ],
  },
  helpers: {
    title: 'Helpers',
    description: 'Small functions that do not belong on the server: ids, dates, and sleep.',
    sections: [
      {
        id: 'id',
        title: 'Id and sleep',
        content: '`generateId` returns a random string. `sleep` waits. `formatDate` defaults to ISO.',
        code: `import { generateId, formatDate, sleep } from '@forgedevstack/harbor';

const id = generateId(12);
const stamp = formatDate(new Date());
await sleep(50);`,
        filename: 'helpers.ts',
      },
    ],
  },
  'release-notes': {
    title: 'Release notes',
    description: 'createChangelogManager reads and writes CHANGELOG.md. It is separate from the portal changelog page.',
    sections: [
      {
        id: 'manager',
        title: 'Add and release',
        content: 'Call `load` before you read. `addChange` queues an unreleased line. `release` writes the version and clears the queue.',
        code: `import { createChangelogManager } from '@forgedevstack/harbor';

const notes = createChangelogManager({ filePath: './CHANGELOG.md' });
notes.load();
notes.addChange('added', 'Marked routes on the existing router');
notes.release('1.6.5');`,
        filename: 'notes.ts',
      },
    ],
  },
  subpaths: {
    title: 'Subpath imports',
    description: 'Import the piece you use. The root package re-exports the same names.',
    sections: [
      {
        id: 'paths',
        title: 'Paths',
        content: `Use a subpath when you want a smaller import list.

| Import | What it holds |
| --- | --- |
| \`@forgedevstack/harbor\` | Server, router, route marks, auth |
| \`@forgedevstack/harbor/database\` | Schema, model, connect |
| \`@forgedevstack/harbor/queue\` | createQueue |
| \`@forgedevstack/harbor/mail\` | createMailer, templates |
| \`@forgedevstack/harbor/ws\` | createWsHub, Redis adapter |
| \`@forgedevstack/harbor/upload\` | streamUpload, S3 adapter |
| \`@forgedevstack/harbor/cache\` | cache, cacheResponse |
| \`@forgedevstack/harbor/auth\` | JWT, API keys, passwords |`,
        code: `import { createServer, router, route } from '@forgedevstack/harbor';
import { connect, Schema, model } from '@forgedevstack/harbor/database';
import { createQueue } from '@forgedevstack/harbor/queue';`,
        filename: 'imports.ts',
      },
    ],
  },
};
