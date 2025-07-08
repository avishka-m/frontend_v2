import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, RefreshCw, BarChart3, Settings, Bell, Zap, TrendingUp } from 'lucide-react';

const WorkflowHeader = ({ workflowData, loading = false, onRefresh, refreshing = false, currentUser }) => {
  if (loading) {
    return <WorkflowHeaderSkeleton />;
  }

  const canAccessAnalytics = currentUser?.role === 'Manager';

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title and Description */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Workflow Management
              </h1>
              <p className="text-sm text-gray-500">
                Unified operations control and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Metrics and Actions */}
        <div className="flex items-center space-x-6">
          {/* Real-time Metrics */}
          {workflowData && (
            <div className="flex items-center space-x-6 text-sm">
              {/* Active Tasks */}
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="block font-medium text-orange-600">
                    {workflowData.activeTasks?.length || 0}
                  </span>
                  <div className="text-xs text-gray-500">Active Tasks</div>
                </div>
              </div>

              {/* Efficiency Rate */}
              {workflowData.efficiency && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div>
                    <span className="block font-medium text-green-600">
                      {Math.round(workflowData.efficiency)}%
                    </span>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                </div>
              )}

              {/* Pending Actions */}
              {workflowData.pendingActions && (
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="block font-medium text-blue-600">
                      {workflowData.pendingActions}
                    </span>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  workflowData.systemStatus === 'operational' ? 'bg-green-500' : 
                  workflowData.systemStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <span className={`block font-medium ${
                    workflowData.systemStatus === 'operational' ? 'text-green-600' : 
                    workflowData.systemStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {workflowData.systemStatus === 'operational' ? 'Operational' : 
                     workflowData.systemStatus === 'warning' ? 'Warning' : 'Issues'}
                  </span>
                  <div className="text-xs text-gray-500">System</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            {canAccessAnalytics && (
              <Link
                to="/analytics"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            )}

            {canAccessAnalytics && (
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
        <div className="flex space-x-3">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default WorkflowHeader; 