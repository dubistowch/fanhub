/**
 * 验证Supabase数据库迁移
 * 该脚本检查Supabase数据库连接并验证数据结构
 */
import { pool, db } from './db.js';
import * as schema from "../shared/schema.js";
import { eq } from 'drizzle-orm';

async function main() {
  try {
    console.log("正在验证Supabase数据库连接...");
    
    // 测试基本连接
    const client = await pool.connect();
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
      } catch (error) {
        console.error(`   ❌ 检查表 "${table}" 时出错:`, error.message);
      }
    }
    
    // 释放连接
    client.release();
    
    console.log("\n数据库验证完成");
    
  } catch (error) {
    console.error("❌ 数据库验证失败:", error);
  } finally {
    // 关闭池连接
    await pool.end();
  }
}

main();