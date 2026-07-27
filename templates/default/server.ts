import { createServer, connect, httpLogger } from '@forgedevstack/harbor';
import { userRoutes } from './routes';
import { CONFIG } from './constants';

async function bootstrap() {
  // Connect to MongoDB
  await connect(CONFIG.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create server with minimal config
  const server = createServer({
    port: CONFIG.PORT,
    cors: true,
    bodyParser: true,
  });

  // Add HTTP request logger
  server.use(httpLogger());

  // Register routes
  server.use(userRoutes);

  console.log(`Server running at http://localhost:${CONFIG.PORT}`);
}

bootstrap().catch(console.error);
