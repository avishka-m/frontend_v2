import React from 'react';
import { 
  Package2, 
  Eye, 
  PlayCircle, 
  CheckSquare,
  Clock,
  User
} from 'lucide-react';

const OrderCard = ({ 
  order, 
  onViewDetails, 
  onStartReceiving, 
  onCompleteReceiving, 
  processingOrder,
  showHistory = false 
}) => {
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

  return (
    <div className="p-4 hover:bg-gray-50 border-b border-gray-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Order #{order.orderID}
            </h3>
            <p className="text-sm text-gray-600">
              Customer: {order.customerID} | Items: {order.items?.length || 0}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{new Date(order.order_date).toLocaleDateString()}</span>
              {order.assigned_worker && (
                <>
                  <span>•</span>
                  <User className="h-3 w-3" />
                  <span>Worker: {order.assigned_worker}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(order.order_status)}`}>
            {order.order_status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(order.priority)}`}>
            {getPriorityLabel(order.priority)}
          </span>
        </div>
      </div>
      
      <div className="mt-3 flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(order)}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>
        
        {!showHistory && (
          <>
            {order.order_status === 'pending' || order.order_status === 'confirmed' ? (
              <button
                onClick={() => onStartReceiving(order.orderID)}
                disabled={processingOrder === order.orderID}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingOrder === order.orderID ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                <span>Start Receiving</span>
              </button>
            ) : order.order_status === 'receiving' ? (
              <button
                onClick={() => onCompleteReceiving(order.orderID)}
                disabled={processingOrder === order.orderID}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingOrder === order.orderID ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                <span>Complete Receiving</span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
