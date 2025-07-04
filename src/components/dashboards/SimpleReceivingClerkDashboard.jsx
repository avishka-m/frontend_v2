import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const SimpleReceivingClerkDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Receiving Clerk Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {currentUser?.name || currentUser?.username}!
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            This is the receiving clerk dashboard.
          </p>
          <p className="text-sm text-blue-800">
            Role: {currentUser?.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleReceivingClerkDashboard;
