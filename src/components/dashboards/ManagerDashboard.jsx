import React from 'react';
import WorkflowDashboard from '../workflow/WorkflowDashboard';
import { 
  BarChart3,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const ManagerDashboard = () => {
  // Manager-specific configuration
  const managerConfig = {
    role: 'manager',
    title: 'Manager Dashboard',
    iconComponent: BarChart3,
    gradientColors: 'from-indigo-600 to-purple-700',
    themeColor: 'indigo',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: TrendingUp,
        includeLocalActive: false,
        actions: []
      },
      {
        id: 'active',
        label: 'Active Orders',
        icon: Activity,
        includeLocalActive: false,
        actions: [
          {
            id: 'reassign_order',
            label: 'Reassign',
            icon: Users,
            variant: 'secondary',
            primary: true,
            apiEndpoint: '/api/orders/reassign',
            successMessage: 'Order reassigned successfully',
            errorMessage: 'Failed to reassign order'
          }
        ]
      },
      {
        id: 'issues',
        label: 'Issues & Alerts',
        icon: AlertCircle,
        includeLocalActive: false,
        actions: [
          {
            id: 'resolve_issue',
            label: 'Resolve',
            icon: CheckCircle,
            variant: 'primary',
            primary: true,
            apiEndpoint: '/api/orders/resolve-issue',
            successMessage: 'Issue resolved',
            errorMessage: 'Failed to resolve issue'
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
      'overview': ['pending', 'processing', 'ready', 'picking', 'packing', 'shipping', 'shipped'], // All active orders
      'active': ['processing', 'ready', 'picking', 'packing', 'shipping'], // Orders in progress
      'issues': ['failed', 'cancelled', 'returned'], // Orders with issues
      'completed': ['delivered'] // Completed orders
    },
    workflowActions: {
      'reassign_order': {
        apiEndpoint: '/api/orders/reassign',
        method: 'POST',
        localTransition: {
          fromTab: 'active',
          toTab: 'active',
          newStatus: null // Status might not change, just assignment
        },
        successMessage: 'Order reassigned successfully',
        errorMessage: 'Failed to reassign order'
      },
      'resolve_issue': {
        apiEndpoint: '/api/orders/resolve-issue',
        method: 'POST',
        localTransition: {
          fromTab: 'issues',
          toTab: 'active',
          newStatus: 'processing'
        },
        successMessage: 'Issue resolved',
        errorMessage: 'Failed to resolve issue'
      }
    }
  };

  return <WorkflowDashboard {...managerConfig} />;
};

export default ManagerDashboard;
