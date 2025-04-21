/**
 * Replit PostgreSQL到Supabase的数据迁移工具
 * 该脚本将Replit中的PostgreSQL数据迁移到Supabase
 */

import { Pool } from 'pg';
import * as schema from '@shared/schema';
import { User, Provider, Creator, Follow, Checkin, CheckinStat } from '@shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

// 数据库连接配置
const SOURCE_DB_URL = process.env.DATABASE_URL;
const TARGET_DB_URL = process.env.SUPABASE_DB_URL;

if (!SOURCE_DB_URL) {
  console.error('错误: DATABASE_URL环境变量未设置');
  process.exit(1);
}

if (!TARGET_DB_URL) {
  console.error('错误: SUPABASE_DB_URL环境变量未设置');
  process.exit(1);
}

interface MigrationStats {
  users: number;
  providers: number;
  creators: number;
  follows: number;
  checkins: number;
  checkinStats: number;
}

async function main() {
  console.log('====== FanHub 数据迁移工具 ======');
  console.log('从Replit PostgreSQL迁移到Supabase\n');

  // 创建源数据库连接
  console.log('连接源数据库...');
  const sourcePool = new Pool({
    connectionString: SOURCE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  // 创建目标数据库连接
  console.log('连接目标数据库...');
  const targetPool = new Pool({
    connectionString: TARGET_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  // 创建Drizzle实例
  const sourceDb = drizzle(sourcePool, { schema });
  const targetDb = drizzle(targetPool, { schema });

  try {
    // 测试连接
    await sourcePool.query('SELECT NOW()');
    console.log('✅ 源数据库连接成功');
    
    await targetPool.query('SELECT NOW()');
    console.log('✅ 目标数据库连接成功');

    // 开始迁移数据
    console.log('\n开始迁移数据...');
    
    const stats: MigrationStats = {
      users: 0,
      providers: 0,
      creators: 0,
      follows: 0,
      checkins: 0,
      checkinStats: 0,
    };

    // 迁移用户数据
    console.log('\n迁移用户数据...');
    const users = await sourceDb.select().from(schema.users);
    console.log(`找到 ${users.length} 个用户`);
    
    if (users.length > 0) {
      // 检查目标数据库中是否已有用户
      const existingUsers = await targetDb.select().from(schema.users);
      
      if (existingUsers.length > 0) {
        console.log(`目标数据库中已存在 ${existingUsers.length} 个用户，跳过用户迁移`);
      } else {
        for (const user of users) {
          try {
            await targetDb.insert(schema.users).values(user);
            stats.users++;
          } catch (error) {
            console.error(`迁移用户 ${user.id} (${user.username}) 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.users}/${users.length} 个用户`);
      }
    }
    
    // 迁移提供商数据
    console.log('\n迁移提供商数据...');
    const providers = await sourceDb.select().from(schema.providers);
    console.log(`找到 ${providers.length} 个提供商`);
    
    if (providers.length > 0) {
      const existingProviders = await targetDb.select().from(schema.providers);
      
      if (existingProviders.length > 0) {
        console.log(`目标数据库中已存在 ${existingProviders.length} 个提供商，跳过提供商迁移`);
      } else {
        for (const provider of providers) {
          try {
            await targetDb.insert(schema.providers).values(provider);
            stats.providers++;
          } catch (error) {
            console.error(`迁移提供商 ${provider.id} 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.providers}/${providers.length} 个提供商`);
      }
    }

    // 迁移创作者数据
    console.log('\n迁移创作者数据...');
    const creators = await sourceDb.select().from(schema.creators);
    console.log(`找到 ${creators.length} 个创作者`);
    
    if (creators.length > 0) {
      const existingCreators = await targetDb.select().from(schema.creators);
      
      if (existingCreators.length > 0) {
        console.log(`目标数据库中已存在 ${existingCreators.length} 个创作者，跳过创作者迁移`);
      } else {
        for (const creator of creators) {
          try {
            await targetDb.insert(schema.creators).values(creator);
            stats.creators++;
          } catch (error) {
            console.error(`迁移创作者 ${creator.id} (${creator.name}) 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.creators}/${creators.length} 个创作者`);
      }
    }

    // 迁移关注数据
    console.log('\n迁移关注数据...');
    const follows = await sourceDb.select().from(schema.follows);
    console.log(`找到 ${follows.length} 个关注`);
    
    if (follows.length > 0) {
      const existingFollows = await targetDb.select().from(schema.follows);
      
      if (existingFollows.length > 0) {
        console.log(`目标数据库中已存在 ${existingFollows.length} 个关注，跳过关注迁移`);
      } else {
        for (const follow of follows) {
          try {
            await targetDb.insert(schema.follows).values(follow);
            stats.follows++;
          } catch (error) {
            console.error(`迁移关注 ${follow.id} 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.follows}/${follows.length} 个关注`);
      }
    }

    // 迁移签到数据
    console.log('\n迁移签到数据...');
    const checkins = await sourceDb.select().from(schema.checkins);
    console.log(`找到 ${checkins.length} 个签到`);
    
    if (checkins.length > 0) {
      const existingCheckins = await targetDb.select().from(schema.checkins);
      
      if (existingCheckins.length > 0) {
        console.log(`目标数据库中已存在 ${existingCheckins.length} 个签到，跳过签到迁移`);
      } else {
        for (const checkin of checkins) {
          try {
            await targetDb.insert(schema.checkins).values(checkin);
            stats.checkins++;
          } catch (error) {
            console.error(`迁移签到 ${checkin.id} 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.checkins}/${checkins.length} 个签到`);
      }
    }

    // 迁移签到统计数据
    console.log('\n迁移签到统计数据...');
    const checkinStats = await sourceDb.select().from(schema.checkinStats);
    console.log(`找到 ${checkinStats.length} 个签到统计记录`);
    
    if (checkinStats.length > 0) {
      const existingCheckinStats = await targetDb.select().from(schema.checkinStats);
      
      if (existingCheckinStats.length > 0) {
        console.log(`目标数据库中已存在 ${existingCheckinStats.length} 个签到统计记录，跳过签到统计迁移`);
      } else {
        for (const stat of checkinStats) {
          try {
            await targetDb.insert(schema.checkinStats).values(stat);
            stats.checkinStats++;
          } catch (error) {
            console.error(`迁移签到统计 ${stat.id} 失败:`, error);
          }
        }
        console.log(`✅ 成功迁移了 ${stats.checkinStats}/${checkinStats.length} 个签到统计记录`);
      }
    }

    // 输出迁移统计
    console.log('\n====== 迁移完成 ======');
    console.log('迁移统计:');
    console.log(`- 用户: ${stats.users}/${users.length}`);
    console.log(`- 提供商: ${stats.providers}/${providers.length}`);
    console.log(`- 创作者: ${stats.creators}/${creators.length}`);
    console.log(`- 关注: ${stats.follows}/${follows.length}`);
    console.log(`- 签到: ${stats.checkins}/${checkins.length}`);
    console.log(`- 签到统计: ${stats.checkinStats}/${checkinStats.length}`);
    
    // 验证数据
    console.log('\n执行数据验证...');
    
    const targetUsers = await targetDb.select().from(schema.users);
    const targetProviders = await targetDb.select().from(schema.providers);
    const targetCreators = await targetDb.select().from(schema.creators);
    const targetFollows = await targetDb.select().from(schema.follows);
    const targetCheckins = await targetDb.select().from(schema.checkins);
    const targetCheckinStats = await targetDb.select().from(schema.checkinStats);
    
    console.log('目标数据库中的记录数:');
    console.log(`- 用户: ${targetUsers.length}`);
    console.log(`- 提供商: ${targetProviders.length}`);
    console.log(`- 创作者: ${targetCreators.length}`);
    console.log(`- 关注: ${targetFollows.length}`);
    console.log(`- 签到: ${targetCheckins.length}`);
    console.log(`- 签到统计: ${targetCheckinStats.length}`);
    
    console.log('\n✅ 数据迁移和验证完成');
    console.log('使用switch-to-supabase.sh脚本切换到Supabase');
  } catch (error) {
    console.error('迁移过程中出错:', error);
  } finally {
    // 关闭数据库连接
    await sourcePool.end();
    await targetPool.end();
    console.log('\n数据库连接已关闭');
  }
}

// 执行主函数
main().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});