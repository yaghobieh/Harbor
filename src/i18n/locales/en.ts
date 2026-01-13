export const en: Record<string, string> = {
  // Server
  'server.starting': 'Server starting...',
  'server.started': 'Server started on http://{host}:{port}',
  'server.stopping': 'Server stopping...',
  'server.stopped': 'Server stopped',
  'server.alreadyRunning': 'Server is already running',
  'server.error': 'Server error',
  'server.gracefulShutdown': 'Received {signal}, shutting down gracefully',

  // Router
  'router.registered': 'Registered route: {method} {path}',
  'router.missingRequired': 'Route must have path, method, and handler',

  // Validation
  'validation.failed': 'Validation failed',
  'validation.required': '{field} is required',
  'validation.typeMismatch': '{field} must be of type {type}',
  'validation.minValue': '{field} must be at least {min}',
  'validation.maxValue': '{field} must be at most {max}',
  'validation.minLength': '{field} must be at least {min} characters',
  'validation.maxLength': '{field} must be at most {max} characters',
  'validation.pattern': '{field} does not match the required pattern',
  'validation.enum': '{field} must be one of: {values}',
  'validation.invalidObjectId': '{field} is not a valid ObjectId',
  'validation.invalidEmail': '{field} is not a valid email address',
  'validation.invalidUrl': '{field} is not a valid URL',
  'validation.invalidDate': '{field} is not a valid date',
  'validation.customFailed': '{field} failed custom validation',

  // Errors
  'errors.badRequest': 'Bad Request',
  'errors.unauthorized': 'Unauthorized',
  'errors.forbidden': 'Forbidden',
  'errors.notFound': 'Not Found',
  'errors.conflict': 'Conflict',
  'errors.tooManyRequests': 'Too Many Requests',
  'errors.internal': 'Internal Server Error',
  'errors.timeout': 'Request timeout',
  'errors.default': 'An error occurred',

  // Config
  'config.notFound': 'No config file found, using defaults',
  'config.loaded': 'Config loaded from {path}',
  'config.loadFailed': 'Failed to load config',

  // Docker
  'docker.containerStarted': 'Container started: {name}',
  'docker.containerStopped': 'Container stopped: {name}',
  'docker.containerRestarted': 'Container restarted: {name}',
  'docker.containerRemoved': 'Container removed: {name}',
  'docker.imageBuilt': 'Image built: {name}:{tag}',
  'docker.imagePushed': 'Image pushed: {name}',
  'docker.imagePulled': 'Image pulled: {name}:{tag}',
  'docker.composeUp': 'Docker Compose up completed',
  'docker.composeDown': 'Docker Compose down completed',
  'docker.commandFailed': 'Docker command failed: {command}',

  // Changelog
  'changelog.loaded': 'Changelog loaded with {count} entries',
  'changelog.saved': 'Changelog saved to {path}',
  'changelog.released': 'Released version {version}',
  'changelog.notFound': 'No changelog file found, starting fresh',

  // Portal
  'portal.generated': 'Portal generated at {path}',
  'portal.generating': 'Generating documentation portal...',

  // Logger
  'logger.levelChanged': 'Log level changed to {level}',

  // HTTP Logger (Morgan-like)
  'http.request': '{method} {url} {status} {duration}ms',
  'http.requestStart': 'Incoming request: {method} {url}',
  'http.requestEnd': 'Request completed: {method} {url} - {status} in {duration}ms',

  // CLI
  'cli.init.success': 'Harbor project initialized!',
  'cli.init.configExists': 'harbor.config.json already exists',
  'cli.init.created': 'Created {file}',
  'cli.docs.generating': 'Generating API documentation...',
  'cli.docs.success': 'Documentation generated successfully',
  'cli.version': 'Harbor v{version}',
  'cli.unknownCommand': 'Unknown command: {command}',

  // Database
  'database.connected': 'Connected to MongoDB at {uri}',
  'database.disconnected': 'Disconnected from MongoDB',
  'database.connecting': 'Connecting to MongoDB...',
  'database.connectionFailed': 'Failed to connect to MongoDB: {error}',
  'database.notConnected': 'Not connected to database. Call harbor.connect() first.',
  'database.modelCreated': 'Model created: {name}',
  'database.documentSaved': 'Document saved: {id}',
  'database.documentDeleted': 'Document deleted: {id}',
  'database.validationFailed': 'Validation failed: {errors}',
  'database.queryExecuted': 'Query executed: {operation} on {collection}',
  'database.indexCreated': 'Index created: {name}',
  'database.transactionStarted': 'Transaction started',
  'database.transactionCommitted': 'Transaction committed',
  'database.transactionAborted': 'Transaction aborted',
};

