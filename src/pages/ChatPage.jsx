/**
 * Chat Page Component
 * Main page containing the complete chat interface
 */

import React from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/ai/ConversationList';
import ChatInterface from '../components/ai/ChatInterface';
import ConnectionTest from '../components/ui/ConnectionTest';

const ChatPage = () => {
  const { loading, error } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Authentication Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <ConnectionTest />
      <Row gutter={16} style={{ height: '100%' }}>
        {/* Conversations Sidebar */}
        <Col xs={24} sm={24} md={8} lg={6} xl={6} style={{ height: '100%' }}>
          <ConversationList />
        </Col>
        
        {/* Chat Interface */}
        <Col xs={24} sm={24} md={16} lg={18} xl={18} style={{ height: '100%' }}>
          <ChatInterface />
        </Col>
      </Row>
    </div>
  );
};

export default ChatPage;
