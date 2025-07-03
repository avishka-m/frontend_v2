/**
 * Main Layout Component
 * Provides the overall application layout with header, sidebar, and main content
 */

import React, { useState } from 'react';
import { Layout, Typography, Button, Space, Tag, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  const { user, userRoles, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <MessageSquare size={16} />,
      label: <Link to="/">AI Chat</Link>,
    },
    {
      key: '/chat',
      icon: <MessageSquare size={16} />,
      label: <Link to="/chat">AI Chat</Link>,
    },
    {
      key: '/seasonal',
      icon: <Brain size={16} />,
      label: <Link to="/seasonal">Seasonal AI</Link>,
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ background: '#fff' }}
        width={250}
      >
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Typography.Title level={collapsed ? 5 : 4} style={{ margin: 0 }}>
            {collapsed ? 'WMS' : 'WMS AI'}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{ 
          background: '#001529', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              WMS AI Assistant
            </Title>
          </div>
          
          <Space>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ color: 'white', display: 'block' }}>
                    {user.username}
                  </Text>
                  <Tag color="blue" size="small">
                    {user.role}
                  </Tag>
                </div>
                <Button 
                  type="text" 
                  icon={<User color="white" size={16} />}
                  style={{ color: 'white' }}
                />
                <Button 
                  type="text" 
                  icon={<Settings color="white" size={16} />}
                  style={{ color: 'white' }}
                />
                <Button 
                  type="text" 
                  icon={<LogOut color="white" size={16} />}
                  onClick={logout}
                  style={{ color: 'white' }}
                />
              </div>
            )}
          </Space>
        </Header>

        {/* Main Content */}
        <Content style={{ 
          margin: 0,
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
