import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  created_at: text('created_at').notNull().default(new Date().toISOString()),
});

export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  created_by: integer('created_by').notNull().references(() => users.id),
  created_at: text('created_at').notNull().default(new Date().toISOString()),
  updated_at: text('updated_at').notNull().default(new Date().toISOString()),
});

export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  topic_id: integer('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  created_at: text('created_at').notNull().default(new Date().toISOString()),
  updated_at: text('updated_at').notNull().default(new Date().toISOString()),
}, (table) => ({
  userTopicUnique: uniqueIndex('user_topic_unique').on(table.user_id, table.topic_id),
}));
