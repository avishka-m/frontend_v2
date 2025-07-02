import React from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Typography, 
  Space, 
  Alert, 
  Progress, 
  Row, 
  Col,
  Statistic,
  Button
} from 'antd';
import {
  AlertOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  CalendarOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const InventoryRecommendations = ({ recommendations, productInfo }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Alert
        message="No recommendations available"
        description="Generate a forecast to get inventory recommendations"
        type="info"
        showIcon
      />
    );
  }

  // Get recommendation priority color
  const getPriorityColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  // Get recommendation icon
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'reorder_point':
        return <ReloadOutlined style={{ color: '#1890ff' }} />;
      case 'order_quantity':
        return <ShoppingCartOutlined style={{ color: '#52c41a' }} />;
      case 'peak_preparation':
        return <AlertOutlined style={{ color: '#faad14' }} />;
      case 'trend_alert':
        return <RiseOutlined style={{ color: '#f5222d' }} />;
      case 'safety_stock':
        return <WarningOutlined style={{ color: '#722ed1' }} />;
      default:
        return <AlertOutlined style={{ color: '#666' }} />;
    }
  };

  // Group recommendations by type
  const groupedRecommendations = recommendations.reduce((groups, rec) => {
    const type = rec.type || 'general';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(rec);
    return groups;
  }, {});

  // Calculate urgency stats
  const urgencyStats = recommendations.reduce((stats, rec) => {
    const urgency = rec.urgency || 'normal';
    stats[urgency] = (stats[urgency] || 0) + 1;
    return stats;
  }, {});

  const totalRecommendations = recommendations.length;
  const highUrgency = urgencyStats.high || 0;
  const urgencyPercentage = totalRecommendations > 0 
    ? Math.round((highUrgency / totalRecommendations) * 100) 
    : 0;

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Total Recommendations"
              value={totalRecommendations}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="High Priority"
              value={highUrgency}
              valueStyle={{ color: urgencyPercentage > 50 ? '#f5222d' : '#52c41a' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Urgency Level"
              value={urgencyPercentage}
              suffix="%"
              valueStyle={{ 
                color: urgencyPercentage > 70 ? '#f5222d' : 
                       urgencyPercentage > 30 ? '#faad14' : '#52c41a' 
              }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* High Priority Alerts */}
      {highUrgency > 0 && (
        <Alert
          message={`${highUrgency} High Priority Recommendation${highUrgency > 1 ? 's' : ''}`}
          description="Immediate action recommended to avoid stockouts or excess inventory"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Recommendations List */}
      <List
        dataSource={recommendations}
        renderItem={(recommendation, index) => (
          <List.Item>
            <Card 
              size="small" 
              style={{ width: '100%' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Row justify="space-between" align="top">
                <Col span={18}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space align="center">
                      {getRecommendationIcon(recommendation.type)}
                      <Text strong>{recommendation.title}</Text>
                      <Tag color={getPriorityColor(recommendation.urgency)}>
                        {(recommendation.urgency || 'normal').toUpperCase()}
                      </Tag>
                      <Tag>{recommendation.type?.replace('_', ' ').toUpperCase()}</Tag>
                    </Space>
                    
                    <Text type="secondary">{recommendation.description}</Text>
                    
                    {recommendation.calculation && (
                      <Text code style={{ fontSize: '11px' }}>
                        Calculation: {recommendation.calculation}
                      </Text>
                    )}
                    
                    {recommendation.action && (
                      <Space>
                        <Text strong>Suggested Action:</Text>
                        <Text>{recommendation.action.replace('_', ' ')}</Text>
                      </Space>
                    )}
                  </Space>
                </Col>
                
                <Col span={6} style={{ textAlign: 'right' }}>
                  {recommendation.value && (
                    <Statistic
                      value={recommendation.value}
                      valueStyle={{ 
                        fontSize: '16px',
                        color: recommendation.urgency === 'high' ? '#f5222d' : '#1890ff'
                      }}
                      suffix="units"
                    />
                  )}
                  
                  {recommendation.date && (
                    <Space style={{ marginTop: '8px' }}>
                      <CalendarOutlined style={{ color: '#666' }} />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {new Date(recommendation.date).toLocaleDateString()}
                      </Text>
                    </Space>
                  )}
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />

      {/* Action Buttons */}
      <Card size="small" style={{ marginTop: '16px', backgroundColor: '#fafafa' }}>
        <Space>
          <Button type="primary" size="small">
            Apply All Recommendations
          </Button>
          <Button size="small">
            Export Report
          </Button>
          <Button size="small">
            Schedule Review
          </Button>
        </Space>
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </div>
      </Card>

      {/* Recommendation Types Legend */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>Recommendation Types:</Title>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Space size="small">
              <ReloadOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: '11px' }}>Reorder Point: When to reorder</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space size="small">
              <ShoppingCartOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: '11px' }}>Order Quantity: How much to order</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space size="small">
              <AlertOutlined style={{ color: '#faad14' }} />
              <Text style={{ fontSize: '11px' }}>Peak Preparation: Seasonal adjustments</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space size="small">
              <RiseOutlined style={{ color: '#f5222d' }} />
              <Text style={{ fontSize: '11px' }}>Trend Alert: Demand pattern changes</Text>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InventoryRecommendations;
