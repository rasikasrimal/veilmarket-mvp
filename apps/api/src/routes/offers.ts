import { FastifyPluginAsync } from 'fastify';
import { createOfferSchema, updateOfferStateSchema } from '@veilmarket/core';

export const offersRoutes: FastifyPluginAsync = async (fastify) => {
  // Create or counter offer
  fastify.post('/', {
    schema: {
      tags: ['offers'],
      summary: 'Create or counter offer',
      body: createOfferSchema,
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