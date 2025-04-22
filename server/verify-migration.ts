/**
 * 验证Supabase数据库迁移
 * 该脚本检查Supabase数据库连接并验证数据结构
 */
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";
import { eq } from 'drizzle-orm';

const { Pool } = pg;
// 使用修复后的连接URL
const testPool = new Pool({ 
  connectionString: process.env.FIXED_SUPABASE_DB_URL || 
                    "postgresql://postgres.gdnmmwhgpxoiitcxegmh:egkpcDBZyUvo32Qz@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("正在验证Supabase数据库连接...");
    
    // 测试基本连接
    const client = await testPool.connect();
    console.log("✅ 成功连接到数据库");
    
    // 检查表是否存在
    const tables = [
      "users", 
      "providers", 
      "creators", 
      "follows", 
      "checkins", 
      "checkin_stats"
    ];
    
    console.log("\n检查数据库表结构:");
    
    for(const table of tables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );
        `);
        
        const exists = result.rows[0].exists;
        console.log(`${exists ? '✅' : '❌'} 表 "${table}" ${exists ? '存在' : '不存在'}`);
        
        if(exists) {
          // 检查表中的记录数量
          const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
          const count = parseInt(countResult.rows[0].count);
          console.log(`   - 包含 ${count} 条记录`);
        }
      } catch (error: any) {
        console.error(`   ❌ 检查表 "${table}" 时出错:`, error.message);
      }
    }
    
    // 释放连接
    client.release();
    
    console.log("\n数据库验证完成");
    
  } catch (error: any) {
    console.error("❌ 数据库验证失败:", error);
  } finally {
    // 关闭池连接
    await testPool.end();
  }
}

main();