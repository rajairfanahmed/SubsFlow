"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { authService, LoginPayload, RegisterPayload } from '@/services/auth.service';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Initial load (checking token)
  isAuthenticating: boolean; // Login/Register operations
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/pricing', '/about'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe(); 
          setUser(userData);
        } catch (error) {
          console.error("Token invalid:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsAuthenticating(true);
    try {
      const response = await authService.login(payload);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
        setIsAuthenticating(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsAuthenticating(true);
    try {
      // Backend does NOT return token on register
      // User must log in manually after registration
      await authService.register(payload);

      // Redirect to login page (not dashboard)
      router.push('/login?registered=true');
    } catch (error) {
      throw error;
    } finally {
        setIsAuthenticating(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {isLoading ? <FullPageSpinner /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
