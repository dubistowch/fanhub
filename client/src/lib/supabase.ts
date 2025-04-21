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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
