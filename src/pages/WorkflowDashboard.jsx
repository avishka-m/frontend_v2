import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Package,
  Truck,
  RotateCcw,
  ArrowRight,
  BarChart3,
  Settings,
  RefreshCw,
  Users,
  Target
} from 'lucide-react';
import workflowService from '../services/workflowService';

const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const [statusResult, optimizationResult] = await Promise.all([
        workflowService.getWorkflowStatusOverview(),
        workflowService.getWorkflowOptimization()
      ]);

      if (statusResult.success) {
        setWorkflowStatus(statusResult.data);
      }

      if (optimizationResult.success) {
        setOptimization(optimizationResult.data);
      }
    } catch (err) {
      setError('Failed to fetch workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWorkflowData();
    setRefreshing(false);
  };

  const getWorkloadStatusColor = (current, capacity) => {
    if (capacity === 0) return 'gray';
    const utilization = (current / capacity) * 100;
    if (utilization > 90) return 'red';
    if (utilization > 70) return 'yellow';
    return 'green';
  };

  const getWorkloadStatusText = (current, capacity) => {
    if (capacity === 0) return 'No Capacity';
    const utilization = (current / capacity) * 100;
    return `${utilization.toFixed(0)}% utilized`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Monitor and manage warehouse operations workflow
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {currentUser?.role === 'Manager' && (
                <button
                  onClick={() => navigate('/workflow/settings')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Workload Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Picking
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {workflowStatus?.current_workload?.active_picking || 0}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_picking || 0,
                        workflowStatus?.capacity?.picking || 0
                      ) === 'red' ? 'text-red-600' : 
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_picking || 0,
                        workflowStatus?.capacity?.picking || 0
                      ) === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getWorkloadStatusText(
                        workflowStatus?.current_workload?.active_picking || 0,
                        workflowStatus?.capacity?.picking || 0
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Packing
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {workflowStatus?.current_workload?.active_packing || 0}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_packing || 0,
                        workflowStatus?.capacity?.packing || 0
                      ) === 'red' ? 'text-red-600' : 
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_packing || 0,
                        workflowStatus?.capacity?.packing || 0
                      ) === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getWorkloadStatusText(
                        workflowStatus?.current_workload?.active_packing || 0,
                        workflowStatus?.capacity?.packing || 0
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Shipping
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {workflowStatus?.current_workload?.active_shipping || 0}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_shipping || 0,
                        workflowStatus?.capacity?.shipping || 0
                      ) === 'red' ? 'text-red-600' : 
                      getWorkloadStatusColor(
                        workflowStatus?.current_workload?.active_shipping || 0,
                        workflowStatus?.capacity?.shipping || 0
                      ) === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getWorkloadStatusText(
                        workflowStatus?.current_workload?.active_shipping || 0,
                        workflowStatus?.capacity?.shipping || 0
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottlenecks & Issues */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Bottlenecks & Issues
            </h3>
            
            {workflowStatus?.bottlenecks?.length > 0 ? (
              <div className="space-y-3">
                {workflowStatus.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-50 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {bottleneck} Bottleneck
                      </p>
                      <p className="text-sm text-red-600">
                        Consider allocating additional resources to this area
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Bottlenecks Detected</h3>
                <p className="text-sm text-gray-500">All workflow stages are operating smoothly.</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Optimization Recommendations
            </h3>
            
            {optimization?.optimizations?.length > 0 ? (
              <div className="space-y-3">
                {optimization.optimizations.map((opt, index) => (
                  <div key={index} className="border border-blue-200 rounded-md p-3">
                    <div className="flex items-start">
                      <Target className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {opt.area}: {opt.action}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {opt.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Optimizations Needed</h3>
                <p className="text-sm text-gray-500">Your workflow is operating efficiently.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      {optimization?.recommended_sequence?.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recommended Processing Sequence
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimization.recommended_sequence.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.orderID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          workflowService.getStatusColor(item.status) === 'green' ? 'bg-green-100 text-green-800' :
                          workflowService.getStatusColor(item.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                          workflowService.getStatusColor(item.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workflowService.getWorkflowActionLabel(item.next_action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/orders/${item.orderID}`)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/receiving')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Receiving</span>
            </button>
            
            <button
              onClick={() => navigate('/picking')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Activity className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Picking</span>
            </button>
            
            <button
              onClick={() => navigate('/packing')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Package className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Packing</span>
            </button>
            
            <button
              onClick={() => navigate('/shipping')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Truck className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Shipping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;
