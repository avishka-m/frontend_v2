import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Truck,
  Archive,
  ArrowRight,
  Loader
} from 'lucide-react';
import workflowService from '../../services/workflowService';

const WorkflowActions = ({ orderId, currentStage, onActionComplete }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartPicking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would need to be implemented with actual picking ID
      // For now, we'll show a placeholder
      setTimeout(() => {
        onActionComplete && onActionComplete('picking_started');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to start picking');
      setLoading(false);
    }
  };

  const handleStartPacking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would need to be implemented with actual packing ID
      // For now, we'll show a placeholder
      setTimeout(() => {
        onActionComplete && onActionComplete('packing_started');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to start packing');
      setLoading(false);
    }
  };

  const handleStartShipping = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would need to be implemented with actual shipping ID
      // For now, we'll show a placeholder
      setTimeout(() => {
        onActionComplete && onActionComplete('shipping_started');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to start shipping');
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    const userRole = currentUser?.role;
    const actions = [];

    if (currentStage === 'Order Created' && ['Manager', 'Picker'].includes(userRole)) {
      actions.push({
        id: 'start_picking',
        label: 'Start Picking',
        icon: Package,
        color: 'blue',
        action: handleStartPicking
      });
    }

    if (currentStage === 'Picking' && ['Manager', 'Packer'].includes(userRole)) {
      actions.push({
        id: 'start_packing',
        label: 'Start Packing',
        icon: Archive,
        color: 'purple',
        action: handleStartPacking
      });
    }

    if (currentStage === 'Packing' && ['Manager', 'Driver'].includes(userRole)) {
      actions.push({
        id: 'start_shipping',
        label: 'Start Shipping',
        icon: Truck,
        color: 'green',
        action: handleStartShipping
      });
    }

    return actions;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white'
    };
    return colors[color] || colors.blue;
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={loading}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${getColorClasses(action.color)} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center space-x-3">
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className="font-medium">{action.label}</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Actions available are based on your role and the current order status. 
          Complete actions will automatically advance the workflow to the next stage.
        </p>
      </div>
    </div>
  );
};

export default WorkflowActions;
