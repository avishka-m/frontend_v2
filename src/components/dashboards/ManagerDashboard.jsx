import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Crown } from 'lucide-react';

const ManagerDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Manager Dashboard"
      role="Manager"
      iconComponent={Crown}
      gradientColors="from-purple-500 to-pink-600"
      // Manager-specific props can be added here if needed
    />
  );
};

export default ManagerDashboard;
