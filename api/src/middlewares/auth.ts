import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  app.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user.role !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden: Admin access required' });
    }
  });
});
