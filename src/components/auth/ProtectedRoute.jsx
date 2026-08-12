import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

// Wraps routes that require a logged-in tenant. Redirects to login if there's
// no valid session, and waits for the initial auth check (reading the token
// from localStorage) before deciding, so a real logged-in tenant doesn't get
// bounced on a hard refresh.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#556067]">progress_activity</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
