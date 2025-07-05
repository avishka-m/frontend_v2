import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { 
  ShoppingCart,
  Package,
  Activity,
  CheckCircle,
  ArrowRight,
  User
} from 'lucide-react';

const PickerDashboard = () => {
  // Picker-specific configuration
  const pickerConfig = {
    role: 'picker',
    title: 'Picker Dashboard',
    iconComponent: ShoppingCart,
    gradientColors: 'from-purple-500 to-indigo-600',
    themeColor: 'purple',
    tabs: [
      {
        id: 'available',
        label: 'Available Orders',
        icon: Package,
        includeLocalActive: false,
        actions: [
          {
            id: 'take_order',
            label: 'Take Order',
            icon: User,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/assign-to-me',
            successMessage: 'Order assigned to you',
            errorMessage: 'Failed to take order'
          }
        ]
      },
      {
        id: 'picking',
        label: 'Picking',
        icon: Activity,
        includeLocalActive: true,
        actions: [
          {
            id: 'complete_picking',
            label: 'Complete Picking',
            icon: CheckCircle,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/complete-picking',
            successMessage: 'Order moved to packing',
            errorMessage: 'Failed to complete picking'
          }
        ]
      },
      {
        id: 'completed',
        label: 'Completed',
        icon: CheckCircle,
        includeLocalActive: false,
        actions: []
      }
    ],
    statusMapping: {
      'available': ['pending', 'ready'], // Orders ready for picking
      'picking': ['picking'], // Orders being picked
      'completed': ['packing', 'shipped', 'delivered'] // Orders that have moved past picking
    },
    workflowActions: {
      'take_order': {
        apiEndpoint: '/api/orders/assign-to-me',
        method: 'POST',
        localTransition: {
          fromTab: 'available',
          toTab: 'picking',
          newStatus: 'picking'
        },
        successMessage: 'Order assigned to you',
        errorMessage: 'Failed to take order'
      },
      'complete_picking': {
        apiEndpoint: '/api/orders/complete-picking',
        method: 'POST',
        localTransition: {
          fromTab: 'picking',
          toTab: 'completed',
          newStatus: 'packing'
        },
        successMessage: 'Order moved to packing',
        errorMessage: 'Failed to complete picking'
      }
    }
  };

  return <WorkflowDashboard {...pickerConfig} />;
};

export default PickerDashboard;
