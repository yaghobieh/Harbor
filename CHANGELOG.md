# Changelog

All notable changes to Harbor will be documented in this file.

## [1.6.5] - 2026-10-01

### Added

- **Marked routes** — `@route.get` / `@route.post` / `@route.put` / `@route.patch` / `@route.del` / `@route.head` / `@route.options` on a class method. `router('/api/users', Users)` mounts that class. The method takes one `ctx` (`query`, `body`, `params`, `headers`, `req`, `res`) and a returned value is still `{ success, data }`. `@route.del` is the delete mark (`delete` is a reserved word). `route.delete(path, handler)` still builds an array route.
- **`@check`**, **`@pre`**, **`@after`**, **`@timeout`**, **`@limit`**, **`@route.cache`** — validation, middleware, timeout, rate limit, and response cache on a marked method. Also available as `route.check`, `route.pre`, `route.after`, `route.timeout`, `route.limit`, and `route.cache`. `route.get(path, handler)` arrays are unchanged.
- **`lab/`** — local project linked with `file:..` for trying this version (`npm run lab`).

### Portal

- Version menu includes 1.6.1 through 1.6.5.
- Docs, home examples, and sandbox show marked routes.
- Code samples import `@forgedevstack/harbor`.
- Portal depends on `@forgedevstack/bear` ^1.3.4 and `@forgedevstack/harbor` via `file:..`.

## [1.6.4] - 2026-07-27

### Added

- **`RedisPubSubAdapter` / `createRedisPubSubAdapter`** — real Redis pub/sub for `WsHub` multi-instance fan-out (`ioredis` peer). Duplicates the client for subscribe (or accepts an explicit `subscriber`); optional `channelPrefix`.
- **`S3StorageAdapter` / `createS3StorageAdapter`** — S3/R2/MinIO streaming uploads with zero AWS SDK. SigV4 PutObject/Delete/HEAD + query-string presigned GET URLs. Temp-file bridge keeps multipart streams off the Node heap.
- **`.github/workflows/publish.yml`** — ForgeStack publish workflow (Node 20, build, test, `npm publish --provenance`).

### Fixed

- Replaced remaining `@forgestack/harbor` install/docs/CLI/template references with `@forgedevstack/harbor`.
- `package.json` `repository` / `bugs` / `homepage` now point at `https://github.com/yaghobieh/Harbor`.

### Changed

- README documents built-in Redis WS adapter and S3 storage adapter (no stub-only contracts).

## [1.6.3] - 2026-07-12

### Added

#### WebSocket Hub (`@forgedevstack/harbor/ws`)
- **`WsHub` / `createWsHub`** — first-class WebSocket support integrated with Harbor's HTTP server via manual `upgrade` handling (`noServer` mode).
- **Connection auth hook** — `authenticate(request)` runs before the upgrade is accepted; rejections respond with a proper HTTP status (default `401`) and never open a socket.
- **Typed message envelope** — all traffic uses `WsMessage<TPayload>` (`{ event, payload }`); invalid envelopes get a `harbor:error` reply.
- **Rooms** — `join` / `leave` / `broadcastToRoom` with automatic cleanup when rooms empty and on disconnect.
- **Per-connection context** — auth hook returns a `context` object carried on every `WsConnection`.
- **Heartbeat** — ping/pong liveness with automatic termination of dead connections.
- **Pub/sub adapter contract** — `WsPubSubAdapter` (`publish` / `subscribe` / `unsubscribe` / `close`) enables multi-instance fan-out; `MemoryPubSubAdapter` ships as the in-process default. No Redis dependency added — the contract is designed for a separate Redis adapter package.
- The existing `websocket` module (`WebSocketManager`) is untouched and fully backward compatible.

#### Streaming Uploads (`@forgedevstack/harbor/upload`)
- **`streamUpload`** middleware — stream-based multipart/form-data parsing; file bytes flow straight to storage without buffering whole files in memory (unlike the buffered `upload` middleware, which remains unchanged).
- **`MultipartParser`** — incremental boundary state machine with backpressure support, per-file/field size limits, file and field count limits, and header size guards.
- **Mime allowlist** — `allowedMimeTypes` rejects disallowed files with `415`; size violations respond `413`.
- **Storage adapter contract** — `StorageAdapter.save(stream, meta) -> { key, url }` with optional `remove(key)`.
- **`LocalDiskStorageAdapter`** — built-in disk storage with configurable directory, base URL, and key strategy.
- **`S3CompatibleStorageAdapter`** — interface and config types only (bucket, endpoint, credentials, signed URLs) so an external adapter package can implement S3/R2/MinIO without adding AWS SDK dependencies to Harbor.
- **`req.uploads`** — stored uploads (`{ key, url, size, ...meta }`) attached to the request; form fields merged into `req.body`.

#### Constants
- `HTTP_STATUS.PAYLOAD_TOO_LARGE` (413) and `HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE` (415) added with status messages.

#### Packaging
- New subpath exports: `@forgedevstack/harbor/ws` and `@forgedevstack/harbor/upload`.
- Added vitest suites covering the hub (rooms, envelopes, adapters, disconnect cleanup) and uploads (parser state machine, limits, disk adapter, middleware).

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
- Subpath import: `@forgedevstack/harbor/queue`

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
- Subpath import: `@forgedevstack/harbor/mail`

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
- Package renamed to `@forgedevstack/harbor`
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
