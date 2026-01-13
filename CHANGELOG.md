# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-01-13

### Added

- **Version Dropdown** - Click on version badge to see changelog history with highlights
- **Project Templates Link** - Homepage now links to templates documentation
- **Template Init Flag** - `harbor init --template` to initialize with full boilerplate
- **Template Version Tracking** - Each project tracks Harbor and template versions

### Changed

- Navbar version badge now shows dropdown with all versions
- Sidebar version badge now shows dropdown with changelog
- Hero code block centered properly
- Docs navigation uses React Router (no page reload)

## [1.3.0] - 2026-01-13

### Added

- **Project Scaffolding CLI** - New `harbor create <project-name>` command:
  - Full boilerplate with routes, controllers, services, models, types, utils, constants
  - Pre-configured ESLint, TypeScript, and Vitest
  - Example User CRUD implementation
  - Environment configuration with `.env.example`
  - Clean architecture with `index.ts` exports

- **Subpath Exports** - Enhanced package exports for better tree-shaking:
  - `import { ... } from 'harbor'` - Main exports
  - `import { Schema, model, connect } from 'harbor/database'` - Database-specific
  - `import { ... } from 'harbor/validations'` - Validation utilities
  - `import { ... } from 'harbor/docker'` - Docker management
  - `import { ... } from 'harbor/utils'` - Utility functions

- **GitHub Integration** - Added repository links:
  - Repository: https://github.com/yaghobieh/Harbor
  - Homepage and issue tracker configured in package.json

### Changed

- **Portal Improvements**:
  - Navbar is now solid (not floating/transparent)
  - Added copy button to all code blocks with visual feedback
  - Light/Dark mode toggle with system option
  - Restructured all components with `index.ts`, `ComponentName.tsx`, `types.ts` pattern
  - All GitHub links now point to official repository

- Portal version updated to 1.3.0
- CLI version updated to 1.2.0

## [1.2.0] - 2026-01-12

### Added

- **MongoDB ODM (Mongoose Replacement)** - Complete database module that replaces Mongoose:
  - `connect()` / `disconnect()` - MongoDB connection management with events
  - `Schema` class - Mongoose-compatible schema definition with all field types
  - `model()` function - Create models from schemas
  - **All Query Methods**: `find()`, `findOne()`, `findById()`, `create()`, `insertMany()`, `updateOne()`, `updateMany()`, `findOneAndUpdate()`, `findByIdAndUpdate()`, `deleteOne()`, `deleteMany()`, `findOneAndDelete()`, `findByIdAndDelete()`, `countDocuments()`, `estimatedDocumentCount()`, `aggregate()`, `distinct()`, `exists()`
  - **Query Builder**: `.where()`, `.select()`, `.sort()`, `.limit()`, `.skip()`, `.lean()`, `.populate()`, `.gt()`, `.gte()`, `.lt()`, `.lte()`, `.in()`, `.nin()`, `.ne()`, `.regex()`, `.exists()`, `.or()`, `.and()`, `.nor()`
  - **Schema Features**: virtuals, instance methods, static methods, pre/post hooks (middleware)
  - **Index Management**: `createIndex()`, `createIndexes()`, `listIndexes()`, `dropIndex()`
  - **Transactions**: `startSession()`, `withTransaction()`
  - `Types.ObjectId` - ObjectId type support

- **Database Translations** - Added i18n support for all database operations (English & Hebrew)

- **Comprehensive Documentation**:
  - Updated README.md with full MongoDB documentation
  - Added Database examples to portal
  - API reference for all database methods

### Changed

- Portal version updated to 1.2.0
- Portal now includes Database tab in code examples
- Features section now highlights MongoDB ODM capability

## [1.1.0] - 2026-01-12

### Added

- **Simplified Route API** - New `GET`, `POST`, `PUT`, `PATCH`, `DELETE` functions that don't require `.build()`
- **i18n/Translation System** - Full internationalization support with `t()`, `setLocale()`, includes English and Hebrew
- **Morgan-like HTTP Logger** - In-house `httpLogger()` middleware with formats: tiny, short, dev, combined, common
- **React Portal** - Complete React-based documentation portal with proper component structure
- `route()` function for creating routes with any HTTP method
- Skip functions for HTTP logger: `successOnly`, `healthChecks`, `staticFiles`, `paths`

### Changed

- `RouteBuilder.handler()` now returns `RouteDefinition` directly (no need to call `.build()`)
- Portal converted from static HTML to React project with components, constants, types pattern

## [1.0.0] - 2026-01-12

### Added

- Initial release of Harbor
- Fast server creation with `createServer()`
- Route management with `RouteBuilder` fluent API
- Pre and post function middleware support
- Request validation with schema definitions
- MongoDB-compatible validation with `MongoValidator`
- Custom validation adapter support
- Config-driven error handling
- CORS middleware with configurable options
- Body parser with size limits
- Request timeout handling
- Docker container management
- Docker Compose integration
- Changelog manager for version tracking
- API Portal documentation generator
- CLI tools for project initialization
- TypeScript-first with full type definitions
- Graceful shutdown handling
- Environment variable overrides
- Comprehensive logging system

