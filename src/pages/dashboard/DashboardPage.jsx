/**
 * Dashboard Page Component
 * Role-based dashboard with AI-powered insights and quick actions
 */

import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Statistic, Typography, Button, Space, 
  Alert, Timeline, List, Avatar, Progress, Tag, Spin,
  Divider, Empty
} from 'antd';
import {
  TruckOutlined, BoxPlotOutlined, UserOutlined, 
  BarChartOutlined, RobotOutlined, BellOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simulate API call for dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Mock data based on role
        const mockData = generateMockData(user?.role);
        setDashboardData(mockData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  const generateMockData = (role) => {
    const baseData = {
      metrics: {
        totalOrders: Math.floor(Math.random() * 1000) + 500,
        activeWorkers: Math.floor(Math.random() * 50) + 25,
        inventoryItems: Math.floor(Math.random() * 5000) + 2000,
        completionRate: Math.floor(Math.random() * 20) + 80
      },
      aiInsights: [
        {
          type: 'success',
          title: 'Peak Hour Optimization',
          message: 'AI detected optimal staffing for 2-4 PM shift. Consider adding 2 pickers.',
          time: '2 hours ago'
        },
        {
          type: 'warning',
          title: 'Inventory Alert',
          message: 'Low stock detected in electronics category. Reorder recommended.',
          time: '4 hours ago'
        },
        {
          type: 'info',
          title: 'Seasonal Prediction',
          message: 'Holiday season demand predicted to increase by 35% next week.',
          time: '6 hours ago'
        }
      ],
      recentActivities: [
        { user: 'John Doe', action: 'Completed order #12345', time: '5 min ago', status: 'success' },
        { user: 'Jane Smith', action: 'Started picking batch B-001', time: '12 min ago', status: 'active' },
        { user: 'Mike Johnson', action: 'Delivered route R-025', time: '25 min ago', status: 'success' },
        { user: 'AI System', action: 'Generated weekly inventory report', time: '1 hour ago', status: 'info' }
      ]
    };

    // Role-specific customizations
    if (role === 'picker') {
      baseData.roleSpecific = {
        assignedOrders: Math.floor(Math.random() * 20) + 10,
        completedToday: Math.floor(Math.random() * 15) + 5,
        averagePickTime: `${Math.floor(Math.random() * 5) + 3} min`,
        efficiency: Math.floor(Math.random() * 20) + 85
      };
    } else if (role === 'manager') {
      baseData.roleSpecific = {
        teamPerformance: Math.floor(Math.random() * 20) + 85,
        dailyRevenue: Math.floor(Math.random() * 50000) + 25000,
        costOptimization: Math.floor(Math.random() * 15) + 10,
        customerSatisfaction: Math.floor(Math.random() * 10) + 90
      };
    }

    return baseData;
  };

  const getRoleSpecificCards = () => {
    if (!dashboardData?.roleSpecific) return null;

    if (hasRole('picker')) {
      return (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Assigned Orders"
                value={dashboardData.roleSpecific.assignedOrders}
                prefix={<BoxPlotOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed Today"
                value={dashboardData.roleSpecific.completedToday}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Pick Time"
                value={dashboardData.roleSpecific.averagePickTime}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Efficiency"
                value={dashboardData.roleSpecific.efficiency}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      );
    }

    if (hasRole('manager')) {
      return (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Team Performance"
                value={dashboardData.roleSpecific.teamPerformance}
                suffix="%"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Daily Revenue"
                value={dashboardData.roleSpecific.dailyRevenue}
                prefix="$"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Cost Savings"
                value={dashboardData.roleSpecific.costOptimization}
                suffix="%"
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Customer Satisfaction"
                value={dashboardData.roleSpecific.customerSatisfaction}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading your personalized dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Welcome Header */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
            <div style={{ color: 'white' }}>
              <Title level={2} style={{ color: 'white', margin: '0 0 8px 0' }}>
                Welcome back, {user?.username}!
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: 0 }}>
                Your AI-powered workspace is ready. Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Role-specific metrics */}
      {getRoleSpecificCards() && (
        <>
          {getRoleSpecificCards()}
          <Divider />
        </>
      )}

      {/* General Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={dashboardData.metrics.totalOrders}
              prefix={<BoxPlotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Workers"
              value={dashboardData.metrics.activeWorkers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inventory Items"
              value={dashboardData.metrics.inventoryItems}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={dashboardData.metrics.completionRate}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Content Grid */}
      <Row gutter={[16, 16]}>
        {/* AI Insights */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RobotOutlined style={{ color: '#1890ff' }} />
                AI Insights & Recommendations
              </Space>
            }
            extra={<Button type="link">View All</Button>}
          >
            <Timeline>
              {dashboardData.aiInsights.map((insight, index) => (
                <Timeline.Item
                  key={index}
                  color={insight.type === 'success' ? 'green' : insight.type === 'warning' ? 'orange' : 'blue'}
                >
                  <div>
                    <Text strong>{insight.title}</Text>
                    <br />
                    <Text type="secondary">{insight.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{insight.time}</Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BellOutlined style={{ color: '#52c41a' }} />
                Recent Activities
              </Space>
            }
            extra={<Button type="link">View All</Button>}
          >
            <List
              dataSource={dashboardData.recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.user === 'AI System' ? <RobotOutlined /> : <UserOutlined />}
                        style={{ 
                          backgroundColor: item.status === 'success' ? '#52c41a' : 
                                          item.status === 'active' ? '#1890ff' : '#722ed1'
                        }}
                      />
                    }
                    title={item.user}
                    description={
                      <div>
                        <Text>{item.action}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                      </div>
                    }
                  />
                  <Tag 
                    color={item.status === 'success' ? 'green' : 
                           item.status === 'active' ? 'blue' : 'purple'}
                  >
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Space wrap size="middle">
              <Button type="primary" icon={<RobotOutlined />}>
                Chat with AI Assistant
              </Button>
              <Button icon={<BoxPlotOutlined />}>
                View Orders
              </Button>
              <Button icon={<BarChartOutlined />}>
                Analytics Dashboard
              </Button>
              <Button icon={<TruckOutlined />}>
                Inventory Management
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
