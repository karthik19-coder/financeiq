import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { authState, isNewUser } = useAuth();
  const location = useLocation();

  if (authState === 'INITIALIZING') {
    return null; // The AuthContext handles the loading UI natively
  }

  if (authState === 'UNAUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  // The 'Anti-Hang' Navigation Guard
  if (authState === 'AUTHENTICATED') {
    if (isNewUser) {
      if (location.pathname !== '/onboarding') {
         return <Navigate to="/onboarding" replace />;
      }
    } else {
      // Prevent routing back to onboarding once completed natively
      if (location.pathname === '/onboarding') {
         return <Navigate to="/dashboard" replace />;
      }
    }
    return <Outlet />;
  }

  return null;
};

export default ProtectedRoute;
