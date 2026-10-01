import { createServer, router } from '@forgedevstack/harbor';
import { healthRoutes } from './routes/health';
import { Users } from './routes/users';

const port = Number(process.env.PORT ?? 3000);

const server = createServer({ port });

server.use(healthRoutes);
server.use(router('/api/users', Users));

server.listen(port, () => {
  console.log('{{PROJECT_NAME}} on http://localhost:' + port);
  console.log('GET    /api/health');
  console.log('GET    /api/users');
  console.log('POST   /api/users   { "name", "email" }');
  console.log('DELETE /api/users/:id');
});
