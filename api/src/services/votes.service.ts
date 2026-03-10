import { db } from '../db/index.js';
import { votes, topics, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { httpErrors } from '@fastify/sensible';

export const votesService = {
  async upsert(userId: number, topicId: number, score: number) {
    const topicResult = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
    const topic = topicResult[0];
    if (!topic) throw httpErrors.notFound('Topic not found');

    const existingResult = await db
      .select()
      .from(votes)
      .where(and(eq(votes.user_id, userId), eq(votes.topic_id, topicId)))
      .limit(1);
    const existing = existingResult[0];

    if (existing) {
      await db
        .update(votes)
        .set({ score })
        .where(eq(votes.id, existing.id));
      
      const [updated] = await db.select().from(votes).where(eq(votes.id, existing.id)).limit(1);
      return {
        ...updated,
        updated_at: updated.updated_at ? updated.updated_at.toISOString() : new Date().toISOString()
      };
    }

    const [result] = await db
      .insert(votes)
      .values({
        user_id: userId,
        topic_id: topicId,
        score,
      });
    
    const [inserted] = await db.select().from(votes).where(eq(votes.id, result.insertId)).limit(1);
    return {
      ...inserted,
      updated_at: inserted.updated_at ? inserted.updated_at.toISOString() : new Date().toISOString()
    };
  },

  async getMyVotes(userId: number) {
    const results = await db
      .select({
        topic_id: votes.topic_id,
        topic_title: topics.title,
        score: votes.score,
        updated_at: votes.updated_at,
      })
      .from(votes)
      .innerJoin(topics, eq(votes.topic_id, topics.id))
      .where(eq(votes.user_id, userId));

    return results.map(v => ({
      ...v,
      updated_at: v.updated_at ? v.updated_at.toISOString() : new Date().toISOString()
    }));
  }
};
