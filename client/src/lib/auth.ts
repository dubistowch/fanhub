import { supabase, OAuthProvider } from './supabase';
import { apiRequest } from './queryClient';
import { User, InsertUser, InsertProvider } from '@shared/schema';

// Sign in with OAuth provider
export async function signInWithOAuth(provider: OAuthProvider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('OAuth sign in error:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    console.log("Auth: Getting current session...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth: Session error:', error);
      throw error;
    }
    
    console.log("Auth: Current session:", data.session);
    return data.session;
  } catch (error) {
    console.error('Auth: Get session error:', error);
    return null;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    console.log("Auth: Getting current user...");
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth: User error:', error);
      throw error;
    }
    
    console.log("Auth: Current user:", data.user);
    return data.user;
  } catch (error) {
    console.error('Auth: Get user error:', error);
    return null;
  }
}

// 維護一個簡單的登錄用戶緩存，防止重複請求
const userCache: Record<string, { timestamp: number, data: any }> = {};

// 創建或更新數據庫中的用戶（OAuth登錄後）
export async function syncUserAfterOAuth(supabaseUser: any) {
  try {
    if (!supabaseUser || !supabaseUser.email) {
      console.error("Auth: Invalid user data for sync:", supabaseUser);
      throw new Error("Invalid user data");
    }
    
    console.log("Auth: Syncing user after OAuth:", { 
      email: supabaseUser.email,
      id: supabaseUser.id,
      has_metadata: !!supabaseUser.user_metadata
    });
    
    // 檢查緩存是否存在且在5秒內（避免重複請求）
    const cacheKey = `user_${supabaseUser.email}`;
    const cachedData = userCache[cacheKey];
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp < 5000)) {
      console.log("Auth: Using cached user data");
      return cachedData.data;
    }
    
    // 首先檢查用戶是否存在
    console.log(`Auth: Checking if user exists: /api/users/email/${supabaseUser.email}`);
    const response = await fetch(`/api/users/email/${supabaseUser.email}`);
    console.log("Auth: User check response:", { status: response.status, ok: response.ok });
    
    if (response.ok) {
      // 用戶存在，返回用戶數據
      const userData = await response.json();
      console.log("Auth: Existing user found:", userData);
      
      // 更新緩存
      userCache[cacheKey] = { timestamp: now, data: userData };
      return userData;
    } else if (response.status === 404) {
      // 用戶不存在，創建新用戶
      console.log("Auth: User not found, creating new user");
      const newUser: InsertUser = {
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        bio: '',
      };
      
      console.log("Auth: Creating new user with data:", newUser);
      
      try {
        const createdUser = await apiRequest('POST', '/api/users', newUser);
        const userData = await createdUser.json();
        console.log("Auth: User created successfully:", userData);
        
        // 更新緩存
        userCache[cacheKey] = { timestamp: now, data: userData };
        return userData;
      } catch (error: any) {
        // 如果創建失敗，可能是因為並發請求已經創建了用戶，再次嘗試獲取
        if (error.message && error.message.includes("already exists")) {
          console.log("Auth: User was created by another request, fetching user data");
          const retryResponse = await fetch(`/api/users/email/${supabaseUser.email}`);
          
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            // 更新緩存
            userCache[cacheKey] = { timestamp: now, data: userData };
            return userData;
          }
        }
        throw error;
      }
    } else if (response.status === 500) {
      // Database connection error or other server error
      try {
        const errorData = await response.json();
        console.error("Auth: Server error while fetching user:", errorData);
        
        // 检查是否是数据库连接错误
        if (errorData.error && errorData.error.includes("ENOTFOUND")) {
          console.warn("Auth: Database connection error - Supabase might be unavailable");
          // 返回部分用户信息，但标记为需要同步
          return {
            id: -1, // 临时ID
            email: supabaseUser.email,
            username: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
            bio: '',
            needsSync: true, // 标记此用户需要在数据库连接恢复后同步
            _supabaseMetadata: supabaseUser // 保存原始Supabase数据以便后续同步
          };
        }
        
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
      } catch (jsonError) {
        // 如果响应不是JSON格式
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error("Auth: Failed to fetch user:", { status: response.status, error: errorText });
        throw new Error(`Failed to fetch user: ${errorText}`);
      }
    } else {
      const errorText = await response.text();
      console.error("Auth: Failed to fetch user:", { status: response.status, error: errorText });
      throw new Error(`Failed to fetch user: ${errorText}`);
    }
  } catch (error) {
    console.error('Error syncing user after OAuth:', error);
    throw error;
  }
}

// Link an OAuth provider to an existing user
export async function linkProvider(userId: number, providerData: any) {
  try {
    const newProvider: InsertProvider = {
      userId,
      provider: providerData.provider,
      providerId: providerData.id,
      providerUsername: providerData.username || '',
      providerAvatar: providerData.avatar || '',
      accessToken: providerData.access_token || '',
      refreshToken: providerData.refresh_token || '',
    };
    
    const response = await apiRequest('POST', '/api/providers', newProvider);
    return await response.json();
  } catch (error) {
    console.error('Error linking provider:', error);
    throw error;
  }
}

// Unlink a provider from a user
export async function unlinkProvider(providerId: number) {
  try {
    await apiRequest('DELETE', `/api/providers/${providerId}`);
    return true;
  } catch (error) {
    console.error('Error unlinking provider:', error);
    throw error;
  }
}
