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
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Create or update user in our database after OAuth login
export async function syncUserAfterOAuth(supabaseUser: any) {
  try {
    // First check if user exists
    const response = await fetch(`/api/users/email/${supabaseUser.email}`);
    
    if (response.ok) {
      // User exists, return the user
      return await response.json();
    } else if (response.status === 404) {
      // User doesn't exist, create new user
      const newUser: InsertUser = {
        email: supabaseUser.email,
        username: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        bio: '',
      };
      
      const createdUser = await apiRequest('POST', '/api/users', newUser);
      return await createdUser.json();
    } else {
      throw new Error('Failed to fetch user');
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
