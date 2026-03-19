# Changelog

All notable changes to Harbor will be documented in this file.

## [Portal 1.1.0] - 2026-02-17

### Changed - Harbor Portal

#### Bear UI Integration
- Migrated all portal components to use `@forgedevstack/bear` UI components
- `BearProvider` configured with full Harbor theme: primary (harbor blue), secondary (forge indigo), custom variants (`harbor`, `forge`, `harborGhost`, `forgeGhost`)
- All colors and styles now flow through Bear's theme provider for consistent light/dark theming
- `Hero` → Bear `Container`, `Typography`, `Button`, `GradientText`, `Grid`, `Card`, `Badge`, `CodeBlock`
- `Navbar` → Bear `Button`, `Typography`, `Flex`, `Badge`
- `Footer` → Bear `Typography`, `Flex`, `Divider`, `Link`
- `Features` / `FeatureCard` → Bear `Grid`, `Card`, `CardBody`, `Typography`
- `CodeExamples` → Bear `Tabs` (pills variant) + `CodeBlock` with syntax highlighting
- `QuickStart` → Bear `CodeBlock`, `Badge`, `Typography`
- `ApiReference` → Bear `Card`, `Badge`, `CodeBlock`
- `ThemeToggle` → Bear `Button` with `useBear()` hook
- `GradientText` → Re-exports Bear's `GradientText` component
- `Sidebar` → Bear `Input` for search, `Typography`, `Link`, `Divider`
- `DocLayout` → Bear `Button` for mobile toggle
- `DocPage` → Bear `Breadcrumbs`, `Typography`, `GradientText`, `Card`, `CodeBlock`, `Divider`, `Button`

#### Real-Time Sandbox
- Added `/sandbox` route with live code editing and simulated execution
- Bear `CodeEditor` with TypeScript syntax highlighting, line numbers, auto-indent, bracket matching
- Bear `Terminal` with interactive command input (`run`, `clear`, `help`, `examples`)
- 5 pre-loaded examples: Hello Server, CRUD API, Database Model, Middleware, Queue & Mail
- Simulated execution engine that extracts console.log output from code
- Split-pane editor + terminal layout

#### Link Updates
- All `forgestack.dev` links updated to `forgedevstack.com`
- GitHub links replaced with npm links

## [1.6.2] - 2026-02-07

### Fixed

#### ODM — `save()` update path could no-op silently
- **`replaceOne`** with **`matchedCount: 0`** (e.g. `isNew` incorrectly `false` on a new document, or stale build) completed without error and **did not insert** rows — APIs could still return an in-memory `_id` while Mongo stayed empty.
- **Fallback:** if `replaceOne` matches nothing and did not upsert, Harbor now **`insertOne`** the payload so the document is persisted.
- **Payload correctness:** the replacement document is built with **`toObject()` after the version bump** so `__v` and fields stay in sync.

## [1.6.1] - 2026-02-07

### Fixed

#### ODM — documents never inserted on `create` / `new(doc).save()`
- **HarborDocument** incorrectly set `isNew = false` whenever a plain `doc` was passed to the constructor. That made the first `save()` call use **`replaceOne`** instead of **`insertOne`**, so missing documents were never created and collections stayed empty in Atlas.
- **Hydration** still sets `isNew = false` via `Model.hydrate()` for rows loaded from MongoDB.

#### ODM — `_id` on insert/replace
- **`insertOne` / `replaceOne`** continue to spread document data then set a UUID **ObjectId** last so string `_id` from `toObject()` never overrides the BSON id.

#### Connection
- **Database name** is parsed with **`extractDbNameFromMongoUri()`** (handles `mongodb` / `mongodb+srv` and credentials) instead of fragile URL parsing.

#### ESM / packaging
- **`export default`** object added for CommonJS and `import harbor from '@forgedevstack/harbor'` (includes `createServer`, `router`, `GET`/`POST`, `connect`, `Schema`, `model`, etc.). **Named imports remain recommended** for tree-shaking.

## [1.6.0] - 2026-02-17

### Added

