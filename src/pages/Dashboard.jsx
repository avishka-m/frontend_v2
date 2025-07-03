import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChatbot } from '../hooks/useChatbot';
import dashboardService from '../services/dashboardService';
import {
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Dashboard statistic card
const StatCard = ({ title, value, icon, color, change, to }) => {
  return (
    <Link to={to} className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
            {title}
          </h3>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {change !== null && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </Link>
  );
};

// Quick action button
const QuickAction = ({ title, icon, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow transition-shadow border border-gray-100 ${
        color ? `text-${color}-500` : 'text-gray-700'
      }`}
    >
      {icon}
      <span className="mt-2 text-sm font-medium text-center">{title}</span>
    </button>
  );
};

// Mock data for when API is unavailable
const getMockDashboardStats = (role) => {
  // Default mock data for all roles
  const mockData = {
    totalOrdersToday: 156,
    warehouseEfficiency: 93,
    workerAttendance: 98,
    lowStockItems: 12,
    
    // Picker stats
    ordersPickedToday: 42,
    pickRate: 65,
    accuracyRate: 99,
    pendingOrders: 15,
    
    // Packer stats
    ordersPackedToday: 38,
    packingRate: 22,
    qualityScore: 97,
    packingQueue: 5,
    
    // Driver stats
    deliveriesToday: 28,
    onTimeRate: 94,
    routeEfficiency: 88,
    remainingStops: 7,
    
    // Clerk stats
    returnsProcessed: 17,
    inventoryUpdates: 112,
    pendingReturns: 3
  };
  
  return mockData;
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { toggleChat } = useChatbot();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previousRole = useRef(currentUser?.role || null);
  const mockDataNotified = useRef(false);

  useEffect(() => {
    // Only fetch if the role has changed or is different from previous
    if (!currentUser?.role || 
        (previousRole.current === currentUser.role && stats !== null)) {
      return;
    }

    // Fetch role-specific statistics
    const fetchStats = async () => {
      // Skip if already loading
      if (isLoading) return;
      
      setIsLoading(true);
      try {
        // Check if we're in development environment
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
          // In development, attempt to fetch but fallback to mock data if it fails
          try {
            const data = await dashboardService.getDashboardStats(currentUser.role);
            setStats(data);
            setIsUsingMockData(false);
            mockDataNotified.current = false; // Reset notification flag when using real data
          } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            // Fallback to mock data
            if (!mockDataNotified.current) {
              console.log("Using mock dashboard data due to API error");
              mockDataNotified.current = true;
            }
            setStats(getMockDashboardStats(currentUser.role));
            setIsUsingMockData(true);
          }
        } else {
          // In production, always use the service and show error if it fails
          const data = await dashboardService.getDashboardStats(currentUser.role);
          setStats(data);
          setIsUsingMockData(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
        // Fallback to mock data in production too if the error is critical
        setStats(getMockDashboardStats(currentUser.role));
        setIsUsingMockData(true);
      } finally {
        setIsLoading(false);
        previousRole.current = currentUser.role;
      }
    };

    fetchStats();
  }, [currentUser?.role, isLoading]);

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
            icon: <ClockIcon className="h-6 w-6" />,
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
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Ask Assistant
          </button>
        </div>
      </div>

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

      {isUsingMockData && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">Using demo data. Connect to the backend server for live data.</p>
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

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
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

      {/* Recent Activities */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {currentUser?.role === 'picker' && (
              <>
                <ActivityItem 
                  title="Order #1234 picked"
                  time="2 minutes ago"
                  status="success"
                />
                <ActivityItem 
                  title="Started picking order #1235"
                  time="15 minutes ago"
                  status="in-progress"
                />
              </>
            )}
            {currentUser?.role === 'packer' && (
              <>
                <ActivityItem 
                  title="Order #1230 packed and ready"
                  time="5 minutes ago"
                  status="success"
                />
                <ActivityItem 
                  title="Quality check completed for #1229"
                  time="20 minutes ago"
                  status="success"
                />
              </>
            )}
            {currentUser?.role === 'driver' && (
              <>
                <ActivityItem 
                  title="Delivered order #1225"
                  time="10 minutes ago"
                  status="success"
                />
                <ActivityItem 
                  title="Started delivery route #5"
                  time="1 hour ago"
                  status="in-progress"
                />
              </>
            )}
            {currentUser?.role === 'clerk' && (
              <>
                <ActivityItem 
                  title="Processed return #445"
                  time="15 minutes ago"
                  status="success"
                />
                <ActivityItem 
                  title="Updated inventory count for Zone A"
                  time="45 minutes ago"
                  status="success"
                />
              </>
            )}
            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <>
                <ActivityItem 
                  title="Generated monthly performance report"
                  time="30 minutes ago"
                  status="success"
                />
                <ActivityItem 
                  title="Updated worker schedules for next week"
                  time="2 hours ago"
                  status="success"
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ title, time, status }) {
  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-medium text-primary-600">{title}</p>
        <div className="ml-2 flex flex-shrink-0">
          <p className="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
             style={{
               backgroundColor: status === 'success' ? '#DEF7EC' : '#FDF6B2',
               color: status === 'success' ? '#03543F' : '#723B13'
             }}
          >
            {status === 'success' ? 'Completed' : 'In Progress'}
          </p>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            {time}
          </p>
        </div>
      </div>
    </li>
  );
}

export default Dashboard;