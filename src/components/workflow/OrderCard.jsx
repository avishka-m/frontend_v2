import React from 'react';
import workflowOrderService from '../../services/workflowOrderService';
import {
  Package,
  Clock,
  MapPin,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Route,
  Play,
  Hand
} from 'lucide-react';

const OrderCard = ({ 
  order, 
  userRole, 
  onAction, 
  onViewDetails, 
  isProcessing, 
  showOptimalPath, 
  onOptimalPath,
  actionContext = 'available' // 'available' or 'working'
}) => {
  const orderId = order.order_id || order.orderID;
  const customerName = order.customer_name || `Customer ${order.customerID}`;
  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A';
  const totalAmount = order.total_amount || order.total || 0;
  const itemCount = order.items ? order.items.length : (order.item_count || 0);
  const priority = order.priority || 'Medium';
  const status = order.order_status;
  const assignedWorker = order.assigned_worker;
  const isAssignedToCurrentUser = assignedWorker && assignedWorker.toString() === (order.currentUserId || '').toString();

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'picking': 'bg-orange-100 text-orange-800 border-orange-200',
      'packing': 'bg-purple-100 text-purple-800 border-purple-200',
      'ready_for_shipping': 'bg-green-100 text-green-800 border-green-200',
      'shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'delivered': 'bg-gray-100 text-gray-800 border-gray-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 ring-red-600/20',
      'Medium': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
      'Low': 'bg-green-100 text-green-800 ring-green-600/20'
    };
    return colors[priority] || colors['Medium'];
  };

  // Get action button configuration
  const getActionConfig = () => {
    const currentStatus = status;
    
    if (actionContext === 'available') {
      // Available tab - show appropriate action for role
      if (userRole === 'Manager' && status === 'pending') {
        return {
          label: 'Confirm Order',
          icon: CheckCircle,
          color: 'bg-green-600 hover:bg-green-700',
          disabled: false
        };
      } else {
        return {
          label: 'Take Order',
          icon: Hand,
          color: 'bg-blue-600 hover:bg-blue-700',
          disabled: false
        };
      }
    } else if (actionContext === 'working') {
      // Working tab - show completion actions
      const actionLabel = workflowOrderService.getRoleActionLabel(currentStatus, userRole);
      const nextStatus = workflowOrderService.getNextStatus(currentStatus, userRole);
      
      return {
        label: actionLabel,
        icon: ArrowRight,
        color: 'bg-green-600 hover:bg-green-700',
        disabled: false,
        nextStatus: nextStatus
      };
    } else if (actionContext === 'history' && userRole === 'Manager') {
      // History tab for managers - orders are confirmed but no action needed
      return null; // No action button for confirmed orders
    }
    
    return null;
  };

  const actionConfig = getActionConfig();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{orderId}
              </h3>
              <p className="text-sm text-gray-600">{customerName}</p>
            </div>
          </div>
          
          {/* Priority Badge */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getPriorityColor(priority)}`}>
            {priority}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="px-6 py-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(status)}`}>
              {status.replace('_', ' ')}
            </span>
            {/* Manager confirmation indicator */}
            {userRole === 'Manager' && actionContext === 'history' && status === 'pending' && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                ✓ Confirmed
              </span>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {orderDate}
          </div>
          
          <div className="flex items-center text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            {itemCount} items
          </div>
          
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            ${totalAmount.toFixed(2)}
          </div>
          
          {(order.shipping_address || order.delivery_address) && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              Delivery
            </div>
          )}
        </div>

        {/* Assignment Status */}
        {actionContext === 'working' && assignedWorker && (
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
            <User className="h-4 w-4 mr-2" />
            Assigned to you
          </div>
        )}

        {/* Driver-specific information */}
        {userRole === 'Driver' && (order.shipping_address || order.delivery_address) && (
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
            <div className="text-sm">
              <div className="flex items-start text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs">
                  {order.shipping_address || order.delivery_address}
                </span>
              </div>
            </div>
            
            {/* Tracking Number for shipped orders */}
            {order.tracking_number && status === 'shipped' && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-xs">Tracking: {order.tracking_number}</span>
              </div>
            )}
            
            {/* Estimated Delivery */}
            {order.estimated_delivery && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-xs">
                  Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()} 
                  {new Date(order.estimated_delivery).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )}
            
            {/* Package Count */}
            {order.package_count && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-xs">{order.package_count} package{order.package_count > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator for Working Tab */}
        {actionContext === 'working' && actionConfig?.nextStatus && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            <ArrowRight className="h-4 w-4 mr-2" />
            Next: {actionConfig.nextStatus.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewDetails(order)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </button>
          
          <div className="flex items-center space-x-2">
            {/* Optimal Path Button (for pickers in working tab) */}
            {showOptimalPath && onOptimalPath && (
              <button
                onClick={() => onOptimalPath(order)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded-md hover:bg-orange-200 transition-colors"
              >
                <Route className="h-3 w-3" />
                <span>Show Path</span>
              </button>
            )}
            
            {/* Main Action Button */}
            {actionConfig && (
              <button
                onClick={() => onAction(order)}
                disabled={isProcessing}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionConfig.color}`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <actionConfig.icon className="h-4 w-4" />
                    <span>{actionConfig.label}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard; 