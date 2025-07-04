import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  Package,
  ArrowRight,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import roleBasedService from '../services/roleBasedService';
import { toast } from 'react-hot-toast';

const PickerDashboard = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await roleBasedService.getOrdersForPicker();
      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const result = await roleBasedService.assignOrderToMe(orderId);
      if (result.success) {
        toast.success('Order assigned to you');
        fetchOrders();
      } else {
        toast.error(result.error || 'Failed to take order');
      }
    } catch (error) {
      toast.error('Failed to take order');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCompletePickup = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const result = await roleBasedService.updateOrderStatus(orderId, 'packing');
      if (result.success) {
        toast.success('Order moved to packing');
        fetchOrders();
      } else {
        toast.error(result.error || 'Failed to complete pickup');
      }
    } catch (error) {
      toast.error('Failed to complete pickup');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const result = await roleBasedService.getOrderDetails(orderId);
      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        toast.error(result.error || 'Failed to load order details');
      }
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picking':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Picker Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back, {currentUser?.name}! Pick orders efficiently.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-sm text-gray-500">Orders Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Orders Ready for Picking
          </h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders available</h3>
              <p className="mt-1 text-sm text-gray-500">
                All orders have been picked or none are ready for picking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderID}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ShoppingCart className="h-8 w-8 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Order #{order.orderID}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customerID} | Items: {order.items?.length || 0}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(order.order_date).toLocaleDateString()}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                          {order.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.priority === 1 ? 'bg-red-100 text-red-800' :
                              order.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Priority {order.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(order.orderID)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      
                      {!order.assigned_worker && (
                        <button
                          onClick={() => handleTakeOrder(order.orderID)}
                          disabled={processingOrder === order.orderID}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                        >
                          {processingOrder === order.orderID ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <User className="h-4 w-4 mr-2" />
                          )}
                          Take Order
                        </button>
                      )}
                      
                      {order.assigned_worker === currentUser?.workerID && (
                        <button
                          onClick={() => handleCompletePickup(order.orderID)}
                          disabled={processingOrder === order.orderID}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingOrder === order.orderID ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Complete → Packing
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Items to Pick</h5>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">Item #{item.itemID}</span>
                            <span className="text-gray-800 font-medium">Qty: {item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-500">
                            ... and {order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{selectedOrder.orderID} Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.customerID}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.shipping_address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <div className="mt-1 border rounded-md divide-y">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Item #{item.itemID}</p>
                          <p className="text-sm text-gray-500">Price: ${item.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Fulfilled: {item.fulfilled_quantity || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickerDashboard;
