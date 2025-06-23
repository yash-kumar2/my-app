import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return user ? children : <AuthPage />;
};

export default PrivateRoute;