// Documentation Navigation Structure

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
    title: 'Guides',
    sections: [
      { title: 'Schemas', path: '/docs/schemas' },
      { title: 'SchemaTypes', path: '/docs/schematypes' },
      { title: 'Connections', path: '/docs/connections' },
      { title: 'Models', path: '/docs/models' },
      { title: 'Documents', path: '/docs/documents' },
      { title: 'Queries', path: '/docs/queries' },
      { title: 'Validation', path: '/docs/validation' },
      { title: 'Middleware', path: '/docs/middleware' },
      { title: 'Virtuals', path: '/docs/virtuals' },
      { title: 'Plugins', path: '/docs/plugins' },
      { title: 'Timestamps', path: '/docs/timestamps' },
      { title: 'Transactions', path: '/docs/transactions' },
    ],
  },
  {
    title: 'Server',
    sections: [
      { title: 'Creating a Server', path: '/docs/server' },
      { title: 'Routes', path: '/docs/routes' },
      { title: 'Error Handling', path: '/docs/errors' },
      { title: 'HTTP Logger', path: '/docs/http-logger' },
      { title: 'Configuration', path: '/docs/config' },
    ],
  },
  {
    title: 'API Reference',
    sections: [
      { title: 'Harbor', path: '/docs/api/harbor' },
      { title: 'Schema', path: '/docs/api/schema' },
      { title: 'Model', path: '/docs/api/model' },
      { title: 'Query', path: '/docs/api/query' },
      { title: 'Document', path: '/docs/api/document' },
      { title: 'Connection', path: '/docs/api/connection' },
    ],
  },
  {
    title: 'Extras',
    sections: [
      { title: 'Docker Manager', path: '/docs/docker' },
      { title: 'i18n', path: '/docs/i18n' },
      { title: 'TypeScript', path: '/docs/typescript' },
      { title: 'Migration from Mongoose', path: '/docs/migration' },
    ],
  },
];

// VERSION is exported from content.const.ts

