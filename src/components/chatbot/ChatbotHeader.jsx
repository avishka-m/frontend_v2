import React from 'react';
import { 
  MessageCircle, 
  Bot, 
  Users, 
  Activity, 
  Settings, 
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Minimize2,
  Maximize2
} from 'lucide-react';

const ChatbotHeader = ({ 
  chatbotData, 
  loading = false, 
  onRefresh, 
  refreshing = false, 
  currentUser,
  onToggleFullscreen,
  isFullscreen = false,
  systemStatus,
  conversationStats
}) => {
  if (loading) {
    return <ChatbotHeaderSkeleton />;
  }

  const userRole = currentUser?.role || 'Clerk';
  const isManager = userRole.toLowerCase() === 'manager';

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col space-y-4">
        {/* Title and Main Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Warehouse Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  Intelligent operations support • {userRole} Access
                </p>
              </div>
            </div>

            {/* System Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                systemStatus?.status === 'operational' ? 'bg-green-500' : 
                systemStatus?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {systemStatus?.status === 'operational' ? 'All systems operational' : 
                 systemStatus?.status === 'warning' ? 'Minor issues' : 'System issues detected'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              onClick={onToggleFullscreen}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 mr-2" />
              ) : (
                <Maximize2 className="w-4 h-4 mr-2" />
              )}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>

            {isManager && (
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>

        {/* Real-time AI Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Active Conversations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    conversationStats?.active || 0
                  )}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              Live conversations
            </div>
          </div>

          {/* AI Response Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    systemStatus?.responseTime || '< 200ms'
                  )}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Optimized
            </div>
          </div>

          {/* Available Agents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Agents</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    systemStatus?.activeAgents || 5
                  )}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-purple-600">
              <Users className="w-4 h-4 mr-1" />
              Ready to assist
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {loading ? (
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    systemStatus?.uptime || '99.9%'
                  )}
                </p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-indigo-600">
              <Clock className="w-4 h-4 mr-1" />
              Reliable service
            </div>
          </div>
        </div>

        {/* User Info and Quick Access */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Logged in as: <span className="font-medium text-gray-900">{currentUser?.username || 'User'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                userRole.toLowerCase() === 'manager' ? 'bg-purple-100 text-purple-800' :
                userRole.toLowerCase() === 'clerk' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userRole}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4 text-sm">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              New Conversation
            </button>
            <button className="text-green-600 hover:text-green-800 font-medium">
              Quick Help
            </button>
            {isManager && (
              <button className="text-purple-600 hover:text-purple-800 font-medium">
                Analytics Dashboard
              </button>
            )}
          </div>
        </div>

        {/* System Alerts */}
        {systemStatus?.alerts && systemStatus.alerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">System Notifications</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {systemStatus.alerts.map((alert, index) => (
                    <li key={index}>• {alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatbotHeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-56 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-2">
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ChatbotHeader; 