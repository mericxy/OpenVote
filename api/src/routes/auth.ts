import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller.js';

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/register', {
    schema: {
      body: z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      }),
      response: {
        201: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      },
    },
  }, authController.register);

  app.post('/login', {
    schema: {
      body: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      response: {
        200: z.object({
          token: z.string(),
        }),
      },
    },
  }, authController.login);
};
