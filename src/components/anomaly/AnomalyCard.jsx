import React from 'react';
import { 
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getSeverityConfig, getCategoryConfig, formatTimestamp } from '../../utils/anomalyUtils';

/**
 * 🔍 Anomaly Card Component
 * 
 * Displays individual anomaly details in a card format with:
 * - Severity-based styling and colors
 * - Category icons and metadata
 * - Formatted timestamps and descriptions
 * - Action buttons and interactive elements
 */
const AnomalyCard = ({ 
  anomaly, 
  onSelect, 
  onDismiss, 
  onViewDetails,
  compact = false,
  showActions = true,
  className = ''
}) => {
  const severityConfig = getSeverityConfig(anomaly.severity);
  const categoryConfig = getCategoryConfig(anomaly.category);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ShieldExclamationIcon className="w-5 h-5" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(anomaly);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    console.log('👁️ View Details clicked for anomaly:', anomaly.id || anomaly.anomaly_id);
    
    if (onViewDetails) {
      try {
        onViewDetails(anomaly);
        console.log('✅ View Details handler called successfully');
      } catch (error) {
        console.error('❌ Error in View Details handler:', error);
      }
    } else {
      console.warn('⚠️ onViewDetails handler not provided');
      // Fallback: open a simple alert with anomaly details
      alert(`Anomaly Details:\n\nTitle: ${anomaly.title || 'N/A'}\nSeverity: ${anomaly.severity || 'N/A'}\nCategory: ${anomaly.category || 'N/A'}\nDescription: ${anomaly.description || 'N/A'}`);
    }
  };

  const handleDismiss = async (e) => {
    e.stopPropagation();
    console.log('🗑️ Dismiss clicked for anomaly:', anomaly.id || anomaly.anomaly_id);
    
    if (onDismiss) {
      try {
        console.log('📤 Calling dismiss handler...');
        await onDismiss(anomaly);
        console.log('✅ Dismiss handler completed successfully');
      } catch (error) {
        console.error('❌ Error in dismiss handler:', error);
      }
    } else {
      console.warn('⚠️ onDismiss handler not provided');
      // Fallback: show confirmation dialog
      if (confirm(`Are you sure you want to dismiss this ${anomaly.severity} anomaly?\n\n"${anomaly.title || anomaly.type}"`)) {
        console.log('✅ Anomaly dismissed (local simulation)');
      }
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer
        ${compact ? 'p-3' : 'p-4'}
        ${className}
      `}
      style={{ borderLeftColor: severityConfig.color }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-1.5 rounded-full"
            style={{ backgroundColor: severityConfig.bgColor, color: severityConfig.color }}
          >
            {getSeverityIcon(anomaly.severity)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{categoryConfig.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {categoryConfig.label}
              </span>
              <span 
                className="px-2 py-1 text-xs font-semibold rounded-full"
                style={{ 
                  backgroundColor: severityConfig.bgColor, 
                  color: severityConfig.color 
                }}
              >
                {severityConfig.label.toUpperCase()}
              </span>
            </div>
            {!compact && (
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(anomaly.timestamp)}
              </p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-1">
            <button
              onClick={handleDismiss}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Dismiss Anomaly"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <h4 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {anomaly.title || anomaly.type || 'Anomaly Detected'}
        </h4>
        
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
          {anomaly.description || anomaly.message || 'No description available'}
        </p>

        {/* Additional Details */}
        {!compact && anomaly.details && (
          <div className="mt-2 text-xs text-gray-500">
            {Object.entries(anomaly.details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detection Method */}
        {anomaly.detection_method && (
          <div className="flex items-center space-x-1 mt-2">
            <span className="text-xs text-gray-500">Detected by:</span>
            <span className={`
              px-1.5 py-0.5 text-xs rounded
              ${anomaly.detection_method === 'ml' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
              }
            `}>
              {anomaly.detection_method === 'ml' ? '🤖 ML' : '📋 Rule'}
            </span>
          </div>
        )}

        {/* Actionable Items */}
        {anomaly.actionable && !compact && (
          <div className="mt-3 flex flex-wrap gap-1">
            {anomaly.item_id && (
              <button
                className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('📦 Navigating to item:', anomaly.item_id);
                  // Navigate to item details
                  try {
                    window.open(`/inventory?search=${anomaly.item_id}`, '_blank');
                  } catch (error) {
                    console.error('❌ Error navigating to item:', error);
                    alert(`Item ID: ${anomaly.item_id}\n\nNavigation not available in current setup.`);
                  }
                }}
              >
                📦 View Item
              </button>
            )}
            {anomaly.order_id && (
              <button
                className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🛒 Navigating to order:', anomaly.order_id);
                  // Navigate to order details
                  try {
                    window.open(`/orders/${anomaly.order_id}`, '_blank');
                  } catch (error) {
                    console.error('❌ Error navigating to order:', error);
                    alert(`Order ID: ${anomaly.order_id}\n\nNavigation not available in current setup.`);
                  }
                }}
              >
                🛒 View Order
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors font-medium"
            >
              🗑️ Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyCard;
