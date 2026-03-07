import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let dbPath = process.env.DATABASE_URL || 'dev.db';

// Se o caminho começar com file:, remove (drizzle-kit às vezes injeta isso)
if (dbPath.startsWith('file:')) {
  dbPath = dbPath.replace('file:', '');
}

console.log('Final Database Path:', dbPath);

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
