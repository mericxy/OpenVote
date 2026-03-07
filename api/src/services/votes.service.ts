import { db } from '../db/index.js';
import { votes, topics } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { httpErrors } from '@fastify/sensible';

export const votesService = {
  async upsert(userId: number, topicId: number, score: number) {
    const topic = await db.select().from(topics).where(eq(topics.id, topicId)).get();
    if (!topic) throw httpErrors.notFound('Topic not found');

    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.user_id, userId), eq(votes.topic_id, topicId)))
      .get();

    const now = new Date().toISOString();

    if (existing) {
      const [updated] = await db
        .update(votes)
        .set({ score, updated_at: now })
        .where(eq(votes.id, existing.id))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(votes)
      .values({
        user_id: userId,
        topic_id: topicId,
        score,
        created_at: now,
        updated_at: now,
      })
      .returning();
    
    return inserted;
  },

  async getMyVotes(userId: number) {
    return db
      .select({
        topic_id: votes.topic_id,
        topic_title: topics.title,
        score: votes.score,
        updated_at: votes.updated_at,
      })
      .from(votes)
      .innerJoin(topics, eq(votes.topic_id, topics.id))
      .where(eq(votes.user_id, userId))
      .all();
  }
};
