import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Spin, 
  Alert, 
  Tabs, 
  Table, 
  Progress, 
  Divider,
  Typography,
  DatePicker 
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ShoppingOutlined,
  InboxOutlined,
  WarningOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import { analyticsService } from '../services/api';

// Import a charting library (if you're using one)
// For example: import { Bar, Line, Pie } from 'react-chartjs-2';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Mock data for development when backend is not available
const MOCK_DATA = {
  inventory: {
    total_items: 1248,
    low_stock_count: 42,
    low_stock_percentage: 3.4,
    total_value: 187250.75,
    categories: [
      { _id: "Electronics", count: 325 },
      { _id: "Clothing", count: 512 },
      { _id: "Furniture", count: 98 },
      { _id: "Office Supplies", count: 189 },
      { _id: "Food & Beverage", count: 124 }
    ]
  },
  orders: {
    total_orders: 578,
    total_revenue: 125780.42,
    average_order_value: 217.61,
    status_breakdown: [
      { _id: "Completed", count: 412 },
      { _id: "Processing", count: 87 },
      { _id: "Pending", count: 68 },
      { _id: "Cancelled", count: 11 }
    ],
    daily_trend: [
      { _id: "2023-06-01", count: 18, revenue: 3950.25 },
      { _id: "2023-06-02", count: 21, revenue: 4570.50 },
      { _id: "2023-06-03", count: 17, revenue: 3650.75 },
      { _id: "2023-06-04", count: 25, revenue: 5420.30 },
      { _id: "2023-06-05", count: 19, revenue: 4120.45 }
    ]
  },
  operations: {
    picking: {
      total: 624,
      completed: 598,
      completion_rate: 95.8,
      avg_time_minutes: 8.2
    },
    packing: {
      total: 587,
      completed: 562,
      completion_rate: 95.7,
      avg_time_minutes: 5.3
    },
    shipping: {
      total: 542,
      delivered: 512,
      delivery_rate: 94.5,
      on_time_rate: 92.8
    }
  },
  warehouse: {
    warehouses: [
      { 
        warehouseID: "WH-001", 
        name: "Main Warehouse", 
        location_utilization: 78.5, 
        capacity_utilization: 72.3,
        occupied_locations: 187,
        total_locations: 238
      },
      { 
        warehouseID: "WH-002", 
        name: "East Distribution Center", 
        location_utilization: 65.8, 
        capacity_utilization: 59.2,
        occupied_locations: 98,
        total_locations: 149
      },
      { 
        warehouseID: "WH-003", 
        name: "West Distribution Center", 
        location_utilization: 82.4, 
        capacity_utilization: 77.9,
        occupied_locations: 145,
        total_locations: 176
      }
    ],
    overall_location_utilization: 76.8
  }
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState({});
  const [orderData, setOrderData] = useState({});
  const [operationsData, setOperationsData] = useState({});
  const [warehouseData, setWarehouseData] = useState({});
  const [timeRange, setTimeRange] = useState(30); // Default 30 days

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch inventory analytics
        try {
          const inventoryResponse = await analyticsService.getInventoryAnalytics();
          setInventoryData(inventoryResponse.data);
        } catch (error) {
          console.log('Using mock data for inventory analytics');
          setInventoryData(MOCK_DATA.inventory);
        }

        // Fetch orders analytics
        try {
          const ordersResponse = await analyticsService.getOrdersAnalytics();
          setOrderData(ordersResponse.data);
        } catch (error) {
          console.log('Using mock data for orders analytics');
          setOrderData(MOCK_DATA.orders);
        }

        // Fetch workforce analytics
        try {
          const workforceResponse = await analyticsService.getWorkforceAnalytics();
          setOperationsData(workforceResponse.data);
        } catch (error) {
          console.log('Using mock data for workforce analytics');
          setOperationsData(MOCK_DATA.operations);
        }

        // Fetch warehouse analytics
        try {
          const warehouseResponse = await analyticsService.getWarehouseUtilization();
          setWarehouseData(warehouseResponse.data);
        } catch (error) {
          console.log('Using mock data for warehouse analytics');
          setWarehouseData(MOCK_DATA.warehouse);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Error loading analytics data. Using placeholder values.');
        
        // Use mock data for everything if there's an error
        setInventoryData(MOCK_DATA.inventory);
        setOrderData(MOCK_DATA.orders);
        setOperationsData(MOCK_DATA.operations);
        setWarehouseData(MOCK_DATA.warehouse);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Columns for warehouse utilization table
  const warehouseColumns = [
    {
      title: 'Warehouse',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location Utilization',
      dataIndex: 'location_utilization',
      key: 'location_utilization',
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            status={value > 90 ? 'exception' : 'normal'}
            format={(percent) => `${percent.toFixed(1)}%`}
          />
          <div style={{ fontSize: 12, color: '#888' }}>
            {value > 90 ? 'Near capacity' : value > 75 ? 'High usage' : 'Good'}
          </div>
        </div>
      ),
    },
    {
      title: 'Capacity Utilization',
      dataIndex: 'capacity_utilization',
      key: 'capacity_utilization',
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            status={value > 90 ? 'exception' : 'normal'}
            format={(percent) => `${percent.toFixed(1)}%`}
          />
        </div>
      ),
    },
    {
      title: 'Locations',
      key: 'locations',
      render: (_, record) => (
        <span>{record.occupied_locations} / {record.total_locations}</span>
      ),
    },
  ];

  // Columns for category breakdown table
  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: '_id',
      key: 'category',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => {
        const percentage = (record.count / inventoryData.total_items) * 100;
        return <span>{percentage.toFixed(1)}%</span>;
      }
    },
  ];

  // Columns for order status breakdown
  const orderStatusColumns = [
    {
      title: 'Status',
      dataIndex: '_id',
      key: 'status',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => {
        const percentage = (record.count / orderData.total_orders) * 100;
        return <span>{percentage.toFixed(1)}%</span>;
      }
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Analytics Dashboard</Title>
        <RangePicker 
          onChange={(dates) => {
            // Calculate days between selected dates
            if (dates && dates[0] && dates[1]) {
              const days = dates[1].diff(dates[0], 'days');
              setTimeRange(days);
            }
          }}
        />
      </div>
      
      {error && (
        <Alert
          message="Notice"
          description={error}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs defaultActiveKey="inventory" style={{ marginBottom: 16 }}>
        {/* Inventory Analytics Tab */}
        <TabPane 
          tab={<span><InboxOutlined /> Inventory</span>} 
          key="inventory"
        >
          {/* Inventory Summary Statistics */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Items"
                  value={inventoryData.total_items || 0}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Low Stock Items"
                  value={inventoryData.low_stock_count || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: inventoryData.low_stock_count > 50 ? '#cf1322' : '#faad14' }}
                  suffix={<span style={{ fontSize: 14, color: '#888' }}>({inventoryData.low_stock_percentage || 0}%)</span>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Inventory Value"
                  value={inventoryData.total_value || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Categories"
                  value={(inventoryData.categories || []).length}
                  prefix={<PieChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Inventory Category Breakdown */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title="Inventory by Category" style={{ marginBottom: 16 }}>
                <Table 
                  dataSource={inventoryData.categories || []} 
                  columns={categoryColumns} 
                  rowKey="_id" 
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Warehouse Utilization" style={{ marginBottom: 16 }}>
                <Statistic
                  title="Overall Location Utilization"
                  value={warehouseData.overall_location_utilization || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ 
                    color: (warehouseData.overall_location_utilization || 0) > 90 
                      ? '#cf1322' : (warehouseData.overall_location_utilization || 0) > 75 
                        ? '#faad14' : '#52c41a' 
                  }}
                />
                <Divider />
                <Table 
                  dataSource={warehouseData.warehouses || []} 
                  columns={warehouseColumns} 
                  rowKey="warehouseID" 
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Order Analytics Tab */}
        <TabPane 
          tab={<span><ShoppingOutlined /> Orders</span>} 
          key="orders"
        >
          {/* Order Summary Statistics */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={orderData.total_orders || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={orderData.total_revenue || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={orderData.average_order_value || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Completed Orders"
                  value={
                    orderData.status_breakdown?.find(status => status._id === "Completed")?.count || 0
                  }
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={
                    <span style={{ fontSize: 14, color: '#888' }}>
                      ({
                        ((orderData.status_breakdown?.find(status => status._id === "Completed")?.count || 0) / 
                        (orderData.total_orders || 1) * 100).toFixed(1)
                      }%)
                    </span>
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* Order Status Breakdown and Trends */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title="Order Status Breakdown" style={{ marginBottom: 16 }}>
                <Table 
                  dataSource={orderData.status_breakdown || []} 
                  columns={orderStatusColumns} 
                  rowKey="_id" 
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Daily Order Trend" style={{ marginBottom: 16 }}>
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {/* 
                    Replace with actual chart component, for example:
                    <Line data={chartData} options={chartOptions} />
                  */}
                  <div style={{ textAlign: 'center' }}>
                    <LineChartOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                    <p>Order trend chart would go here</p>
                    <p style={{ color: '#888' }}>
                      Using a charting library like Chart.js or Recharts
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Operations Analytics Tab */}
        <TabPane 
          tab={<span><BarChartOutlined /> Operations</span>} 
          key="operations"
        >
          {/* Operations Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Card title="Picking Operations">
                <Statistic
                  title="Completion Rate"
                  value={operationsData.picking?.completion_rate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Completed"
                      value={operationsData.picking?.completed || 0}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Avg Time"
                      value={operationsData.picking?.avg_time_minutes || 0}
                      suffix="min"
                      precision={1}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Packing Operations">
                <Statistic
                  title="Completion Rate"
                  value={operationsData.packing?.completion_rate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Completed"
                      value={operationsData.packing?.completed || 0}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Avg Time"
                      value={operationsData.packing?.avg_time_minutes || 0}
                      suffix="min"
                      precision={1}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Shipping Operations">
                <Statistic
                  title="On-Time Rate"
                  value={operationsData.shipping?.on_time_rate || 0}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Delivered"
                      value={operationsData.shipping?.delivered || 0}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Delivery Rate"
                      value={operationsData.shipping?.delivery_rate || 0}
                      suffix="%"
                      precision={1}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Operational Efficiency Visualization */}
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Operational Efficiency" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Picking Process</Text>
                  <Progress 
                    percent={operationsData.picking?.completion_rate || 0} 
                    status={
                      (operationsData.picking?.completion_rate || 0) < 85 
                        ? 'exception' 
                        : (operationsData.picking?.completion_rate || 0) < 95 
                          ? 'normal' 
                          : 'success'
                    }
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Packing Process</Text>
                  <Progress 
                    percent={operationsData.packing?.completion_rate || 0} 
                    status={
                      (operationsData.packing?.completion_rate || 0) < 85 
                        ? 'exception' 
                        : (operationsData.packing?.completion_rate || 0) < 95 
                          ? 'normal' 
                          : 'success'
                    }
                  />
                </div>
                <div>
                  <Text strong>Shipping Process</Text>
                  <Progress 
                    percent={operationsData.shipping?.delivery_rate || 0} 
                    status={
                      (operationsData.shipping?.delivery_rate || 0) < 85 
                        ? 'exception' 
                        : (operationsData.shipping?.delivery_rate || 0) < 95 
                          ? 'normal' 
                          : 'success'
                    }
                  />
                </div>
                <Divider />
                <div style={{ marginTop: 16 }}>
                  <Text strong>On-Time Delivery Performance</Text>
                  <Progress 
                    percent={operationsData.shipping?.on_time_rate || 0} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    status={
                      (operationsData.shipping?.on_time_rate || 0) < 85 
                        ? 'exception' 
                        : (operationsData.shipping?.on_time_rate || 0) < 95 
                          ? 'normal' 
                          : 'success'
                    }
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;
