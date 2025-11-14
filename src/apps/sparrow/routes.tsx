import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { SparrowAuthProvider, useSparrowAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PdfViewer from './pages/PdfViewer';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSparrowAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/sparrow/login" />;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSparrowAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/sparrow/dashboard" />;
};

// Sparrow route configuration
export const sparrowRoutes: RouteObject[] = [
  {
    path: '/sparrow/login',
    element: (
      <SparrowAuthProvider>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </SparrowAuthProvider>
    ),
  },
  {
    path: '/sparrow/register',
    element: (
      <SparrowAuthProvider>
        <PublicRoute>
          <Register />
        </PublicRoute>
      </SparrowAuthProvider>
    ),
  },
  {
    path: '/sparrow/dashboard',
    element: (
      <SparrowAuthProvider>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </SparrowAuthProvider>
    ),
  },
  {
    path: '/sparrow/pdf/:id',
    element: (
      <SparrowAuthProvider>
        <ProtectedRoute>
          <PdfViewer />
        </ProtectedRoute>
      </SparrowAuthProvider>
    ),
  },
  {
    path: '/sparrow/project/:id',
    element: (
      <SparrowAuthProvider>
        <ProtectedRoute>
          <PdfViewer />
        </ProtectedRoute>
      </SparrowAuthProvider>
    ),
  },
];
