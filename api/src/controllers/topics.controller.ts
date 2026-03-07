import { FastifyReply, FastifyRequest } from 'fastify';
import { topicsService } from '../services/topics.service.js';

export const topicsController = {
  async list(request: FastifyRequest, reply: FastifyReply) {
    return topicsService.list(request.user.id);
  },

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    return topicsService.getById(Number(request.params.id), request.user.id);
  },

  async create(request: FastifyRequest<{ Body: { title: string; description: string } }>, reply: FastifyReply) {
    const topic = await topicsService.create({
      ...request.body,
      created_by: request.user.id,
    });
    return reply.status(201).send(topic);
  },

  async update(request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; description?: string } }>, reply: FastifyReply) {
    return topicsService.update(Number(request.params.id), request.body);
  },

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await topicsService.delete(Number(request.params.id));
    return reply.status(204).send();
  }
};
