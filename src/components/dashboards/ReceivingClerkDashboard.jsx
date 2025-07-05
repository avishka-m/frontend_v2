import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { ClipboardCheck, Package, Inbox, CheckCircle } from 'lucide-react';

const ReceivingClerkDashboard = () => {
  return (
    <WorkflowDashboard 
      title="Receiving Clerk Dashboard"
      role="ReceivingClerk"
      iconComponent={ClipboardCheck}
      gradientColors="from-blue-500 to-cyan-600"
    />
  );
};

export default ReceivingClerkDashboard;
