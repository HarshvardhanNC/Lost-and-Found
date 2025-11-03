import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useAuth } from '../../context/AuthContext'; // Keeping for backward compatibility

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Redux state
  const { user: reduxUser, isAuthenticated: reduxIsAuthenticated, loading: reduxLoading } = useAppSelector((state) => state.auth);
  
  // Context API (for backward compatibility)
  const { user: contextUser, isAuthenticated: contextIsAuthenticated, loading: contextLoading } = useAuth();
  
  // Use Redux state, fallback to Context API
  const user = reduxUser || contextUser;
  const isAuthenticated = reduxIsAuthenticated || contextIsAuthenticated;
  const loading = reduxLoading || contextLoading;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // User's role is not authorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
