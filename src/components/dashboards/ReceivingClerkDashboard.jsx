import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
  Eye,
  History,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Truck,
  CheckSquare,
  XCircle,
  PlayCircle,
  Bell,
  Settings,
  Package2,
  ListChecks
} from 'lucide-react';
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
      
      // Get orders that are relevant to receiving clerk (pending, confirmed)
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
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchProcessedOrders = async () => {
    try {
      // Get orders that were processed by this receiving clerk
      const result = await roleBasedService.getProcessedOrdersByWorker(currentUser.id, 'receiving');
      
      if (result.success) {
        setProcessedOrders(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch processed orders');
      }
    } catch (error) {
      toast.error('Failed to fetch processed orders');
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const handleStartReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const result = await roleBasedService.updateOrderStatus(orderId, 'receiving');
      if (result.success) {
        toast.success('Order receiving started');
        addNotification({
          type: 'success',
          message: `Started receiving order #${orderId}`
        });
        fetchActiveOrders();
      } else {
        toast.error(result.error || 'Failed to start receiving');
      }
    } catch (error) {
      toast.error('Failed to start receiving');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompleteReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const result = await roleBasedService.updateOrderStatus(orderId, 'picking');
      if (result.success) {
        toast.success('Order receiving completed - moved to picking stage');
        addNotification({
          type: 'success',
          message: `Completed receiving order #${orderId}`
        });
        fetchActiveOrders();
      } else {
        toast.error(result.error || 'Failed to complete receiving');
      }
    } catch (error) {
      toast.error('Failed to complete receiving');
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
    if (!autoRefresh) {
      addNotification({
        type: 'info',
        message: 'Auto-refresh enabled'
      });
    } else {
      addNotification({
        type: 'info',
        message: 'Auto-refresh disabled'
      });
    }
  };

  const filteredOrders = activeOrders.filter(order => 
    order.orderID.toString().includes(searchTerm) ||
    order.customerID.toString().includes(searchTerm) ||
    order.items.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'receiving': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Normal';
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.order_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.order_status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Receiving</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.order_status === 'receiving').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredOrders.filter(o => o.priority === 1).length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                <div key={order.orderID} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Package2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Order #{order.orderID}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customerID} | Items: {order.items?.length || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(order.priority)}`}>
                        {getPriorityLabel(order.priority)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    {!showHistory && (
                      <>
                        {order.order_status === 'pending' || order.order_status === 'confirmed' ? (
                          <button
                            onClick={() => handleStartReceiving(order.orderID)}
                            disabled={processingOrder === order.orderID}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <PlayCircle className="h-4 w-4" />
                            <span>Start Receiving</span>
                          </button>
                        ) : order.order_status === 'receiving' ? (
                          <button
                            onClick={() => handleCompleteReceiving(order.orderID)}
                            disabled={processingOrder === order.orderID}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckSquare className="h-4 w-4" />
                            <span>Complete Receiving</span>
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          </div>
          
          {selectedOrder ? (
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Order #{selectedOrder.orderID}</h4>
                <p className="text-sm text-gray-600">Customer ID: {selectedOrder.customerID}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(selectedOrder.order_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ${selectedOrder.total_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(selectedOrder.priority)}`}>
                  {getPriorityLabel(selectedOrder.priority)}
                </span>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Items to Receive:</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Item #{item.itemID}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.name || 'Product name not available'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs text-gray-600">
                          ${(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.shipping_address && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Shipping Address:</h5>
                  <p className="text-sm text-gray-600">{selectedOrder.shipping_address}</p>
                </div>
              )}
              
              {selectedOrder.notes && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Notes:</h5>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivingClerkDashboard;
