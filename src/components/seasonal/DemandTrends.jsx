/**
 * Demand Trends Component
 * Shows demand forecasting and trend analysis
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Select, 
  Button, 
  Statistic,
  Row,
  Col,
  Tag,
  Progress,
  Empty
} from 'antd';
import { TrendingUp, Target, AlertCircle, Calendar } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const DemandTrends = () => {
  const [selectedProduct, setSelectedProduct] = useState('PROD001');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForecastData();
  }, [selectedProduct]);

  const loadForecastData = async () => {
    try {
      setLoading(true);
      
      // Mock forecast data
      const mockForecast = {
        product_id: selectedProduct,
        forecast_data: generateMockForecastData(),
        seasonal_factors: {
          spring: 1.1,
          summer: 1.3,
          fall: 0.9,
          winter: 1.2,
          holiday: 1.8,
          back_to_school: 1.5
        },
        accuracy_metrics: {
          mean_absolute_error: 15.2,
          mean_squared_error: 234.5,
          mean_absolute_percentage_error: 12.8,
          accuracy_score: 87.2
        },
        recommendations: [
          "Increase inventory for summer season (30% demand increase expected)",
          "Plan for back-to-school rush in August (50% demand spike)",
          "Consider early procurement for holiday season",
          "Monitor spring demand patterns for potential adjustments"
        ]
      };

      setForecastData(mockForecast);
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockForecastData = () => {
    const data = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Simple seasonal pattern
      const seasonalFactor = 1.0 + 0.3 * Math.sin(2 * Math.PI * i / 365);
      const randomFactor = 0.8 + Math.random() * 0.4;
      const predictedDemand = 100 * seasonalFactor * randomFactor;
      
      data.push({
        date: date.toISOString().split('T')[0],
        predicted_demand: Math.round(predictedDemand),
        confidence_interval: [
          Math.round(predictedDemand * 0.8), 
          Math.round(predictedDemand * 1.2)
        ]
      });
    }
    
    return data;
  };

  const products = [
    { id: 'PROD001', name: 'Winter Jacket' },
    { id: 'PROD002', name: 'Beach Umbrella' },
    { id: 'PROD003', name: 'School Supplies' }
  ];

  const getAccuracyColor = (score) => {
    if (score >= 85) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#f5222d';
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <TrendingUp size={20} />
          <Title level={4} style={{ margin: 0 }}>Demand Trends & Forecasting</Title>
        </Space>
        <Select
          value={selectedProduct}
          onChange={setSelectedProduct}
          style={{ width: 200 }}
          placeholder="Select Product"
        >
          {products.map(product => (
            <Option key={product.id} value={product.id}>
              {product.name}
            </Option>
          ))}
        </Select>
      </div>

      {!forecastData ? (
        <Card>
          <Empty 
            description="No forecast data available. Select a product to view demand trends."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {/* Accuracy Metrics */}
          <Col xs={24} lg={8}>
            <Card title="Forecast Accuracy" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Accuracy Score"
                  value={forecastData.accuracy_metrics.accuracy_score}
                  suffix="%"
                  valueStyle={{ 
                    color: getAccuracyColor(forecastData.accuracy_metrics.accuracy_score) 
                  }}
                />
                <Progress
                  percent={forecastData.accuracy_metrics.accuracy_score}
                  strokeColor={getAccuracyColor(forecastData.accuracy_metrics.accuracy_score)}
                  size="small"
                />
                <div>
                  <Text type="secondary">Mean Absolute Error: </Text>
                  <Text strong>{forecastData.accuracy_metrics.mean_absolute_error}</Text>
                </div>
                <div>
                  <Text type="secondary">MAPE: </Text>
                  <Text strong>{forecastData.accuracy_metrics.mean_absolute_percentage_error}%</Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Seasonal Factors */}
          <Col xs={24} lg={8}>
            <Card title="Seasonal Factors" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(forecastData.seasonal_factors).map(([season, factor]) => (
                  <div key={season} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ textTransform: 'capitalize' }}>
                      {season.replace('_', ' ')}:
                    </Text>
                    <Tag 
                      color={factor > 1.2 ? 'red' : factor > 1.0 ? 'orange' : 'green'}
                    >
                      {factor.toFixed(1)}x
                    </Tag>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Quick Stats */}
          <Col xs={24} lg={8}>
            <Card title="90-Day Forecast" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Average Daily Demand"
                  value={Math.round(
                    forecastData.forecast_data.reduce((sum, day) => sum + day.predicted_demand, 0) / 
                    forecastData.forecast_data.length
                  )}
                  prefix={<Target size={16} />}
                />
                <Statistic
                  title="Peak Demand Day"
                  value={Math.max(...forecastData.forecast_data.map(d => d.predicted_demand))}
                  valueStyle={{ color: '#f5222d' }}
                />
                <Statistic
                  title="Total Forecast"
                  value={forecastData.forecast_data.reduce((sum, day) => sum + day.predicted_demand, 0)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Space>
            </Card>
          </Col>

          {/* Forecast Chart (Simple Bar Chart) */}
          <Col xs={24}>
            <Card title="90-Day Demand Forecast" size="small">
              <div style={{ 
                display: 'flex', 
                alignItems: 'end', 
                gap: '1px', 
                height: '200px',
                overflowX: 'auto',
                padding: '16px 0'
              }}>
                {forecastData.forecast_data.slice(0, 30).map((day, index) => {
                  const maxDemand = Math.max(...forecastData.forecast_data.map(d => d.predicted_demand));
                  const height = (day.predicted_demand / maxDemand) * 100;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        height: `${height}%`,
                        backgroundColor: '#1890ff',
                        opacity: 0.7,
                        borderRadius: '1px',
                        minHeight: '2px',
                        minWidth: '8px'
                      }}
                      title={`${day.date}: ${day.predicted_demand} units`}
                    />
                  );
                })}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Showing first 30 days of forecast data
              </Text>
            </Card>
          </Col>

          {/* Recommendations */}
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <AlertCircle size={16} />
                  AI Recommendations
                </Space>
              } 
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {forecastData.recommendations.map((rec, index) => (
                  <div key={index} style={{ 
                    padding: '8px 12px', 
                    background: '#f0f2f5', 
                    borderRadius: '4px',
                    borderLeft: '3px solid #1890ff'
                  }}>
                    <Text>{rec}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DemandTrends;
