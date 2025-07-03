/**
 * Chat Interface Component
 * Main chat interface with message display and input
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Empty,
  Spin,
  message as antMessage,
  Divider
} from 'antd';
import { Send, MessageSquare, Bot } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import RoleSelector from './RoleSelector';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ChatInterface = () => {
  const { 
    currentConversation, 
    messages, 
    loading, 
    sendMessage, 
    selectedRole 
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentConversation) {
      antMessage.error('Please select or create a conversation first');
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      antMessage.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No conversation selected
  if (!currentConversation) {
    return (
      <Card style={{ height: '100%' }}>
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Empty
            image={<MessageSquare size={64} color="#ccc" />}
            description={
              <div>
                <Title level={4} style={{ color: '#999', marginBottom: 8 }}>
                  No Conversation Selected
                </Title>
                <Text type="secondary">
                  Select an existing conversation or create a new one to start chatting
                </Text>
              </div>
            }
          />
          
          <Divider />
          
          <div style={{ maxWidth: 300 }}>
            <RoleSelector />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <Bot size={18} />
          <span>{currentConversation.title}</span>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            ({currentConversation.agent_role} assistant)
          </Text>
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ 
        padding: 0, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      {/* Messages Area */}
      <div 
        style={{ 
          flex: 1, 
          padding: '16px',
          overflow: 'auto',
          backgroundColor: '#fafafa'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">
                    Start a conversation with the {currentConversation.agent_role} assistant
                  </Text>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble 
                key={message.message_id || index} 
                message={message} 
              />
            ))}
            
            {/* Loading indicator for AI response */}
            {isSending && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                marginBottom: 16 
              }}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #e1e4e8',
                    borderRadius: '12px'
                  }}
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <Space>
                    <Spin size="small" />
                    <Text type="secondary">
                      {currentConversation.agent_role} assistant is thinking...
                    </Text>
                  </Space>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #f0f0f0',
        backgroundColor: 'white'
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask the ${currentConversation.agent_role} assistant anything...`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isSending}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={handleSendMessage}
            loading={isSending}
            disabled={!messageText.trim() || loading}
          >
            Send
          </Button>
        </Space.Compact>
        
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Press Enter to send, Shift+Enter for new line
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
