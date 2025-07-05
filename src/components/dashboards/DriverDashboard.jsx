import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { Truck, MapPin, Route, Navigation } from 'lucide-react';

const DriverDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Driver Dashboard"
      role="Driver"
      iconComponent={Truck}
      gradientColors="from-green-500 to-emerald-600"
    />
  );
};

export default DriverDashboard;
