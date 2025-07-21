import React, { Suspense, lazy } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ReceivingClerkDashboard = lazy(() => import('../components/dashboards/ReceivingClerkDashboard'));
const PickerDashboard = lazy(() => import('../components/dashboards/PickerDashboard'));
const PackerDashboard = lazy(() => import('../components/dashboards/PackerDashboard'));
const DriverDashboard = lazy(() => import('../components/dashboards/DriverDashboard'));
const ManagerDashboard = lazy(() => import('../components/dashboards/ManagerDashboard'));

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Route users to their specific dashboard based on role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'ReceivingClerk':
        return <ReceivingClerkDashboard />;
      case 'Picker':
        return <PickerDashboard />;
      case 'Packer':
        return <PackerDashboard />;
      case 'Driver':
        return <DriverDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      default:
        // Fallback for unknown roles
        return (
          <div className="p-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Unknown Role Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome, {currentUser.name || currentUser.username}!
              </p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  Role: {currentUser.role}
                </p>
                <p className="text-sm text-yellow-800">
                  User ID: {currentUser.workerID}
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  This role is not recognized. Please contact your administrator.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      {renderDashboard()}
    </Suspense>
  );
};

export default RoleBasedDashboard;
