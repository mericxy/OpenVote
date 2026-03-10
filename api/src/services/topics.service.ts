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
        average_score: sql<number>`COALESCE(CAST(avg(${votes.score}) AS DOUBLE), 0)`,
        vote_count: sql<number>`CAST(count(${votes.id}) AS SIGNED)`,
        user_vote: sql<number>`(SELECT ${votes.score} FROM ${votes} WHERE ${votes.topic_id} = ${topics.id} AND ${votes.user_id} = ${userId} LIMIT 1)`,
      })
      .from(topics)
      .leftJoin(votes, eq(topics.id, votes.topic_id))
      .groupBy(topics.id, topics.title, topics.description);
    
    return results.map(topic => ({
      ...topic,
      average_score: topic.average_score ? Number(topic.average_score) : 0,
      vote_count: Number(topic.vote_count),
      user_vote: topic.user_vote ? Number(topic.user_vote) : null
    }));
  },

  async getById(id: number, userId: number) {
    const results = await db
      .select({
        id: topics.id,
        title: topics.title,
        description: topics.description,
        average_score: sql<number>`COALESCE(CAST(avg(${votes.score}) AS DOUBLE), 0)`,
        vote_count: sql<number>`CAST(count(${votes.id}) AS SIGNED)`,
        user_vote: sql<number>`(SELECT ${votes.score} FROM ${votes} WHERE ${votes.topic_id} = ${topics.id} AND ${votes.user_id} = ${userId} LIMIT 1)`,
      })
      .from(topics)
      .where(eq(topics.id, id))
      .leftJoin(votes, eq(topics.id, votes.topic_id))
      .groupBy(topics.id, topics.title, topics.description)
      .limit(1);
    
    const topic = results[0];
    if (!topic) throw httpErrors.notFound('Topic not found');
    
    return {
      ...topic,
      average_score: topic.average_score ? Number(topic.average_score) : 0,
      vote_count: Number(topic.vote_count),
      user_vote: topic.user_vote ? Number(topic.user_vote) : null
    };
  },

  async create(data: { title: string; description: string; created_by: number }) {
    const [result] = await db.insert(topics).values({
      ...data,
    });
    
    const [topic] = await db.select().from(topics).where(eq(topics.id, result.insertId)).limit(1);
    return {
      ...topic,
      created_at: topic.created_at ? topic.created_at.toISOString() : new Date().toISOString(),
      updated_at: topic.updated_at ? topic.updated_at.toISOString() : new Date().toISOString()
    };
  },

  async update(id: number, data: { title?: string; description?: string }) {
    await db.update(topics)
      .set({ ...data })
      .where(eq(topics.id, id));
    
    const [topic] = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
    if (!topic) throw httpErrors.notFound('Topic not found');
    return {
      ...topic,
      created_at: topic.created_at ? topic.created_at.toISOString() : new Date().toISOString(),
      updated_at: topic.updated_at ? topic.updated_at.toISOString() : new Date().toISOString()
    };
  },

  async delete(id: number) {
    const [result] = await db.delete(topics).where(eq(topics.id, id));
    if (result.affectedRows === 0) throw httpErrors.notFound('Topic not found');
  }
};
