import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL must be set. Did you forget to provide Supabase database connection?');
}

// 创建一个PostgreSQL客户端连接到Supabase
const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// 初始化连接
async function initializeClient() {
  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL');
  } catch (error) {
    console.error('Failed to connect to Supabase PostgreSQL:', error);
    throw error;
  }
}

// 初始化数据库连接
initializeClient().catch(console.error);

// 创建drizzle实例
export const db = drizzle(client, { schema });