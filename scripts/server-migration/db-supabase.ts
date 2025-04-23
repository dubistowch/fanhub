import { getSupabaseDb } from './supabase-connection';

// 异步导出数据库实例获取函数
// 这样我们可以在代码中使用 await getDb() 获取数据库实例
export const getDb = async () => {
  try {
    return await getSupabaseDb();
  } catch (error) {
    console.error('无法连接到Supabase数据库:', error);
    throw error;
  }
};

// 为了保持与现有代码兼容，我们提供一个代理对象
// 这个对象会在被访问时尝试获取真正的数据库实例
// 注意：这会导致所有数据库操作变为异步的
export const db = new Proxy({} as ReturnType<typeof getSupabaseDb>, {
  get(target, prop, receiver) {
    return async (...args: any[]) => {
      try {
        const realDb = await getSupabaseDb();
        const method = Reflect.get(realDb, prop, receiver);
        if (typeof method === 'function') {
          return method.apply(realDb, args);
        }
        return method;
      } catch (error) {
        console.error(`数据库操作失败 (${String(prop)}):`, error);
        throw error;
      }
    };
  }
});