import { Pool } from '@neondatabase/serverless';
import * as schema from "@shared/schema";
import { Pool as PgPool } from 'pg';
import { drizzle } from 'drizzle-orm/neon-serverless';

console.log("開始遷移數據到Supabase...");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 必須設置。 (Replit PostgreSQL)");
}

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL 必須設置。 (Supabase PostgreSQL)");
}

// 設置來源數據庫（Replit）
const sourcePool = new Pool({ connectionString: process.env.DATABASE_URL });
const sourceDb = drizzle({ client: sourcePool, schema });

// 設置目標數據庫（Supabase）
const targetClient = new PgPool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
console.log("正在連接到Supabase數據庫...");

const migrate = async () => {
  try {
    // 不需要显式连接PgPool
    // const targetDb = drizzle({ client: targetClient, schema }); // 不使用Drizzle ORM操作目標數據庫
    
    console.log("已連接到Supabase數據庫。");
    console.log("創建數據庫表...");

    // 創建Supabase表格
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        provider TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_username TEXT,
        provider_avatar TEXT,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        name TEXT NOT NULL,
        bio TEXT,
        cover_image TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        creator_id INTEGER NOT NULL REFERENCES creators(id),
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        creator_id INTEGER NOT NULL REFERENCES creators(id),
        date TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS checkin_stats (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES creators(id),
        date DATE NOT NULL,
        count INTEGER NOT NULL DEFAULT 0
      );
    `);

    console.log("數據庫表已創建。");
    console.log("開始遷移數據...");

    // 遷移用戶數據
    console.log("遷移用戶數據...");
    const users = await sourceDb.query.users.findMany();
    for (const user of users) {
      try {
        await targetClient.query(
          `INSERT INTO users (id, email, username, avatar_url, bio, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
           email = $2, username = $3, avatar_url = $4, bio = $5, created_at = $6
          `,
          [user.id, user.email, user.username, user.avatarUrl, user.bio, user.createdAt]
        );
        console.log(`  用戶已遷移: ${user.username} (ID: ${user.id})`);
      } catch (error) {
        console.error(`  無法遷移用戶 ${user.id}:`, error);
      }
    }

    // 遷移提供商數據
    console.log("遷移提供商數據...");
    const providers = await sourceDb.query.providers.findMany();
    for (const provider of providers) {
      try {
        await targetClient.query(
          `INSERT INTO providers (id, user_id, provider, provider_id, provider_username, provider_avatar, access_token, refresh_token, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
           user_id = $2, provider = $3, provider_id = $4, provider_username = $5, provider_avatar = $6, 
           access_token = $7, refresh_token = $8, created_at = $9
          `,
          [
            provider.id, provider.userId, provider.provider, provider.providerId,
            provider.providerUsername, provider.providerAvatar, provider.accessToken, 
            provider.refreshToken, provider.createdAt
          ]
        );
        console.log(`  提供商已遷移: ${provider.provider} (ID: ${provider.id})`);
      } catch (error) {
        console.error(`  無法遷移提供商 ${provider.id}:`, error);
      }
    }

    // 遷移創作者數據
    console.log("遷移創作者數據...");
    const creators = await sourceDb.query.creators.findMany();
    for (const creator of creators) {
      try {
        await targetClient.query(
          `INSERT INTO creators (id, user_id, name, bio, cover_image, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
           user_id = $2, name = $3, bio = $4, cover_image = $5, created_at = $6
          `,
          [creator.id, creator.userId, creator.name, creator.bio, creator.coverImage, creator.createdAt]
        );
        console.log(`  創作者已遷移: ${creator.name} (ID: ${creator.id})`);
      } catch (error) {
        console.error(`  無法遷移創作者 ${creator.id}:`, error);
      }
    }

    // 遷移關注數據
    console.log("遷移關注數據...");
    const follows = await sourceDb.query.follows.findMany();
    for (const follow of follows) {
      try {
        await targetClient.query(
          `INSERT INTO follows (id, user_id, creator_id, created_at) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
           user_id = $2, creator_id = $3, created_at = $4
          `,
          [follow.id, follow.userId, follow.creatorId, follow.createdAt]
        );
        console.log(`  關注已遷移: User ${follow.userId} -> Creator ${follow.creatorId} (ID: ${follow.id})`);
      } catch (error) {
        console.error(`  無法遷移關注 ${follow.id}:`, error);
      }
    }

    // 遷移簽到數據
    console.log("遷移簽到數據...");
    const checkins = await sourceDb.query.checkins.findMany();
    for (const checkin of checkins) {
      try {
        await targetClient.query(
          `INSERT INTO checkins (id, user_id, creator_id, date) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
           user_id = $2, creator_id = $3, date = $4
          `,
          [checkin.id, checkin.userId, checkin.creatorId, checkin.date]
        );
        console.log(`  簽到已遷移: User ${checkin.userId} -> Creator ${checkin.creatorId} (ID: ${checkin.id})`);
      } catch (error) {
        console.error(`  無法遷移簽到 ${checkin.id}:`, error);
      }
    }

    // 遷移簽到統計數據
    console.log("遷移簽到統計數據...");
    const checkinStats = await sourceDb.query.checkinStats.findMany();
    for (const stat of checkinStats) {
      try {
        await targetClient.query(
          `INSERT INTO checkin_stats (id, creator_id, date, count) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
           creator_id = $2, date = $3, count = $4
          `,
          [stat.id, stat.creatorId, stat.date, stat.count]
        );
        console.log(`  簽到統計已遷移: Creator ${stat.creatorId}, Date ${stat.date} (ID: ${stat.id})`);
      } catch (error) {
        console.error(`  無法遷移簽到統計 ${stat.id}:`, error);
      }
    }

    console.log("數據遷移完成！");
    
    // 重設序列值
    console.log("重設ID序列...");
    const tables = ['users', 'providers', 'creators', 'follows', 'checkins', 'checkin_stats'];
    for (const table of tables) {
      try {
        await targetClient.query(`
          SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
                       (SELECT MAX(id) FROM ${table}), 
                       false);
        `);
        console.log(`  已重設 ${table} 的ID序列`);
      } catch (error) {
        console.error(`  無法重設 ${table} 的ID序列:`, error);
      }
    }

    console.log("遷移過程成功完成！");
  } catch (error) {
    console.error("遷移過程中發生錯誤:", error);
  } finally {
    await sourcePool.end();
    await targetClient.end();
  }
};

migrate();