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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    async function loadUser() {
      try {
        setIsLoading(true);
        console.log("AuthContext: Loading user...");
        
        // Get session and user from Supabase
        const session = await getCurrentSession();
        console.log("AuthContext: Session:", session);
        if (!session) {
          console.log("AuthContext: No session found");
          setIsLoading(false);
          return;
        }
        
        const supabaseUserData = await getCurrentUser();
        console.log("AuthContext: Supabase user data:", supabaseUserData);
        if (!supabaseUserData) {
          console.log("AuthContext: No Supabase user found");
          setIsLoading(false);
          return;
        }
        
        setSupabaseUser(supabaseUserData);
        
        // Sync with our database
        console.log("AuthContext: Syncing with our database...");
        const userData = await syncUserAfterOAuth(supabaseUserData);
        console.log("AuthContext: Synced user data:", userData);
        setUser(userData);
      } catch (err: any) {
        setError(err);
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const supabaseUserData = await getCurrentUser();
          setSupabaseUser(supabaseUserData);
          
          const userData = await syncUserAfterOAuth(supabaseUserData);
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setSupabaseUser(null);
      setUser(null);
    } catch (err: any) {
      setError(err);
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
