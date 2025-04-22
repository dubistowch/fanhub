import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// 确保数据库连接URL已经设置
if (!process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL) {
  throw new Error(
    "数据库连接URL未设置。请确保SUPABASE_DB_URL或DATABASE_URL环境变量已设置。"
  );
}

// 优先使用SUPABASE_DB_URL，回退到DATABASE_URL
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

// 创建连接池
export const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// 初始化drizzle ORM
export const db = drizzle(pool, { schema });

// 监听连接错误事件
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
  // 这里可以添加重试逻辑或者其他错误处理
});
