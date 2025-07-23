import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import { inventoryService } from '../../services/inventoryService';
import receivingService from '../../services/receivingService';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Truck,
  ArrowLeftRight,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Archive,
  ClipboardCheck,
  RotateCcw,
  Activity,
  MessageCircle
} from 'lucide-react';

const ROLE_NAVIGATION = {
  Manager: [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/chatbot/enhanced', name: 'AI Assistant', icon: MessageCircle },
    { path: '/workflow', name: 'Workflow', icon: Activity },
    { path: '/inventory', name: 'Inventory', icon: Package },
    { path: '/orders', name: 'Orders', icon: ShoppingCart },
    { path: '/customers', name: 'Customers', icon: Store },
    { path: '/workers', name: 'Workers', icon: Users },
    // { path: '/locations', name: 'Locations', icon: MapPin },
    { path: '/receiving', name: 'Receiving', icon: ArrowLeftRight },
    { path: '/picking', name: 'Picking', icon: ClipboardCheck },
    { path: '/packing', name: 'Packing', icon: Archive },
    { path: '/shipping', name: 'Shipping', icon: Truck },
    { path: '/returns', name: 'Returns', icon: RotateCcw },
    { path: '/vehicles', name: 'Vehicles', icon: Truck },
    // { path: '/analytics', name: 'Analytics', icon: BarChart3 },
    { path: '/seasonal-inventory', name: 'Seasonal Forecasting', icon: BarChart3 }
    // { path: '/seasonal-inventory/demo', name: 'Forecasting Demo', icon: BarChart3 },
    // { path: '/settings', name: 'Settings', icon: Settings }
  ],
  ReceivingClerk: [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/inventory/update', name: 'Update Inventory', icon: Package },
    { path: '/receiving/return-item', name: 'Return Item', icon: RotateCcw },
    { path: '/returns', name: 'Returns Management', icon: RotateCcw },
    { path: '/inventory', name: 'Inventory', icon: Archive },
    { path: '/chatbot/enhanced', name: 'AI Assistant', icon: MessageCircle }
  ],
  Picker: [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/history', name: 'History', icon: ClipboardCheck },
    { path: '/warehouse-map', name: 'Warehouse Map', icon: MapPin },
    { path: '/chatbot/enhanced', name: 'AI Assistant', icon: MessageCircle }
  ],
  Packer: [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/chatbot/enhanced', name: 'AI Assistant', icon: MessageCircle },
    { path: '/workflow', name: 'Workflow', icon: Activity },
    { path: '/packing', name: 'Packing Tasks', icon: Archive },
    { path: '/orders', name: 'Orders', icon: ShoppingCart }
  ],
  Driver: [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/chatbot/enhanced', name: 'AI Assistant', icon: MessageCircle },
    { path: '/workflow', name: 'Workflow', icon: Activity },
    { path: '/shipping', name: 'Shipping', icon: Truck },
    { path: '/vehicles', name: 'Vehicles', icon: Truck }
  ]
};

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();

  // Prefetch logic for sidebar links
  const handlePrefetch = (path) => {
    if (path === '/orders') {
      queryClient.prefetchQuery({
        queryKey: ['orders', { statusFilter: '' }],
        queryFn: () => orderService.getOrders({ limit: 100 })
      });
    } else if (path === '/inventory') {
      queryClient.prefetchQuery({
        queryKey: ['inventory', { searchTerm: '', selectedCategory: 'All', selectedStatus: 'All', page: 1, limit: 50, sortKey: 'name', sortDir: 'asc' }],
        queryFn: () => inventoryService.getInventory({ page: 1, limit: 50, sort_by: 'name', sort_order: 'asc' })
      });
    } else if (path === '/receiving') {
      queryClient.prefetchQuery({
        queryKey: ['receivings', { statusFilter: '' }],
        queryFn: () => receivingService.getAllReceivings({})
      });
    }
  };

  // Get navigation items based on user role
  const navItems = currentUser?.role ? ROLE_NAVIGATION[currentUser.role] || [] : [];

  return (
    <aside className={`bg-white shadow-md h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center">
              <span className="text-xl font-semibold text-primary-600">WMS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="px-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center py-2 px-4 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onMouseEnter={() => handlePrefetch(item.path)}
                  >
                    <span className="mr-3"><Icon className="w-6 h-6" /></span>
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info - only visible when not collapsed */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {currentUser?.firstName?.charAt(0).toUpperCase() || currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {currentUser?.fullName || currentUser?.firstName || currentUser?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role?.replace(/([A-Z])/g, ' $1').trim() || 'User'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;