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

const PackingDashboard = () => {
  // Packing-specific configuration (similar to Packer but might have different workflow)
  const packingConfig = {
    role: 'packing',
    title: 'Packing Dashboard',
    iconComponent: Package,
    gradientColors: 'from-emerald-500 to-green-600',
    themeColor: 'emerald',
    tabs: [
      {
        id: 'pending',
        label: 'Ready for Packing',
        icon: Box,
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
        id: 'active',
        label: 'Packing in Progress',
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
      'active': ['packing'], // Orders being packed (we'll differentiate by assigned_worker)
      'completed': ['shipping', 'shipped', 'delivered'] // Orders that have moved past packing
    },
    workflowActions: {
      'start_packing': {
        apiEndpoint: '/api/orders/start-packing',
        method: 'POST',
        localTransition: {
          fromTab: 'pending',
          toTab: 'active',
          newStatus: 'packing'
        },
        successMessage: 'Packing started',
        errorMessage: 'Failed to start packing'
      },
      'complete_packing': {
        apiEndpoint: '/api/orders/complete-packing',
        method: 'POST',
        localTransition: {
          fromTab: 'active',
          toTab: 'completed',
          newStatus: 'shipping'
        },
        successMessage: 'Order ready for shipping',
        errorMessage: 'Failed to complete packing'
      }
    }
  };

  return <WorkflowDashboard {...packingConfig} />;
};

export default PackingDashboard;
