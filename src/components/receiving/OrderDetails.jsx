import React from 'react';
import { FileText, Package, DollarSign, MapPin, StickyNote, X } from 'lucide-react';

const OrderDetails = ({ order, onClose }) => {
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

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
        </div>
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No Order Selected</p>
          <p className="text-sm">Select an order from the list to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Order Header */}
        <div className="border-b border-gray-100 pb-4">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Order #{order.orderID}</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Customer ID:</span>
              <span className="font-medium">{order.customerID}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{new Date(order.order_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-green-600">
                ${order.total_amount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status and Priority */}
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(order.order_status)}`}>
            {order.order_status}
          </span>
          <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(order.priority)}`}>
            {getPriorityLabel(order.priority)} Priority
          </span>
        </div>
        
        {/* Items Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Package className="h-5 w-5 text-gray-600" />
            <h5 className="font-semibold text-gray-900">Items to Receive ({order.items?.length || 0})</h5>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {order.items?.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Item #{item.itemID}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.name || 'Product name not available'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Qty: {item.quantity}
                      </span>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <span className="text-sm text-gray-600">
                        ${(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: ${((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No items found for this order</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Shipping Address */}
        {order.shipping_address && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h5 className="font-semibold text-gray-900">Shipping Address</h5>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">{order.shipping_address}</p>
            </div>
          </div>
        )}
        
        {/* Notes */}
        {order.notes && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <StickyNote className="h-5 w-5 text-gray-600" />
              <h5 className="font-semibold text-gray-900">Order Notes</h5>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-medium">
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-semibold text-green-600">
                  ${order.total_amount?.toFixed(2) || '0.00'}
                </span>
              </div>
              {order.assigned_worker && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Worker:</span>
                  <span className="font-medium">{order.assigned_worker}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
