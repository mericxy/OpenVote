import { db } from '../db/index.js';
import { topics, votes } from '../db/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import { httpErrors } from '@fastify/sensible';

export const topicsService = {
  async list(userId: number) {
    const results = await db
      .select({
        id: topics.id,
        title: topics.title,
        description: topics.description,
        average_score: sql<number>`round(avg(${votes.score}), 1)`,
        vote_count: sql<number>`count(${votes.id})`,
        user_vote: sql<number>`(select score from ${votes} where topic_id = ${topics.id} and user_id = ${userId})`,
      })
      .from(topics)
      .leftJoin(votes, eq(topics.id, votes.topic_id))
      .groupBy(topics.id)
      .all();
    
    return results;
  },

  async getById(id: number, userId: number) {
    const topic = await db
      .select({
        id: topics.id,
        title: topics.title,
        description: topics.description,
        average_score: sql<number>`round(avg(${votes.score}), 1)`,
        vote_count: sql<number>`count(${votes.id})`,
        user_vote: sql<number>`(select score from ${votes} where topic_id = ${topics.id} and user_id = ${userId})`,
      })
      .from(topics)
      .where(eq(topics.id, id))
      .leftJoin(votes, eq(topics.id, votes.topic_id))
      .groupBy(topics.id)
      .get();
    
    if (!topic) throw httpErrors.notFound('Topic not found');
    return topic;
  },

  async create(data: { title: string; description: string; created_by: number }) {
    const now = new Date().toISOString();
    const [topic] = await db.insert(topics).values({
      ...data,
      created_at: now,
      updated_at: now,
    }).returning();
    return topic;
  },

  async update(id: number, data: { title?: string; description?: string }) {
    const [topic] = await db.update(topics)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(topics.id, id))
      .returning();
    
    if (!topic) throw httpErrors.notFound('Topic not found');
    return topic;
  },

  async delete(id: number) {
    const result = await db.delete(topics).where(eq(topics.id, id)).returning();
    if (result.length === 0) throw httpErrors.notFound('Topic not found');
  }
};
