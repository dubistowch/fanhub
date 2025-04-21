/**
 * 这个脚本用于修复Supabase数据库URL并测试连接
 */

import pg from 'pg';
const { Pool } = pg;

async function main() {
  // 获取原始URL
  const originalUrl = process.env.SUPABASE_DB_URL;
  if (!originalUrl) {
    console.error('错误: SUPABASE_DB_URL环境变量未设置');
    process.exit(1);
  }

  console.log('原始数据库URL: ', maskPassword(originalUrl));

  // 修复URL格式 - 密码中可能存在@符号，需要正确处理
  // 我们需要从URL的基本组件中重建它
  let fixedUrl;
  try {
    const match = originalUrl.match(/postgresql:\/\/([^:]+):([^@]+)@?@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('无法解析数据库URL格式');
    }
    
    const [_, username, password, host, port, database] = match;
    // 移除密码中可能存在的@符号或编码它
    const cleanPassword = password.replace(/@/g, '%40');
    
    fixedUrl = `postgresql://${username}:${cleanPassword}@${host}:${port}/${database}`;
    console.log('已从组件重建URL');
  } catch (error) {
    console.error('URL解析失败，尝试使用备用方法');
    // 备用方法：尝试简单替换第二个@符号
    fixedUrl = originalUrl.replace(/(.+?):(.+?)@(.+?)@(.+)/, '$1:$2@$4');
  }
  console.log('修复后的数据库URL: ', maskPassword(fixedUrl));

  // 设置环境变量
  process.env.FIXED_SUPABASE_DB_URL = fixedUrl;

  // 尝试连接到数据库
  console.log('尝试连接到Supabase数据库...');
  
  try {
    const pool = new Pool({
      connectionString: fixedUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000, // 5秒超时
    });

    // 测试连接
    const client = await pool.connect();
    console.log('成功连接到Supabase数据库!');
    
    // 执行简单查询
    const result = await client.query('SELECT NOW() as current_time');
    console.log('服务器时间:', result.rows[0].current_time);
    
    // 释放客户端连接
    client.release();
    
    // 关闭连接池
    await pool.end();
    
    console.log('连接测试成功，可以使用修复后的URL');
    console.log('请将以下环境变量添加到项目中:');
    console.log(`SUPABASE_DB_URL="${fixedUrl}"`);
    
    return fixedUrl;
  } catch (error) {
    console.error('连接失败:', error);
    throw error;
  }
}

// 用于在日志中隐藏密码的辅助函数
function maskPassword(url: string): string {
  return url.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
}

// 执行主函数
main()
  .then(fixedUrl => {
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });