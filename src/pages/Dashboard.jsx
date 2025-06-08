import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List, Typography, Spin, Alert } from 'antd';
import { 
  ShoppingCartOutlined, 
  InboxOutlined, 
  TeamOutlined, 
  CarOutlined,
  DollarOutlined,
  FileExclamationOutlined
} from '@ant-design/icons';
import { dashboardService } from '../services/api';

const { Title } = Typography;

// Mock data for development when backend is not available
const MOCK_DATA = {
  summary: {
    total_orders: 156,
    total_inventory: 423,
    active_workers: 12,
    available_vehicles: 8,
    monthly_revenue: 45789.23,
    pending_orders: 23
  },
  recentOrders: [
    { order_id: 'ORD-2023-001', customer_name: 'Acme Corp', order_date: '2023-07-15', status: 'Completed', total: 1250.99 },
    { order_id: 'ORD-2023-002', customer_name: 'TechSolutions Inc', order_date: '2023-07-16', status: 'Processing', total: 3450.50 },
    { order_id: 'ORD-2023-003', customer_name: 'Global Retailers', order_date: '2023-07-17', status: 'Pending', total: 720.75 },
    { order_id: 'ORD-2023-004', customer_name: 'City Wholesale', order_date: '2023-07-18', status: 'Completed', total: 1890.25 },
    { order_id: 'ORD-2023-005', customer_name: 'Metro Distributors', order_date: '2023-07-19', status: 'Processing', total: 2340.00 }
  ],
  lowStockItems: [
    { id: 1, name: 'Printer Paper A4', sku: 'PP-A4-500', quantity: 5 },
    { id: 2, name: 'Desk Lamp LED', sku: 'DL-LED-001', quantity: 3 },
    { id: 3, name: 'Wireless Mouse', sku: 'WM-BLK-001', quantity: 7 },
    { id: 4, name: 'USB-C Cable 2m', sku: 'USB-C-2M', quantity: 2 },
    { id: 5, name: 'Notebook Pro 15"', sku: 'NB-PRO-15', quantity: 1 }
  ],
  pendingTasks: [
    { id: 1, name: 'Process incoming shipment', due_date: '2023-07-20', priority: 'High' },
    { id: 2, name: 'Verify inventory count', due_date: '2023-07-21', priority: 'Medium' },
    { id: 3, name: 'Schedule delivery trucks', due_date: '2023-07-22', priority: 'High' },
    { id: 4, name: 'Update supplier contracts', due_date: '2023-07-25', priority: 'Low' },
    { id: 5, name: 'Organize warehouse section B', due_date: '2023-07-28', priority: 'Medium' }
  ]
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let useRealData = true;
        
        // Fetch dashboard summary
        try {
          const summaryResponse = await dashboardService.getSummary();
          setSummary(summaryResponse.data);
        } catch (error) {
          // If backend is not available, use mock data
          console.log('Using mock data for summary');
          setSummary(MOCK_DATA.summary);
          useRealData = false;
        }

        if (useRealData) {
          try {
            // Fetch recent orders
            const ordersResponse = await dashboardService.getRecentOrders();
            setRecentOrders(ordersResponse.data);
            
            // Fetch low stock items
            const lowStockResponse = await dashboardService.getLowStockItems();
            setLowStockItems(lowStockResponse.data);
            
            // Fetch pending tasks
            const tasksResponse = await dashboardService.getPendingTasks();
            setPendingTasks(tasksResponse.data);
          } catch (error) {
            // If any of these calls fail, use mock data for everything
            setRecentOrders(MOCK_DATA.recentOrders);
            setLowStockItems(MOCK_DATA.lowStockItems);
            setPendingTasks(MOCK_DATA.pendingTasks);
          }
        } else {
          // Use mock data for everything else if summary call failed
          setRecentOrders(MOCK_DATA.recentOrders);
          setLowStockItems(MOCK_DATA.lowStockItems);
          setPendingTasks(MOCK_DATA.pendingTasks);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Using demo data as backend is not available.');
        
        // Use mock data if there's any error
        setSummary(MOCK_DATA.summary);
        setRecentOrders(MOCK_DATA.recentOrders);
        setLowStockItems(MOCK_DATA.lowStockItems);
        setPendingTasks(MOCK_DATA.pendingTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Order columns for the table
  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: 
            status === 'Completed' ? 'green' : 
            status === 'Processing' ? 'blue' : 
            status === 'Pending' ? 'orange' : 'red' 
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20 }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      {/* Summary Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Total Orders"
              value={summary.total_orders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Inventory Items"
              value={summary.total_inventory || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Active Workers"
              value={summary.active_workers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Available Vehicles"
              value={summary.available_vehicles || 0}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue and Pending Orders */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Monthly Revenue"
              value={summary.monthly_revenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Pending Orders"
              value={summary.pending_orders || 0}
              prefix={<FileExclamationOutlined />}
              valueStyle={{ color: summary.pending_orders > 10 ? '#cf1322' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card 
        title="Recent Orders" 
        style={{ marginBottom: 16 }}
        extra={<a href="/orders">View All</a>}
      >
        <Table 
          dataSource={recentOrders} 
          columns={orderColumns} 
          rowKey="order_id" 
          pagination={false}
          size="small"
        />
      </Card>

      {/* Low Stock Items and Pending Tasks */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            title="Low Stock Items"
            style={{ marginBottom: 16 }}
            extra={<a href="/inventory">View All</a>}
          >
            <List
              size="small"
              dataSource={lowStockItems}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <span style={{ color: item.quantity <= 5 ? 'red' : 'orange' }}>
                      {item.quantity} remaining
                    </span>
                  }
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`SKU: ${item.sku}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Pending Tasks"
            style={{ marginBottom: 16 }}
            extra={<a href="/tasks">View All</a>}
          >
            <List
              size="small"
              dataSource={pendingTasks}
              renderItem={(task) => (
                <List.Item
                  extra={
                    <span style={{ color: 
                      task.priority === 'High' ? 'red' : 
                      task.priority === 'Medium' ? 'orange' : 'green' 
                    }}>
                      {task.priority}
                    </span>
                  }
                >
                  <List.Item.Meta
                    title={task.name}
                    description={`Due: ${task.due_date}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 