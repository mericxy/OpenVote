import { FastifyReply, FastifyRequest } from 'fastify';
import { votesService } from '../services/votes.service.js';

export const votesController = {
  async upsert(request: FastifyRequest<any>, reply: FastifyReply) {
    const { topic_id, score } = request.body as any;
    
    const vote = await votesService.upsert(request.user.id, topic_id, score);

    return vote;
  },

  async getMyVotes(request: FastifyRequest<any>, reply: FastifyReply) {
    return votesService.getMyVotes(request.user.id);
  }
};
