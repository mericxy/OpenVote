import { FastifyReply, FastifyRequest } from 'fastify';
import { votesService } from '../services/votes.service.js';

export const votesController = {
  async upsert(request: FastifyRequest<{ Body: { topic_id: number; score: number } }>, reply: FastifyReply) {
    const { topic_id, score } = request.body;
    return votesService.upsert(request.user.id, topic_id, score);
  },

  async getMyVotes(request: FastifyRequest, reply: FastifyReply) {
    return votesService.getMyVotes(request.user.id);
  }
};
