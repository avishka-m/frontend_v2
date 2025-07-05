import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { 
  Truck,
  Package,
  Route,
  CheckCircle,
  ArrowRight,
  Navigation
} from 'lucide-react';

const DriverDashboard = () => {
  // Driver-specific configuration
  const driverConfig = {
    role: 'driver',
    title: 'Driver Dashboard',
    iconComponent: Truck,
    gradientColors: 'from-orange-500 to-red-600',
    themeColor: 'orange',
    tabs: [
      {
        id: 'ready',
        label: 'Ready for Delivery',
        icon: Package,
        includeLocalActive: false,
        actions: [
          {
            id: 'start_delivery',
            label: 'Start Delivery',
            icon: ArrowRight,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/start-delivery',
            successMessage: 'Delivery started successfully',
            errorMessage: 'Failed to start delivery'
          }
        ]
      },
      {
        id: 'delivery',
        label: 'Out for Delivery',
        icon: Route,
        includeLocalActive: true,
        actions: [
          {
            id: 'complete_delivery',
            label: 'Mark Delivered',
            icon: CheckCircle,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/complete-delivery',
            successMessage: 'Order delivered successfully',
            errorMessage: 'Failed to complete delivery'
          }
        ]
      },
      {
        id: 'history',
        label: 'Delivery History',
        icon: CheckCircle,
        includeLocalActive: false,
        actions: []
      }
    ],
    statusMapping: {
      'ready': ['shipping'], // Orders ready for pickup
      'delivery': ['shipped'], // Orders out for delivery
      'history': ['delivered'] // Completed deliveries
    },
    workflowActions: {
      'start_delivery': {
        apiEndpoint: '/api/orders/start-delivery',
        method: 'POST',
        localTransition: {
          fromTab: 'ready',
          toTab: 'delivery',
          newStatus: 'shipped'
        },
        successMessage: 'Delivery started successfully',
        errorMessage: 'Failed to start delivery'
      },
      'complete_delivery': {
        apiEndpoint: '/api/orders/complete-delivery',
        method: 'POST',
        localTransition: {
          fromTab: 'delivery',
          toTab: 'history',
          newStatus: 'delivered'
        },
        successMessage: 'Order delivered successfully',
        errorMessage: 'Failed to complete delivery'
      }
    }
  };

  return <WorkflowDashboard {...driverConfig} />;
};

export default DriverDashboard;
