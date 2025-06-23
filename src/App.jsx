import React from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoadmapDashboard from './pages/RoadmapDashboard';

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <PrivateRoute>
          <RoadmapDashboard />
        </PrivateRoute>
      </div>
    </AuthProvider>
  );
};

export default App;