import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, List, Typography, Spin, Alert, Progress, Tag, Tabs, Badge, Avatar, Timeline, Button } from 'antd';
import { 
  ShoppingCartOutlined, 
  InboxOutlined, 
  TeamOutlined, 
  CarOutlined,
  DollarOutlined,
  FileExclamationOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  ToolOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { dashboardService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
  ],
  roleStats: {
    picker: {
      ordersPickedToday: 42,
      pickRate: 65,
      accuracyRate: 99.5,
      pendingOrders: 15
    },
    packer: {
      ordersPackedToday: 38,
      packingRate: 22, 
      qualityScore: 97.8,
      packingQueue: 12
    },
    driver: {
      deliveriesToday: 28,
      onTimeRate: 94.5,
      routeEfficiency: 88,
      remainingStops: 8
    },
    clerk: {
      returnsProcessed: 17,
      inventoryUpdates: 112,
      accuracyRate: 99.2,
      pendingReturns: 5
    }
  },
  warehouseActivity: [
    { time: '09:15', event: 'Large shipment received from Supplier A', type: 'receiving' },
    { time: '10:30', event: 'Order #ORD-2023-042 packed and ready for shipping', type: 'packing' },
    { time: '11:45', event: 'Inventory count updated for electronics section', type: 'inventory' },
    { time: '13:20', event: 'Driver #8 completed all deliveries ahead of schedule', type: 'shipping' },
    { time: '14:50', event: 'New urgent order #ORD-2023-057 received', type: 'orders' }
  ]
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [roleStats, setRoleStats] = useState({});
  const [warehouseActivity, setWarehouseActivity] = useState([]);
  const { user } = useAuth();

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

        // Try to fetch role-specific stats if user has a role
        if (user?.role && useRealData) {
          try {
            const statsResponse = await dashboardService.getStats(user.role);
            setRoleStats(statsResponse.data);
          } catch (error) {
            console.log('Using mock data for role stats');
            // Use mock data for role stats
            setRoleStats(MOCK_DATA.roleStats[user.role.toLowerCase()] || {});
          }
        } else {
          // Use mock role stats
          setRoleStats(user?.role ? MOCK_DATA.roleStats[user.role.toLowerCase()] || {} : {});
        }

        // For now, use mock data for other components since endpoints are commented out
        setRecentOrders(MOCK_DATA.recentOrders);
        setLowStockItems(MOCK_DATA.lowStockItems);
        setPendingTasks(MOCK_DATA.pendingTasks);
        setWarehouseActivity(MOCK_DATA.warehouseActivity);

        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Using demo data as backend is not fully available.');
        
        // Use mock data if there's any error
        setSummary(MOCK_DATA.summary);
        setRecentOrders(MOCK_DATA.recentOrders);
        setLowStockItems(MOCK_DATA.lowStockItems);
        setPendingTasks(MOCK_DATA.pendingTasks);
        setRoleStats(user?.role ? MOCK_DATA.roleStats[user.role.toLowerCase()] || {} : {});
        setWarehouseActivity(MOCK_DATA.warehouseActivity);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        if (status === 'Completed') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'Processing') {
          color = 'processing';
          icon = <ClockCircleOutlined />;
        } else if (status === 'Pending') {
          color = 'warning';
          icon = <ClockCircleOutlined />;
        } else {
          color = 'error';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
    },
  ];

  // Role-specific widget based on user role
  const RoleSpecificWidget = () => {
    if (!user?.role) return null;

    const role = user.role.toLowerCase();
    
    // Common style for cards
    const cardStyle = { 
      height: '100%',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
    };

    if (role === 'picker' || role === 'pickersupervisor') {
      return (
        <Card title="Picker Performance" style={cardStyle}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Orders Picked Today" 
                value={roleStats.ordersPickedToday || 0} 
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Pending Orders" 
                value={roleStats.pendingOrders || 0} 
                prefix={<FileExclamationOutlined />}
                valueStyle={{ color: roleStats.pendingOrders > 10 ? '#cf1322' : '#faad14' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text>Pick Rate (items/hour)</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={(roleStats.pickRate / 100) * 100} 
                  strokeColor="#1890ff" 
                  showInfo={false}
                  style={{ flex: 1, marginRight: 12 }}
                />
                <Text strong>{roleStats.pickRate || 0}</Text>
              </div>
            </div>
            <div>
              <Text>Accuracy Rate</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={roleStats.accuracyRate || 0} 
                  strokeColor="#52c41a"
                  style={{ flex: 1, marginRight: 12 }}
                />
              </div>
            </div>
          </div>
        </Card>
      );
    }
    
    if (role === 'packer' || role === 'packersupervisor') {
      return (
        <Card title="Packer Performance" style={cardStyle}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Orders Packed Today" 
                value={roleStats.ordersPackedToday || 0} 
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Packing Queue" 
                value={roleStats.packingQueue || 0} 
                prefix={<FileExclamationOutlined />}
                valueStyle={{ color: roleStats.packingQueue > 10 ? '#cf1322' : '#faad14' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text>Packing Rate (orders/hour)</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={(roleStats.packingRate / 40) * 100} // Assuming 40 is max
                  strokeColor="#1890ff" 
                  showInfo={false}
                  style={{ flex: 1, marginRight: 12 }}
                />
                <Text strong>{roleStats.packingRate || 0}</Text>
              </div>
            </div>
            <div>
              <Text>Quality Score</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={roleStats.qualityScore || 0} 
                  strokeColor="#52c41a"
                  style={{ flex: 1, marginRight: 12 }}
                />
              </div>
            </div>
          </div>
        </Card>
      );
    }
    
    if (role === 'driver' || role === 'driversupervisor') {
      return (
        <Card title="Driver Performance" style={cardStyle}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Deliveries Today" 
                value={roleStats.deliveriesToday || 0} 
                prefix={<CarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Remaining Stops" 
                value={roleStats.remainingStops || 0} 
                prefix={<FileExclamationOutlined />}
                valueStyle={{ color: roleStats.remainingStops > 5 ? '#cf1322' : '#faad14' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text>On-Time Delivery Rate</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={roleStats.onTimeRate || 0} 
                  strokeColor="#1890ff" 
                  style={{ flex: 1, marginRight: 12 }}
                />
              </div>
            </div>
            <div>
              <Text>Route Efficiency</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={roleStats.routeEfficiency || 0} 
                  strokeColor="#52c41a"
                  style={{ flex: 1, marginRight: 12 }}
                />
              </div>
            </div>
          </div>
        </Card>
      );
    }
    
    if (role === 'clerk' || role === 'clerksupervisor') {
      return (
        <Card title="Clerk Performance" style={cardStyle}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic 
                title="Returns Processed" 
                value={roleStats.returnsProcessed || 0} 
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic 
                title="Inventory Updates" 
                value={roleStats.inventoryUpdates || 0} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text>Accuracy Rate</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={roleStats.accuracyRate || 0} 
                  strokeColor="#1890ff" 
                  style={{ flex: 1, marginRight: 12 }}
                />
              </div>
            </div>
            <div>
              <Text>Pending Returns</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Progress 
                  percent={((roleStats.pendingReturns || 0) / 20) * 100} // Assuming 20 is max
                  strokeColor={roleStats.pendingReturns > 10 ? '#cf1322' : '#faad14'} 
                  showInfo={false}
                  style={{ flex: 1, marginRight: 12 }}
                />
                <Text strong>{roleStats.pendingReturns || 0}</Text>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    
    // For manager or any other role
    return (
      <Card title="Warehouse Overview" style={cardStyle}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="Warehouse Efficiency" 
              value={summary.warehouseEfficiency || 0} 
              suffix="%" 
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Worker Attendance" 
              value={summary.workerAttendance || 0} 
              suffix="%" 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <Text>Orders Fulfillment Rate</Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Progress 
                percent={95} 
                strokeColor="#1890ff" 
                style={{ flex: 1, marginRight: 12 }}
              />
            </div>
          </div>
          <div>
            <Text>Inventory Accuracy</Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Progress 
                percent={98.7} 
                strokeColor="#52c41a"
                style={{ flex: 1, marginRight: 12 }}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  // Activity feed with timeline
  const ActivityFeed = () => (
    <Card 
      title="Warehouse Activity" 
      style={{ marginBottom: 16, height: '100%' }}
      bodyStyle={{ maxHeight: '400px', overflow: 'auto' }}
    >
      <Timeline>
        {warehouseActivity.map((activity, index) => {
          let color = 'blue';
          let icon = null;
          
          if (activity.type === 'receiving') {
            color = 'green';
            icon = <InboxOutlined />;
          } else if (activity.type === 'packing') {
            color = 'blue';
            icon = <InboxOutlined />;
          } else if (activity.type === 'inventory') {
            color = 'purple';
            icon = <ToolOutlined />;
          } else if (activity.type === 'shipping') {
            color = 'orange';
            icon = <CarOutlined />;
          } else if (activity.type === 'orders') {
            color = 'red';
            icon = <FireOutlined />;
          }
          
          return (
            <Timeline.Item key={index} color={color} dot={icon}>
              <p style={{ margin: 0 }}><Text strong>{activity.time}</Text></p>
              <p style={{ margin: 0 }}>{activity.event}</p>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );

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
        message="Notice"
        description={error}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {error && (
        <Alert
          message="Notice"
          description={error}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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

      {/* Revenue and Pending Orders with trends */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card style={{ marginBottom: 16 }}>
            <Statistic
              title="Monthly Revenue"
              value={summary.monthly_revenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span>
                  USD
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    <RiseOutlined /> 8.2%
                  </Tag>
                </span>
              }
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
              suffix={
                <span>
                  <Tag color={summary.pending_orders > 20 ? 'error' : 'warning'} style={{ marginLeft: 8 }}>
                    {summary.pending_orders > 20 
                      ? <RiseOutlined /> 
                      : <FallOutlined />
                    } 
                    {summary.pending_orders > 20 ? '+12.5%' : '-4.2%'}
                  </Tag>
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Role-specific widget and Activity Feed */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <RoleSpecificWidget />
        </Col>
        <Col xs={24} md={12}>
          <ActivityFeed />
        </Col>
      </Row>

      {/* Tabbed sections for Orders, Inventory, and Tasks */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={
              <span>
                <ShoppingCartOutlined />
                Recent Orders
                <Badge count={recentOrders.length} style={{ marginLeft: 8 }} />
              </span>
            } 
            key="1"
          >
            <Table 
              dataSource={recentOrders} 
              columns={orderColumns} 
              rowKey="order_id" 
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <InboxOutlined />
                Low Stock Items
                <Badge count={lowStockItems.length} style={{ marginLeft: 8 }} color="orange" />
              </span>
            } 
            key="2"
          >
            <List
              size="small"
              dataSource={lowStockItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">Reorder</Button>,
                    <Button type="link" size="small">View Details</Button>
                  ]}
                  extra={
                    <Tag color={item.quantity <= 3 ? 'error' : 'warning'}>
                      {item.quantity} remaining
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<InboxOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.name}
                    description={`SKU: ${item.sku}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <FileExclamationOutlined />
                Pending Tasks
                <Badge count={pendingTasks.length} style={{ marginLeft: 8 }} />
              </span>
            } 
            key="3"
          >
            <List
              size="small"
              dataSource={pendingTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">Assign</Button>,
                    <Button type="link" size="small">Complete</Button>
                  ]}
                  extra={
                    <Tag color={
                      task.priority === 'High' ? 'error' : 
                      task.priority === 'Medium' ? 'warning' : 'success' 
                    }>
                      {task.priority}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={task.priority === 'High' ? <FireOutlined /> : <StarOutlined />} 
                        style={{ 
                          backgroundColor: task.priority === 'High' ? '#ff4d4f' : 
                                          task.priority === 'Medium' ? '#faad14' : '#52c41a' 
                        }} 
                      />
                    }
                    title={task.name}
                    description={`Due: ${task.due_date}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

    </div>
  );
};

export default Dashboard; 