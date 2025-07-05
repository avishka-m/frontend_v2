import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Package, Route, Target, MapPin } from 'lucide-react';

const PickerDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Picker Dashboard"
      role="Picker"
      iconComponent={Package}
      gradientColors="from-orange-500 to-red-600"
    />
  );
};

export default PickerDashboard;
