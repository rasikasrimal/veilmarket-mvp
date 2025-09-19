import { FastifyPluginAsync } from 'fastify';
import { createListingSchema, searchListingsSchema } from '@veilmarket/core';

export const listingsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create listing
  fastify.post('/', {
    schema: {
      tags: ['listings'],
      summary: 'Create listing',
      body: createListingSchema,
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
      querystring: searchListingsSchema,
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