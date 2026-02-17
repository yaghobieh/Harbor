# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

Built with [Harbor](https://forgedevstack.com/harbor) - The pipeline for Node.js backends.

## Features

- 🚀 **Express Server** - Fast and minimal web framework
- 📦 **MongoDB** - Database with Harbor ODM
- 🔒 **TypeScript** - Type-safe development
- 📝 **ESLint** - Code linting and formatting
- 🧪 **Vitest** - Testing framework
- 📁 **Clean Architecture** - Organized folder structure

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm test` | Run tests |

## Project Structure

```
├── server.ts          # Application entry point
├── routes/            # Route definitions
│   ├── index.ts       # Route aggregator
│   └── user.routes.ts # User routes
├── controllers/       # Request handlers
│   └── user.controller.ts
├── services/          # Business logic
│   └── user.service.ts
├── models/            # Database models
│   └── user.model.ts
├── types/             # TypeScript definitions
├── utils/             # Utility functions
├── constants/         # App constants & config
└── package.json
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | - |
| `DB_NAME` | Database name | `harbor_app` |
| `JWT_SECRET` | JWT signing secret | - |

## License

MIT

