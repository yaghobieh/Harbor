import { createServer, connect, httpLogger } from 'harbor';
import { routes } from './routes';
import { config } from './constants';

async function bootstrap() {
  // Create server with Harbor
  const app = createServer({
    port: config.PORT,
    cors: true,
    helmet: true,
    json: true,
    urlencoded: true,
  });

  // HTTP request logging
  app.use(httpLogger({
    format: 'dev',
    skip: (req) => req.path === '/health',
  }));

  // Connect to MongoDB (optional)
  if (config.MONGODB_URI) {
    await connect(config.MONGODB_URI, {
      dbName: config.DB_NAME,
    });
    console.log('📦 Connected to MongoDB');
  }

  // Register all routes
  app.use('/api', routes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Start server
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📚 API Docs: http://localhost:${config.PORT}/api-docs`);
  });
}

bootstrap().catch(console.error);

