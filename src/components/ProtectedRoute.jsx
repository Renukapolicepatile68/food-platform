import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  const userToken = localStorage.getItem('userToken');

  if (!userToken || !userRole) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    // Logged in but wrong role, redirect to appropriate dashboard or home
    if (userRole === 'customer') {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (userRole === 'restaurant') {
      return <Navigate to="/restaurant-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
