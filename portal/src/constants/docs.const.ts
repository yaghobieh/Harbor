export interface DocSection {
  title: string;
  path: string;
  children?: DocSection[];
}

export interface DocNavigation {
  title: string;
  sections: DocSection[];
}

export const DOC_NAVIGATION: DocNavigation[] = [
  {
    title: 'Getting Started',
    sections: [
      { title: 'Quick Start', path: '/docs/quick-start' },
      { title: 'Installation', path: '/docs/installation' },
      { title: 'Project Templates', path: '/docs/templates' },
      { title: 'CLI', path: '/docs/cli' },
      { title: 'Configuration', path: '/docs/config' },
    ],
  },
  {
    title: 'Core',
    sections: [
      { title: 'Creating a Server', path: '/docs/server' },
      { title: 'Routes', path: '/docs/routes' },
      { title: 'Marked Routes', path: '/docs/marked-routes' },
      { title: 'Controllers & Services', path: '/docs/layers' },
      { title: 'Hooks', path: '/docs/hooks' },
      { title: 'Timeout', path: '/docs/timeout' },
      { title: 'Route Context', path: '/docs/route-context' },
      { title: 'Responses', path: '/docs/responses' },
      { title: 'Middleware', path: '/docs/middleware' },
      { title: 'CORS', path: '/docs/cors' },
      { title: 'Swagger', path: '/docs/swagger' },
      { title: 'Error Handling', path: '/docs/errors' },
    ],
  },
  {
    title: 'Database',
    sections: [
      { title: 'MongoDB ODM', path: '/docs/database' },
      { title: 'Schemas', path: '/docs/schemas' },
      { title: 'Models & Queries', path: '/docs/queries' },
      { title: 'Indexes', path: '/docs/indexes' },
      { title: 'Validation', path: '/docs/validation' },
    ],
  },
  {
    title: 'Queue & Mail',
    sections: [
      { title: 'Job Queue', path: '/docs/queue' },
      { title: 'Mail', path: '/docs/mail' },
      { title: 'Mail Templates', path: '/docs/mail-templates' },
    ],
  },
  {
    title: 'Auth & Security',
    sections: [
      { title: 'Authentication', path: '/docs/auth' },
      { title: 'API Keys', path: '/docs/api-keys' },
      { title: 'Passwords', path: '/docs/passwords' },
      { title: 'Roles', path: '/docs/roles' },
      { title: 'Request Signing', path: '/docs/signing' },
      { title: 'Rate Limiting', path: '/docs/rate-limit' },
    ],
  },
  {
    title: 'Real-time & Cache',
    sections: [
      { title: 'WebSocket', path: '/docs/websocket' },
      { title: 'WebSocket Hub', path: '/docs/ws-hub' },
      { title: 'Caching', path: '/docs/cache' },
      { title: 'Scheduler', path: '/docs/scheduler' },
    ],
  },
  {
    title: 'Observability',
    sections: [
      { title: 'Health Checks', path: '/docs/health' },
      { title: 'Metrics', path: '/docs/metrics' },
      { title: 'HTTP Logger', path: '/docs/http-logger' },
      { title: 'Logger', path: '/docs/logger' },
    ],
  },
  {
    title: 'Extras',
    sections: [
      { title: 'File Uploads', path: '/docs/upload' },
      { title: 'Streaming Uploads', path: '/docs/streaming-uploads' },
      { title: 'Docker', path: '/docs/docker' },
      { title: 'Helpers', path: '/docs/helpers' },
      { title: 'Release Notes', path: '/docs/release-notes' },
      { title: 'Subpath Imports', path: '/docs/subpaths' },
      { title: 'i18n', path: '/docs/i18n' },
    ],
  },
  {
    title: 'Testing',
    sections: [
      { title: 'Testing with Crucible', path: '/docs/testing' },
    ],
  },
  {
    title: 'Ecosystem',
    sections: [
      { title: 'ForgeStack', path: '/docs/forgestack' },
      { title: 'Forge CLI', path: '/docs/forge-cli' },
    ],
  },
];
