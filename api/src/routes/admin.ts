import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { adminController } from '../controllers/admin.controller.js';

export const adminRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);
  app.addHook('onRequest', app.requireAdmin);

  app.get('/users/stats', {
    schema: {
      response: {
        200: z.object({
          total_users: z.number(),
          total_votes: z.number(),
          latest_registration: z.string().nullable(),
        }),
      },
    },
  }, adminController.getStats);

  app.get('/users', {
    schema: {
      response: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
          created_at: z.string(),
          vote_count: z.number(),
        })),
      },
    },
  }, adminController.listUsers);
};
