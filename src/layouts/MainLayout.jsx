import { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  TeamOutlined,
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Chatbot from '../components/Chatbot';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define menu items based on user role
  // In a real application, you would filter these based on user permissions
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: <Link to="/inventory">Inventory</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: 'workers',
      icon: <TeamOutlined />,
      label: <Link to="/workers">Workers</Link>,
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: <Link to="/locations">Locations</Link>,
    },
    {
      key: 'vehicles',
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Vehicles</Link>,
    },
    {
      key: 'warehouse-operations',
      label: 'Warehouse Operations',
      icon: <SettingOutlined />,
      children: [
        {
          key: 'receiving',
          icon: <ImportOutlined />,
          label: <Link to="/receiving">Receiving</Link>,
        },
        {
          key: 'picking',
          icon: <ExportOutlined />,
          label: <Link to="/picking">Picking</Link>,
        },
        {
          key: 'packing',
          icon: <ExportOutlined />,
          label: <Link to="/packing">Packing</Link>,
        },
        {
          key: 'shipping',
          icon: <ExportOutlined />,
          label: <Link to="/shipping">Shipping</Link>,
        },
        {
          key: 'returns',
          icon: <ImportOutlined />,
          label: <Link to="/returns">Returns</Link>,
        },
      ],
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
    },
  ];

  // User dropdown menu items
  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Get the active menu key based on current location
  const getActiveMenuKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    return [path.split('/')[1]];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'WMS' : 'WMS System'}
          </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={getActiveMenuKey()}
          selectedKeys={getActiveMenuKey()}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInline: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 16 }}>
                Welcome, {user?.username || 'User'}
              </span>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
              >
                <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} icon={<UserOutlined />} />
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '2px',
          }}
        >
          {children}
          <Chatbot />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 