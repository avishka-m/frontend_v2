import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useChatbot } from '../../../hooks/useChatbot';
import {
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import StatCard from './StatCard';
import QuickAction from './QuickAction';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { toggleChat } = useChatbot();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    // Fetch role-specific statistics
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats?role=${currentUser?.role}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error loading dashboard data. Please try again later.');
      }
    };

    if (currentUser?.role) {
      fetchStats();
    }
  }, [currentUser]);

  const getRoleSpecificStats = () => {
    switch (currentUser?.role) {
      case 'picker':
        return [
          { name: 'Orders Picked Today', value: stats?.ordersPickedToday || 0 },
          { name: 'Pick Rate', value: `${stats?.pickRate || 0} items/hour` },
          { name: 'Accuracy Rate', value: `${stats?.accuracyRate || 0}%` },
          { name: 'Pending Orders', value: stats?.pendingOrders || 0 }
        ];
      case 'packer':
        return [
          { name: 'Orders Packed Today', value: stats?.ordersPackedToday || 0 },
          { name: 'Packing Rate', value: `${stats?.packingRate || 0} orders/hour` },
          { name: 'Quality Score', value: `${stats?.qualityScore || 0}%` },
          { name: 'In Packing Queue', value: stats?.packingQueue || 0 }
        ];
      case 'driver':
        return [
          { name: 'Deliveries Today', value: stats?.deliveriesToday || 0 },
          { name: 'On-Time Rate', value: `${stats?.onTimeRate || 0}%` },
          { name: 'Route Efficiency', value: `${stats?.routeEfficiency || 0}%` },
          { name: 'Remaining Stops', value: stats?.remainingStops || 0 }
        ];
      case 'clerk':
        return [
          { name: 'Returns Processed', value: stats?.returnsProcessed || 0 },
          { name: 'Inventory Updates', value: stats?.inventoryUpdates || 0 },
          { name: 'Accuracy Rate', value: `${stats?.accuracyRate || 0}%` },
          { name: 'Pending Returns', value: stats?.pendingReturns || 0 }
        ];
      case 'admin':
      case 'manager':
        return [
          { name: 'Orders Today', value: stats?.totalOrdersToday || 0 },
          { name: 'Warehouse Efficiency', value: `${stats?.warehouseEfficiency || 0}%` },
          { name: 'Worker Attendance', value: `${stats?.workerAttendance || 0}%` },
          { name: 'Critical Inventory', value: stats?.lowStockItems || 0 }
        ];
      default:
        return [];
    }
  };

  // Role-specific quick actions
  const getQuickActions = () => {
    switch (currentUser?.role) {
      case 'clerk':
        return [
          {
            title: 'Add Inventory',
            icon: <CubeIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/inventory/add',
            color: 'primary'
          },
          {
            title: 'Process Return',
            icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/returns/new',
            color: 'info'
          },
          {
            title: 'Ask Assistant',
            icon: <ClockIcon className="h-6 w-6" />,
            onClick: toggleChat,
            color: 'secondary'
          }
        ];
      case 'picker':
        return [
          {
            title: 'Picking Tasks',
            icon: <CubeIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/picking',
            color: 'primary'
          },
          {
            title: 'Optimize Path',
            icon: <TruckIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/picking/path',
            color: 'success'
          },
          {
            title: 'Ask Assistant',
            icon: <ClockIcon className="h-6 w-6" />,
            onClick: toggleChat,
            color: 'secondary'
          }
        ];
      case 'packer':
        return [
          {
            title: 'Packing Tasks',
            icon: <ShoppingCartIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/packing',
            color: 'primary'
          },
          {
            title: 'Create Sub-Order',
            icon: <CubeIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/orders/sub',
            color: 'warning'
          },
          {
            title: 'Ask Assistant',
            icon: <ClockIcon className="h-6 w-6" />,
            onClick: toggleChat,
            color: 'secondary'
          }
        ];
      case 'driver':
        return [
          {
            title: 'Shipping Tasks',
            icon: <TruckIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/shipping',
            color: 'primary'
          },
          {
            title: 'Optimize Route',
            icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/shipping/route',
            color: 'success'
          },
          {
            title: 'Ask Assistant',
            icon: <ClockIcon className="h-6 w-6" />,
            onClick: toggleChat,
            color: 'secondary'
          }
        ];
      case 'manager':
      default:
        return [
          {
            title: 'View Analytics',
            icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/analytics',
            color: 'info'
          },
          {
            title: 'Check Anomalies',
            icon: <ExclamationTriangleIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/analytics/anomalies',
            color: 'warning'
          },
          {
            title: 'Manage Workers',
            icon: <UserGroupIcon className="h-6 w-6" />,
            onClick: () => window.location.href = '/workers',
            color: 'secondary'
          },
          {
            title: 'Ask Assistant',
            icon: <ClockIcon className="h-6 w-6" />,
            onClick: toggleChat,
            color: 'primary'
          }
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {currentUser?.username || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={toggleChat}
            className="btn btn-primary"
          >
            Ask Assistant
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getRoleSpecificStats().map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary-600">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getQuickActions().map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              icon={action.icon}
              onClick={action.onClick}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Role-specific links */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Common Tasks</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentUser?.role === 'picker' && (
            <>
              <Link to="/picking/new" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Start New Pick Task
              </Link>
              <Link to="/inventory/scan" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Scan Inventory
              </Link>
            </>
          )}
          {currentUser?.role === 'packer' && (
            <>
              <Link to="/packing/queue" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                View Packing Queue
              </Link>
              <Link to="/packing/materials" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Request Packing Materials
              </Link>
            </>
          )}
          {currentUser?.role === 'driver' && (
            <>
              <Link to="/deliveries/route" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                View Today's Route
              </Link>
              <Link to="/deliveries/schedule" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Check Schedule
              </Link>
            </>
          )}
          {currentUser?.role === 'clerk' && (
            <>
              <Link to="/inventory/count" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Start Inventory Count
              </Link>
              <Link to="/returns/process" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Process Returns
              </Link>
            </>
          )}
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <>
              <Link to="/analytics" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                View Analytics
              </Link>
              <Link to="/workers/schedule" className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Manage Schedules
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;