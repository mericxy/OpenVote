import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { votesController } from '../controllers/votes.controller.js';

export const votesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.post('/', {
    schema: {
      body: z.object({
        topic_id: z.number(),
        score: z.number().int().min(0).max(5),
      }),
      response: {
        200: z.object({
          id: z.number(),
          topic_id: z.number(),
          user_id: z.number(),
          score: z.number(),
          updated_at: z.string(),
        }),
      },
    },
  }, votesController.upsert);

  app.get('/me', {
    schema: {
      response: {
        200: z.array(z.object({
          topic_id: z.number(),
          topic_title: z.string(),
          score: z.number(),
          updated_at: z.string(),
        })),
      },
    },
  }, votesController.getMyVotes);
};
