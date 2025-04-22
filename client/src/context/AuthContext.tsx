import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentSession, getCurrentUser, syncUserAfterOAuth, signOut } from '@/lib/auth';
import { UserWithProviders } from '@shared/schema';

interface AuthContextType {
  supabaseUser: any;
  user: UserWithProviders | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create a context with a default value that matches the shape
const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  user: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshUser: async () => {}
});

// Use hook must be defined before the provider for Fast Refresh to work correctly
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [user, setUser] = useState<UserWithProviders | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = async () => {
    try {
      if (!supabaseUser) return;
      
      const userData = await syncUserAfterOAuth(supabaseUser);
      setUser(userData);
    } catch (err: any) {
      setError(err);
      console.error('Failed to refresh user:', err);
    }
  };

  useEffect(() => {
    // 會話恢復函數：當頁面重新加載時嘗試恢復會話
    async function loadUser() {
      try {
        setIsLoading(true);
        console.log("AuthContext: Loading user...");
        
        // 直接從 Supabase 獲取當前會話，不使用我們的緩存
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthContext: Session error:", sessionError);
          setIsLoading(false);
          return;
        }
        
        console.log("AuthContext: Direct Supabase session result:", sessionData);
        
        if (!sessionData.session) {
          console.log("AuthContext: No session found from direct Supabase call");
          
          // 嘗試刷新會話
          try {
            console.log("AuthContext: Attempting to refresh session...");
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error("AuthContext: Session refresh error:", refreshError);
              setIsLoading(false);
              return;
            }
            
            if (!refreshData.session) {
              console.log("AuthContext: No session after refresh attempt");
              setIsLoading(false);
              return;
            }
            
            console.log("AuthContext: Session refreshed successfully:", refreshData.session);
            // 繼續使用刷新後的會話
            const supabaseUserData = refreshData.user;
            setSupabaseUser(supabaseUserData);
            
            // 同步到我們的數據庫
            try {
              const userData = await syncUserAfterOAuth(supabaseUserData);
              console.log("AuthContext: Synced user data after refresh:", userData);
              setUser(userData);
            } catch (syncError) {
              console.error("AuthContext: Error syncing user data after refresh:", syncError);
              // 降級處理 - 確保有效的 supabaseUserData
              if (supabaseUserData && supabaseUserData.email) {
                setUser({
                  id: -1,
                  email: supabaseUserData.email,
                  username: supabaseUserData.user_metadata?.full_name || supabaseUserData.email.split('@')[0],
                  avatarUrl: supabaseUserData.user_metadata?.avatar_url || null,
                  bio: '',
                  createdAt: new Date(),
                  providers: []
                });
              } else {
                console.error("AuthContext: Invalid supabaseUserData for fallback user creation");
              }
            }
          } catch (refreshError) {
            console.error("AuthContext: Unexpected error during refresh:", refreshError);
            setIsLoading(false);
            return;
          }
        } else {
          // 會話有效，處理用戶數據
          console.log("AuthContext: Valid session found:", sessionData.session);
          
          const supabaseUserData = sessionData.session.user;
          setSupabaseUser(supabaseUserData);
          
          // 同步到我們的數據庫
          try {
            const userData = await syncUserAfterOAuth(supabaseUserData);
            console.log("AuthContext: Synced user data:", userData);
            setUser(userData);
          } catch (syncError) {
            console.error("AuthContext: Error syncing user data:", syncError);
            // 降級處理
            setUser({
              id: -1,
              email: supabaseUserData.email,
              username: supabaseUserData.user_metadata?.full_name || supabaseUserData.email.split('@')[0],
              avatarUrl: supabaseUserData.user_metadata?.avatar_url || null,
              bio: '',
              createdAt: new Date(),
              providers: []
            });
          }
        }
      } catch (err: any) {
        setError(err);
        console.error('Auth general error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // 在每次頁面加載時立即調用，包括頁面刷新
    loadUser();

    // 建立 Supabase 認證狀態變更監聽器
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthContext: Auth state change detected:", { event, hasSession: !!session });
        
        if (event === 'SIGNED_IN' && session) {
          // 處理登入事件
          const supabaseUserData = session.user;
          setSupabaseUser(supabaseUserData);
          
          try {
            // 將 Supabase 用戶同步到我們的數據庫
            const userData = await syncUserAfterOAuth(supabaseUserData);
            setUser(userData);
          } catch (syncError) {
            console.error("AuthContext: Error during auth state change sync:", syncError);
            // 降級處理
            setUser({
              id: -1,
              email: supabaseUserData.email,
              username: supabaseUserData.user_metadata?.full_name || supabaseUserData.email.split('@')[0],
              avatarUrl: supabaseUserData.user_metadata?.avatar_url || null,
              bio: '',
              createdAt: new Date(),
              providers: []
            });
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // 處理登出事件
          console.log("AuthContext: User signed out or deleted");
          setSupabaseUser(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // 處理令牌刷新事件
          console.log("AuthContext: Token refreshed");
          const supabaseUserData = session.user;
          setSupabaseUser(supabaseUserData);
          
          try {
            const userData = await syncUserAfterOAuth(supabaseUserData);
            setUser(userData);
          } catch (syncError) {
            console.error("AuthContext: Error syncing user after token refresh:", syncError);
          }
        }
      }
    );

    return () => {
      console.log("AuthContext: Cleaning up auth state listener");
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      // signOut函數現在會處理所有清理工作，包括重定向
      await signOut();
      // 以下代碼在重定向前可能執行，將狀態清空
      setSupabaseUser(null);
      setUser(null);
    } catch (err: any) {
      console.error('Error during sign out:', err);
      setError(err);
      
      // 即使出錯，也嘗試強制重定向到登錄頁面
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  const value = {
    supabaseUser,
    user,
    isLoading,
    error,
    signOut: handleSignOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 分开导出，解决热更新问题
export { AuthProvider };
export { useAuth };
