import React, { useState, useEffect } from 'react';
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
  Divider,
  message,
  Spin
} from 'antd';
import {
  LineChartOutlined,
  ReloadOutlined,
  AlertOutlined,
  RiseOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { seasonalInventoryService } from '../services/seasonalInventoryApi';
import ForecastChart from '../components/SeasonalInventory/ForecastChart';
import SeasonalPatternsChart from '../components/SeasonalInventory/SeasonalPatternsChart';
import InventoryRecommendations from '../components/SeasonalInventory/InventoryRecommendations';

const { Option } = Select;
const { Title, Text } = Typography;

const SeasonalInventoryLive = () => {
  const [loading, setLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [systemStatus, setSystemStatus] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [itemAnalysis, setItemAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Initialize system and check health
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    setSystemLoading(true);
    setError(null);
    
    try {
      // Check system health
      const healthResponse = await seasonalInventoryService.healthCheck();
      console.log('Health check response:', healthResponse);
      
      if (healthResponse.status === 'healthy') {
        // Get system status
        const statusResponse = await seasonalInventoryService.getSystemStatus();
        setSystemStatus(statusResponse);
        
        // Load sample products for demonstration
        setAvailableProducts([
          { product_id: 'SKU001', description: 'Wireless Bluetooth Headphones' },
          { product_id: 'SKU002', description: 'Smartphone Case' },
          { product_id: 'SKU003', description: 'USB Charging Cable' },
          { product_id: '85123A', description: 'Electronic Component' },
          { product_id: '22423', description: 'Industrial Part' }
        ]);
        
        // Set default product
        setSelectedProduct('SKU001');
        
        message.success('Seasonal Inventory system initialized successfully');
      } else {
        throw new Error('System not available');
      }
    } catch (err) {
      console.error('System initialization error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to initialize system');
      message.error('Failed to connect to seasonal inventory service');
    } finally {
      setSystemLoading(false);
    }
  };

  // Generate forecast for selected product
  const generateForecast = async () => {
    if (!selectedProduct) {
      message.warning('Please select a product first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get forecast
      const forecastResponse = await seasonalInventoryService.getProductForecast(
        selectedProduct, 
        forecastDays, 
        0.95
      );
      
      console.log('Forecast response:', forecastResponse);
      
      if (forecastResponse.status === 'success') {
        setForecastData(forecastResponse);
        
        // Get item analysis
        const analysisResponse = await seasonalInventoryService.getItemAnalysis(selectedProduct);
        setItemAnalysis(analysisResponse);
        
        // Get recommendations
        const recommendationsResponse = await seasonalInventoryService.getInventoryRecommendations(
          forecastDays, 
          0.8
        );
        setRecommendations(recommendationsResponse.recommendations || []);
        
        message.success('Forecast generated successfully');
      } else {
        throw new Error(forecastResponse.message || 'Forecast generation failed');
      }
    } catch (err) {
      console.error('Forecast error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate forecast';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Retrain models
  const handleRetrain = async () => {
    setLoading(true);
    try {
      const response = await seasonalInventoryService.retrainModels([selectedProduct]);
      message.success('Model retraining started in background');
      console.log('Retrain response:', response);
    } catch (err) {
      console.error('Retrain error:', err);
      message.error('Failed to start model retraining');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <RiseOutlined style={{ color: '#52c41a' }} />;
    return <LineChartOutlined style={{ color: '#1890ff' }} />;
  };

  if (systemLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Initializing Seasonal Inventory System...</Text>
        </div>
      </div>
    );
  }

  if (error && !systemStatus) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="System Connection Error"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button onClick={initializeSystem} type="primary">
              Retry Connection
            </Button>
          }
        />
      </div>
    );
  }

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
                  Seasonal Inventory Prediction
                </Title>
                <Text type="secondary">
                  AI-powered demand forecasting and inventory optimization
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={initializeSystem}
                    loading={systemLoading}
                  >
                    Refresh System
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<LineChartOutlined />}
                    onClick={handleRetrain}
                    disabled={loading || !selectedProduct}
                    loading={loading}
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
          {systemStatus && (
            <Alert
              message={
                systemStatus.service_status?.status === 'available' 
                  ? "System Status: Online" 
                  : "System Status: Limited Availability"
              }
              description={
                systemStatus.service_status?.data_info 
                  ? `Processing ${systemStatus.service_status.data_info.total_records || 'N/A'} records across ${systemStatus.service_status.data_info.unique_products || 'N/A'} products`
                  : "System initialized and ready for forecasting"
              }
              type={systemStatus.service_status?.status === 'available' ? "success" : "warning"}
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: '16px' }}
            />
          )}
          
          {error && (
            <Alert
              message="Forecast Error"
              description={error}
              type="warning"
              showIcon
              closable
              style={{ marginBottom: '16px' }}
            />
          )}
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
                  {availableProducts.map(product => (
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
                  onClick={generateForecast}
                  disabled={!selectedProduct}
                  style={{ marginTop: '24px' }}
                >
                  Generate Forecast
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Key Metrics */}
        {forecastData && forecastData.forecast_insights && (
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Average Daily Demand"
                    value={forecastData.forecast_insights.average_daily_demand || 0}
                    precision={1}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={getTrendIcon(forecastData.forecast_insights.demand_trend)}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Peak Demand"
                    value={forecastData.forecast_insights.peak_demand_value || 0}
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
                    value={forecastData.forecast_insights.predicted_total_demand || 0}
                    precision={0}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Model Accuracy"
                    value={forecastData.model_metrics?.accuracy || 'N/A'}
                    precision={2}
                    suffix={forecastData.model_metrics?.accuracy ? "%" : ""}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        )}

        {/* Forecast Chart */}
        {forecastData && (
          <Col span={16}>
            <Card title="Demand Forecast" extra={<LineChartOutlined />}>
              <ForecastChart data={forecastData} />
            </Card>
          </Col>
        )}

        {/* Seasonal Patterns */}
        {itemAnalysis && itemAnalysis.seasonal_patterns && (
          <Col span={8}>
            <Card title="Seasonal Patterns">
              <SeasonalPatternsChart data={itemAnalysis.seasonal_patterns} />
            </Card>
          </Col>
        )}

        {/* Inventory Recommendations */}
        {recommendations.length > 0 && (
          <Col span={24}>
            <Card title="Inventory Recommendations" extra={<AlertOutlined />}>
              <InventoryRecommendations recommendations={recommendations} />
            </Card>
          </Col>
        )}

        {/* No Data State */}
        {!loading && !forecastData && selectedProduct && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <LineChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <Title level={4} style={{ color: '#999', marginTop: '16px' }}>
                  No Forecast Data
                </Title>
                <Text type="secondary">
                  Click "Generate Forecast" to create predictions for {selectedProduct}
                </Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SeasonalInventoryLive;
