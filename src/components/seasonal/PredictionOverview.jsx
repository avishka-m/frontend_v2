/**
 * Prediction Overview Component
 * Shows summary of AI predictions and insights
 */

import React from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Progress,
  Row,
  Col,
  Statistic
} from 'antd';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const { Title, Text } = Typography;

const PredictionOverview = ({ analyticsData }) => {
  if (!analyticsData) {
    return (
      <Card title="Prediction Overview" loading={true} />
    );
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return '#52c41a';
      case 'medium': return '#faad14';
      case 'low': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const mockPredictionData = {
    confidence_distribution: {
      high: 12,
      medium: 8,
      low: 3
    },
    accuracy_trend: 87.2,
    recent_predictions: [
      { product: 'Winter Jacket', confidence: 'high', impact: 'positive' },
      { product: 'Beach Umbrella', confidence: 'medium', impact: 'positive' },
      { product: 'School Supplies', confidence: 'high', impact: 'neutral' }
    ]
  };

  const totalPredictions = Object.values(mockPredictionData.confidence_distribution)
    .reduce((sum, count) => sum + count, 0);

  return (
    <Card 
      title={
        <Space>
          <Brain size={18} />
          Prediction Overview
        </Space>
      }
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Accuracy Score */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Model Accuracy</Text>
            <Text style={{ 
              color: getConfidenceColor('high'),
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {mockPredictionData.accuracy_trend}%
            </Text>
          </div>
          <Progress 
            percent={mockPredictionData.accuracy_trend} 
            strokeColor={getConfidenceColor('high')}
            size="small"
            style={{ marginTop: '4px' }}
          />
        </div>

        {/* Confidence Distribution */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Prediction Confidence
          </Text>
          <Row gutter={8}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: getConfidenceColor('high')
                }}>
                  {mockPredictionData.confidence_distribution.high}
                </div>
                <Tag color="green" size="small">High</Tag>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: getConfidenceColor('medium')
                }}>
                  {mockPredictionData.confidence_distribution.medium}
                </div>
                <Tag color="orange" size="small">Medium</Tag>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: getConfidenceColor('low')
                }}>
                  {mockPredictionData.confidence_distribution.low}
                </div>
                <Tag color="red" size="small">Low</Tag>
              </div>
            </Col>
          </Row>
        </div>

        {/* Recent Predictions */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Recent Predictions
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            {mockPredictionData.recent_predictions.map((prediction, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: '#fafafa',
                  borderRadius: '4px'
                }}
              >
                <Text style={{ fontSize: '13px' }}>{prediction.product}</Text>
                <Space size="small">
                  <Tag 
                    color={getConfidenceColor(prediction.confidence)}
                    size="small"
                    style={{ margin: 0 }}
                  >
                    {prediction.confidence}
                  </Tag>
                  {prediction.impact === 'positive' ? (
                    <TrendingUp size={12} color="#52c41a" />
                  ) : prediction.impact === 'negative' ? (
                    <AlertTriangle size={12} color="#f5222d" />
                  ) : (
                    <CheckCircle size={12} color="#d9d9d9" />
                  )}
                </Space>
              </div>
            ))}
          </Space>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          borderTop: '1px solid #f0f0f0',
          paddingTop: '12px',
          marginTop: '8px'
        }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Total Predictions"
                value={totalPredictions}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Active Models"
                value={3}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
          </Row>
        </div>
      </Space>
    </Card>
  );
};

export default PredictionOverview;
