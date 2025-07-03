/**
 * Inventory Page Component
 * AI-powered inventory management with predictive analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Input, Select, Tag, Typography,
  Row, Col, Statistic, Alert, Modal, Form, InputNumber,
  DatePicker, Tooltip, Progress, Divider, message
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ExportOutlined, ImportOutlined,
  WarningOutlined, ArrowUpOutlined, RobotOutlined,
  BarChartOutlined, SyncOutlined, FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const InventoryPage = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    generateMockInventoryData();
    generateAiInsights();
  }, []);

  const generateMockInventoryData = () => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home & Garden'];
    const statuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];
    
    const mockData = Array.from({ length: 50 }, (_, index) => ({
      key: index,
      id: `INV-${(index + 1).toString().padStart(4, '0')}`,
      name: `Product ${index + 1}`,
      category: categories[index % categories.length],
      currentStock: Math.floor(Math.random() * 500),
      minStock: Math.floor(Math.random() * 50) + 10,
      maxStock: Math.floor(Math.random() * 200) + 300,
      unit: 'pcs',
      unitPrice: (Math.random() * 100 + 10).toFixed(2),
      location: `A${Math.floor(index / 10) + 1}-${(index % 10) + 1}`,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      supplier: `Supplier ${(index % 5) + 1}`,
      aiPrediction: Math.floor(Math.random() * 100) + 50,
      seasonalTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    }));

    // Add status based on stock levels
    mockData.forEach(item => {
      if (item.currentStock === 0) {
        item.status = 'Out of Stock';
      } else if (item.currentStock <= item.minStock) {
        item.status = 'Low Stock';
      } else if (item.currentStock >= item.maxStock) {
        item.status = 'Overstocked';
      } else {
        item.status = 'In Stock';
      }
    });

    setInventoryData(mockData);
    setFilteredData(mockData);
  };

  const generateAiInsights = () => {
    const insights = [
      {
        type: 'warning',
        title: 'Reorder Alert',
        message: '15 items are below minimum stock level',
        impact: 'high',
        action: 'Generate Purchase Orders'
      },
      {
        type: 'success',
        title: 'Seasonal Opportunity',
        message: 'Electronics category expected to surge 25% next month',
        impact: 'medium',
        action: 'Increase Stock'
      },
      {
        type: 'info',
        title: 'Cost Optimization',
        message: 'AI identified potential 12% cost reduction in Clothing category',
        impact: 'medium',
        action: 'Review Suppliers'
      }
    ];
    setAiInsights(insights);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterData(searchText, category);
  };

  const filterData = (search, category) => {
    let filtered = inventoryData;

    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'green';
      case 'Low Stock': return 'orange';
      case 'Out of Stock': return 'red';
      case 'Overstocked': return 'blue';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'increasing' ? 
      <ArrowUpOutlined style={{ color: '#52c41a' }} /> :
      <ArrowUpOutlined style={{ color: '#ff4d4f', transform: 'rotate(180deg)' }} />;
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: [
        { text: 'Electronics', value: 'Electronics' },
        { text: 'Clothing', value: 'Clothing' },
        { text: 'Books', value: 'Books' },
        { text: 'Sports', value: 'Sports' },
        { text: 'Home & Garden', value: 'Home & Garden' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (value, record) => (
        <div>
          <Text strong={record.status === 'Low Stock' || record.status === 'Out of Stock'}>
            {value} {record.unit}
          </Text>
          {(record.status === 'Low Stock' || record.status === 'Out of Stock') && (
            <WarningOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: 'In Stock', value: 'In Stock' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Out of Stock', value: 'Out of Stock' },
        { text: 'Overstocked', value: 'Overstocked' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: 'AI Prediction',
      dataIndex: 'aiPrediction',
      key: 'aiPrediction',
      width: 150,
      render: (value, record) => (
        <Tooltip title={`AI predicts demand of ${value} units based on historical data and trends`}>
          <div>
            <Text>{value} units</Text>
            <div style={{ marginTop: 4 }}>
              {getTrendIcon(record.seasonalTrend)}
              <Text type="secondary" style={{ marginLeft: 4, fontSize: '12px' }}>
                {record.seasonalTrend}
              </Text>
            </div>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small">Reorder</Button>
          <Button type="link" size="small">History</Button>
        </Space>
      ),
    },
  ];

  const summaryStats = {
    totalItems: inventoryData.length,
    lowStock: inventoryData.filter(item => item.status === 'Low Stock').length,
    outOfStock: inventoryData.filter(item => item.status === 'Out of Stock').length,
    totalValue: inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0)
  };

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Inventory Management</Title>
          <Text type="secondary">AI-powered inventory optimization and analytics</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<SyncOutlined />}>Sync</Button>
            <Button icon={<ExportOutlined />}>Export</Button>
            {hasRole(['manager', 'clerk']) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                Add Item
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* AI Insights Alert */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Alert
            message={
              <Space>
                <RobotOutlined />
                <Text strong>AI Insights Available</Text>
              </Space>
            }
            description={
              <div style={{ marginTop: '8px' }}>
                {aiInsights.map((insight, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <Text>{insight.message}</Text>
                    <Button type="link" size="small" style={{ padding: 0, marginLeft: '8px' }}>
                      {insight.action}
                    </Button>
                  </div>
                ))}
              </div>
            }
            type="info"
            showIcon
            action={
              <Button size="small" type="primary" ghost>
                View All Insights
              </Button>
            }
          />
        </Col>
      </Row>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={summaryStats.totalItems}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={summaryStats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={summaryStats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={summaryStats.totalValue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryFilter}
            >
              <Option value="all">All Categories</Option>
              <Option value="Electronics">Electronics</Option>
              <Option value="Clothing">Clothing</Option>
              <Option value="Books">Books</Option>
              <Option value="Sports">Sports</Option>
              <Option value="Home & Garden">Home & Garden</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={10}>
            <Space>
              <Button icon={<FilterOutlined />}>Advanced Filters</Button>
              <Button type="primary" ghost icon={<RobotOutlined />}>
                AI Recommendations
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1200, y: 'calc(100vh - 500px)' }}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowClassName={(record) => {
            if (record.status === 'Out of Stock') return 'row-out-of-stock';
            if (record.status === 'Low Stock') return 'row-low-stock';
            return '';
          }}
        />
      </Card>

      {/* Add Item Modal */}
      <Modal
        title="Add New Inventory Item"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Product Name" required>
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" required>
                <Select placeholder="Select category">
                  <Option value="Electronics">Electronics</Option>
                  <Option value="Clothing">Clothing</Option>
                  <Option value="Books">Books</Option>
                  <Option value="Sports">Sports</Option>
                  <Option value="Home & Garden">Home & Garden</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Initial Stock" required>
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Min Stock" required>
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Max Stock" required>
                <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Unit Price" required>
                <InputNumber
                  min={0}
                  precision={2}
                  prefix="$"
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Location" required>
                <Input placeholder="e.g., A1-5" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Item
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .row-out-of-stock {
          background-color: #fff2f0 !important;
        }
        .row-low-stock {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default InventoryPage;
