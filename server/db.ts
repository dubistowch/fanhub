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

// 获取原始URL
let connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

// 检查并修复URL格式 - 处理密码中可能存在的@符号
if (connectionString.includes('@@')) {
  try {
    const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@?@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [_, username, password, host, port, database] = match;
      // 移除密码中可能存在的@符号或编码它
      const cleanPassword = password.replace(/@/g, '%40');
      
      connectionString = `postgresql://${username}:${cleanPassword}@${host}:${port}/${database}`;
      console.log("数据库连接: 已修复URL中的双@符号问题");
    }
  } catch (err) {
    console.error("尝试修复URL格式失败:", err);
  }
}

console.log("数据库连接: 使用URL", connectionString.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3'));

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
