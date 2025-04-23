/**
 * 检查Supabase连接状态的工具
 * 用于验证Supabase URL和数据库连接是否正常
 */

// 导入必要的模块
import { supabase } from "./supabase-connection";
import { checkConnection } from "./supabase-connection";

async function main() {
  console.log("检查Supabase环境变量...");
  
  // 检查环境变量
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; 
  const supabaseDbUrl = process.env.SUPABASE_DB_URL;
  
  console.log("Supabase URL:", supabaseUrl ? "已设置" : "未设置");
  console.log("Supabase Anon Key:", supabaseAnonKey ? "已设置" : "未设置");
  console.log("Supabase DB URL:", supabaseDbUrl ? "已设置" : "未设置");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("错误: Supabase URL或Anon Key未设置，无法进行Supabase Auth验证");
    process.exit(1);
  }
  
  if (!supabaseDbUrl) {
    console.error("错误: SUPABASE_DB_URL未设置，无法连接Supabase数据库");
    process.exit(1);
  }
  
  // 测试Supabase Auth连接
  try {
    console.log("测试Supabase Auth连接...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Supabase Auth连接错误:", error.message);
    } else {
      console.log("Supabase Auth连接成功!");
    }
  } catch (error) {
    console.error("尝试连接Supabase Auth时发生异常:", error);
  }
  
  // 测试Supabase数据库连接
  try {
    console.log("测试Supabase数据库连接...");
    const isConnected = await checkConnection();
    
    if (isConnected) {
      console.log("Supabase数据库连接成功!");
    } else {
      console.error("Supabase数据库连接失败!");
      
      // 解析连接URL以便调试
      try {
        const url = new URL(supabaseDbUrl);
        console.log("数据库连接信息:");
        console.log("- 协议:", url.protocol);
        console.log("- 主机:", url.hostname);
        console.log("- 端口:", url.port);
        console.log("- 路径:", url.pathname);
        console.log("- 用户名:", url.username ? "已设置" : "未设置");
        console.log("- 密码:", url.password ? "已设置" : "未设置");
      } catch (parseError) {
        console.error("无法解析数据库URL:", parseError);
      }
    }
  } catch (error) {
    console.error("尝试连接Supabase数据库时发生异常:", error);
  }
}

// 执行主函数
main().catch(error => {
  console.error("程序执行失败:", error);
  process.exit(1);
});