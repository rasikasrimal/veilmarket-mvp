import { FastifyPluginAsync } from 'fastify';

export const listingsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create listing
  fastify.post('/', {
    schema: {
      tags: ['listings'],
      summary: 'Create listing',
      body: {
        type: 'object',
        required: ['title', 'type', 'materialIdentifierId'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          type: { type: 'string', enum: ['SELL', 'BUY_REQ'] },
          quantity: { type: 'string', maxLength: 100 },
          unit: { type: 'string', maxLength: 50 },
          priceIndicative: { type: 'string', maxLength: 100 },
          location: { type: 'string', maxLength: 200 },
          materialIdentifierId: { type: 'string' }
        }
      }
    },
  }, async (request, reply) => {
    // TODO: Implement listing creation
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Search listings
  fastify.get('/', {
    schema: {
      tags: ['listings'],
      summary: 'Search listings',
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', maxLength: 200 },
          materialScheme: { type: 'string', maxLength: 50 },
          materialValue: { type: 'string', maxLength: 100 },
          type: { type: 'string', enum: ['SELL', 'BUY_REQ'] },
          location: { type: 'string', maxLength: 200 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      }
    },
  }, async (request, reply) => {
    // TODO: Implement listings search
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Get listing by ID
  fastify.get('/:id', {
    schema: {
      tags: ['listings'],
      summary: 'Get listing by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
  }, async (request, reply) => {
    // TODO: Implement listing retrieval
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });
};