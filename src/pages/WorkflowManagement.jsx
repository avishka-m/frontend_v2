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
  Target,
  Eye,
  Filter,
  Download,
  Bell,
  Zap
} from 'lucide-react';
import workflowService from '../services/workflowService';

const WorkflowManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWorkflowMetrics();
  }, []);

  const fetchWorkflowMetrics = async () => {
    try {
      setLoading(true);
      const result = await workflowService.getWorkflowMetrics();
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch workflow metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWorkflowMetrics();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50';
      case 'in_progress': return 'bg-blue-50';
      case 'pending': return 'bg-yellow-50';
      case 'high': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'picking': return <Package className="w-5 h-5 text-blue-600" />;
      case 'packing': return <Package className="w-5 h-5 text-purple-600" />;
      case 'shipping': return <Truck className="w-5 h-5 text-green-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const filterTasks = (tasks) => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => {
      if (filter === 'high-priority') return task.priority === 'high';
      if (filter === 'my-tasks') return task.worker_id === currentUser?.workerID;
      return task.type === filter;
    });
  };

  const handleTaskAction = (task) => {
    const routes = {
      picking: `/picking/${task.id}`,
      packing: `/packing/${task.id}`,
      shipping: `/shipping/${task.id}`
    };
    
    if (routes[task.type]) {
      navigate(routes[task.type]);
    }
  };

  const canPerformAction = (task) => {
    const userRole = currentUser?.role;
    const allowedRoles = {
      picking: ['Manager', 'Picker'],
      packing: ['Manager', 'Packer'],
      shipping: ['Manager', 'Driver']
    };
    
    return allowedRoles[task.type]?.includes(userRole) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTasks = filterTasks(metrics?.activeTasks || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Unified operations control and monitoring
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
                  onClick={() => navigate('/analytics')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Tasks
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.metrics?.totalActiveTasks || 0}
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
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Critical Tasks
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.metrics?.criticalTasks || 0}
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
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilization Rate
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.metrics?.utilizationRate || 0}%
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
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bottlenecks
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.metrics?.bottlenecks?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'tasks', label: 'Active Tasks', icon: Package },
              { key: 'optimization', label: 'Optimization', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Workload Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Picking</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.current_workload?.active_picking || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.capacity?.picking || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, ((metrics?.status?.current_workload?.active_picking || 0) / Math.max(1, metrics?.status?.capacity?.picking || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Packing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.current_workload?.active_packing || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.capacity?.packing || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, ((metrics?.status?.current_workload?.active_packing || 0) / Math.max(1, metrics?.status?.capacity?.packing || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.current_workload?.active_shipping || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm font-medium">
                        {metrics?.status?.capacity?.shipping || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, ((metrics?.status?.current_workload?.active_shipping || 0) / Math.max(1, metrics?.status?.capacity?.shipping || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/orders')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">View Orders</p>
                        <p className="text-sm text-gray-600">Manage all orders</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/inventory')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Check Inventory</p>
                        <p className="text-sm text-gray-600">Monitor stock levels</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/analytics')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">View Analytics</p>
                        <p className="text-sm text-gray-600">Performance insights</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Tasks</option>
                    <option value="high-priority">High Priority</option>
                    <option value="my-tasks">My Tasks</option>
                    <option value="picking">Picking</option>
                    <option value="packing">Packing</option>
                    <option value="shipping">Shipping</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredTasks.length} of {metrics?.activeTasks?.length || 0} tasks
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active tasks found</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={`${task.type}-${task.id}`}
                      className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${getStatusBgColor(task.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTaskIcon(task.type)}
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {task.type} Task #{task.id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Order #{task.order_id} • {task.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getPriorityIcon(task.priority)}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/workflow/order/${task.order_id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canPerformAction(task) && (
                              <button
                                onClick={() => handleTaskAction(task)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              {/* Bottlenecks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bottlenecks</h3>
                {metrics?.metrics?.bottlenecks?.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.metrics.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="font-medium text-red-800">{bottleneck}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No bottlenecks detected</p>
                )}
              </div>

              {/* Optimization Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                {metrics?.optimization?.optimizations?.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.optimization.optimizations.map((opt, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <TrendingUp className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">{opt.area}</h4>
                            <p className="text-sm text-blue-700 mt-1">{opt.action}</p>
                            <p className="text-sm text-blue-600 mt-2">{opt.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No optimization recommendations available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManagement;
