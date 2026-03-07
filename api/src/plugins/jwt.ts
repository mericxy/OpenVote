import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

export default fp(async (app) => {
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
  });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
