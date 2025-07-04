import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Package,
  Truck,
  ArrowRight,
  Calendar,
  User,
  FileText,
  Activity,
  Eye
} from 'lucide-react';
import workflowService from '../services/workflowService';

const OrderWorkflowStatus = ({ orderId, onStatusChange }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workflowData, setWorkflowData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchWorkflowData();
    }
  }, [orderId]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const result = await workflowService.getOrderWorkflowStatus(orderId);
      
      if (result.success) {
        setWorkflowData(result.data);
        if (onStatusChange) {
          onStatusChange(result.data.overall_status);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch workflow data');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'pending':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleString();
  };

  const canPerformAction = (stage) => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const stageActions = {
      'Picking': ['Manager', 'Picker'],
      'Packing': ['Manager', 'Packer'],
      'Shipping': ['Manager', 'Driver']
    };
    
    return stageActions[stage.name]?.includes(userRole) || false;
  };

  const handleStageAction = (stage) => {
    const stageRoutes = {
      'Picking': `/picking/${stage.details?.pickingID}`,
      'Packing': `/packing/${stage.details?.packingID}`,
      'Shipping': `/shipping/${stage.details?.shippingID}`
    };
    
    if (stageRoutes[stage.name] && stage.details) {
      navigate(stageRoutes[stage.name]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No workflow data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <span className="font-medium text-blue-600">
              {workflowData.progress_percentage}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${workflowData.progress_percentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current Stage:</span>
          <span className="font-medium text-gray-900">
            {workflowData.current_stage}
          </span>
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Stages</h3>
        
        <div className="space-y-4">
          {workflowData.stages?.map((stage, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStageColor(stage.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStageIcon(stage.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <p className="text-sm text-gray-600">{stage.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(stage.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* View Details Button */}
                  {stage.details && (
                    <button
                      onClick={() => navigate(`/workflow/order/${orderId}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Action Button */}
                  {canPerformAction(stage) && stage.status === 'pending' && (
                    <button
                      onClick={() => handleStageAction(stage)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </button>
                  )}
                  
                  {canPerformAction(stage) && stage.status === 'in_progress' && (
                    <button
                      onClick={() => handleStageAction(stage)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/workflow/order/${orderId}`)}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">View Full Workflow</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">View Order Details</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderWorkflowStatus;
