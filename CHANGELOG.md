# Changelog

All notable changes to Harbor will be documented in this file.

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
