/**
 * Supabase连接器
 * 提供与Supabase数据库和Auth连接的健壮方案
 */

import pg from 'pg';
const { Pool } = pg;
type PoolClient = pg.PoolClient;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('VITE_SUPABASE_URL或VITE_SUPABASE_ANON_KEY环境变量未设置');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// 连接重试配置
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;
const CONNECTION_TIMEOUT_MS = 5000;

// 连接状态
let isConnected = false;
let isConnecting = false;
let connectionError: Error | null = null;

// 创建PostgreSQL连接池
const createPool = () => {
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error('SUPABASE_DB_URL环境变量未设置，请确保提供Supabase数据库连接URL');
  }

  return new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
};

// 连接池实例
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// 获取数据库连接
export const getSupabaseDb = async () => {
  if (db) return db;
  
  if (isConnecting) {
    // 如果正在连接，等待连接完成
    let retries = 0;
    while (isConnecting && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
    if (db) return db;
  }

  if (connectionError) {
    throw connectionError;
  }

  isConnecting = true;
  
  try {
    pool = createPool();
    
    // 测试连接
    const client = await pool.connect();
    client.release();
    
    db = drizzle(pool, { schema });
    isConnected = true;
    connectionError = null;
    
    console.log('成功连接到Supabase PostgreSQL数据库');
    return db;
  } catch (error) {
    connectionError = error instanceof Error 
      ? error 
      : new Error('未知数据库连接错误');
    console.error('Supabase连接失败:', connectionError);
    throw connectionError;
  } finally {
    isConnecting = false;
  }
};

// 执行数据库查询并处理连接错误
export const executeWithRetry = async <T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> => {
  if (!pool) {
    try {
      await getSupabaseDb();
    } catch (error) {
      console.error('无法建立Supabase连接', error);
      throw error;
    }
  }

  if (!pool) {
    throw new Error('数据库连接池未初始化');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    const client = await pool.connect();
    
    try {
      return await operation(client);
    } catch (error) {
      lastError = error instanceof Error 
        ? error 
        : new Error('未知数据库操作错误');
      
      console.error(`查询执行失败 (尝试 ${attempt}/${RETRY_COUNT}):`, lastError);
      
      // 如果是连接错误，尝试重新连接
      if (lastError.message.includes('ECONNREFUSED') || 
          lastError.message.includes('ENOTFOUND') || 
          lastError.message.includes('connection')) {
        isConnected = false;
        
        // 最后一次尝试之前重新初始化连接池
        if (attempt === RETRY_COUNT) {
          try {
            if (pool) {
              await pool.end();
              pool = null;
              db = null;
            }
            await getSupabaseDb();
          } catch (reconnectError) {
            console.error('重新连接失败:', reconnectError);
          }
        }
      }
      
      if (attempt < RETRY_COUNT) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    } finally {
      client.release();
    }
  }
  
  throw lastError || new Error('所有数据库操作尝试都失败了');
};

// 关闭数据库连接
export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
    isConnected = false;
  }
};

// 检查连接状态
export const checkConnection = async (): Promise<boolean> => {
  try {
    if (!pool) {
      await getSupabaseDb();
    }
    
    if (!pool) {
      return false; // 如果仍然没有连接池，返回失败
    }
    
    // 简单的检查查询
    await executeWithRetry(async (client) => {
      const result = await client.query('SELECT NOW()');
      return result.rows[0];
    });
    
    return true;
  } catch (error) {
    console.error('Supabase连接检查失败:', error);
    return false;
  }
};