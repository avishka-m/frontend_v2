/**
 * Recommendations Panel Component
 * Shows AI-generated inventory recommendations
 */

import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Tag, 
  List,
  Popconfirm,
  Empty,
  Badge,
  message
} from 'antd';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const { Title, Text } = Typography;

const RecommendationsPanel = ({ recommendations = [], onRefresh, showAll = false }) => {
  const [loading, setLoading] = useState(false);

  const mockRecommendations = recommendations.length > 0 ? recommendations : [
    {
      id: '1',
      product_name: 'Winter Jacket',
      season: 'winter',
      recommendation_type: 'seasonal_adjustment',
      action_required: 'INCREASE_STOCK',
      priority: 'high',
      recommended_stock_level: 250,
      current_stock_level: 100,
      predicted_shortage: 150,
      cost_impact: 1500,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      product_name: 'Beach Umbrella',
      season: 'summer',
      recommendation_type: 'seasonal_adjustment',
      action_required: 'MAINTAIN_STOCK',
      priority: 'medium',
      recommended_stock_level: 180,
      current_stock_level: 175,
      predicted_shortage: null,
      cost_impact: null,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      product_name: 'School Supplies',
      season: 'back_to_school',
      recommendation_type: 'seasonal_adjustment',
      action_required: 'INCREASE_STOCK',
      priority: 'high',
      recommended_stock_level: 300,
      current_stock_level: 120,
      predicted_shortage: 180,
      cost_impact: 1800,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      product_name: 'Garden Tools',
      season: 'spring',
      recommendation_type: 'seasonal_adjustment',
      action_required: 'REDUCE_STOCK',
      priority: 'low',
      recommended_stock_level: 80,
      current_stock_level: 150,
      predicted_shortage: null,
      cost_impact: -700,
      created_at: new Date().toISOString()
    }
  ];

  const displayRecommendations = showAll ? mockRecommendations : mockRecommendations.slice(0, 5);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'INCREASE_STOCK':
        return <TrendingUp size={14} color="#52c41a" />;
      case 'REDUCE_STOCK':
        return <TrendingDown size={14} color="#f5222d" />;
      case 'MAINTAIN_STOCK':
        return <Minus size={14} color="#faad14" />;
      default:
        return <CheckCircle size={14} color="#d9d9d9" />;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'INCREASE_STOCK': return 'Increase Stock';
      case 'REDUCE_STOCK': return 'Reduce Stock';
      case 'MAINTAIN_STOCK': return 'Maintain Stock';
      default: return action;
    }
  };

  const handleDeleteRecommendation = async (id) => {
    try {
      setLoading(true);
      // Mock delete - in real app would call seasonalService.deleteRecommendation(id)
      message.success('Recommendation deleted');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      message.error('Failed to delete recommendation');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    const absAmount = Math.abs(amount);
    const symbol = amount >= 0 ? '+' : '-';
    return `${symbol}$${absAmount.toLocaleString()}`;
  };

  return (
    <Card 
      title={
        <Space>
          <Target size={18} />
          AI Recommendations
          {!showAll && displayRecommendations.length > 0 && (
            <Badge count={displayRecommendations.length} />
          )}
        </Space>
      }
      size="small"
      extra={
        onRefresh && (
          <Button 
            size="small" 
            onClick={onRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        )
      }
    >
      {displayRecommendations.length === 0 ? (
        <Empty 
          description="No recommendations available. Run seasonal analysis to generate recommendations."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '20px 0' }}
        />
      ) : (
        <List
          dataSource={displayRecommendations}
          renderItem={(rec) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Delete this recommendation?"
                  onConfirm={() => handleDeleteRecommendation(rec.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<Trash2 size={14} />}
                    danger
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={getActionIcon(rec.action_required)}
                title={
                  <Space>
                    <Text strong>{rec.product_name}</Text>
                    <Tag 
                      color={getPriorityColor(rec.priority)}
                      size="small"
                    >
                      {rec.priority}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Tag color="blue" size="small" style={{ textTransform: 'capitalize' }}>
                        {rec.season.replace('_', ' ')}
                      </Tag>
                      <Text style={{ marginLeft: '8px' }}>
                        {getActionText(rec.action_required)}
                      </Text>
                    </div>
                    
                    <div style={{ fontSize: '12px' }}>
                      <Text type="secondary">Current: </Text>
                      <Text>{rec.current_stock_level}</Text>
                      <Text type="secondary" style={{ margin: '0 8px' }}>→</Text>
                      <Text type="secondary">Recommended: </Text>
                      <Text strong>{rec.recommended_stock_level}</Text>
                    </div>

                    {rec.predicted_shortage && (
                      <div style={{ fontSize: '12px' }}>
                        <AlertTriangle size={12} color="#f5222d" style={{ marginRight: '4px' }} />
                        <Text type="danger">Shortage: {rec.predicted_shortage} units</Text>
                      </div>
                    )}

                    {rec.cost_impact && (
                      <div style={{ fontSize: '12px' }}>
                        <Text type="secondary">Cost Impact: </Text>
                        <Text 
                          style={{ 
                            color: rec.cost_impact >= 0 ? '#f5222d' : '#52c41a',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatCurrency(rec.cost_impact)}
                        </Text>
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecommendationsPanel;
