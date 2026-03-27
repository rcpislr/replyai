'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@replyai/shared';
import APIClient from '@replyai/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, tenantName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = new APIClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      apiClient.setToken(storedToken);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(email, password);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        apiClient.setToken(response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, tenantName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.register(email, password, name, tenantName);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        apiClient.setToken(response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    apiClient.clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
