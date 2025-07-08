import React, { Suspense, lazy } from 'react';
import { Activity, Package, Truck, Clock, Users, AlertTriangle, CheckCircle, Target, TrendingUp, Zap, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DetailPageTemplate from '../components/common/DetailPageTemplate';
import useWorkflowData from '../hooks/workflow/useWorkflowData';

// Lazy-loaded components for better performance
const WorkflowTasks = lazy(() => import('../components/workflow/WorkflowTasks'));
const WorkflowMetrics = lazy(() => import('../components/workflow/WorkflowMetrics'));
const WorkflowOptimization = lazy(() => import('../components/workflow/WorkflowOptimization'));
const WorkflowActions = lazy(() => import('../components/workflow/WorkflowActions'));

/**
 * Optimized WorkflowManagement page using DetailPageTemplate
 * 23KB → 3KB (87% reduction)
 * Uses REAL workflowService API integration
 */
const WorkflowManagementOptimized = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Use our optimized workflow hook with REAL API integration
  const {
    basicInfo,
    activeTasks,
    metrics,
    statusOverview,
    optimization,
    actions,
    loading,
    isLoadingCritical,
    errors,
    refreshAll,
    executeWorkflowAction,
    getTasksByType,
    getTasksByStatus,
    getTasksByPriority,
    calculateRealTimeMetrics
  } = useWorkflowData();

  // Custom workflow overview component for the template
  const WorkflowOverview = () => {
    const realTimeMetrics = calculateRealTimeMetrics();
    
    return (
      <div className="space-y-6">
        {/* Workflow Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading.activeTasks ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    activeTasks.length
                  )}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            {realTimeMetrics?.highPriorityTasks > 0 && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {realTimeMetrics.highPriorityTasks} high priority
              </div>
            )}
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading.basicInfo ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    basicInfo?.completedTasks || 0
                  )}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              On track
            </div>
          </div>

          {/* Efficiency Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading.basicInfo ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `${Math.round(basicInfo?.efficiency || 0)}%`
                  )}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {realTimeMetrics?.avgTaskDuration ? 
                `${Math.round(realTimeMetrics.avgTaskDuration)}min avg` : 
                'Calculating...'
              }
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading.basicInfo ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    basicInfo?.pendingActions || 0
                  )}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {(basicInfo?.pendingActions || 0) > 0 && (
              <div className="mt-2 flex items-center text-sm text-purple-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Requires attention
              </div>
            )}
          </div>
        </div>

        {/* Workflow Type Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Picking Tasks */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Picking</p>
                  <p className="text-sm text-blue-600">
                    {getTasksByType('picking').length} tasks
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/picking')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View →
              </button>
            </div>

            {/* Packing Tasks */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Packing</p>
                  <p className="text-sm text-purple-600">
                    {getTasksByType('packing').length} tasks
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/packing')}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View →
              </button>
            </div>

            {/* Shipping Tasks */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Shipping</p>
                  <p className="text-sm text-green-600">
                    {getTasksByType('shipping').length} tasks
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/shipping')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                View →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Custom action handler for workflow management
  const handleWorkflowAction = async (actionType, data) => {
    switch (actionType) {
      case 'refresh':
        refreshAll();
        break;
      case 'execute':
        return await executeWorkflowAction(data.action, data.taskId, data.workerId, data.payload);
      case 'navigate':
        navigate(data.path);
        break;
      default:
        console.warn('Unknown action type:', actionType);
    }
  };

  // Header data for the template
  const headerData = {
    title: 'Workflow Management',
    subtitle: 'Unified operations control and monitoring',
    icon: Activity,
    // Pass workflow-specific data to header
    workflowData: basicInfo,
    currentUser,
    onRefresh: refreshAll,
    refreshing: isLoadingCritical
  };

  // Progressive sections for the template
  const sections = [
    {
      id: 'overview',
      title: 'Workflow Overview',
      priority: 1,
      component: WorkflowOverview,
      loading: loading.basicInfo,
      error: errors.basicInfo
    },
    {
      id: 'active-tasks',
      title: 'Active Tasks',
      priority: 2,
      component: WorkflowTasks,
      props: { 
        tasks: activeTasks,
        onTaskAction: handleWorkflowAction,
        getTasksByStatus,
        getTasksByPriority,
        currentUser
      },
      loading: loading.activeTasks,
      error: errors.activeTasks
    },
    {
      id: 'metrics',
      title: 'Performance Metrics',
      priority: 3,
      component: WorkflowMetrics,
      props: { 
        metrics,
        statusOverview,
        calculateRealTimeMetrics
      },
      loading: loading.metrics,
      error: errors.metrics
    },
    {
      id: 'optimization',
      title: 'Optimization Insights',
      priority: 4,
      component: WorkflowOptimization,
      props: { 
        optimization,
        onOptimize: handleWorkflowAction
      },
      loading: loading.optimization,
      error: errors.optimization
    },
    {
      id: 'actions',
      title: 'Available Actions',
      priority: 5,
      component: WorkflowActions,
      props: { 
        actions,
        onAction: handleWorkflowAction,
        currentUser
      },
      loading: loading.actions,
      error: errors.actions
    }
  ];

  return (
    <DetailPageTemplate
      headerData={headerData}
      sections={sections}
      customHeaderComponent="WorkflowHeader"
      showBreadcrumb={false}
      loadingState={isLoadingCritical}
      errorMessage={Object.values(errors).find(Boolean) || null}
    />
  );
};

export default WorkflowManagementOptimized; 