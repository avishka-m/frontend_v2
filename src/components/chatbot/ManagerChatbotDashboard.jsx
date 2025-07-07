/**
 * Manager Chatbot Dashboard Component
 * Comprehensive analytics and management interface for managers
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../common/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  FiUsers, 
  FiMessageCircle, 
  FiTrendingUp, 
  FiAlertTriangle,
  FiSettings,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiFilter,
  FiCalendar,
  FiActivity,
  FiBarChart2,
  FiTarget
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/Tabs';
import { Alert, AlertDescription } from '../common/Alert';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../common/Notification';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

const ManagerChatbotDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [systemOverview, setSystemOverview] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchSystemOverview();
    fetchPerformanceMetrics();
    fetchSystemAlerts();
    fetchExecutiveSummary();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await chatbotService.get('/role-based/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    }
  };

  const fetchSystemOverview = async () => {
    try {
      const response = await chatbotService.get(`/role-based/analytics/system-overview?period_days=${selectedPeriod}`);
      setSystemOverview(response.data);
    } catch (error) {
      console.error('Error fetching system overview:', error);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await chatbotService.get(`/role-based/analytics/performance?period_days=${selectedPeriod}`);
      setPerformanceMetrics(response.data);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const response = await chatbotService.get('/role-based/analytics/alerts');
      setSystemAlerts(response.data);
    } catch (error) {
      console.error('Error fetching system alerts:', error);
    }
  };

  const fetchExecutiveSummary = async () => {
    try {
      const response = await chatbotService.get(`/role-based/analytics/executive-summary?period_days=${selectedPeriod}`);
      setExecutiveSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching executive summary:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardData(),
      fetchSystemOverview(),
      fetchPerformanceMetrics(),
      fetchSystemAlerts(),
      fetchExecutiveSummary()
    ]);
    setNotification({ type: 'success', message: 'Dashboard refreshed successfully' });
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    setLoading(true);
  };

  const handleExportData = async () => {
    try {
      const response = await chatbotService.post('/role-based/export/conversations', {
        format: 'json',
        include_metadata: true,
        include_context: true
      });
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setNotification({ type: 'success', message: 'Data exported successfully' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({ type: 'error', message: 'Failed to export data' });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading analytics...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <FiAlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and management tools</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} variant="outline" className="flex items-center space-x-2">
            <FiDownload className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center space-x-2">
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {systemAlerts.map((alert, index) => (
            <Alert key={index} className={`border-${alert.severity === 'critical' ? 'red' : 'yellow'}-200 bg-${alert.severity === 'critical' ? 'red' : 'yellow'}-50`}>
              <FiAlertTriangle className={`h-4 w-4 text-${alert.severity === 'critical' ? 'red' : 'yellow'}-600`} />
              <AlertDescription className={`text-${alert.severity === 'critical' ? 'red' : 'yellow'}-800`}>
                <strong>{alert.severity === 'critical' ? 'Critical' : 'Warning'}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executiveSummary?.summary?.total_conversations || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMessageCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executiveSummary?.summary?.active_users || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiUsers className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executiveSummary?.summary?.system_health || 'Unknown'}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FiActivity className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agent Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(executiveSummary?.summary?.agent_performance * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <FiTarget className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiBarChart2 className="h-5 w-5" />
                  <span>System Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemOverview?.usage_statistics?.conversations_per_day || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="conversations" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Usage Distribution */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiUsers className="h-5 w-5" />
                  <span>Agent Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(systemOverview?.usage_statistics?.agent_usage_breakdown || {}).map(([key, value]) => ({
                        name: key,
                        value: value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(systemOverview?.usage_statistics?.agent_usage_breakdown || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FiActivity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recent_conversations?.slice(0, 5).map((conversation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiMessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{conversation.title}</p>
                        <p className="text-sm text-gray-500">Agent: {conversation.agent_role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{conversation.message_count} messages</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics?.comparison ? Object.entries(performanceMetrics.comparison).map(([key, value]) => ({
                    metric: key,
                    current: value.current,
                    previous: value.previous
                  })) : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#8884d8" name="Current Period" />
                    <Line type="monotone" dataKey="previous" stroke="#82ca9d" name="Previous Period" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics Table */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics?.comparison && Object.entries(performanceMetrics.comparison).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Current: {value.current}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={value.trend === 'up' ? 'success' : value.trend === 'down' ? 'destructive' : 'secondary'}>
                          {value.change_percent > 0 ? '+' : ''}{value.change_percent}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Performance */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemOverview?.agent_metrics?.individual_agents && Object.entries(systemOverview.agent_metrics.individual_agents).map(([agent, metrics]) => (
                    <div key={agent} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{agent}</h4>
                        <Badge variant="outline">{metrics.total_interactions} interactions</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Success Rate</p>
                          <p className="font-medium">{(metrics.success_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Response Time</p>
                          <p className="font-medium">{metrics.average_response_time}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Capabilities */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Agent Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemOverview?.agent_metrics?.individual_agents && Object.entries(systemOverview.agent_metrics.individual_agents).map(([agent, metrics]) => (
                    <div key={agent} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 capitalize mb-2">{agent}</h4>
                      <div className="flex flex-wrap gap-2">
                        {metrics.capabilities && Object.keys(metrics.capabilities).map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {systemOverview?.engagement_metrics?.total_active_users || 0}
                  </p>
                  <p className="text-sm text-gray-500">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {systemOverview?.engagement_metrics?.average_session_duration || 0}
                  </p>
                  <p className="text-sm text-gray-500">Avg Session Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {systemOverview?.engagement_metrics?.messages_per_user || 0}
                  </p>
                  <p className="text-sm text-gray-500">Messages per User</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemOverview?.trending_topics?.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{topic.topic.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">{topic.mentions} mentions</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={topic.growth_rate > 0 ? 'success' : 'destructive'}>
                        {topic.growth_rate > 0 ? '+' : ''}{topic.growth_rate}%
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        Sentiment: {topic.sentiment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {executiveSummary?.key_insights?.map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{insight.category}</Badge>
                          <p className="text-sm text-gray-700">{insight.insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {executiveSummary?.recommendations?.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Next Actions</h4>
                  <div className="space-y-2">
                    {executiveSummary?.next_actions?.map((action, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ManagerChatbotDashboard; 