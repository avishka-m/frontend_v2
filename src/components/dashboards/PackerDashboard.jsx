import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';
import roleBasedService from '../../services/roleBasedService';
import { toast } from 'react-hot-toast';

const PackerDashboard = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await roleBasedService.getOrdersForPacker();
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

  const handleCompletePacking = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const result = await roleBasedService.updateOrderStatus(orderId, 'shipping');
      if (result.success) {
        toast.success('Order moved to shipping');
        fetchOrders();
      } else {
        toast.error(result.error || 'Failed to complete packing');
      }
    } catch (error) {
      toast.error('Failed to complete packing');
    } finally {
      setProcessingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Packer Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back, {currentUser?.name}! Pack orders for shipping.
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
            Orders Ready for Packing
          </h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders available</h3>
              <p className="mt-1 text-sm text-gray-500">
                All orders have been packed or none are ready for packing.
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
                        <Package className="h-8 w-8 text-purple-600" />
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
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {!order.assigned_worker && (
                        <button
                          onClick={() => handleTakeOrder(order.orderID)}
                          disabled={processingOrder === order.orderID}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
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
                          onClick={() => handleCompletePacking(order.orderID)}
                          disabled={processingOrder === order.orderID}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingOrder === order.orderID ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Truck className="h-4 w-4 mr-2" />
                          )}
                          Complete → Shipping
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Items to Pack</h5>
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
    </div>
  );
};

export default PackerDashboard;
