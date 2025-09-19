import fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

const server = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function main() {
  try {
    // Register security plugins
    await server.register(helmet);
    await server.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || 'https://veilmarket.com']
        : true,
      credentials: true,
    });

    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // Health check
    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Simple API test endpoint
    server.get('/api/test', async () => {
      return { message: 'VeilMarket API is running!' };
    });

    const PORT = process.env.PORT || 4000;
    await server.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`🚀 VeilMarket API server running on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();