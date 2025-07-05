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
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const PackingDashboard = () => {
  const { currentUser } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [packingOrders, setPackingOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'packing', 'shipped'
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Fetch orders and organize by status
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all orders and filter by packing-related statuses
      const orders = await orderService.getOrders();
      
      if (orders && Array.isArray(orders)) {
        // Group orders by status relevant to packing
        const pending = orders.filter(order => 
          order.order_status === 'picking' || order.order_status === 'picked'
        );
        const packing = orders.filter(order => 
          order.order_status === 'packing'
        );
        const shipped = orders.filter(order => 
          order.order_status === 'shipping' || order.order_status === 'shipped' || order.order_status === 'delivered'
        );

        setPendingOrders(pending);
        setPackingOrders(packing);
        setShippedOrders(shipped);
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
      
      // Smart state updates - only update if relevant to packing workflow
      const isRelevantUpdate = ['picking', 'picked', 'packing', 'shipping', 'shipped', 'delivered'].includes(order_status);
      
      if (isRelevantUpdate && order_data) {
        // Remove order from all lists first
        setPendingOrders(prev => prev.filter(order => order.orderID !== order_id));
        setPackingOrders(prev => prev.filter(order => order.orderID !== order_id));
        setShippedOrders(prev => prev.filter(order => order.orderID !== order_id));
        
        // Add updated order to appropriate list
        const updatedOrder = { ...order_data, order_status };
        
        if (order_status === 'picking' || order_status === 'picked') {
          setPendingOrders(prev => [...prev, updatedOrder]);
        } else if (order_status === 'packing') {
          setPackingOrders(prev => [...prev, updatedOrder]);
        } else if (['shipping', 'shipped', 'delivered'].includes(order_status)) {
          setShippedOrders(prev => [...prev, updatedOrder]);
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
      console.log('WebSocket connected for packing dashboard');
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

  const handleStartPacking = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      const result = await orderService.updateOrderStatus(orderId, 'packing');
      
      if (result) {
        toast.success('Order packing started successfully');
        // WebSocket will handle the update
        setActiveTab('packing');
      } else {
        toast.error('Failed to start packing');
      }
    } catch (error) {
      console.error('Error starting packing:', error);
      toast.error('Failed to start packing');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompletePacking = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
      const result = await orderService.updateOrderStatus(orderId, 'shipping');
      
      if (result) {
        toast.success('Order packed successfully - moved to shipping');
        // WebSocket will handle the update
        setActiveTab('shipped');
      } else {
        toast.error('Failed to complete packing');
      }
    } catch (error) {
      console.error('Error completing packing:', error);
      toast.error('Failed to complete packing');
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
      case 'packing':
        return packingOrders;
      case 'shipped':
        return shippedOrders;
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
        return 'Ready for Packing';
      case 'packing':
        return 'Currently Packing';
      case 'shipped':
        return 'Packed & Shipped';
      default:
        return 'Orders';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'pending':
        return `${pendingOrders.length} orders ready to be packed`;
      case 'packing':
        return `${packingOrders.length} orders currently being packed`;
      case 'shipped':
        return `${shippedOrders.length} orders packed and shipped`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600">Loading packing dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Packing Dashboard</h1>
              <p className="text-gray-600">Welcome, {currentUser?.username || 'Packer'}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">
                    {isConnected ? 'Real-time updates active' : 'Offline mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {pendingOrders.length + packingOrders.length}
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'pending', label: 'Ready for Packing', icon: Clock, count: pendingOrders.length },
              { id: 'packing', label: 'Currently Packing', icon: Package, count: packingOrders.length },
              { id: 'shipped', label: 'Packed & Shipped', icon: Truck, count: shippedOrders.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-600'
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
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No orders found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search criteria.' : `No orders in ${getTabTitle().toLowerCase()} status.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <PackingOrderRow
                key={order.orderID}
                order={order}
                activeTab={activeTab}
                onViewDetails={handleViewOrderDetails}
                onStartPacking={handleStartPacking}
                onCompletePacking={handleCompletePacking}
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

// Packing Order Row Component
const PackingOrderRow = ({ order, activeTab, onViewDetails, onStartPacking, onCompletePacking, processingOrder }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'picking': { color: 'bg-blue-100 text-blue-800', label: 'Picking' },
      'picked': { color: 'bg-green-100 text-green-800', label: 'Picked' },
      'packing': { color: 'bg-orange-100 text-orange-800', label: 'Packing' },
      'shipping': { color: 'bg-purple-100 text-purple-800', label: 'Shipping' },
      'shipped': { color: 'bg-gray-100 text-gray-800', label: 'Shipped' },
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
      1: { color: 'bg-red-100 text-red-800', label: 'High' },
      2: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      3: { color: 'bg-green-100 text-green-800', label: 'Low' },
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: 'Normal' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        Priority {config.label}
      </span>
    );
  };

  const isProcessing = processingOrder === order.orderID;

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
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
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Customer: {order.customerID}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>Items: {order.items?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Total: ${order.total_amount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
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
          
          {activeTab === 'pending' && (
            <button
              onClick={() => onStartPacking(order.orderID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Start Packing</span>
                </>
              )}
            </button>
          )}
          
          {activeTab === 'packing' && (
            <button
              onClick={() => onCompletePacking(order.orderID)}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete & Ship</span>
                </>
              )}
            </button>
          )}
          
          {activeTab === 'shipped' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Items Details */}
      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items to Pack</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Item #{item.itemID || `${index + 1}`}
                </span>
                <span className="font-medium text-gray-900">
                  Qty: {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
            Order #{order.order_id || order.orderID} Details
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
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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

          {order.shipping_address && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Shipping Address</p>
              <p className="text-gray-900">{order.shipping_address}</p>
            </div>
          )}

          {order.notes && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Packing Notes</p>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Items to Pack</p>
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

export default PackingDashboard;
