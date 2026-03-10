import { db } from '../src/db/index.js';
import { users, topics, votes } from '../src/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const [adminInsert] = await db.insert(users).values({
    name: 'Admin',
    email: 'admin@openvote.com',
    password_hash: adminPassword,
    role: 'admin',
  });
  
  const [admin] = await db.select().from(users).where(eq(users.id, adminInsert.insertId)).limit(1);

  // 2. Users
  const userPassword = await bcrypt.hash('user123', 10);
  const [user1Insert] = await db.insert(users).values({
    name: 'João Silva',
    email: 'joao@email.com',
    password_hash: userPassword,
    role: 'user',
  });
  const [user1] = await db.select().from(users).where(eq(users.id, user1Insert.insertId)).limit(1);

  const [user2Insert] = await db.insert(users).values({
    name: 'Maria Souza',
    email: 'maria@email.com',
    password_hash: userPassword,
    role: 'user',
  });
  const [user2] = await db.select().from(users).where(eq(users.id, user2Insert.insertId)).limit(1);

  // 3. Topics
  const [topic1Insert] = await db.insert(topics).values({
    title: 'Framework Frontend Favorito',
    description: 'Qual framework você prefere usar em 2026?',
    created_by: admin.id,
  });
  const [topic1] = await db.select().from(topics).where(eq(topics.id, topic1Insert.insertId)).limit(1);

  const [topic2Insert] = await db.insert(topics).values({
    title: 'Melhor Linguagem para Backend',
    description: 'Node.js, Rust, Go ou Python?',
    created_by: admin.id,
  });
  const [topic2] = await db.select().from(topics).where(eq(topics.id, topic2Insert.insertId)).limit(1);

  // 4. Votes
  await db.insert(votes).values([
    { user_id: user1.id, topic_id: topic1.id, score: 5 },
    { user_id: user2.id, topic_id: topic1.id, score: 4 },
    { user_id: user1.id, topic_id: topic2.id, score: 3 },
  ]);

  console.log('✅ Seed finished!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
