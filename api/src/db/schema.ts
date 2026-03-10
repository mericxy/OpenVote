import { mysqlTable, varchar, int, mysqlEnum, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['user', 'admin']).notNull().default('user'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const topics = mysqlTable('topics', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  created_by: int('created_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const votes = mysqlTable('votes', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id),
  topic_id: int('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  score: int('score').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  userTopicUnique: uniqueIndex('user_topic_unique').on(table.user_id, table.topic_id),
}));
