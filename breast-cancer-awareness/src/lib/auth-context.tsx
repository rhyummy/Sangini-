// ============================================================
// Simple Auth Store using React Context + localStorage
// Role-based: patient | doctor | volunteer | admin
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  loginAs: (role: UserRole) => void; // Quick demo login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bca_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, _role: UserRole): boolean => {
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('bca_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const loginAs = (role: UserRole) => {
    const found = mockUsers.find(u => u.role === role);
    if (found) {
      setUser(found);
      localStorage.setItem('bca_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bca_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
