import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, Hash, MapPin, AlertTriangle, Truck } from 'lucide-react';
import { ORDER_STATUS_COLORS, ORDER_PRIORITY_COLORS, ORDER_STATUS_DISPLAY, ORDER_PRIORITY_DISPLAY } from '../../services/orderService';

const OrderHeader = ({ orderData, loading = false }) => {
  if (loading) {
    return <OrderHeaderSkeleton />;
  }

  if (!orderData) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'picking': return '📦';
      case 'packing': return '📮';
      case 'shipping': return '🚚';
      case 'delivered': return '✨';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1: return '🔴'; // High
      case 2: return '🟡'; // Medium
      case 3: return '🟢'; // Low
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb and Title */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/orders" 
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          
          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{orderData.order_id}
                </h1>
                <p className="text-sm text-gray-500">
                  {orderData.customer_name || `Customer ${orderData.customer_id}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Quick Info */}
        <div className="flex items-center space-x-6">
          {/* Order Status */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(orderData.order_status)}</span>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[orderData.order_status] || 'bg-gray-100 text-gray-800'}`}>
                {ORDER_STATUS_DISPLAY[orderData.order_status] || orderData.order_status}
              </span>
              <div className="text-xs text-gray-500 mt-1">Status</div>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getPriorityIcon(orderData.priority)}</span>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ORDER_PRIORITY_COLORS[orderData.priority] || 'bg-gray-100 text-gray-800'}`}>
                {ORDER_PRIORITY_DISPLAY[orderData.priority] || 'Unknown'}
              </span>
              <div className="text-xs text-gray-500 mt-1">Priority</div>
            </div>
          </div>

          {/* Order Date */}
          {orderData.order_date && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="block font-medium">
                  {new Date(orderData.order_date).toLocaleDateString()}
                </span>
                <div className="text-xs text-gray-500">Order Date</div>
              </div>
            </div>
          )}
          
          {/* Items Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <div>
              <span className="block font-medium">
                {orderData.items_count || orderData.items?.length || 0} items
              </span>
              <div className="text-xs text-gray-500">
                Qty: {orderData.items_total_quantity || 0}
              </div>
            </div>
          </div>

          {/* Assigned Worker */}
          {orderData.assigned_worker && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <div>
                <span className="block font-medium">
                  {orderData.worker_name || `Worker ${orderData.assigned_worker}`}
                </span>
                <div className="text-xs text-gray-500">Assigned</div>
              </div>
            </div>
          )}

          {/* Total Amount */}
          {orderData.total_amount && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-lg">💰</span>
              <div>
                <span className="block font-medium text-green-600">
                  ${parseFloat(orderData.total_amount).toFixed(2)}
                </span>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="border-l border-gray-300 pl-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default OrderHeader; 