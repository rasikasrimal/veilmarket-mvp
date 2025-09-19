import { FastifyPluginAsync } from 'fastify';
import { paginationSchema } from '@veilmarket/core';

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get user notifications
  fastify.get('/', {
    schema: {
      tags: ['notifications'],
      summary: 'Get user notifications',
      querystring: paginationSchema,
    },
  }, async (request, reply) => {
    // TODO: Implement notifications retrieval
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Mark notification as read
  fastify.patch('/:id/read', {
    schema: {
      tags: ['notifications'],
      summary: 'Mark notification as read',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
  }, async (request, reply) => {
    // TODO: Implement notification read status update
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });
};