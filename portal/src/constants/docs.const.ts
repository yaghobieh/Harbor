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
    ],
  },
  {
    title: 'Core',
    sections: [
      { title: 'Creating a Server', path: '/docs/server' },
      { title: 'Routes', path: '/docs/routes' },
      { title: 'Configuration', path: '/docs/config' },
      { title: 'Error Handling', path: '/docs/errors' },
    ],
  },
  {
    title: 'Database',
    sections: [
      { title: 'MongoDB ODM', path: '/docs/database' },
      { title: 'Schemas', path: '/docs/schemas' },
      { title: 'Models & Queries', path: '/docs/queries' },
      { title: 'Validation', path: '/docs/validation' },
    ],
  },
  {
    title: 'Queue & Mail',
    sections: [
      { title: 'Job Queue', path: '/docs/queue' },
      { title: 'Mail', path: '/docs/mail' },
    ],
  },
  {
    title: 'Auth & Security',
    sections: [
      { title: 'Authentication', path: '/docs/auth' },
      { title: 'Rate Limiting', path: '/docs/rate-limit' },
    ],
  },
  {
    title: 'Real-time & Cache',
    sections: [
      { title: 'WebSocket', path: '/docs/websocket' },
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
    ],
  },
  {
    title: 'Extras',
    sections: [
      { title: 'File Uploads', path: '/docs/upload' },
      { title: 'Docker', path: '/docs/docker' },
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
