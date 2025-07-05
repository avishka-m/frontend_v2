import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  User,
  RefreshCw,
  History,
  Search,
  Bell,
  Clock,
  CheckCircle,
  Package,
  AlertCircle
} from 'lucide-react';
import OrderCard from '../receiving/OrderCard';
import OrderDetails from '../receiving/OrderDetails';
import OrderStats from '../receiving/OrderStats';
import roleBasedService from '../../services/roleBasedService';
import { toast } from 'react-hot-toast';

const ReceivingClerkDashboard = () => {
  const { currentUser } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [processedOrders, setProcessedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const refreshIntervalRef = useRef(null);

  // Real-time updates
  useEffect(() => {
    fetchActiveOrders();
    
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchActiveOrders(true); // Silent refresh
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchActiveOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const result = await roleBasedService.getOrdersForReceivingClerk();
      
      if (result.success) {
        const previousCount = activeOrders.length;
        setActiveOrders(result.data);
        
        // Show notification for new orders
        if (silent && result.data.length > previousCount) {
          addNotification({
            type: 'info',
            message: `${result.data.length - previousCount} new order(s) received`
          });
        }
        
        setLastUpdate(new Date());
      } else {
        if (!silent) toast.error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      if (!silent) toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchProcessedOrders = async () => {
    try {
      const result = await roleBasedService.getProcessedOrdersByWorker(currentUser?.id, 'receiving');
      
      if (result.success) {
        setProcessedOrders(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch processed orders');
      }
    } catch (error) {
      toast.error('Failed to fetch processed orders');
      console.error('Error fetching processed orders:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const handleStartReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      console.log('Starting receiving for order:', orderId);
      
      const result = await roleBasedService.updateOrderStatus(orderId, 'receiving');
      console.log('Update result:', result);
      
      if (result.success) {
        toast.success('Order receiving started');
        addNotification({
          type: 'success',
          message: `Started receiving order #${orderId}`
        });
        await fetchActiveOrders(); // Refresh the orders list
      } else {
        toast.error(result.error || 'Failed to start receiving');
        console.error('Failed to start receiving:', result.error);
      }
    } catch (error) {
      toast.error('Failed to start receiving');
      console.error('Error starting receiving:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompleteReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      console.log('Completing receiving for order:', orderId);
      
      const result = await roleBasedService.updateOrderStatus(orderId, 'picking');
      console.log('Update result:', result);
      
      if (result.success) {
        toast.success('Order receiving completed - moved to picking stage');
        addNotification({
          type: 'success',
          message: `Completed receiving order #${orderId}`
        });
        await fetchActiveOrders(); // Refresh the orders list
      } else {
        toast.error(result.error || 'Failed to complete receiving');
        console.error('Failed to complete receiving:', result.error);
      }
    } catch (error) {
      toast.error('Failed to complete receiving');
      console.error('Error completing receiving:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      fetchProcessedOrders();
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    addNotification({
      type: 'info',
      message: autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled'
    });
  };

  const filteredOrders = activeOrders.filter(order => 
    order.orderID?.toString().includes(searchTerm) ||
    order.customerID?.toString().includes(searchTerm) ||
    order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading receiving dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Profile and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receiving Dashboard</h1>
              <p className="text-gray-600">Welcome, {currentUser?.username || 'Receiving Clerk'}</p>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                autoRefresh 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
            </button>
            
            <button
              onClick={handleToggleHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100"
            >
              <History className="h-4 w-4" />
              <span>{showHistory ? 'Hide History' : 'Show History'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span className="flex-1">{notification.message}</span>
              <span className="text-xs opacity-75">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => fetchActiveOrders()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <OrderStats orders={filteredOrders} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {showHistory ? 'Processed Orders History' : 'Active Orders for Receiving'}
              </h2>
              <p className="text-sm text-gray-600">
                {showHistory ? 
                  `${processedOrders.length} orders processed by you` : 
                  `${filteredOrders.length} orders ready for receiving`
                }
              </p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {(showHistory ? processedOrders : filteredOrders).map((order) => (
                <OrderCard
                  key={order.orderID}
                  order={order}
                  onViewDetails={handleViewOrderDetails}
                  onStartReceiving={handleStartReceiving}
                  onCompleteReceiving={handleCompleteReceiving}
                  processingOrder={processingOrder}
                  showHistory={showHistory}
                />
              ))}
              
              {(showHistory ? processedOrders : filteredOrders).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>
                    {showHistory ? 'No processed orders found' : 'No orders ready for receiving'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
        />
      </div>
    </div>
  );
};

export default ReceivingClerkDashboard;