#### Job Queue System
- `Queue` class for in-memory job processing with workers
- `createQueue()` factory function
- Priority queues: `critical`, `high`, `normal`, `low`
- Retry with exponential backoff (configurable attempts, backoff multiplier)
- Dead letter queue for permanently failed jobs
- Delayed jobs with automatic promotion
- Bulk job insertion with `addBulk()`
- Job lifecycle events: `onJobComplete`, `onJobFailed`, `onJobRetry`, `onJobDead`, `onDrained`
- Queue stats: pending, active, completed, failed, delayed, dead, avg duration
- Pause/resume/drain/clean operations
- Configurable concurrency (multiple workers)
- Subpath import: `@forgestack/harbor/queue`

#### Mail System
- `Mailer` class with zero-dependency SMTP transport (Node.js `net`/`tls`)
- `createMailer()` and `createMailerFromProvider()` factory functions
- Pre-configured providers: Gmail, Outlook, SendGrid, AWS SES
- HTML and plain text email support
- File attachments with base64 encoding
- Template engine with `{{variable}}` placeholders
- `registerTemplate()` / `renderNamedTemplate()` for reusable templates
- `sendTemplate()` for sending emails with registered templates
- Priority headers (high/normal/low)
- CC, BCC, Reply-To, custom headers
- STARTTLS upgrade for secure connections
- `escapeHtml()` utility for safe template rendering
- Subpath import: `@forgestack/harbor/mail`

#### Testing
- Added `@forgedevstack/crucible` as devDependency for testing

### Notes
- ORM/DB, Validation, Logger, Caching already existed from v1.3.0–1.5.0
- Queue complements the existing Scheduler (cron/interval) with event-driven job processing
- Mail uses zero external dependencies — built on Node.js `net` and `tls` modules

---

## [1.5.0] - 2026-01-14

### Added

#### WebSocket Support
- `createWebSocketServer()` for real-time applications
- Room-based broadcasting
- Heartbeat/ping-pong for connection health
- Client tracking and management

#### Job Scheduler
- `createScheduler()` for task scheduling
- Cron expressions support (`scheduler.cron('0 * * * *', ...)`)
- Interval-based scheduling (`scheduler.every('5m', ...)`)
- One-time scheduling (`scheduler.at(date, ...)`)

#### Rate Limiting
- `rateLimit()` middleware with memory store
- `slidingWindowRateLimit()` for accurate limiting
- Redis store support for distributed systems
- Customizable key generation and skip logic

#### Health Checks
- `healthCheck()` endpoint with multiple checks
- Pre-built checks: MongoDB, Redis, Memory, Disk
- `customHealthCheck()` for custom health logic
- Critical vs non-critical check distinction

#### Metrics (Prometheus)
- `metricsMiddleware()` for automatic collection
- `metricsEndpoint()` for Prometheus scraping
- Counter, Gauge, Histogram metric types
- Request duration, size, and count metrics

#### File Uploads
- `upload()` middleware for multipart handling
- Disk and memory storage options
- File type and size validation
- Custom filename generation

#### Caching
- `CacheManager` with memory store
- `RedisCache` for distributed caching
- `cacheResponse()` middleware
- `cached()` function wrapper

#### Authentication
- `JWT` class for token signing/verification
- `jwtAuth()` middleware
- `apiKeyAuth()` middleware
- `requireRole()` and `requirePermission()` for RBAC
- `verifySignature()` for HMAC request signing
- Password hashing utilities

### Changed
- Server now has `.use()`, `.get()`, `.post()`, etc. methods
- Server `.listen()` method for simpler startup
- Auto-start disabled by default

## [1.4.0] - 2026-01-14

### Added
- `route.get()`, `route.post()` syntax for routes
- Express-like convenience methods on server
- ForgeStack branding and organization

### Changed
- Package renamed to `@forgestack/harbor`
- Auto-start now defaults to false

## [1.3.0] - 2026-01-13

### Added
- Full MongoDB ODM (Mongoose replacement)
- Schema, Model, Query with all methods
- Connection management
- Hooks (pre, post) support
- Virtual fields
- Indexes

## [1.2.0] - 2026-01-12

### Added
- Simplified router API with `GET()`, `POST()`, etc.
- Removed need for `.build()` on routes
- CLI for project scaffolding

## [1.1.0] - 2026-01-11

### Added
- HTTP request logger (Morgan alternative)
- i18n support for translations
- Docker manager

## [1.0.0] - 2026-01-10

### Added
- Initial release
- `createServer()` for quick server setup
- Route management with pre/post functions
- Validation system
- Error handling with config
- Logger integration
