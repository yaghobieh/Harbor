import { createLabServer } from './server.ts';

const server = createLabServer(0);
await server.start();

const address = server.server?.address();
const port = address && typeof address === 'object' ? address.port : 0;
const base = `http://127.0.0.1:${port}`;

try {
  const created = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Ada', email: 'ada@harbor.dev' }),
  });
  const createdBody = await created.json();
  assert(created.status === 200, `create status ${created.status}`);
  assert(createdBody.data.user.email === 'ada@harbor.dev', 'create payload');

  const invalid = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'nope' }),
  });
  assert(invalid.status === 400, `validation status ${invalid.status}`);

  const listed = await fetch(`${base}/api/users`);
  const listedBody = await listed.json();
  assert(listedBody.data.users.length === 1, 'list length');

  const denied = await fetch(`${base}/api/users/1`, { method: 'DELETE' });
  assert(denied.status === 401, `delete without token ${denied.status}`);

  const removed = await fetch(`${base}/api/users/1`, {
    method: 'DELETE',
    headers: { 'x-lab-token': 'lab' },
  });
  const removedBody = await removed.json();
  assert(removed.status === 200, `delete status ${removed.status}`);
  assert(removedBody.data.deleted === true, 'deleted flag');

  console.log('harbor lab passed');
} finally {
  await server.stop();
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
