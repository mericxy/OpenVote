import { FastifyReply, FastifyRequest } from 'fastify';
import { votesService } from '../services/votes.service.js';

export const votesController = {
  async upsert(request: FastifyRequest<any>, reply: FastifyReply) {
    const { topic_id, score } = request.body as any;
    
    const vote = await votesService.upsert(request.user.id, topic_id, score);

    const peerUrl = process.env.REPLICATION_PEER_URL;
    if (peerUrl) {
      console.log(`[Distributed Systems] Replicando voto de ${request.user.email} para ${peerUrl}/votes/replicate`);
      
      fetch(`${peerUrl}/votes/replicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: request.user.email,
          topic_id,
          score,
        }),
      }).then(async res => {
        if (res.ok) {
           console.log(`[Distributed Systems] ✅ Sucesso: Replicação confirmada por ${peerUrl}`);
        } else {
           const body = await res.text().catch(() => '');
           console.error(`[Distributed Systems] ❌ Erro: ${peerUrl} retornou Status ${res.status}. Resposta: ${body}`);
        }
      }).catch(err => {
        console.error(`[Distributed Systems] ❌ Erro na replicação para ${peerUrl}:`, err.message);
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
