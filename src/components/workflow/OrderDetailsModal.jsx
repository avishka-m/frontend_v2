import React from 'react';
import { X, Package, Star, Calendar, User, MapPin, FileText } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = parseFloat(item.price || item.unit_price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'picking':
        return 'bg-orange-100 text-orange-800';
      case 'packing':
        return 'bg-purple-100 text-purple-800';
      case 'ready_to_ship':
      case 'ready to ship':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toString().toLowerCase()) {
      case '1':
      case 'high':
        return 'bg-red-100 text-red-800';
      case '2':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case '3':
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toString().toLowerCase()) {
      case '1':
        return 'High';
      case '2':
        return 'Medium';
      case '3':
        return 'Low';
      default:
        return `Priority ${priority}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Order #{order.order_id || order.orderID} Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Order Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                </div>
                <p className="text-gray-900 ml-6">{order.customer_name || `Customer ${order.customerID}`}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-600">Order Date</p>
                </div>
                <p className="text-gray-900 ml-6">
                  {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                  {order.order_status}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Priority</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(order.priority)}`}>
                  <Star className="h-3 w-3 inline mr-1" />
                  {getPriorityLabel(order.priority)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-600">Shipping Address</p>
              </div>
              <p className="text-gray-900 ml-6">{order.shipping_address}</p>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-600">Notes</p>
              </div>
              <p className="text-gray-900 ml-6 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Order Items</p>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.item_name || item.name || item.productName || `Item ${item.itemID}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${(item.price || item.unit_price || 0).toFixed(2)}
                      </p>
                      {item.location && (
                        <p className="text-sm text-gray-500">
                          Location: {item.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.price || item.unit_price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Order Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      ${calculateOrderTotal(order.items).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No items found for this order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
