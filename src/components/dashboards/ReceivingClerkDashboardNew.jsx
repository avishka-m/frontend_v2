import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { 
  ClipboardList,
  Package,
  Activity,
  CheckCircle,
  ArrowRight,
  Clock
} from 'lucide-react';

const ReceivingClerkDashboard = () => {
  // Receiving Clerk-specific configuration
  const receivingClerkConfig = {
    role: 'receiving_clerk',
    title: 'Receiving Clerk Dashboard',
    iconComponent: ClipboardList,
    gradientColors: 'from-blue-500 to-cyan-600',
    themeColor: 'blue',
    tabs: [
      {
        id: 'pending',
        label: 'Pending Orders',
        icon: Clock,
        includeLocalActive: false,
        actions: [
          {
            id: 'accept_order',
            label: 'Accept Order',
            icon: ArrowRight,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/accept',
            successMessage: 'Order accepted and processing started',
            errorMessage: 'Failed to accept order'
          }
        ]
      },
      {
        id: 'active',
        label: 'Processing',
        icon: Activity,
        includeLocalActive: true,
        actions: [
          {
            id: 'complete_receiving',
            label: 'Complete Receiving',
            icon: CheckCircle,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/complete-receiving',
            successMessage: 'Order ready for picking',
            errorMessage: 'Failed to complete receiving'
          }
        ]
      },
      {
        id: 'completed',
        label: 'Ready for Picking',
        icon: Package,
        includeLocalActive: false,
        actions: []
      }
    ],
    statusMapping: {
      'pending': ['pending'], // New orders
      'active': ['processing'], // Orders being processed
      'completed': ['ready', 'picking', 'packing', 'shipping', 'shipped', 'delivered'] // Orders that have moved past receiving
    },
    workflowActions: {
      'accept_order': {
        apiEndpoint: '/api/orders/accept',
        method: 'POST',
        localTransition: {
          fromTab: 'pending',
          toTab: 'active',
          newStatus: 'processing'
        },
        successMessage: 'Order accepted and processing started',
        errorMessage: 'Failed to accept order'
      },
      'complete_receiving': {
        apiEndpoint: '/api/orders/complete-receiving',
        method: 'POST',
        localTransition: {
          fromTab: 'active',
          toTab: 'completed',
          newStatus: 'ready'
        },
        successMessage: 'Order ready for picking',
        errorMessage: 'Failed to complete receiving'
      }
    }
  };

  return <WorkflowDashboard {...receivingClerkConfig} />;
};

export default ReceivingClerkDashboard;
