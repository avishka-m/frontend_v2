/**
 * Manager Analytics Panel
 * Comprehensive analytics dashboard for manager users
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../common/Card';
import { 
  FiBarChart2, 
  FiUsers, 
  FiTrendingUp, 
  FiAlertCircle,
  FiActivity,
  FiDatabase,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiArrowRight,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiStar,
  FiTarget,
  FiClock,
  FiMessageCircle,
  FiShield
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/Tabs';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../common/Notification';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ManagerAnalyticsPanel = ({ dashboardData, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [systemOverview, setSystemOverview] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({});
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [executiveSummary, setExecutiveSummary] = useState({});
  const [agentManagement, setAgentManagement] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Set default analytics data since role-based endpoints don't exist yet
      const defaultOverview = {
        total_conversations: 0,
        active_users: 0,
        system_health: 'Good',
        avg_agent_performance: 85,
        conversation_growth: '+12%',
        user_growth: '+8%',
        performance_trend: '+5%'
      };
      
      const defaultPerformance = {
        response_time_avg: '1.2s',
        success_rate: '95%',
        user_satisfaction: '4.2/5'
      };
      
      const defaultAlerts = [
        { id: 1, type: 'info', message: 'System running normally', severity: 'low' },
        { id: 2, type: 'warning', message: 'High conversation volume detected', severity: 'medium' }
      ];
      
      const defaultSummary = {
        key_insights: ['User engagement increased', 'Response times improved'],
        recommendations: ['Consider adding more agents', 'Optimize frequently asked questions'],
        next_actions: ['Review agent performance', 'Update conversation templates']
      };
      
      const defaultAgents = {
        total_agents: 5,
        active_agents: 4,
        performance_avg: 85
      };
      
      setSystemOverview(defaultOverview);
      setPerformanceMetrics(defaultPerformance);
      setSystemAlerts(defaultAlerts);
      setExecutiveSummary(defaultSummary);
      setAgentManagement(defaultAgents);
      
      showNotification('Analytics loaded (demo data)', 'info');
      
    } catch (error) {
      showNotification('Failed to load analytics data', 'error');
      console.error('Analytics load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRefresh = async () => {
    await loadAnalyticsData();
    if (onRefresh) onRefresh();
    showNotification('Analytics refreshed', 'success');
  };

  const handleExportAnalytics = async () => {
    try {
      const analyticsData = {
        systemOverview,
        performanceMetrics,
        userAnalytics,
        systemAlerts,
        executiveSummary,
        agentManagement,
        period: selectedPeriod,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      showNotification('Analytics exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export analytics', 'error');
      console.error('Export error:', error);
    }
  };

  const renderMetricCard = (title, value, change, icon, color = 'blue') => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Total Conversations',
          systemOverview.total_conversations || 0,
          systemOverview.conversation_growth || null,
          <FiMessageCircle className="h-5 w-5 text-blue-600" />,
          'blue'
        )}
        {renderMetricCard(
          'Active Users',
          systemOverview.active_users || 0,
          systemOverview.user_growth || null,
          <FiUsers className="h-5 w-5 text-green-600" />,
          'green'
        )}
        {renderMetricCard(
          'System Health',
          systemOverview.system_health || 'Good',
          null,
          <FiActivity className="h-5 w-5 text-yellow-600" />,
          'yellow'
        )}
        {renderMetricCard(
          'Agent Performance',
          systemOverview.avg_agent_performance || 0,
          systemOverview.performance_trend || null,
          <FiStar className="h-5 w-5 text-purple-600" />,
          'purple'
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={systemOverview.conversation_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="conversations" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={systemOverview.agent_usage || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(systemOverview.agent_usage || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Alerts</span>
            <Badge variant={systemAlerts.length > 0 ? 'destructive' : 'secondary'}>
              {systemAlerts.length} alerts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemAlerts.length === 0 ? (
            <div className="text-center py-6">
              <FiCheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-gray-500">No system alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiAlertCircle className={`h-5 w-5 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderMetricCard(
          'Avg Response Time',
          `${performanceMetrics.avg_response_time || 0}ms`,
          performanceMetrics.response_time_trend || null,
          <FiClock className="h-5 w-5 text-blue-600" />,
          'blue'
        )}
        {renderMetricCard(
          'Success Rate',
          `${performanceMetrics.success_rate || 0}%`,
          performanceMetrics.success_rate_trend || null,
          <FiCheckCircle className="h-5 w-5 text-green-600" />,
          'green'
        )}
        {renderMetricCard(
          'Error Rate',
          `${performanceMetrics.error_rate || 0}%`,
          performanceMetrics.error_rate_trend || null,
          <FiXCircle className="h-5 w-5 text-red-600" />,
          'red'
        )}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceMetrics.response_time_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Error Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceMetrics.success_error_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successRate" fill="#10B981" name="Success Rate" />
                <Bar dataKey="errorRate" fill="#EF4444" name="Error Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      {/* Agent Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Total Agents',
          agentManagement.total_agents || 0,
          null,
          <FiShield className="h-5 w-5 text-blue-600" />,
          'blue'
        )}
        {renderMetricCard(
          'Active Agents',
          agentManagement.active_agents || 0,
          null,
          <FiCheckCircle className="h-5 w-5 text-green-600" />,
          'green'
        )}
        {renderMetricCard(
          'Top Performer',
          agentManagement.top_performer || 'N/A',
          null,
          <FiStar className="h-5 w-5 text-yellow-600" />,
          'yellow'
        )}
        {renderMetricCard(
          'Avg Rating',
          agentManagement.avg_rating || 0,
          null,
          <FiTarget className="h-5 w-5 text-purple-600" />,
          'purple'
        )}
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Agent</th>
                  <th className="text-left p-3">Conversations</th>
                  <th className="text-left p-3">Success Rate</th>
                  <th className="text-left p-3">Avg Response</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(agentManagement.agent_details || []).map((agent, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.role}</div>
                    </td>
                    <td className="p-3">{agent.conversations}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        agent.successRate > 90 ? 'bg-green-100 text-green-800' :
                        agent.successRate > 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {agent.successRate}%
                      </span>
                    </td>
                    <td className="p-3">{agent.avgResponse}ms</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <FiStar className="h-4 w-4 text-yellow-500" />
                        <span>{agent.rating}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Key Insights</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {(executiveSummary.key_insights || []).map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Recommendations</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {(executiveSummary.recommendations || []).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Next Actions</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {(executiveSummary.next_actions || []).map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executiveSummary.usage_patterns || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversations" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">System-wide chatbot performance and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportAnalytics}>
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <FiRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          {renderAgentsTab()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading analytics...</span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ManagerAnalyticsPanel; 