import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuthStore();
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper skeleton loader if preferred
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};