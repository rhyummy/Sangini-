// ============================================================
// Auth Store using Supabase Auth + React Context
// Role-based: patient | doctor | volunteer | admin
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAs: (role: UserRole) => void; // Quick demo login (keeps backward compat)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from users table
  async function fetchUserProfile(authUser: SupabaseUser): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        // User might not have a profile yet, create one
        console.log('No profile found, using auth metadata');
        return {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: (authUser.user_metadata?.role as UserRole) || 'patient',
          createdAt: authUser.created_at,
        };
      }

      return {
        id: data.id,
        name: data.full_name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user).then(setUser);
      } else {
        // Check localStorage for demo user
        const stored = localStorage.getItem('bca_user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch { /* ignore */ }
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
          if (profile) {
            localStorage.setItem('bca_user', JSON.stringify(profile));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('bca_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login with Supabase Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user);
        setUser(profile);
        if (profile) {
          localStorage.setItem('bca_user', JSON.stringify(profile));
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Signup with Supabase Auth
  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            full_name: name,
            role: role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    localStorage.removeItem('bca_user');
  };

  // Demo login (backward compatibility)
  const loginAs = (role: UserRole) => {
    const found = mockUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem('bca_user', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      session, 
      isLoading, 
      login, 
      signup, 
      logout, 
      loginAs 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
