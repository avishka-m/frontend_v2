import React from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const InventoryRecommendations = ({ recommendations = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading recommendations...</span>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <InformationCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No recommendations available at this time</p>
      </div>
    );
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'medium':
      case 'soon':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
      case 'normal':
      case 'stable':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'medium':
      case 'soon':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'low':
      case 'normal':
      case 'stable':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'reorder_point':
      case 'reorder':
        return <ClockIcon className="h-4 w-4" />;
      case 'order_quantity':
      case 'quantity':
        return <ShoppingCartIcon className="h-4 w-4" />;
      case 'peak_preparation':
      case 'peak':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const formatType = (type) => {
    return type?.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Recommendations ({recommendations.length})
        </h3>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getUrgencyColor(rec.urgency || rec.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getUrgencyIcon(rec.urgency || rec.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(rec.type)}
                    <h4 className="text-sm font-semibold text-gray-900">
                      {rec.title || formatType(rec.type)}
                    </h4>
                    {rec.product_id && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {rec.product_id}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {rec.description || rec.message}
                  </p>

                  {rec.value && (
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {typeof rec.value === 'number' ? `${rec.value} units` : rec.value}
                    </div>
                  )}

                  {rec.calculation && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <strong>Calculation:</strong> {rec.calculation}
                    </div>
                  )}

                  {rec.confidence && (
                    <div className="text-xs text-gray-600 mt-1">
                      <strong>Confidence:</strong> {rec.confidence}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  rec.urgency === 'high' || rec.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800' 
                    : rec.urgency === 'medium' || rec.priority === 'soon'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {rec.urgency || rec.priority || 'Normal'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                  Take Action
                </button>
                <button className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors">
                  Dismiss
                </button>
                <button className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendation Types:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            <span>Reorder Point: When to reorder</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingCartIcon className="h-4 w-4 text-green-600" />
            <span>Order Quantity: How much to order</span>
          </div>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
            <span>Peak Preparation: Seasonal adjustments</span>
          </div>
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="h-4 w-4 text-gray-600" />
            <span>General: Other insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryRecommendations;
