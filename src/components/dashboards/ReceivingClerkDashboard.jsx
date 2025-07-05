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
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const ReceivingClerkDashboard = () => {
  const { currentUser } = useAuth();
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [receivingOrders, setReceivingOrders] = useState([]);
  const [processedOrders, setProcessedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('confirmed'); // 'confirmed', 'receiving', 'history'
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Define fetchOrders function first
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all orders and filter by status
      const result = await orderService.getOrders();
      
      if (result && Array.isArray(result)) {
        // Filter orders by status
        const confirmed = result.filter(order => order.order_status === 'confirmed');
        const receiving = result.filter(order => order.order_status === 'receiving');
        const processed = result.filter(order => 
          order.order_status === 'picking' || 
          order.order_status === 'picking_in_progress' ||
          order.order_status === 'packing' ||
          order.order_status === 'shipped' ||
          order.order_status === 'delivered'
        );

        setConfirmedOrders(confirmed);
        setReceivingOrders(receiving);
        setProcessedOrders(processed);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Received WebSocket message:', message);
    
    if (message.type === 'order_update') {
      const { order_id, order_status, order_data } = message.data;
      
      // Show update indicator
      setIsUpdating(true);
      setUpdateMessage(`Order #${order_id} updated`);
      
      // Update the specific order in state without full refresh
      const updateOrderInState = (orders) => {
        return orders.map(order => {
          if (order.orderID === order_id) {
            return { ...order, order_status, ...order_data };
          }
          return order;
        });
      };
      
      // Update all order states
      setConfirmedOrders(prev => updateOrderInState(prev));
      setReceivingOrders(prev => updateOrderInState(prev));
      setProcessedOrders(prev => updateOrderInState(prev));
      
      // If the order moved to a different status, we need to reorganize
      if (order_data) {
        // Remove the order from all lists first
        setConfirmedOrders(prev => prev.filter(order => order.orderID !== order_id));
        setReceivingOrders(prev => prev.filter(order => order.orderID !== order_id));
        setProcessedOrders(prev => prev.filter(order => order.orderID !== order_id));
        
        // Add the updated order to the appropriate list
        const updatedOrder = { ...order_data, order_status };
        
        if (order_status === 'confirmed') {
          setConfirmedOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'receiving') {
          setReceivingOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'processed' || order_status === 'delivered') {
          setProcessedOrders(prev => [...prev, updatedOrder]);
        }
      }
      
      // Hide update indicator after 2 seconds
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateMessage('');
      }, 2000);
      
      // Show notification for relevant order updates
      toast.success(`Order #${order_id} status updated to ${order_status}`);
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
      
      const result = await orderService.updateOrderStatus(orderId, 'receiving');
      
      if (result) {
        toast.success('Order receiving started successfully');
        // No need to refresh - WebSocket will handle the update
        
        // Switch to receiving tab to show the updated order
        setActiveTab('receiving');
      } else {
        toast.error('Failed to start receiving');
      }
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
      
      const result = await orderService.updateOrderStatus(orderId, 'picking');
      
      if (result) {
        toast.success('Order receiving completed - moved to picking stage');
        // No need to refresh - WebSocket will handle the update
        
        // Switch to history tab to show the completed order
        setActiveTab('history');
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
      case 'confirmed':
        return confirmedOrders;
      case 'receiving':
        return receivingOrders;
      case 'history':
        return processedOrders;
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
      case 'confirmed':
        return 'Confirmed Orders';
      case 'receiving':
        return 'Orders in Receiving';
      case 'history':
        return 'Processed Orders History';
      default:
        return 'Orders';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'confirmed':
        return `${confirmedOrders.length} orders ready to start receiving`;
      case 'receiving':
        return `${receivingOrders.length} orders currently being received`;
      case 'history':
        return `${processedOrders.length} orders completed and moved to next stages`;
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
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receiving Clerk Dashboard</h1>
              <p className="text-gray-600">Welcome, {currentUser?.username || 'Receiving Clerk'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="w-4 h-4" />
                <span>Real-time updates active</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-amber-600">
                <WifiOff className="w-4 h-4" />
                <span>Connecting to real-time updates...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{confirmedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Receiving</p>
              <p className="text-2xl font-semibold text-gray-900">{receivingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed Today</p>
              <p className="text-2xl font-semibold text-gray-900">{processedOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Confirmed Orders ({confirmedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('receiving')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'receiving'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Receiving ({receivingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              History ({processedOrders.length})
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
          <h3 className="text-lg font-semibold text-gray-900">{getTabTitle()}</h3>
          <p className="text-sm text-gray-600">{getTabDescription()}</p>
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
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Order #{order.order_id}
            </h4>
            <p className="text-sm text-gray-600">
              Customer: {order.customer_name || order.customer_id}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-3 w-3" />
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
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {item.item_name || item.name || item.productName || `Item ${index + 1}`} (x{item.quantity || 1})
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
            {order.order_status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
            {getPriorityLabel(order.priority)}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails(order)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
            
            {activeTab === 'confirmed' && (
              <button
                onClick={() => onStartReceiving(order.order_id)}
                disabled={processingOrder === order.order_id}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
