import { FastifyPluginAsync } from 'fastify';

export const offersRoutes: FastifyPluginAsync = async (fastify) => {
  // Create or counter offer
  fastify.post('/', {
    schema: {
      tags: ['offers'],
      summary: 'Create or counter offer',
      body: {
        type: 'object',
        required: ['listingId'],
        properties: {
          threadId: { type: 'string' },
          listingId: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          quantity: { type: 'string', maxLength: 100 },
          unit: { type: 'string', maxLength: 50 },
          terms: { type: 'string', maxLength: 1000 },
          message: { type: 'string', maxLength: 500 },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      }
    },
  }, async (request, reply) => {
    // TODO: Implement offer creation/counter
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Accept offer (only latest OPEN)
  fastify.post('/:id/accept', {
    schema: {
      tags: ['offers'],
      summary: 'Accept offer',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
  }, async (request, reply) => {
    // TODO: Implement offer acceptance with integrity checks
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Reject offer
  fastify.post('/:id/reject', {
    schema: {
      tags: ['offers'],
      summary: 'Reject offer',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          message: { type: 'string', maxLength: 500 }
        }
      }
    },
  }, async (request, reply) => {
    // TODO: Implement offer rejection
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });
};