/**
 * Message Bubble Component
 * Displays individual chat messages with appropriate styling
 */

import React from 'react';
import { Card, Typography, Space, Tag, Avatar } from 'antd';
import { User, Bot, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const { Text, Paragraph } = Typography;

const MessageBubble = ({ message }) => {
  const isAI = message.sender_type === 'ai' || message.sender_type === 'agent';
  const isUser = message.sender_type === 'user';

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        width: '100%'
      }}
    >
      <div 
        style={{ 
          maxWidth: '70%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}
      >
        {/* Avatar */}
        <Avatar 
          size="small"
          style={{ 
            backgroundColor: isUser ? '#1890ff' : '#52c41a',
            flexShrink: 0,
            marginTop: 4
          }}
          icon={isUser ? <User size={14} /> : <Bot size={14} />}
        />

        {/* Message Content */}
        <Card
          size="small"
          style={{
            backgroundColor: isUser ? '#1890ff' : '#f6f8fa',
            border: isUser ? '1px solid #1890ff' : '1px solid #e1e4e8',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{
            padding: '8px 12px',
            color: isUser ? 'white' : 'inherit'
          }}
        >
          {/* Message Header */}
          <div style={{ marginBottom: 4 }}>
            <Space size={8}>
              <Text 
                strong 
                style={{ 
                  fontSize: '12px',
                  color: isUser ? 'rgba(255,255,255,0.9)' : '#666'
                }}
              >
                {isUser ? 'You' : `${message.agent_role || 'AI'} Assistant`}
              </Text>
              
              {message.agent_role && isAI && (
                <Tag 
                  size="small" 
                  style={{ 
                    fontSize: '10px',
                    lineHeight: '14px',
                    padding: '0 4px',
                    margin: 0
                  }}
                >
                  {message.agent_role}
                </Tag>
              )}
              
              <Space size={4}>
                <Clock 
                  size={10} 
                  color={isUser ? 'rgba(255,255,255,0.7)' : '#999'} 
                />
                <Text 
                  style={{ 
                    fontSize: '10px',
                    color: isUser ? 'rgba(255,255,255,0.7)' : '#999'
                  }}
                >
                  {formatTimestamp(message.timestamp || message.created_at)}
                </Text>
              </Space>
            </Space>
          </div>

          {/* Message Text */}
          <Paragraph 
            style={{ 
              margin: 0,
              color: isUser ? 'white' : 'inherit',
              fontSize: '14px',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message.content}
          </Paragraph>

          {/* Message Metadata */}
          {message.context && Object.keys(message.context).length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${isUser ? 'rgba(255,255,255,0.2)' : '#eee'}` }}>
              <Text 
                style={{ 
                  fontSize: '11px',
                  color: isUser ? 'rgba(255,255,255,0.7)' : '#999'
                }}
              >
                Context: {JSON.stringify(message.context)}
              </Text>
            </div>
          )}

          {/* Processing Status */}
          {message.processing_status && message.processing_status !== 'completed' && (
            <div style={{ marginTop: 4 }}>
              <Tag 
                color={message.processing_status === 'processing' ? 'orange' : 'red'}
                size="small"
              >
                {message.processing_status}
              </Tag>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessageBubble;
