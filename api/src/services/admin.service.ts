import { db } from '../db/index.js';
import { users, votes } from '../db/schema.js';
import { sql, desc } from 'drizzle-orm';

export const adminService = {
  async getUserStats() {
    const results = await db
      .select({
        total_users: sql<number>`CAST(count(${users.id}) AS SIGNED)`,
        total_votes: sql<number>`(SELECT CAST(count(*) AS SIGNED) FROM ${votes})`,
        latest_registration: sql<any>`MAX(${users.created_at})`,
      })
      .from(users);
    
    const stats = results[0];
    
    let latest = stats?.latest_registration;
    if (latest instanceof Date) {
      latest = latest.toISOString();
    }
    
    return {
      total_users: Number(stats?.total_users || 0),
      total_votes: Number(stats?.total_votes || 0),
      latest_registration: latest || null,
    };
  },

  async listUsers() {
    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        vote_count: sql<number>`(SELECT CAST(count(*) AS SIGNED) FROM ${votes} WHERE user_id = ${users.id})`,
      })
      .from(users)
      .orderBy(desc(users.created_at));
    
    return results.map(user => ({
      ...user,
      created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
      vote_count: Number(user.vote_count || 0)
    }));
  }
};
