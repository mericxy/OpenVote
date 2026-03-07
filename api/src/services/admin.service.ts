import { db } from '../db/index.js';
import { users, votes } from '../db/schema.js';
import { sql, desc } from 'drizzle-orm';

export const adminService = {
  async getUserStats() {
    const [stats] = await db
      .select({
        total_users: sql<number>`count(${users.id})`,
        total_votes: sql<number>`(select count(*) from ${votes})`,
        latest_registration: sql<string>`max(${users.created_at})`,
      })
      .from(users)
      .all();
    
    return stats;
  },

  async listUsers() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        vote_count: sql<number>`(select count(*) from ${votes} where user_id = ${users.id})`,
      })
      .from(users)
      .orderBy(desc(users.created_at))
      .all();
  }
};
