import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (public facing data only)
// This uses the public anon key which is safe to use in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase configuration:', { 
  hasUrl: !!supabaseUrl, 
  hasAnonKey: !!supabaseAnonKey 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Please check your environment variables.');
}

// 設定 Supabase 客戶端選項以確保會話持久化
const supabaseOptions = {
  auth: {
    // 存儲會話到 localStorage 並使用其進行持久化
    persistSession: true,
    // 嘗試刷新會話如果接近過期
    autoRefreshToken: true,
    // 設置會話傳輸方式 (localStorage, 默認)
    storage: window.localStorage,
    // 設置存儲鍵名
    storageKey: 'sb-auth-token',
    // 確保檢測 URL 中的訪問令牌 (用於 OAuth 回調)
    detectSessionInUrl: true,
    // 將會話 cookie 存儲在安全上下文中
    cookieOptions: {
      name: 'sb-auth-cookie',
      lifetime: 60 * 60 * 8,
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax',
    }
  }
};

// 檢查與清理可能的過期會話數據
try {
  const checkForStaleSessions = () => {
    const now = Date.now();
    // 檢查 localStorage 中所有與 Supabase 相關的鍵
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase.auth') || key.includes('sb-')) {
        try {
          const storageData = JSON.parse(localStorage.getItem(key) || '{}');
          // 檢查過期令牌
          if (storageData?.expiresAt && storageData.expiresAt < now) {
            console.log('Removing stale auth data:', key);
            localStorage.removeItem(key);
          }
        } catch (e) {
          // 無法解析 JSON，保留存儲項
        }
      }
    });
  };
  
  // 在初始化前清理可能過期的會話
  checkForStaleSessions();
} catch (storageError) {
  console.warn('Error accessing localStorage:', storageError);
}

// 初始化 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Provider configuration
export const OAUTH_PROVIDERS = {
  google: {
    id: 'google',
    name: 'Google',
    color: 'bg-red-600',
    icon: 'fab fa-google'
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    color: 'bg-[#6441A4]',
    icon: 'fab fa-twitch'
  }'
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    color: 'bg-[#6441A4]',
    icon: 'fab fa-twitch'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    color: 'bg-blue-400',
    icon: 'fab fa-twitter'
  }
};

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;
