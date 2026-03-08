import { FastifyReply, FastifyRequest } from 'fastify';
import { topicsService } from '../services/topics.service.js';

export const topicsController = {
  async list(request: FastifyRequest<any>, reply: FastifyReply) {
    return topicsService.list(request.user.id);
  },

  async getById(request: FastifyRequest<any>, reply: FastifyReply) {
    const params = request.params as any;
    return topicsService.getById(Number(params.id), request.user.id);
  },

  async create(request: FastifyRequest<any>, reply: FastifyReply) {
    const body = request.body as any;
    const topic = await topicsService.create({
      ...body,
      created_by: request.user.id,
    });
    return reply.status(201).send(topic);
  },

  async update(request: FastifyRequest<any>, reply: FastifyReply) {
    const params = request.params as any;
    const body = request.body as any;
    return topicsService.update(Number(params.id), body);
  },

  async delete(request: FastifyRequest<any>, reply: FastifyReply) {
    const params = request.params as any;
    await topicsService.delete(Number(params.id));
    return reply.status(204).send();
  }
};
