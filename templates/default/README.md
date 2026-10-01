# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

This project is ready to run. It does not need MongoDB. Users live in memory so you can call the API as soon as the server starts.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:3000/api/health

Routes stay thin. `src/routes/users.ts` calls `UserController`, and the controller calls `UserService`.

## API

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/health` | |
| GET | `/api/users` | |
| GET | `/api/users/:id` | |
| POST | `/api/users` | `{ "name": "Ada", "email": "ada@harbor.dev" }` |
| DELETE | `/api/users/:id` | |

```bash
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"Grace","email":"grace@harbor.dev"}'
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start with reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |

Set `PORT` to change the port. The default is `3000`.
