import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { httpErrors } from '@fastify/sensible';

export const authService = {
  async register(data: { name: string; email: string; password_hash: string }) {
    const existingResult = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingResult.length > 0) throw httpErrors.conflict('Email already exists');

    const [result] = await db.insert(users).values({
      ...data,
      role: 'user',
    });
    
    const [user] = await db.select().from(users).where(eq(users.id, result.insertId)).limit(1);
    return {
      ...user,
      created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
    };
  },

  async login(data: { email: string; password_plain: string }) {
    const result = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    const user = result[0];
    if (!user) throw httpErrors.unauthorized('Invalid credentials');

    const matches = await bcrypt.compare(data.password_plain, user.password_hash);
    if (!matches) throw httpErrors.unauthorized('Invalid credentials');

    return {
      ...user,
      created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
    };
  },
};
