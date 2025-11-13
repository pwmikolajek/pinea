import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const ALLOWED_DOMAIN = 'humanmade.com';

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

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verify domain restriction
      if (!user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: `Only ${ALLOWED_DOMAIN} email addresses are allowed to register.`,
        };
      }

      // Create user object
      const userData: User = {
        id: 0, // Will be set by backend if needed
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
      };

      // Store Firebase token
      const token = await user.getIdToken();
      localStorage.setItem('sparrow_token', token);
      localStorage.setItem('sparrow_user', JSON.stringify(userData));
      localStorage.setItem('sparrow_auth_provider', 'google');
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message || 'Google sign-in failed',
      };
    }
  };

  const logout = async () => {
    const authProvider = localStorage.getItem('sparrow_auth_provider');

    // Sign out from Firebase if using Google auth
    if (authProvider === 'google') {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('Firebase sign-out error:', error);
      }
    }

    localStorage.removeItem('sparrow_token');
    localStorage.removeItem('sparrow_user');
    localStorage.removeItem('sparrow_auth_provider');
    setUser(null);
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
  };

  return <SparrowAuthContext.Provider value={value}>{children}</SparrowAuthContext.Provider>;
};
