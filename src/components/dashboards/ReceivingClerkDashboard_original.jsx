import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import ConnectionStatus from '../common/ConnectionStatus';
import UpdateIndicator from '../common/UpdateIndicator';
import { 
  User,
  Package,
  CheckCircle,
  ArrowRight,
  History,
  Search,
  Eye,
  Clock,
  DollarSign,
  X,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  Activity,
  Users,
  ShoppingCart,
  Filter,
  Download,
  BarChart3,
  Zap,
  Award,
  Target,
  Truck,
  Box,
  CheckSquare,
  Archive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const ReceivingClerkDashboard = () => {
  const { currentUser } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [receivingOrders, setReceivingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'receiving', 'completed'
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [workflowAnimation, setWorkflowAnimation] = useState(null);
  
  // Local state to track orders being received without status change
  const [localReceivingOrders, setLocalReceivingOrders] = useState([]);

  // Define fetchOrders function first
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all orders and filter by receiving-related statuses
      const result = await orderService.getOrders();
      
      if (result && Array.isArray(result)) {
        // Group orders by status relevant to receiving workflow
        const pending = result.filter(order => 
          order.order_status === 'confirmed' // Orders ready to be received
        );
        const receiving = result.filter(order => 
          order.order_status === 'receiving' // Orders with actual receiving status
        );
        const completed = result.filter(order => 
          order.order_status === 'picking' || 
          order.order_status === 'picked' ||
          order.order_status === 'packing' ||
          order.order_status === 'shipping' ||
          order.order_status === 'shipped' ||
          order.order_status === 'delivered'
        );

        setPendingOrders(pending);
        setReceivingOrders(receiving);
        setCompletedOrders(completed);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle WebSocket messages with improved UX
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Received WebSocket message:', message);
    
    if (message.type === 'order_update') {
      const { order_id, order_status, order_data } = message.data;
      
      // Show subtle update indicator
      setIsUpdating(true);
      setUpdateMessage(`Order #${order_id} updated`);
      
      // Smart state updates - only update if relevant to receiving workflow
      const isRelevantUpdate = ['confirmed', 'receiving', 'picking', 'picked', 'packing', 'shipping', 'shipped', 'delivered'].includes(order_status);
      
      if (isRelevantUpdate && order_data) {
        // Remove order from all lists first
        setPendingOrders(prev => prev.filter(order => order.orderID !== order_id));
        setReceivingOrders(prev => prev.filter(order => order.orderID !== order_id));
        setCompletedOrders(prev => prev.filter(order => order.orderID !== order_id));
        setLocalReceivingOrders(prev => prev.filter(order => order.orderID !== order_id));
        
        // Add updated order to appropriate list
        const updatedOrder = { ...order_data, order_status };
        
        if (order_status === 'confirmed') {
          setPendingOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'receiving') {
          setReceivingOrders(prev => [...prev, updatedOrder]);
        } else if (['picking', 'picked', 'packing', 'shipping', 'shipped', 'delivered'].includes(order_status)) {
          setCompletedOrders(prev => [...prev, updatedOrder]);
        }
        
        // Show success notification for relevant updates
        toast.success(`Order #${order_id} moved to ${order_status}`);
      }
      
      // Hide update indicator after 2 seconds
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateMessage('');
      }, 2000);
    }
  }, []);

  // WebSocket connection for real-time updates
  const { 
    connectionStatus, 
    lastMessage, 
    connectionError, 
    isConnected 
  } = useWebSocket({
    autoConnect: true,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('WebSocket connected for receiving clerk dashboard');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  useEffect(() => {
    // Initial fetch
    fetchOrders();
    
    // No need for setInterval polling anymore - WebSocket handles real-time updates
  }, [fetchOrders]);

  const handleStartReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      // Find the order in pending orders
      const order = pendingOrders.find(o => o.orderID === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }
      
      // Show workflow animation
      setWorkflowAnimation('starting');
      
      // Move order to local receiving orders WITHOUT changing status
      setLocalReceivingOrders(prev => [...prev, order]);
      setPendingOrders(prev => prev.filter(o => o.orderID !== orderId));
      
      // Switch to receiving tab with animation
      setTimeout(() => {
        setActiveTab('receiving');
        setWorkflowAnimation('receiving');
      }, 300);
      
      // Clear animation after transition
      setTimeout(() => {
        setWorkflowAnimation(null);
      }, 1000);
      
      toast.success('📦 Order moved to receiving queue');
    } catch (error) {
      console.error('Error starting receiving:', error);
      toast.error('Failed to start receiving');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompleteReceiving = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      // Show workflow animation
      setWorkflowAnimation('completing');
      
      // Actually change the status to picking
      const result = await orderService.updateOrderStatus(orderId, 'picking');
      
      if (result) {
        // Remove from local receiving orders
        setLocalReceivingOrders(prev => prev.filter(o => o.orderID !== orderId));
        setReceivingOrders(prev => prev.filter(o => o.orderID !== orderId));
        
        // Switch to completed tab with animation
        setTimeout(() => {
          setActiveTab('completed');
          setWorkflowAnimation('completed');
        }, 300);
        
        // Clear animation after transition
        setTimeout(() => {
          setWorkflowAnimation(null);
        }, 1000);
        
        toast.success('✅ Order receiving completed - moved to picking stage');
        
        // Refresh orders to get updated data
        await fetchOrders();
      } else {
        toast.error('Failed to complete receiving');
      }
    } catch (error) {
      console.error('Error completing receiving:', error);
      toast.error('Failed to complete receiving');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'receiving':
        // Combine actual receiving orders with local receiving orders
        return [...receivingOrders, ...localReceivingOrders];
      case 'completed':
        return completedOrders;
      default:
        return [];
    }
  };

  const filteredOrders = getCurrentOrders().filter(order => 
    order.order_id?.toString().includes(searchTerm) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items?.some(item => 
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Deliveries';
      case 'receiving':
        return 'Currently Receiving';
      case 'completed':
        return 'Completed Receiving';
      default:
        return 'Orders';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'pending':
        return `${pendingOrders.length} orders ready to start receiving`;
      case 'receiving':
        return `${receivingOrders.length + localReceivingOrders.length} orders currently being received`;
      case 'completed':
        return `${completedOrders.length} orders completed and moved to next stages`;
      default:
        return '';
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receiving Clerk Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.username || 'Receiving Clerk'}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">
                    {isConnected ? 'Real-time updates active' : 'Offline mode'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Archive className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-gray-600">
                    {receivingOrders.length + localReceivingOrders.length} active receiving
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-gray-600">
                    {completedOrders.length} completed today
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Status and Update Indicator */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <ConnectionStatus 
              isConnected={isConnected} 
              connectionStatus={connectionStatus}
              connectionError={connectionError}
            />
            <UpdateIndicator 
              isUpdating={isUpdating}
              message={updateMessage}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Ready to start</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Today</div>
              <div className="text-sm font-medium text-blue-600">
                {pendingOrders.length > 0 ? 'Action needed' : 'All clear'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Receiving</p>
                <p className="text-2xl font-semibold text-gray-900">{receivingOrders.length + localReceivingOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Active</div>
              <div className="text-sm font-medium text-yellow-600">
                {(receivingOrders.length + localReceivingOrders.length) > 0 ? 'Processing' : 'None active'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">{completedOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Moved to next stage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Success</div>
              <div className="text-sm font-medium text-green-600">
                {completedOrders.length > 0 ? `${completedOrders.length} done` : 'None yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress Indicator */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Receiving Workflow Progress</h3>
          <div className="text-sm text-gray-600">
            {workflowAnimation && (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="capitalize">{workflowAnimation}...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pendingOrders.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <Truck className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Pending Deliveries</p>
                <p className="text-xs text-gray-500">{pendingOrders.length} waiting</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (receivingOrders.length + localReceivingOrders.length) > 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <Activity className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Currently Receiving</p>
                <p className="text-xs text-gray-500">{receivingOrders.length + localReceivingOrders.length} in progress</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completedOrders.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Completed</p>
                <p className="text-xs text-gray-500">{completedOrders.length} done today</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Daily Progress</span>
            <span>{Math.round((completedOrders.length / Math.max(pendingOrders.length + receivingOrders.length + localReceivingOrders.length + completedOrders.length, 1)) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((completedOrders.length / Math.max(pendingOrders.length + receivingOrders.length + localReceivingOrders.length + completedOrders.length, 1)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${workflowAnimation === 'starting' ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Pending Deliveries</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  activeTab === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pendingOrders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('receiving')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'receiving'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${workflowAnimation === 'receiving' ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Currently Receiving</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  activeTab === 'receiving' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {receivingOrders.length + localReceivingOrders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${workflowAnimation === 'completed' ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Completed</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  activeTab === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {completedOrders.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tab Content Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{getTabTitle()}</h3>
              <p className="text-sm text-gray-600">{getTabDescription()}</p>
            </div>
            {activeTab === 'completed' && (
              <button
                onClick={fetchOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh completed orders to get latest details"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No orders found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'No orders match the current filter'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderRow
                key={order.order_id}
                order={order}
                activeTab={activeTab}
                onViewDetails={handleViewOrderDetails}
                onStartReceiving={handleStartReceiving}
                onCompleteReceiving={handleCompleteReceiving}
                processingOrder={processingOrder}
              />
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

// Order Row Component
const OrderRow = ({ 
  order, 
  activeTab, 
  onViewDetails, 
  onStartReceiving, 
  onCompleteReceiving, 
  processingOrder 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'receiving': return 'bg-yellow-100 text-yellow-800';
      case 'picking': return 'bg-purple-100 text-purple-800';
      case 'packing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = parseFloat(item.price || item.unit_price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${
            activeTab === 'pending' ? 'bg-blue-100' : 
            activeTab === 'receiving' ? 'bg-yellow-100' : 
            'bg-green-100'
          }`}>
            <Package className={`h-5 w-5 ${
              activeTab === 'pending' ? 'text-blue-600' : 
              activeTab === 'receiving' ? 'text-yellow-600' : 
              'text-green-600'
            }`} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Order #{order.order_id}
            </h4>
            <p className="text-sm text-gray-600">
              <Users className="h-3 w-3 inline mr-1" />
              {order.customer_name || order.customer_id}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Box className="h-3 w-3" />
                <span>{order.items?.length || 0} items</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>${calculateOrderTotal(order.items).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Order Items Preview */}
            {order.items && order.items.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-medium">Items:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {order.items.slice(0, 3).map((item, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {item.item_name || item.name || item.productName || `Item ${index + 1}`} (x{item.quantity || 1})
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-full">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
              {order.order_status}
            </span>
            <div className="mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
                <Star className="h-3 w-3 inline mr-1" />
                {getPriorityLabel(order.priority)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails(order)}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
            
            {activeTab === 'pending' && (
              <button
                onClick={() => onStartReceiving(order.order_id)}
                disabled={processingOrder === order.order_id}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {processingOrder === order.order_id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span>Start Receiving</span>
              </button>
            )}
            
            {activeTab === 'receiving' && (
              <button
                onClick={() => onCompleteReceiving(order.order_id)}
                disabled={processingOrder === order.order_id}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {processingOrder === order.order_id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Complete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = parseFloat(item.price || item.unit_price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.order_id} Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-80">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer</p>
              <p className="text-lg text-gray-900">{order.customer_name || order.customer_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Order Date</p>
              <p className="text-lg text-gray-900">
                {new Date(order.order_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {order.order_status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Priority</p>
              <span className="inline-block px-2 py-1 text-sm rounded-full bg-orange-100 text-orange-800">
                {order.priority === 1 ? 'High' : order.priority === 2 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>

          {order.shipping_address && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Shipping Address</p>
              <p className="text-gray-900">{order.shipping_address}</p>
            </div>
          )}

          {order.notes && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Order Items</p>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.item_name || item.name || item.productName || `Item ${index + 1}`}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity || 1}
                      </p>
                      <p className="font-medium text-gray-900">
                        ${(parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${calculateOrderTotal(order.items).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No items found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivingClerkDashboard;
