import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const SparrowAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSparrowAuth = () => {
  const context = useContext(SparrowAuthContext);
  if (!context) {
    throw new Error('useSparrowAuth must be used within a SparrowAuthProvider');
  }
  return context;
};

export const SparrowAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('sparrow_token');
    const userData = localStorage.getItem('sparrow_user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('sparrow_token', token);
      localStorage.setItem('sparrow_user', JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register({ email, password, name });
      const { token, user } = response.data;

      localStorage.setItem('sparrow_token', token);
      localStorage.setItem('sparrow_user', JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('sparrow_token');
    localStorage.removeItem('sparrow_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <SparrowAuthContext.Provider value={value}>{children}</SparrowAuthContext.Provider>;
};
