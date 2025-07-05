import React from 'react';
import { RefreshCw, Settings, User, Wifi, WifiOff } from 'lucide-react';

const WorkflowHeader = ({ 
  title, 
  role, 
  iconComponent: IconComponent, 
  gradientColors, 
  onRefresh, 
  refreshing, 
  connectionStatus,
  isConnected,
  currentUser,
  onSettings 
}) => {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Role Icon */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors} text-white shadow-lg`}>
              {IconComponent && <IconComponent className="h-6 w-6" />}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {role} Dashboard - Monitor and manage your workflow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm">
              {isConnected ? (
                <Wifi className={`h-4 w-4 ${getConnectionStatusColor()}`} />
              ) : (
                <WifiOff className={`h-4 w-4 ${getConnectionStatusColor()}`} />
              )}
              <span className={`font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>

            {/* Current User */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{currentUser?.username || 'User'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {currentUser?.role === 'Manager' && onSettings && (
                <button
                  onClick={onSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowHeader;
