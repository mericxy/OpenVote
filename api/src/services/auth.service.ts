import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { httpErrors } from '@fastify/sensible';

export const authService = {
  async register(data: { name: string; email: string; password_hash: string }) {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).get();
    if (existing) throw httpErrors.conflict('Email already exists');

    const [user] = await db.insert(users).values({
      ...data,
      role: 'user',
      created_at: new Date().toISOString(),
    }).returning();
    
    return user;
  },

  async login(data: { email: string; password_plain: string }) {
    const user = await db.select().from(users).where(eq(users.email, data.email)).get();
    if (!user) throw httpErrors.unauthorized('Invalid credentials');

    const matches = await bcrypt.compare(data.password_plain, user.password_hash);
    if (!matches) throw httpErrors.unauthorized('Invalid credentials');

    return user;
  },
};
