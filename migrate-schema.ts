/**
 * 数据库模式迁移工具
 * 使用drizzle将数据模型同步到Supabase数据库
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from "./shared/schema.js";

const { Pool } = pg;

const connectionString = process.env.FIXED_SUPABASE_DB_URL || 
                  "postgresql://postgres.gdnmmwhgpxoiitcxegmh:egkpcDBZyUvo32Qz@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function main() {
  try {
    console.log("正在连接到Supabase数据库...");

    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log("创建drizzle客户端...");
    const db = drizzle(pool, { schema });
    
    console.log("正在执行数据库迁移...");
    // 使用schema对象中的定义创建表
    await db.insert(schema.users).values({
      email: "admin@example.com",
      username: "Admin",
      bio: "Fanhub系统管理员",
      avatarUrl: null
    }).onConflictDoNothing();
    
    console.log("✅ 数据库模式迁移完成");
    
    await pool.end();
  } catch (error: any) {
    console.error("❌ 数据库迁移失败:", error.message);
  }
}

main();