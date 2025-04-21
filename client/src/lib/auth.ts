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

// Create or update user in our database after OAuth login
export async function syncUserAfterOAuth(supabaseUser: any) {
  try {
    console.log("Auth: Syncing user after OAuth:", { 
      email: supabaseUser.email,
      id: supabaseUser.id,
      has_metadata: !!supabaseUser.user_metadata
    });
    
    // First check if user exists
    console.log(`Auth: Checking if user exists: /api/users/email/${supabaseUser.email}`);
    const response = await fetch(`/api/users/email/${supabaseUser.email}`);
    console.log("Auth: User check response:", { status: response.status, ok: response.ok });
    
    if (response.ok) {
      // User exists, return the user
      const userData = await response.json();
      console.log("Auth: Existing user found:", userData);
      return userData;
    } else if (response.status === 404) {
      // User doesn't exist, create new user
      console.log("Auth: User not found, creating new user");
      const newUser: InsertUser = {
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        bio: '',
      };
      
      console.log("Auth: Creating new user with data:", newUser);
      const createdUser = await apiRequest('POST', '/api/users', newUser);
      
      if (!createdUser.ok) {
        const errorText = await createdUser.text();
        console.error("Auth: Failed to create user:", { status: createdUser.status, error: errorText });
        throw new Error(`Failed to create user: ${errorText}`);
      }
      
      const userData = await createdUser.json();
      console.log("Auth: User created successfully:", userData);
      return userData;
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
