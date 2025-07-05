import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { 
  Package,
  Box,
  Activity,
  CheckCircle,
  ArrowRight,
  Truck
} from 'lucide-react';

const PackerDashboard = () => {
  // Packer-specific configuration
  const packerConfig = {
    role: 'packer',
    title: 'Packer Dashboard',
    iconComponent: Box,
    gradientColors: 'from-green-500 to-teal-600',
    themeColor: 'green',
    tabs: [
      {
        id: 'pending',
        label: 'Ready for Packing',
        icon: Package,
        includeLocalActive: false,
        actions: [
          {
            id: 'start_packing',
            label: 'Start Packing',
            icon: ArrowRight,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/start-packing',
            successMessage: 'Packing started',
            errorMessage: 'Failed to start packing'
          }
        ]
      },
      {
        id: 'packing',
        label: 'Packing',
        icon: Activity,
        includeLocalActive: true,
        actions: [
          {
            id: 'complete_packing',
            label: 'Complete Packing',
            icon: CheckCircle,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/complete-packing',
            successMessage: 'Order ready for shipping',
            errorMessage: 'Failed to complete packing'
          }
        ]
      },
      {
        id: 'completed',
        label: 'Ready for Shipping',
        icon: Truck,
        includeLocalActive: false,
        actions: []
      }
    ],
    statusMapping: {
      'pending': ['packing'], // Orders ready for packing
      'packing': ['packing'], // Orders being packed (we'll differentiate by assigned_worker)
      'completed': ['shipping', 'shipped', 'delivered'] // Orders that have moved past packing
    },
    workflowActions: {
      'start_packing': {
        apiEndpoint: '/api/orders/start-packing',
        method: 'POST',
        localTransition: {
          fromTab: 'pending',
          toTab: 'packing',
          newStatus: 'packing'
        },
        successMessage: 'Packing started',
        errorMessage: 'Failed to start packing'
      },
      'complete_packing': {
        apiEndpoint: '/api/orders/complete-packing',
        method: 'POST',
        localTransition: {
          fromTab: 'packing',
          toTab: 'completed',
          newStatus: 'shipping'
        },
        successMessage: 'Order ready for shipping',
        errorMessage: 'Failed to complete packing'
      }
    }
  };

  return <WorkflowDashboard {...packerConfig} />;
};

export default PackerDashboard;
