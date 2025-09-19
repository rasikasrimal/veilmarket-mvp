import { FastifyPluginAsync } from 'fastify';

export const uploadsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get signed upload URL
  fastify.post('/sign', {
    schema: {
      tags: ['uploads'],
      summary: 'Get signed upload URL',
      body: {
        type: 'object',
        required: ['filename', 'contentType', 'size', 'listingId'],
        properties: {
          filename: { type: 'string', minLength: 1, maxLength: 255 },
          contentType: { type: 'string', minLength: 1, maxLength: 100 },
          size: { type: 'integer', minimum: 1, maximum: 104857600 }, // 100MB
          listingId: { type: 'string' }
        }
      }
    },
  }, async (request, reply) => {
    // TODO: Implement signed URL generation for S3
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });

  // Process uploaded document (webhook)
  fastify.post('/process', {
    schema: {
      tags: ['uploads'],
      summary: 'Process uploaded document',
      body: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          listingId: { type: 'string' }
        },
        required: ['key', 'listingId']
      }
    },
  }, async (request, reply) => {
    // TODO: Implement document processing (watermark, mask)
    reply.status(501).send({ code: 'NOT_IMPLEMENTED', message: 'Not implemented yet' });
  });
};