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
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 存儲會話到 localStorage 並使用其進行持久化
    persistSession: true,
    // 嘗試刷新會話如果接近過期
    autoRefreshToken: true,
    // 設置會話傳輸方式 (localStorage, 默認)
    storage: window.localStorage,
    // 設置持久化的訪問令牌
    storageKey: 'fanhub-auth-token',
  }
});

// Provider configuration
export const OAUTH_PROVIDERS = {
  google: {
    id: 'google',
    name: 'Google',
    color: 'bg-red-600',
    icon: 'fab fa-google'
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    color: 'bg-indigo-600',
    icon: 'fab fa-discord'
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
