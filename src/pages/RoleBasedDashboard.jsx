import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

// Import role-based dashboards
import ReceivingClerkDashboard from '../components/dashboards/ReceivingClerkDashboard';
import PickerDashboard from '../components/dashboards/PickerDashboard';
import PackerDashboard from '../components/dashboards/PackerDashboard';
import DriverDashboard from '../components/dashboards/DriverDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Route users to their specific dashboard based on role
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
      return <Navigate to="/inventory" replace />;
  }
};

export default RoleBasedDashboard;
