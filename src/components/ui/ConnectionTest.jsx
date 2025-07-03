/**
 * Connection Test Component
 * Quick diagnostic to test backend connectivity
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Spin } from 'antd';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { chatService } from '../../services/chatService';

const { Text, Title } = Typography;

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const data = await chatService.getUserRoles();
      setBackendData(data);
      setConnectionStatus('connected');
    } catch (err) {
      setError(err.message);
      setConnectionStatus('failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Spin size="small" />;
      case 'connected':
        return <CheckCircle color="green" size={20} />;
      case 'failed':
        return <WifiOff color="red" size={20} />;
      default:
        return <Wifi color="gray" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'processing';
    }
  };

  return (
    <Card size="small" style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getStatusIcon()}
          <Text strong>Backend Connection</Text>
          <Tag color={getStatusColor()}>
            {connectionStatus === 'checking' ? 'Testing...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Failed'}
          </Tag>
        </div>

        {backendData && (
          <div>
            <Text type="secondary">Connected as: </Text>
            <Text strong>{backendData.username}</Text>
            <Text type="secondary"> ({backendData.role})</Text>
            <br />
            <Text type="secondary">Available roles: </Text>
            {backendData.allowed_chatbot_roles?.map(role => (
              <Tag key={role} size="small">{role}</Tag>
            ))}
          </div>
        )}

        {error && (
          <Text type="danger">Error: {error}</Text>
        )}

        <Button 
          size="small" 
          onClick={testConnection}
          loading={connectionStatus === 'checking'}
        >
          Test Again
        </Button>
      </Space>
    </Card>
  );
};

export default ConnectionTest;
