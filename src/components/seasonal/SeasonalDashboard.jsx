/**
 * Seasonal Dashboard Component
 * Main dashboard for seasonal inventory analysis and AI predictions
 */

import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Spin, 
  Alert,
  Tabs,
  Statistic,
  Badge,
  message
} from 'antd';
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  Calendar,
  Package,
  Target,
  Brain,
  RefreshCw
} from 'lucide-react';

import { seasonalService } from '../../services/seasonalService';
import SeasonalPatterns from './SeasonalPatterns';
import DemandTrends from './DemandTrends';
import PredictionOverview from './PredictionOverview';
import RecommendationsPanel from './RecommendationsPanel';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SeasonalDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics summary and recommendations in parallel
      const [summary, recs] = await Promise.all([
        seasonalService.getAnalyticsSummary(),
        seasonalService.getSeasonalRecommendations()
      ]);

      setAnalyticsData(summary);
      setRecommendations(recs);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runSeasonalAnalysis = async () => {
    try {
      setLoading(true);
      message.info('Starting seasonal analysis...');

      const analysis = await seasonalService.analyzeSeasonalPatterns();
      
      message.success(`Analysis completed! Analyzed ${analysis.products_analyzed} products.`);
      
      // Reload dashboard data
      await loadDashboardData();

    } catch (error) {
      console.error('Failed to run seasonal analysis:', error);
      message.error('Failed to run seasonal analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboardData();
    message.success('Dashboard refreshed');
  };

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        action={
          <Button onClick={loadDashboardData} type="primary">
            Retry
          </Button>
        }
      />
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space justify="space-between" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <Space>
                <Brain size={32} color="#1890ff" />
                Seasonal Inventory AI
              </Space>
            </Title>
            <Text type="secondary">
              AI-powered seasonal inventory analysis and demand predictions
            </Text>
          </div>
          <Space>
            <Button 
              icon={<RefreshCw size={16} />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<Brain size={16} />}
              onClick={runSeasonalAnalysis}
              loading={loading}
            >
              Run Analysis
            </Button>
          </Space>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Patterns"
              value={analyticsData?.total_patterns || 0}
              prefix={<BarChart3 size={20} color="#1890ff" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Predictions"
              value={analyticsData?.total_predictions || 0}
              prefix={<TrendingUp size={20} color="#52c41a" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Recommendations"
              value={analyticsData?.total_recommendations || 0}
              prefix={<Target size={20} color="#faad14" />}
              suffix={
                analyticsData?.high_priority_recommendations > 0 && (
                  <Badge 
                    count={analyticsData.high_priority_recommendations} 
                    offset={[10, 0]}
                  />
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Analysis Status"
              value={analyticsData?.analysis_status || 'inactive'}
              prefix={<Package size={20} />}
              valueStyle={{ 
                color: getStatusColor(analyticsData?.analysis_status) 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* High Priority Alerts */}
      {analyticsData?.high_priority_recommendations > 0 && (
        <Alert
          message="High Priority Recommendations"
          description={`You have ${analyticsData.high_priority_recommendations} high priority recommendations that require immediate attention.`}
          type="warning"
          showIcon
          icon={<AlertTriangle size={16} />}
          style={{ marginBottom: '24px' }}
          action={
            <Button 
              size="small" 
              type="primary" 
              onClick={() => setActiveTab('recommendations')}
            >
              View
            </Button>
          }
        />
      )}

      {/* Main Content Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: '24px' }}
        >
          <TabPane 
            tab={
              <Space>
                <BarChart3 size={16} />
                Overview
              </Space>
            } 
            key="overview"
          >
            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <PredictionOverview analyticsData={analyticsData} />
                </Col>
                <Col xs={24} lg={12}>
                  <RecommendationsPanel 
                    recommendations={recommendations.slice(0, 5)} 
                    onRefresh={handleRefresh}
                  />
                </Col>
              </Row>
            </Spin>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <TrendingUp size={16} />
                Demand Trends
              </Space>
            } 
            key="trends"
          >
            <Spin spinning={loading}>
              <DemandTrends />
            </Spin>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <Calendar size={16} />
                Seasonal Patterns
              </Space>
            } 
            key="patterns"
          >
            <Spin spinning={loading}>
              <SeasonalPatterns />
            </Spin>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <Target size={16} />
                Recommendations
                {analyticsData?.high_priority_recommendations > 0 && (
                  <Badge 
                    count={analyticsData.high_priority_recommendations} 
                    size="small" 
                  />
                )}
              </Space>
            } 
            key="recommendations"
          >
            <Spin spinning={loading}>
              <RecommendationsPanel 
                recommendations={recommendations} 
                onRefresh={handleRefresh}
                showAll={true}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SeasonalDashboard;
