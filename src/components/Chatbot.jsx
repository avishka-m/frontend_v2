import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Input, List, Avatar, Spin, Typography, Tooltip, Empty, Select } from 'antd';
import { RobotOutlined, UserOutlined, SendOutlined, MessageOutlined, ReloadOutlined, CommentOutlined } from '@ant-design/icons';
import { chatbotService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const Chatbot = () => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Helper: format timestamp
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // On open, load or create conversation
  useEffect(() => {
    if (visible && user) {
      setInitLoading(true);
      chatbotService.getUserConversations().then(res => {
        const convs = res.data || [];
        setConversations(convs);
        if (convs.length > 0) {
          // Load the most recent conversation
          const latest = convs.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))[0];
          loadConversation(latest.conversation_id);
        } else {
          // Start a new conversation automatically
          startNewConversation();
        }
      }).finally(() => setInitLoading(false));
    }
    // eslint-disable-next-line
  }, [visible, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load conversation messages
  const loadConversation = async (convId) => {
    setLoading(true);
    try {
      const res = await chatbotService.getConversationById(convId);
      setMessages(res.data.messages || []);
      setConversationId(convId);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Start a new conversation
  const startNewConversation = async () => {
    if (!user?.role) return;
    setCreatingConversation(true);
    try {
      const res = await chatbotService.createConversation({ role: user.role, title: `Chat with ${user.role}` });
      setConversationId(res.data.conversation_id);
      setMessages([]);
      // Refresh conversation list
      const convs = await chatbotService.getUserConversations();
      setConversations(convs.data || []);
    } catch (err) {
      // fallback: show error
    } finally {
      setCreatingConversation(false);
    }
  };

  // Send a chat message
  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    setLoading(true);
    const userMsg = {
      role: user.role,
      message: input,
      conversation_id: conversationId,
    };
    setMessages((msgs) => [
      ...msgs,
      { role: 'user', content: input, timestamp: new Date().toISOString() },
    ]);
    setInput('');
    try {
      const res = await chatbotService.chat(userMsg);
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: res.data.response, timestamp: res.data.timestamp },
      ]);
    } catch (err) {
      // fallback: show error
    } finally {
      setLoading(false);
    }
  };

  // UI for conversation list (optional, as a dropdown)
  const conversationDropdown = conversations.length > 1 && (
    <div style={{ marginBottom: 12 }}>
      <Select
        style={{ width: '100%' }}
        value={conversationId}
        onChange={loadConversation}
        options={conversations.map(c => ({
          label: `${c.title} (${c.role})`,
          value: c.conversation_id
        }))}
      />
    </div>
  );

  // UI for chat messages (bubble style)
  const chatMessages = (
    <div style={{ minHeight: 200, maxHeight: 350, overflowY: 'auto', background: '#fafafa', padding: 8 }}>
      {messages.length === 0 && !loading && <Empty description="No messages yet" style={{ margin: '32px 0' }} />}
      <List
        dataSource={messages}
        renderItem={item => (
          <List.Item
            style={{
              justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
              border: 'none',
              padding: '4px 0',
            }}
          >
            <div style={{ display: 'flex', flexDirection: item.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', maxWidth: '80%' }}>
              <Avatar
                icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                style={{ backgroundColor: item.role === 'user' ? '#1890ff' : '#fadb14', margin: '0 8px' }}
              />
              <div style={{
                background: item.role === 'user' ? '#e6f7ff' : '#fffbe6',
                color: '#222',
                borderRadius: 12,
                padding: '8px 14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                minWidth: 40,
                maxWidth: 320,
                wordBreak: 'break-word',
              }}>
                <div style={{ fontSize: 14 }}>{item.content}</div>
                <div style={{ fontSize: 10, color: '#888', textAlign: item.role === 'user' ? 'right' : 'left' }}>{formatTime(item.timestamp)}</div>
              </div>
            </div>
          </List.Item>
        )}
      />
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <>
      <Tooltip title="Chat with WMS Bot">
        <Button
          type="primary"
          shape="circle"
          icon={<CommentOutlined />}
          size="large"
          style={{ position: 'fixed', right: 32, bottom: 32, zIndex: 1000 }}
          onClick={() => setVisible(true)}
        />
      </Tooltip>
      <Drawer
        title={<span><RobotOutlined /> WMS Chatbot</span>}
        placement="right"
        width={400}
        onClose={() => setVisible(false)}
        open={visible}
        footer={null}
      >
        {conversationDropdown}
        <Button
          type="dashed"
          icon={<ReloadOutlined />}
          onClick={startNewConversation}
          loading={creatingConversation}
          block
          style={{ marginBottom: 12 }}
        >
          New Conversation
        </Button>
        <Spin spinning={loading || initLoading} tip="Loading...">
          {chatMessages}
        </Spin>
        <Input.Group compact style={{ marginTop: 16 }}>
          <Input
            style={{ width: 'calc(100% - 48px)' }}
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onPressEnter={sendMessage}
            disabled={!conversationId || loading || initLoading}
            autoFocus
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={!input.trim() || !conversationId || loading || initLoading}
          />
        </Input.Group>
      </Drawer>
    </>
  );
};

export default Chatbot; 