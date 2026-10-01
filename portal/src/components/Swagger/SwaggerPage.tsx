import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  GradientText,
  CodeBlock,
  Breadcrumbs,
  Badge,
} from '@forgedevstack/bear';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface SwaggerOperation {
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  body?: string;
  response: string;
}

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET: '#16a34a',
  POST: '#2563eb',
  PUT: '#d97706',
  PATCH: '#7c3aed',
  DELETE: '#dc2626',
};

const OPERATIONS: SwaggerOperation[] = [
  {
    method: 'GET',
    path: '/api/users',
    summary: 'List users',
    description: 'Marked with @route.get. The return value is wrapped as { success, data }.',
    response: `{
  "success": true,
  "data": { "users": [] }
}`,
  },
  {
    method: 'POST',
    path: '/api/users',
    summary: 'Create a user',
    description: '@check validates the JSON body before the method runs. Invalid email or a short name returns 400.',
    body: `{
  "name": "Ada",
  "email": "ada@harbor.dev"
}`,
    response: `{
  "success": true,
  "data": { "id": "1", "email": "ada@harbor.dev", "name": "Ada" }
}`,
  },
  {
    method: 'GET',
    path: '/api/users/{id}',
    summary: 'Read one user',
    description: 'ctx.params.id is the path segment. A missing user responds 404 from the method.',
    response: `{
  "success": true,
  "data": { "user": { "id": "1", "name": "Ada", "email": "ada@harbor.dev" } }
}`,
  },
  {
    method: 'PUT',
    path: '/api/users/{id}',
    summary: 'Replace a user',
    description: 'Same ctx object as POST. Send the full user document.',
    body: `{
  "name": "Ada Lovelace",
  "email": "ada@harbor.dev"
}`,
    response: `{
  "success": true,
  "data": { "id": "1", "name": "Ada Lovelace", "email": "ada@harbor.dev" }
}`,
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}',
    summary: 'Update part of a user',
    description: 'Send only the fields that change.',
    body: `{
  "name": "Ada Lovelace"
}`,
    response: `{
  "success": true,
  "data": { "id": "1", "name": "Ada Lovelace" }
}`,
  },
  {
    method: 'DELETE',
    path: '/api/users/{id}',
    summary: 'Delete a user',
    description: 'Written as @route.del. @pre can require a header before the method runs. Missing auth returns 401.',
    response: `{
  "success": true,
  "data": { "deleted": true, "id": "1" }
}`,
  },
];

const OPENAPI = `openapi: 3.0.3
info:
  title: Harbor sample API
  version: 1.6.5
  description: Routes mounted with router('/api/users', Users).
servers:
  - url: http://127.0.0.1:3000
paths:
  /api/users:
    get:
      summary: List users
      responses:
        '200':
          description: User list inside the Harbor envelope
    post:
      summary: Create a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, email]
              properties:
                name:
                  type: string
                  minLength: 2
                email:
                  type: string
                  format: email
      responses:
        '200':
          description: Created user
        '400':
          description: Validation failed
  /api/users/{id}:
    get:
      summary: Read one user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User
        '404':
          description: Not found
    put:
      summary: Replace a user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Replaced user
    patch:
      summary: Update part of a user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Updated user
    delete:
      summary: Delete a user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Deleted
        '401':
          description: Missing auth header
`;

export const SwaggerPage: FC = () => {
  const [openPath, setOpenPath] = useState<string>(`${OPERATIONS[0].method} ${OPERATIONS[0].path}`);

  return (
    <article className="max-w-4xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs/quick-start' },
          { label: 'Swagger' },
        ]}
        className="mb-8"
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Typography variant="h1" className="text-3xl md:text-5xl font-bold">
            <GradientText preset="ocean" className="text-3xl md:text-5xl font-bold">
              Swagger
            </GradientText>
          </Typography>
          <Badge variant="info">OpenAPI 3</Badge>
        </div>
        <Typography className="text-lg opacity-60 max-w-2xl">
          The HTTP surface of a Harbor app. Each row is a method on a class mounted with router(). Responses use the Harbor envelope.
        </Typography>
      </header>

      <div className="rounded-2xl overflow-hidden mb-10" style={{ border: '1px solid var(--border-color)' }}>
        <div className="px-4 py-3" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <Typography variant="body2" className="font-mono">
            http://127.0.0.1:3000
          </Typography>
          <Typography variant="caption" className="opacity-50">Harbor sample · v1.6.5</Typography>
        </div>

        <ul>
          {OPERATIONS.map((operation) => {
            const key = `${operation.method} ${operation.path}`;
            const open = openPath === key;
            return (
              <li key={key} style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="w-full text-left px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                  onClick={() => setOpenPath(open ? '' : key)}
                  aria-expanded={open}
                >
                  <span
                    className="inline-flex items-center justify-center shrink-0 w-20 rounded-md text-xs font-bold text-white py-1"
                    style={{ backgroundColor: METHOD_COLOR[operation.method] }}
                  >
                    {operation.method}
                  </span>
                  <span className="font-mono text-sm break-all" style={{ color: 'var(--text-primary)' }}>
                    {operation.path}
                  </span>
                  <span className="text-sm opacity-60 sm:ml-auto">{operation.summary}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4">
                    <Typography className="opacity-70 mb-4">{operation.description}</Typography>
                    {operation.body && (
                      <div className="mb-4">
                        <Typography variant="overline" className="opacity-50 mb-2">Request body</Typography>
                        <CodeBlock code={operation.body} language="json" copyable />
                      </div>
                    )}
                    <Typography variant="overline" className="opacity-50 mb-2">Response 200</Typography>
                    <CodeBlock code={operation.response} language="json" copyable />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <Typography variant="h3" className="text-2xl font-bold mb-3">OpenAPI document</Typography>
      <Typography className="opacity-60 mb-4">
        Copy this spec into any Swagger or OpenAPI viewer. The matching class is in the <Link to="/docs/routes" style={{ color: 'var(--harbor-accent)' }}>routes docs</Link>.
      </Typography>
      <CodeBlock code={OPENAPI} title="openapi.yaml" language="yaml" copyable showLineNumbers />
    </article>
  );
};
