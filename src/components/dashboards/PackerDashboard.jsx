import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Package, Box, Archive, CheckCircle } from 'lucide-react';

const PackerDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Packer Dashboard"
      role="Packer"
      iconComponent={Box}
      gradientColors="from-purple-500 to-indigo-600"
    />
  );
};

export default PackerDashboard;
