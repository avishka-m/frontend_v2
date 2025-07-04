import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft,
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Package,
  Truck,
  MapPin,
  Calendar,
  User,
  FileText,
  ChevronRight
} from 'lucide-react';
import workflowService from '../services/workflowService';

const OrderWorkflowTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchWorkflowData();
    }
  }, [orderId]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const result = await workflowService.getOrderWorkflowStatus(parseInt(orderId));
      
      if (result.success) {
        setWorkflowData(result.data);
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
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'in_progress':
      case 'processing':
        return <Clock className="w-8 h-8 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-gray-400" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
      case 'processing':
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
    // Navigate to appropriate workflow action page
    const stageRoutes = {
      'Picking': `/picking/${stage.details?.pickingID}`,
      'Packing': `/packing/${stage.details?.packingID}`,
      'Shipping': `/shipping/${stage.details?.shippingID}`
    };
    
    const route = stageRoutes[stage.name];
    if (route) {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !workflowData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error || 'Failed to load workflow data'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { order, workflow_status } = workflowData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/orders')}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Workflow Tracker</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Track the progress of Order #{order?.orderID}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {workflow_status?.progress_percentage || 0}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{order?.orderID}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900">{order?.customerID}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(order?.order_date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  workflowService.getStatusColor(workflow_status?.overall_status) === 'green' ? 'bg-green-100 text-green-800' :
                  workflowService.getStatusColor(workflow_status?.overall_status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                  workflowService.getStatusColor(workflow_status?.overall_status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {workflow_status?.overall_status}
                </span>
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
              <span>Progress</span>
              <span>{workflow_status?.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${workflow_status?.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Current Stage: <span className="font-medium">{workflow_status?.current_stage}</span>
          </div>
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Workflow Stages</h3>
          
          <div className="space-y-6">
            {workflow_status?.workflow_stages && Object.entries(workflow_status.workflow_stages).map(([stageName, stage], index) => (
              <div key={stageName} className="relative">
                {/* Connection Line */}
                {index < Object.keys(workflow_status.workflow_stages).length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-300"></div>
                )}
                
                <div className={`flex items-start p-4 rounded-lg border-2 ${getStageColor(stage.status)}`}>
                  <div className="flex-shrink-0">
                    {getStageIcon(stage.status)}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900 capitalize">{stageName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stage.status === 'completed' || stage.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          stage.status === 'in_progress' || stage.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                          stage.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {stage.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {stage.total_count > 0 
                        ? `${stage.completed_count} of ${stage.total_count} ${stageName} tasks completed`
                        : `No ${stageName} tasks for this order`
                      }
                    </p>
                    
                    {/* Stage Progress */}
                    {stage.total_count > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((stage.completed_count / stage.total_count) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stage.completed_count / stage.total_count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Stage Records */}
                    {stage.records && stage.records.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Records ({stage.records.length})</h5>
                        <div className="space-y-1">
                          {stage.records.slice(0, 3).map((record, recordIndex) => (
                            <div key={recordIndex} className="text-xs text-gray-600">
                              ID: {record.pickingID || record.packingID || record.shippingID || record.returnID} - 
                              Status: {record.status} - 
                              Updated: {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'N/A'}
                            </div>
                          ))}
                          {stage.records.length > 3 && (
                            <div className="text-xs text-gray-500">
                              ... and {stage.records.length - 3} more records
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order?.items && order.items.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Order Items</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fulfilled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.itemID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.fulfilled_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.fulfilled_quantity >= item.quantity ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Fulfilled
                          </span>
                        ) : item.fulfilled_quantity > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderWorkflowTracker;
