import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { topicsController } from '../controllers/topics.controller.js';

export const topicsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/', {
    schema: {
      response: {
        200: z.array(z.object({
          id: z.number(),
          title: z.string(),
          description: z.string(),
          average_score: z.number().nullable(),
          vote_count: z.number(),
          user_vote: z.number().nullable(),
        })),
      },
    },
  }, topicsController.list);

  app.get('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({
          id: z.number(),
          title: z.string(),
          description: z.string(),
          average_score: z.number().nullable(),
          vote_count: z.number(),
          user_vote: z.number().nullable(),
        }),
      },
    },
  }, topicsController.getById);

  app.post('/', {
    onRequest: [app.authenticate, app.requireAdmin],
    schema: {
      body: z.object({
        title: z.string().min(3),
        description: z.string().min(10),
      }),
      response: {
        201: z.object({
          id: z.number(),
          title: z.string(),
          description: z.string(),
          created_by: z.number(),
          created_at: z.string(),
          updated_at: z.string(),
        }),
      },
    },
  }, topicsController.create);

  app.put('/:id', {
    onRequest: [app.authenticate, app.requireAdmin],
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
      }),
    },
  }, topicsController.update);

  app.delete('/:id', {
    onRequest: [app.authenticate, app.requireAdmin],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 204: z.null() },
    },
  }, topicsController.delete);
};
