import React from 'react';
import { 
  Package,
  Eye,
  User,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Activity,
  AlertCircle,
  Loader
} from 'lucide-react';

const WorkflowOrdersList = ({ 
  orders, 
  activeTab, 
  tabs, 
  processingOrder, 
  onWorkflowAction, 
  onViewDetails, 
  themeColor,
  searchTerm 
}) => {
  const currentTabConfig = tabs.find(tab => tab.id === activeTab);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'picking':
      case 'active':
        return 'bg-amber-100 text-amber-800';
      case 'packing':
        return 'bg-purple-100 text-purple-800';
      case 'shipping':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionButton = (order) => {
    const actions = currentTabConfig?.actions || [];
    const primaryAction = actions.find(action => action.primary);
    
    if (!primaryAction) return null;
    
    const isProcessing = processingOrder === (order.orderID || order.order_id);
    
    return (
      <button
        onClick={() => {
          console.log('🔘 Button clicked:', { 
            actionId: primaryAction.id, 
            order: order,
            processingOrder: processingOrder 
          });
          onWorkflowAction(primaryAction.id, order);
        }}
        disabled={isProcessing}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${primaryAction.variant === 'primary' 
            ? `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700` 
            : `bg-gray-100 text-gray-700 hover:bg-gray-200`
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          <>
            <Loader size={16} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {primaryAction.icon && <primaryAction.icon size={16} />}
            <span>{primaryAction.label}</span>
          </>
        )}
      </button>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No orders in {currentTabConfig?.label || 'this category'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No orders match your search "${searchTerm}"` 
              : 'Orders will appear here when they match this status'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {currentTabConfig?.label || 'Orders'} ({orders.length})
          </h3>
          {searchTerm && (
            <span className="text-sm text-gray-500">
              Showing results for "{searchTerm}"
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderID || order.order_id || order.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Package size={24} className={`text-${themeColor}-600`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        Order #{order.orderID || order.order_id}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{order.customer_name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(order.order_date)}</span>
                      </div>
                      {order.delivery_address && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span className="truncate max-w-xs">{order.delivery_address}</span>
                        </div>
                      )}
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        {order.items.length <= 2 && (
                          <span className="ml-2">
                            ({order.items.map(item => item.item_name).join(', ')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {getActionButton(order)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowOrdersList;
