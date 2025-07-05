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
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Truck,
  X,
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
  DollarSign,
  Navigation,
  Route,
  Home,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  const [readyOrders, setReadyOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('ready'); // 'ready', 'delivery', 'history'
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Local state to track orders out for delivery without status change
  const [localDeliveryOrders, setLocalDeliveryOrders] = useState([]);

  // Fetch orders and organize by status
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all orders and filter by shipping-related statuses
      const orders = await orderService.getOrders();
      
      if (orders && Array.isArray(orders)) {
        // Group orders by status relevant to shipping/delivery
        const ready = orders.filter(order => 
          order.order_status === 'shipping' // Only show shipping orders ready for delivery
        );
        const delivery = orders.filter(order => 
          order.order_status === 'shipped' // Orders with actual shipped status (out for delivery)
        );
        const history = orders.filter(order => 
          order.order_status === 'delivered' // Completed deliveries
        );

        setReadyOrders(ready);
        setDeliveryOrders(delivery);
        setHistoryOrders(history);
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
      
      // Smart state updates - only update if relevant to shipping workflow
      const isRelevantUpdate = ['shipping', 'shipped', 'delivered'].includes(order_status);
      
      if (isRelevantUpdate && order_data) {
        // Remove order from all lists first
        setReadyOrders(prev => prev.filter(order => order.orderID !== order_id));
        setDeliveryOrders(prev => prev.filter(order => order.orderID !== order_id));
        setHistoryOrders(prev => prev.filter(order => order.orderID !== order_id));
        setLocalDeliveryOrders(prev => prev.filter(order => order.orderID !== order_id));
        
        // Add updated order to appropriate list
        const updatedOrder = { ...order_data, order_status };
        
        if (order_status === 'shipping') {
          setReadyOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'shipped') {
          setDeliveryOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'delivered') {
          setHistoryOrders(prev => [...prev, updatedOrder]);
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
      console.log('WebSocket connected for driver dashboard');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStartDelivery = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      // Find the order in ready orders
      const order = readyOrders.find(o => o.orderID === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }
      
      // Move order to local delivery orders WITHOUT changing status
      setLocalDeliveryOrders(prev => [...prev, order]);
      setReadyOrders(prev => prev.filter(o => o.orderID !== orderId));
      
      // Switch to delivery tab
      setActiveTab('delivery');
      
      toast.success('Order added to delivery route');
    } catch (error) {
      console.error('Error starting delivery:', error);
      toast.error('Failed to start delivery');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      // Actually change the status to delivered
      const result = await orderService.updateOrderStatus(orderId, 'delivered');
      
      if (result) {
        // Remove from local delivery orders
        setLocalDeliveryOrders(prev => prev.filter(o => o.orderID !== orderId));
        setDeliveryOrders(prev => prev.filter(o => o.orderID !== orderId));
        
        // Switch to history tab
        setActiveTab('history');
        
        toast.success('Order delivered successfully!');
        
        // Refresh orders to get updated data
        await fetchOrders();
      } else {
        toast.error('Failed to complete delivery');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'ready':
        return readyOrders;
      case 'delivery':
        // Combine actual shipped orders with local delivery orders
        return [...deliveryOrders, ...localDeliveryOrders];
      case 'history':
        return historyOrders;
      default:
        return [];
    }
  };

  const filteredOrders = getCurrentOrders().filter(order => 
    order.order_id?.toString().includes(searchTerm) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items?.some(item => 
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'ready':
        return 'Ready to Ship';
      case 'delivery':
        return 'Out for Delivery';
      case 'history':
        return 'Delivery History';
      default:
        return 'Orders';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'ready':
        return `${readyOrders.length} orders ready for delivery`;
      case 'delivery':
        return `${deliveryOrders.length + localDeliveryOrders.length} orders out for delivery`;
      case 'history':
        return `${historyOrders.length} completed deliveries`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading driver dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome, {currentUser?.username || 'Driver'}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">
                    {isConnected ? 'Real-time updates active' : 'Offline mode'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Route className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-gray-600">
                    {deliveryOrders.length + localDeliveryOrders.length} active deliveries
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {readyOrders.length + deliveryOrders.length + localDeliveryOrders.length}
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {historyOrders.length}
              </div>
              <div className="text-sm text-gray-600">Delivered Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'ready', label: 'Ready to Ship', icon: Package, count: readyOrders.length },
              { id: 'delivery', label: 'Out for Delivery', icon: Truck, count: deliveryOrders.length + localDeliveryOrders.length },
              { id: 'history', label: 'Delivered', icon: CheckCircle, count: historyOrders.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getTabTitle()}</h2>
              <p className="text-gray-600 mt-1">{getTabDescription()}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {activeTab === 'delivery' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Navigation className="h-4 w-4" />
                  <span>Optimize Route</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No orders found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search criteria.' : `No orders in ${getTabTitle().toLowerCase()} status.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <DriverOrderRow
                key={order.orderID}
                order={order}
                activeTab={activeTab}
                onViewDetails={handleViewOrderDetails}
                onStartDelivery={handleStartDelivery}
                onCompleteDelivery={handleCompleteDelivery}
                processingOrder={processingOrder}
              />
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <DeliveryOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      
      {/* Connection Status and Update Indicators */}
      <ConnectionStatus 
        connectionStatus={connectionStatus}
        isConnected={isConnected}
        connectionError={connectionError}
      />
      <UpdateIndicator 
        isUpdating={isUpdating}
        message={updateMessage}
      />
    </div>
  );
};

// Driver Order Row Component
const DriverOrderRow = ({ order, activeTab, onViewDetails, onStartDelivery, onCompleteDelivery, processingOrder }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'shipping': { color: 'bg-purple-100 text-purple-800', label: 'Ready to Ship' },
      'shipped': { color: 'bg-blue-100 text-blue-800', label: 'Out for Delivery' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      1: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      2: { color: 'bg-yellow-100 text-yellow-800', label: 'Standard' },
      3: { color: 'bg-green-100 text-green-800', label: 'Economy' },
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: 'Standard' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getDistanceEstimate = (address) => {
    // Mock distance calculation - in real app, use Google Maps API
    const distances = ['0.5 mi', '1.2 mi', '2.1 mi', '3.4 mi', '5.2 mi'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  const isProcessing = processingOrder === order.orderID;

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.order_id || order.orderID}
              </h3>
              {getStatusBadge(order.order_status)}
              {getPriorityBadge(order.priority)}
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{order.customer_name || `Customer ${order.customerID}`}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>{order.items?.length || 0} items</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>${order.total_amount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {order.shipping_address || 'Address not available'}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-blue-600 font-medium">
                {getDistanceEstimate(order.shipping_address)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onViewDetails(order)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {/* Navigation button for delivery orders */}
          {activeTab === 'delivery' && (
            <button
              onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(order.shipping_address || '')}`, '_blank')}
              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
              title="Navigate"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
          
          {activeTab === 'ready' && (
            <button
              onClick={() => onStartDelivery(order.orderID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  <span>Start Delivery</span>
                </>
              )}
            </button>
          )}
          
          {activeTab === 'delivery' && (
            <button
              onClick={() => onCompleteDelivery(order.orderID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Delivering...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Delivered</span>
                </>
              )}
            </button>
          )}
          
          {activeTab === 'history' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Delivered</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Items Summary */}
      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Delivery Items</h4>
            <span className="text-sm text-gray-500">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded px-3 py-2">
                <span className="text-gray-700 truncate">
                  {item.item_name || `Item ${item.itemID}`}
                </span>
                <span className="font-medium text-gray-900 ml-2">
                  ×{item.quantity}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded px-3 py-2">
                <span>+{order.items.length - 3} more items</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Delivery Order Details Modal Component
const DeliveryOrderDetailsModal = ({ order, onClose }) => {
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
            Delivery Order #{order.order_id || order.orderID}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
              <p className="text-gray-900">{order.customer_name || `Customer ${order.customerID}`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {order.order_status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
              <p className="text-gray-900">{new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Priority</p>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Priority {order.priority}
              </span>
            </div>
          </div>

          {/* Delivery Address - Primary focus for drivers */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Delivery Address</p>
              <button
                onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(order.shipping_address || '')}`, '_blank')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
              >
                <Navigation className="h-3 w-3" />
                <span>Navigate</span>
              </button>
            </div>
            <p className="text-blue-900 font-medium">{order.shipping_address || 'Address not available'}</p>
          </div>

          {/* Customer Contact Info */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-gray-900">{order.customer_phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{order.customer_email || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {order.delivery_notes && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Delivery Notes</p>
              <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">{order.delivery_notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Items to Deliver</p>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.item_name || `Item ${item.itemID}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${(item.price || item.unit_price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.price || item.unit_price || 0) * item.quantity).toFixed(2)}
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

export default DriverDashboard;
