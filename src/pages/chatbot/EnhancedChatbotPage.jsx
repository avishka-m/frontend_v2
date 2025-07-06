/**
 * Enhanced Chatbot Page
 * Main page that integrates all enhanced chatbot features with role-based access
 */

import React, { useState, useEffect } from 'react';
import { 
  FiMessageCircle, 
    FiMaximize,
  FiMinimize,
  FiSettings,
  FiHelpCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/common/Tabs';
import { useAuth } from '../../hooks/useAuth';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../../components/common/Notification';
import EnhancedChatbotInterface from '../../components/chatbot/EnhancedChatbotInterface';
import ManagerAnalyticsPanel from '../../components/chatbot/ManagerAnalyticsPanel';
import ConversationManagementPanel from '../../components/chatbot/ConversationManagementPanel';
import UserChatInterface from '../../components/chatbot/UserChatInterface';

const EnhancedChatbotPage = () => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState('chat');
  const [systemStatus, setSystemStatus] = useState({});
  const [userPermissions, setUserPermissions] = useState({});
  const [conversations, setConversations] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine user role and access level
  const userRole = user?.role || 'Clerk';
  const isManager = userRole.toLowerCase() === 'manager';

  useEffect(() => {
    initializePage();
  }, [user]);

  const initializePage = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load initial data in parallel
      const promises = [
        loadSystemStatus(),
        loadUserPermissions(),
        loadConversations(),
      ];
      
      // Add manager-specific data if applicable
      if (isManager) {
        promises.push(loadDashboardData());
      }
      
      await Promise.all(promises);
      
    } catch (error) {
      showNotification('Failed to initialize chatbot page', 'error');
      console.error('Page initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    try {
      // This would typically call an API to get system status
      // For now, we'll simulate it
      setSystemStatus({
        status: 'operational',
        uptime: '99.9%',
        activeAgents: 5,
        responseTime: '< 200ms'
      });
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const permissions = await chatbotService.roleBased.getPermissions();
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotService.getAllConversations({ limit: 100 });
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const dashboard = await chatbotService.roleBased.getDashboard();
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    await initializePage();
    showNotification('Data refreshed successfully', 'success');
  };

  const handleConversationUpdate = (conversationId, updates) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.conversation_id === conversationId 
          ? { ...conv, ...updates }
          : conv
      )
    );
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiMessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced WMS Chatbot</h1>
            <p className="text-sm text-gray-600">
              AI-powered warehouse management assistant • {userRole} Access
            </p>
          </div>
        </div>
        
        {/* System Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            systemStatus.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {systemStatus.status === 'operational' ? 'All systems operational' : 'System issues detected'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* User Info */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
          <p className="text-xs text-gray-500">{userRole} • {Object.keys(userPermissions).length} features</p>
        </div>
        
        {/* System Stats */}
        <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">Uptime</p>
            <p className="text-sm font-semibold text-gray-900">{systemStatus.uptime}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Response</p>
            <p className="text-sm font-semibold text-gray-900">{systemStatus.responseTime}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Agents</p>
            <p className="text-sm font-semibold text-gray-900">{systemStatus.activeAgents}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <FiRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMessageCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Features</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(userPermissions).length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiSettings className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStatus.status === 'operational' ? '100%' : '85%'}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiAlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    // For non-managers, show simple user chat interface
    if (!isManager) {
      return (
        <div className="flex-1 overflow-hidden">
          <UserChatInterface key={refreshKey} />
        </div>
      );
    }

    // For managers, show full enhanced interface with tabs
    return (
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 p-1 m-4 mb-0">
            <TabsTrigger value="chat">Enhanced Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Enhanced Chat Interface Tab */}
          <TabsContent value="chat" className="flex-1 p-4 pt-2">
            <EnhancedChatbotInterface key={refreshKey} />
          </TabsContent>

          {/* Analytics Tab (Manager Only) */}
          <TabsContent value="analytics" className="flex-1 p-4 pt-2">
            <ManagerAnalyticsPanel
              dashboardData={dashboardData}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="flex-1 p-4 pt-2">
            <ConversationManagementPanel
              conversations={conversations}
              onConversationUpdate={handleConversationUpdate}
              onRefresh={loadConversations}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Enhanced Chatbot</h2>
          <p className="text-gray-600">Initializing AI assistant and loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      <div className="flex flex-col h-full">
        {renderHeader()}
        {!isFullscreen && isManager && renderQuickStats()}
        {renderMainContent()}
      </div>
      
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Help Text */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FiInfo className="h-4 w-4" />
            <span>Enhanced WMS Chatbot v2.0 • Industry-grade AI assistant</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedChatbotPage; 