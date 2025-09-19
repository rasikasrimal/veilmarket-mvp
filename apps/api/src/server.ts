import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';

import { authRoutes } from './routes/auth';
import { listingsRoutes } from './routes/listings';
import { offersRoutes } from './routes/offers';
import { uploadsRoutes } from './routes/uploads';
import { webhooksRoutes } from './routes/webhooks';
import { notificationsRoutes } from './routes/notifications';

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    ...(process.env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
  },
});

// Security plugins
server.register(helmet, {
  contentSecurityPolicy: false,
});

server.register(cors, {
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// File upload support
server.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// API documentation
server.register(swagger, {
  swagger: {
    info: {
      title: 'VeilMarket API',
      description: 'Privacy-first B2B ingredients marketplace API',
      version: '0.1.0',
    },
    host: 'localhost:4000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'auth', description: 'Authentication and organization management' },
      { name: 'listings', description: 'Listings management' },
      { name: 'offers', description: 'Offers and negotiations' },
      { name: 'uploads', description: 'File uploads' },
      { name: 'notifications', description: 'Notifications' },
    ],
  },
});

server.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Routes
server.register(authRoutes, { prefix: '/auth' });
server.register(listingsRoutes, { prefix: '/listings' });
server.register(offersRoutes, { prefix: '/offers' });
server.register(uploadsRoutes, { prefix: '/uploads' });
server.register(webhooksRoutes, { prefix: '/webhooks' });
server.register(notificationsRoutes, { prefix: '/notifications' });

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  
  if (error.validation) {
    reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      fields: error.validation.reduce((acc: Record<string, string>, err: any) => {
        const field = err.instancePath.replace('/', '') || err.params?.missingProperty || 'unknown';
        acc[field] = err.message;
        return acc;
      }, {}),
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    await server.close();
    process.exit(0);
  } catch (error) {
    server.log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    server.log.info(`Server running on http://${host}:${port}`);
    server.log.info(`API documentation available at http://${host}:${port}/docs`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();