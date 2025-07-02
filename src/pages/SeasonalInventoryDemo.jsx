import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Statistic,
  Alert,
  Tag,
  Space,
  Typography,
  Divider
} from 'antd';
import {
  LineChartOutlined,
  ReloadOutlined,
  AlertOutlined,
  RiseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import ForecastChart from '../components/SeasonalInventory/ForecastChart';
import SeasonalPatternsChart from '../components/SeasonalInventory/SeasonalPatternsChart';
import InventoryRecommendations from '../components/SeasonalInventory/InventoryRecommendations';

const { Option } = Select;
const { Title, Text } = Typography;

// Mock data for demonstration
const mockProducts = [
  { product_id: 'SKU001', description: 'Wireless Bluetooth Headphones' },
  { product_id: 'SKU002', description: 'Smartphone Case' },
  { product_id: 'SKU003', description: 'USB Charging Cable' },
  { product_id: '85123A', description: 'Electronic Component' },
  { product_id: '22423', description: 'Industrial Part' }
];

const mockForecastData = {
  product_id: 'SKU001',
  historical_data: [
    { ds: '2024-12-01', y: 150 },
    { ds: '2024-12-02', y: 145 },
    { ds: '2024-12-03', y: 160 },
    { ds: '2024-12-04', y: 155 },
    { ds: '2024-12-05', y: 175 },
    { ds: '2024-12-06', y: 180 },
    { ds: '2024-12-07', y: 165 }
  ],
  forecast: [
    { ds: '2024-12-08', yhat: 170, yhat_lower: 150, yhat_upper: 190 },
    { ds: '2024-12-09', yhat: 175, yhat_lower: 155, yhat_upper: 195 },
    { ds: '2024-12-10', yhat: 180, yhat_lower: 160, yhat_upper: 200 },
    { ds: '2024-12-11', yhat: 185, yhat_lower: 165, yhat_upper: 205 },
    { ds: '2024-12-12', yhat: 190, yhat_lower: 170, yhat_upper: 210 },
    { ds: '2024-12-13', yhat: 195, yhat_lower: 175, yhat_upper: 215 },
    { ds: '2024-12-14', yhat: 200, yhat_lower: 180, yhat_upper: 220 }
  ]
};

const mockItemAnalysis = {
  product_id: 'SKU001',
  forecast_insights: {
    average_daily_demand: 175.2,
    peak_demand_value: 200,
    peak_demand_date: '2024-12-14',
    predicted_total_demand: 1225,
    demand_trend: 'increasing'
  },
  seasonal_patterns: {
    weekly_seasonality: {
      '0': 0.95, // Sunday
      '1': 1.05, // Monday
      '2': 1.10, // Tuesday
      '3': 1.15, // Wednesday
      '4': 1.20, // Thursday
      '5': 1.25, // Friday
      '6': 1.30  // Saturday
    },
    monthly_seasonality: {
      '1': 0.85, '2': 0.90, '3': 0.95, '4': 1.00,
      '5': 1.05, '6': 1.10, '7': 1.15, '8': 1.20,
      '9': 1.25, '10': 1.30, '11': 1.35, '12': 1.40
    }
  }
};

const mockRecommendations = [
  {
    type: 'reorder_point',
    title: 'Recommended Reorder Point',
    value: 450,
    description: 'Reorder when stock drops to 450 units',
    urgency: 'medium',
    calculation: '(175.2 daily demand × 7 lead days) + 225.4 safety stock'
  },
  {
    type: 'order_quantity',
    title: 'Recommended Monthly Order Quantity',
    value: 1350,
    description: 'Order 1350 units for next month',
    urgency: 'normal',
    calculation: '1225 predicted demand + 10% buffer'
  },
  {
    type: 'peak_preparation',
    title: 'Peak Demand Alert',
    value: 200,
    description: 'Prepare for high demand (200 units) around 2024-12-14',
    urgency: 'high'
  }
];

const mockModelMetrics = {
  mape: 2.15,
  accuracy: 97.85,
  last_training: '2024-12-07T10:30:00Z'
};

const mockSystemStatus = {
  status: 'available',
  data_info: {
    total_records: 276843,
    unique_products: 3941
  }
};

const SeasonalInventoryDemo = () => {
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('SKU001');
  const [forecastDays, setForecastDays] = useState(30);

  // Simulate loading
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <RiseOutlined style={{ color: '#52c41a' }} />;
    return <LineChartOutlined style={{ color: '#1890ff' }} />;
  };

  const recommendationColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'reorder_point': 'blue',
          'order_quantity': 'green',
          'peak_preparation': 'orange'
        };
        return <Tag color={colors[type] || 'default'}>{type.replace('_', ' ').toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => <strong>{value}</strong>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header Section */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <BarChartOutlined style={{ marginRight: '8px' }} />
                  Seasonal Inventory Prediction (Demo)
                </Title>
                <Text type="secondary">
                  AI-powered demand forecasting and inventory optimization
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<LineChartOutlined />}
                    disabled={loading}
                  >
                    Retrain Model
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* System Status */}
        <Col span={24}>
          <Alert
            message={`System Status: ${mockSystemStatus.status}`}
            description={`Processing ${mockSystemStatus.data_info.total_records} records across ${mockSystemStatus.data_info.unique_products} products`}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </Col>

        {/* Controls Section */}
        <Col span={24}>
          <Card title="Forecast Configuration">
            <Row gutter={[16, 16]} align="middle">
              <Col span={8}>
                <Text strong>Select Product:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Choose a product"
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                >
                  {mockProducts.map(product => (
                    <Option key={product.product_id} value={product.product_id}>
                      {product.product_id} - {product.description}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Text strong>Forecast Days:</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={forecastDays}
                  onChange={setForecastDays}
                >
                  <Option value={7}>7 Days</Option>
                  <Option value={30}>30 Days</Option>
                  <Option value={60}>60 Days</Option>
                  <Option value={90}>90 Days</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={loading}
                  style={{ marginTop: '24px' }}
                >
                  Generate Forecast
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Key Metrics */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Average Daily Demand"
                  value={mockItemAnalysis.forecast_insights.average_daily_demand}
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={getTrendIcon(mockItemAnalysis.forecast_insights.demand_trend)}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Peak Demand"
                  value={mockItemAnalysis.forecast_insights.peak_demand_value}
                  precision={1}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<AlertOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Predicted Demand"
                  value={mockItemAnalysis.forecast_insights.predicted_total_demand}
                  precision={0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Model Accuracy (MAPE)"
                  value={mockModelMetrics.mape}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Forecast Chart */}
        <Col span={16}>
          <Card title="Demand Forecast" extra={<LineChartOutlined />}>
            <ForecastChart data={mockForecastData} />
          </Card>
        </Col>

        {/* Seasonal Patterns */}
        <Col span={8}>
          <Card title="Seasonal Patterns">
            <SeasonalPatternsChart data={mockItemAnalysis.seasonal_patterns} />
          </Card>
        </Col>

        {/* Inventory Recommendations */}
        <Col span={24}>
          <Card title="Inventory Recommendations" extra={<AlertOutlined />}>
            <InventoryRecommendations recommendations={mockRecommendations} />
          </Card>
        </Col>

        {/* Demo Notice */}
        <Col span={24}>
          <Alert
            message="Demo Mode"
            description="This is a demonstration of the Seasonal Inventory Prediction interface. Connect to the backend API to see real data and forecasts."
            type="info"
            showIcon
            closable
          />
        </Col>
      </Row>
    </div>
  );
};

export default SeasonalInventoryDemo;
