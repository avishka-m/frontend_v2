import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Crown, CheckCircle, Package, Clock } from 'lucide-react';

const ManagerDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Manager Dashboard"
      role="Manager"
      iconComponent={Crown}
      gradientColors="from-purple-500 to-pink-600"
    />
  );
};

export default ManagerDashboard;
