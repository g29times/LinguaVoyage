import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, type AuthUser } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  emailVerified: boolean | null;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as AuthUser || null);
      setEmailVerified(session?.user ? !!session.user.email_confirmed_at : null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Auth state change:`, {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email,
        currentPath: window.location.pathname,
        currentUrl: window.location.href
      });

      setSession(session);
      setUser(session?.user as AuthUser || null);
      setEmailVerified(session?.user ? !!session.user.email_confirmed_at : null);
      setLoading(false);

      // Handle successful OAuth sign in
      if (event === 'SIGNED_IN' && session) {
        const currentPath = window.location.pathname;
        console.log(`[${timestamp}] SIGNED_IN event detected:`, {
          currentPath,
          userEmail: session.user.email,
          provider: session.user.app_metadata?.provider,
          hasHash: !!window.location.hash
        });
        
        // Clear any URL fragments from OAuth redirect
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log(`[${timestamp}] Clearing OAuth hash from URL`);
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // If we're on auth page or OAuth callback, redirect to home
        if (currentPath === '/auth' || currentPath === '/auth/callback') {
          console.log(`[${timestamp}] OAuth sign-in detected, will redirect to home in 100ms...`);
          setTimeout(() => {
            console.log(`[${new Date().toISOString()}] Executing redirect to home page`);
            window.location.href = '/';
          }, 100);
        } else {
          console.log(`[${timestamp}] User signed in but not on auth page, current path: ${currentPath}`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { error };
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    emailVerified,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendVerification,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}