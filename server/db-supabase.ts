import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL must be set. Did you forget to provide Supabase database connection?');
}

// 创建一个PostgreSQL连接池连接到Supabase
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 连接在被移除前可以空闲的毫秒数
  connectionTimeoutMillis: 2000, // 建立连接的超时时间
});

// 当连接被创建时记录日志
pool.on('connect', () => {
  console.log('PostgreSQL connection created');
});

// 当连接发生错误时记录日志
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// 测试连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Supabase PostgreSQL:', err);
  } else {
    console.log('Successfully connected to Supabase PostgreSQL, current time:', res.rows[0].now);
  }
});

// 创建drizzle实例
export const db = drizzle(pool, { schema });