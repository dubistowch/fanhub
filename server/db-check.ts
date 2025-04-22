/**
 * 数据库连接检查工具
 * 用于验证和确保数据库连接的可靠性
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// 测试数据库连接并打印状态
async function checkDatabaseConnection() {
  console.log("开始检查数据库连接...");
  
  // 首先尝试标准URL
  let connectionUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error("错误: 未找到数据库连接URL。请设置SUPABASE_DB_URL或DATABASE_URL环境变量。");
    process.exit(1);
  }
  
  console.log("使用连接URL:", maskPassword(connectionUrl));
  
  // 尝试连接
  try {
    const pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000, // 5秒超时
    });
    
    // 测试连接
    const client = await pool.connect();
    console.log("✅ 成功连接到数据库!");
    
    // 执行简单查询
    const result = await client.query('SELECT NOW() as current_time');
    console.log("服务器时间:", result.rows[0].current_time);
    
    // 检查表是否存在
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\n数据库中的表:");
    for (const row of tablesQuery.rows) {
      console.log(`- ${row.table_name}`);
    }
    
    // 释放客户端连接
    client.release();
    
    // 关闭连接池
    await pool.end();
    
    console.log("\n数据库连接测试成功!");
  } catch (error: any) {
    console.error("❌ 数据库连接失败:", error.message);
    
    if (error.message.includes("SASL") || error.message.includes("authentication")) {
      console.log("\n尝试修复连接URL...");
      
      // 从URL中提取组件并重建URL
      try {
        const match = connectionUrl.match(/postgresql:\/\/([^:]+):([^@]+)@?@([^:]+):(\d+)\/(.+)/);
        if (!match) {
          throw new Error("无法解析数据库URL格式");
        }
        
        const [_, username, password, host, port, database] = match;
        // 移除密码中可能存在的@符号或编码它
        const cleanPassword = password.replace(/@/g, '%40');
        
        const fixedUrl = `postgresql://${username}:${cleanPassword}@${host}:${port}/${database}`;
        console.log("已生成修复后的URL:", maskPassword(fixedUrl));
        
        console.log("尝试使用修复后的URL连接...");
        
        // 使用修复后的URL重新连接
        const pool = new Pool({
          connectionString: fixedUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000, // 5秒超时
        });
        
        const client = await pool.connect();
        console.log("✅ 使用修复后的URL成功连接到数据库!");
        
        // 释放客户端连接
        client.release();
        
        // 关闭连接池
        await pool.end();
        
        console.log("\n请更新环境变量使用以下URL:");
        console.log(`SUPABASE_DB_URL="${fixedUrl}"`);
        
        // 更新环境变量以供当前进程使用
        process.env.SUPABASE_DB_URL = fixedUrl;
      } catch (err: any) {
        console.error("尝试修复URL失败:", err.message);
      }
    }
  }
}

// 用于在日志中隐藏密码的辅助函数
function maskPassword(url: string): string {
  return url.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
}

// 执行检查
checkDatabaseConnection();