/**
 * Chatbot Page Component
 * AI-powered conversational interface for warehouse operations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Input, Button, Space, Typography, Avatar, List,
  Divider, Tag, Spin, Alert, Row, Col, Statistic,
  Select, Switch, Tooltip, Badge
} from 'antd';
import {
  SendOutlined, RobotOutlined, UserOutlined, 
  SettingOutlined, ClearOutlined, DownloadOutlined,
  AudioOutlined, PictureOutlined, FileTextOutlined,
  BulbOutlined, ArrowUpOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ChatbotPage = () => {
  const { user, hasRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState('assistant');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      content: `Hello ${user?.username}! I'm your AI warehouse assistant. I can help you with inventory queries, order management, analytics, and operational insights. What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        'Show low stock items',
        'Generate inventory report',
        'Optimize picker routes',
        'Predict demand trends'
      ]
    };
    setMessages([welcomeMessage]);
  }, [user?.username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, user?.role);
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (query, userRole) => {
    const responses = {
      inventory: {
        content: `Based on current inventory data, I found the following insights:\n\n• 15 items are below minimum stock level\n• Electronics category shows 25% increase in demand\n• Recommended reorder for SKUs: INV-0001, INV-0023, INV-0045\n\nWould you like me to generate purchase orders for these items?`,
        suggestions: ['Generate purchase orders', 'Show detailed analysis', 'Export report']
      },
      orders: {
        content: `Here's your current order status:\n\n• 47 orders pending processing\n• 23 orders in picking phase\n• 12 orders ready for shipping\n• Average fulfillment time: 2.3 hours\n\nOptimal picking route for next batch ready. Shall I assign it?`,
        suggestions: ['Assign picking routes', 'Show order details', 'Optimize workflow']
      },
      analytics: {
        content: `Analytics summary for today:\n\n• Productivity up 15% compared to yesterday\n• Peak hours: 2-4 PM (consider additional staff)\n• Cost savings opportunity in packaging materials\n• Customer satisfaction: 94.2%\n\nDeep dive into any specific metric?`,
        suggestions: ['Show productivity details', 'Cost optimization tips', 'Staff scheduling']
      },
      default: {
        content: `I understand you're asking about "${query}". As your warehouse AI assistant, I can help with:\n\n• Inventory management and stock optimization\n• Order processing and fulfillment\n• Analytics and performance insights\n• Workflow optimization\n• Predictive analytics\n\nWhat specific area would you like to explore?`,
        suggestions: ['Inventory insights', 'Order management', 'Performance analytics', 'Optimization tips']
      }
    };

    let responseType = 'default';
    if (query.toLowerCase().includes('inventory') || query.toLowerCase().includes('stock')) {
      responseType = 'inventory';
    } else if (query.toLowerCase().includes('order') || query.toLowerCase().includes('pick')) {
      responseType = 'orders';
    } else if (query.toLowerCase().includes('analytic') || query.toLowerCase().includes('report')) {
      responseType = 'analytics';
    }

    const response = responses[responseType];
    
    return {
      id: Date.now() + 1,
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      insights: responseType !== 'default' ? [
        { metric: 'Confidence', value: 95 },
        { metric: 'Data Sources', value: 5 },
        { metric: 'Processing Time', value: '0.8s' }
      ] : null
    };
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const MessageComponent = ({ message }) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
      marginBottom: '16px',
      alignItems: 'flex-start'
    }}>
      <Avatar 
        icon={message.type === 'ai' ? <RobotOutlined /> : <UserOutlined />}
        style={{ 
          backgroundColor: message.type === 'ai' ? '#1890ff' : '#52c41a',
          marginLeft: message.type === 'user' ? '8px' : '0',
          marginRight: message.type === 'ai' ? '8px' : '0'
        }}
      />
      <div style={{ 
        maxWidth: '70%', 
        background: message.type === 'user' ? '#e6f7ff' : '#f6ffed',
        borderRadius: '12px',
        padding: '12px 16px',
        wordBreak: 'break-word'
      }}>
        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
          {message.content}
        </div>
        
        {message.insights && (
          <div style={{ marginTop: '12px', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>AI Insights:</Text>
            <Row gutter={8} style={{ marginTop: '4px' }}>
              {message.insights.map((insight, index) => (
                <Col key={index}>
                  <Statistic 
                    title={insight.metric} 
                    value={insight.value} 
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}
        
        {message.suggestions && (
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Suggested actions:
            </Text>
            <Space wrap>
              {message.suggestions.map((suggestion, index) => (
                <Button 
                  key={index}
                  size="small" 
                  type="dashed"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ fontSize: '12px' }}
                >
                  {suggestion}
                </Button>
              ))}
            </Space>
          </div>
        )}
        
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {message.timestamp.toLocaleTimeString()}
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px', borderRadius: '12px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Avatar size={40} icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>AI Warehouse Assistant</Title>
                <Text type="secondary">Powered by advanced ML models • Always learning</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="AI Response Mode">
                <Select value={aiMode} onChange={setAiMode} style={{ width: 120 }}>
                  <Option value="assistant">Assistant</Option>
                  <Option value="expert">Expert</Option>
                  <Option value="creative">Creative</Option>
                </Select>
              </Tooltip>
              <Tooltip title="Voice Input">
                <Switch
                  checkedChildren={<AudioOutlined />}
                  unCheckedChildren={<AudioOutlined />}
                  checked={voiceEnabled}
                  onChange={setVoiceEnabled}
                />
              </Tooltip>
              <Button icon={<DownloadOutlined />} onClick={exportChat}>Export</Button>
              <Button icon={<ClearOutlined />} onClick={clearChat}>Clear</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Chat Area */}
      <Card 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        bodyStyle={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0
        }}
      >
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 300px)'
        }}>
          {messages.map(message => (
            <MessageComponent key={message.id} message={message} />
          ))}
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: '8px' }} />
              <div style={{ 
                background: '#f6ffed', 
                borderRadius: '12px', 
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Spin size="small" style={{ marginRight: '8px' }} />
                <Text type="secondary">AI is thinking...</Text>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <Row gutter={8} align="bottom">
            <Col flex="auto">
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about warehouse operations..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ borderRadius: '20px' }}
              />
            </Col>
            <Col>
              <Space>
                <Tooltip title="Attach Image">
                  <Button icon={<PictureOutlined />} />
                </Tooltip>
                <Tooltip title="Attach Document">
                  <Button icon={<FileTextOutlined />} />
                </Tooltip>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  style={{ borderRadius: '20px' }}
                >
                  Send
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card style={{ marginTop: '16px', borderRadius: '12px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text type="secondary">Quick Actions:</Text>
          </Col>
          <Col>
            <Space wrap>
              <Button size="small" icon={<BulbOutlined />}>Smart Insights</Button>
              <Button size="small" icon={<ArrowUpOutlined />}>Predictions</Button>
              <Button size="small" icon={<SettingOutlined />}>Settings</Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChatbotPage;
