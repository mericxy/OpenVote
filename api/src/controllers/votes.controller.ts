import { FastifyReply, FastifyRequest } from 'fastify';
import { votesService } from '../services/votes.service.js';

export const votesController = {
  async upsert(request: FastifyRequest<any>, reply: FastifyReply) {
    const { topic_id, score } = request.body as any;
    
    const vote = await votesService.upsert(request.user.id, topic_id, score);

    const peerUrl = process.env.REPLICATION_PEER_URL;
    if (peerUrl) {
      console.log(`[Distributed Systems] Replicando voto do usuário ${request.user.email} para ${peerUrl}`);
      
      fetch(`${peerUrl}/votes/replicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: request.user.email,
          topic_id,
          score,
        }),
      }).catch(err => {
        console.error(`[Distributed Systems] Erro na replicação para ${peerUrl}:`, err.message);
      });
    }

    return vote;
  },

  async replicate(request: FastifyRequest<any>, reply: FastifyReply) {
    const { user_email, topic_id, score } = request.body as any;
    console.log(`[Distributed Systems] Recebido voto replicado: ${user_email} -> Tópico ${topic_id} (Nota ${score})`);
    
    await votesService.replicate(user_email, topic_id, score);
    
    return { replicated: true };
  },

  async getMyVotes(request: FastifyRequest<any>, reply: FastifyReply) {
    return votesService.getMyVotes(request.user.id);
  }
};
