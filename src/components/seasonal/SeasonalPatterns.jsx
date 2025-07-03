/**
 * Seasonal Patterns Component
 * Visualizes seasonal demand patterns and trends
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Select, 
  Row, 
  Col, 
  Tag, 
  Empty,
  Spin
} from 'antd';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { seasonalService } from '../../services/seasonalService';

const { Title, Text } = Typography;
const { Option } = Select;

const SEASON_COLORS = {
  spring: '#52c41a',
  summer: '#faad14',
  fall: '#f5222d',
  winter: '#1890ff',
  holiday: '#eb2f96',
  back_to_school: '#722ed1'
};

const SEASON_ICONS = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
  winter: '❄️',
  holiday: '🎄',
  back_to_school: '🎒'
};

const SeasonalPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      
      // For demo, we'll use mock data since we don't have real products yet
      const mockPatterns = [
        {
          id: '1',
          product_id: 'PROD001',
          product_name: 'Winter Jacket',
          season: 'winter',
          demand_variance: 85.3,
          peak_months: [11, 12, 1, 2],
          low_months: [6, 7, 8],
          historical_demand: [100, 80, 60, 40, 20, 15, 10, 15, 30, 60, 120, 150]
        },
        {
          id: '2',
          product_id: 'PROD002',
          product_name: 'Beach Umbrella',
          season: 'summer',
          demand_variance: 92.1,
          peak_months: [6, 7, 8],
          low_months: [11, 12, 1, 2],
          historical_demand: [20, 30, 50, 80, 120, 150, 180, 160, 100, 60, 30, 20]
        },
        {
          id: '3',
          product_id: 'PROD003',
          product_name: 'School Supplies',
          season: 'back_to_school',
          demand_variance: 78.9,
          peak_months: [8, 9],
          low_months: [3, 4, 5],
          historical_demand: [30, 25, 40, 60, 80, 90, 200, 180, 120, 80, 40, 35]
        }
      ];

      setPatterns(mockPatterns);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1];
  };

  const getVarianceColor = (variance) => {
    if (variance >= 80) return '#f5222d';
    if (variance >= 60) return '#faad14';
    return '#52c41a';
  };

  const getTrendDirection = (demand) => {
    const firstHalf = demand.slice(0, 6).reduce((a, b) => a + b, 0);
    const secondHalf = demand.slice(6).reduce((a, b) => a + b, 0);
    return secondHalf > firstHalf ? 'up' : 'down';
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading seasonal patterns...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Calendar size={20} />
          <Title level={4} style={{ margin: 0 }}>Seasonal Patterns</Title>
        </Space>
      </div>

      {patterns.length === 0 ? (
        <Card>
          <Empty 
            description="No seasonal patterns found. Run an analysis to generate patterns."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {patterns.map((pattern) => (
            <Col key={pattern.id} xs={24} lg={12} xl={8}>
              <Card
                title={
                  <Space>
                    <span style={{ fontSize: '20px' }}>
                      {SEASON_ICONS[pattern.season]}
                    </span>
                    <span>{pattern.product_name}</span>
                  </Space>
                }
                extra={
                  <Tag 
                    color={SEASON_COLORS[pattern.season]}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {pattern.season.replace('_', ' ')}
                  </Tag>
                }
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* Variance */}
                  <div>
                    <Text type="secondary">Demand Variance:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text 
                        strong 
                        style={{ 
                          color: getVarianceColor(pattern.demand_variance),
                          fontSize: '18px' 
                        }}
                      >
                        {pattern.demand_variance.toFixed(1)}%
                      </Text>
                      <Space style={{ marginLeft: '8px' }}>
                        {getTrendDirection(pattern.historical_demand) === 'up' ? (
                          <TrendingUp size={16} color="#52c41a" />
                        ) : (
                          <TrendingDown size={16} color="#f5222d" />
                        )}
                      </Space>
                    </div>
                  </div>

                  {/* Peak Months */}
                  <div>
                    <Text type="secondary">Peak Months:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Space wrap>
                        {pattern.peak_months.map(month => (
                          <Tag 
                            key={month} 
                            color="green"
                            style={{ margin: '2px' }}
                          >
                            {getMonthName(month)}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>

                  {/* Low Months */}
                  <div>
                    <Text type="secondary">Low Months:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Space wrap>
                        {pattern.low_months.map(month => (
                          <Tag 
                            key={month} 
                            color="red"
                            style={{ margin: '2px' }}
                          >
                            {getMonthName(month)}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>

                  {/* Simple Demand Chart */}
                  <div>
                    <Text type="secondary">Demand Pattern:</Text>
                    <div style={{ 
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'end',
                      gap: '2px',
                      height: '40px'
                    }}>
                      {pattern.historical_demand.map((demand, index) => {
                        const height = (demand / Math.max(...pattern.historical_demand)) * 100;
                        return (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              height: `${height}%`,
                              backgroundColor: SEASON_COLORS[pattern.season],
                              opacity: 0.7,
                              borderRadius: '1px',
                              minHeight: '2px'
                            }}
                            title={`${getMonthName(index + 1)}: ${demand}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SeasonalPatterns;
