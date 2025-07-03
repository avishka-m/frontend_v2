/**
 * Main Layout Component
 * Provides the overall application layout with header, sidebar, and main content
 */

import React from 'react';
import { Layout, Typography, Button, Space, Tag } from 'antd';
import { MessageSquare, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children }) => {
  const { user, userRoles, logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: '#001529', 
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MessageSquare color="white" size={24} style={{ marginRight: 12 }} />
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
                style={{ color: 'white' }}
                onClick={logout}
              />
            </div>
          )}
        </Space>
      </Header>

      <Layout>
        {/* Main Content */}
        <Content style={{ 
          margin: '24px 24px 0',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 88px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
