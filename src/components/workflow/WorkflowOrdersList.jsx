import React from 'react';
import { 
  Package, 
  Calendar, 
  User, 
  Star, 
  Eye, 
  Play, 
  CheckCircle, 
  Clock,
  MapPin,
  DollarSign,
  FileText
} from 'lucide-react';

const WorkflowOrdersList = ({ 
  orders, 
  activeTab, 
  onOrderSelect, 
  onWorkflowAction, 
  workflowActions,
  processingOrder,
  searchTerm,
  themeColor = 'blue' 
}) => {
  const currentOrders = orders[activeTab] || [];
  
  // Filter orders based on search term
  const filteredOrders = currentOrders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const orderIdMatch = (order.order_id || order.orderID || '').toString().toLowerCase().includes(searchLower);
    const customerMatch = (order.customer_name || '').toLowerCase().includes(searchLower);
    const statusMatch = (order.order_status || '').toLowerCase().includes(searchLower);
    
    return orderIdMatch || customerMatch || statusMatch;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picking':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'packing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready_to_ship':
      case 'ready to ship':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toString().toLowerCase()) {
      case '1':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case '2':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '3':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = parseFloat(item.price || item.unit_price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);
  };

  const getAvailableActions = (order) => {
    if (!workflowActions) return [];
    
    return Object.entries(workflowActions).filter(([actionId, action]) => {
      // Check if action is available for current tab/status
      if (action.availableFor && !action.availableFor.includes(activeTab)) {
        return false;
      }
      
      return true;
    });
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching orders found' : 'No orders found'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Try adjusting your search terms or clear the search to see all orders.`
              : `There are no orders in the ${activeTab} stage right now.`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders
        </h3>
        <p className="text-sm text-gray-600">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredOrders.map((order) => {
          const orderId = order.order_id || order.orderID;
          const isProcessing = processingOrder === orderId;
          const availableActions = getAvailableActions(order);
          
          return (
            <div key={orderId} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Order #{orderId}
                      </span>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                      <Star className="h-3 w-3 inline mr-1" />
                      {getPriorityLabel(order.priority)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{order.customer_name || `Customer ${order.customerID}`}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
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
                            className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded border"
                          >
                            {item.item_name || item.name || item.productName || `Item ${index + 1}`} (x{item.quantity || 1})
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded border">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* View Details Button */}
                  <button
                    onClick={() => onOrderSelect(order)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  
                  {/* Action Buttons */}
                  {availableActions.map(([actionId, action]) => (
                    <button
                      key={actionId}
                      onClick={() => onWorkflowAction(actionId, order)}
                      disabled={isProcessing}
                      className={`
                        flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isProcessing 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : `${action.buttonClass || `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700`}`
                        }
                      `}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        action.icon && <action.icon className="h-4 w-4" />
                      )}
                      <span>{isProcessing ? 'Processing...' : action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowOrdersList;
