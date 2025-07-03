/**
 * Conversation List Component
 * Displays and manages the list of chat conversations
 */

import React, { useState } from 'react';
import { 
  List, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Popconfirm, 
  Empty,
  Input,
  message
} from 'antd';
import { 
  MessageSquare, 
  Trash2, 
  Search, 
  Plus,
  User, 
  HardHat, 
  Package, 
  Truck, 
  Crown 
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const { Text, Paragraph } = Typography;
const { Search: SearchInput } = Input;

const ROLE_ICONS = {
  clerk: <User size={14} />,
  picker: <HardHat size={14} />,
  packer: <Package size={14} />,
  driver: <Truck size={14} />,
  manager: <Crown size={14} />,
};

const ROLE_COLORS = {
  clerk: 'blue',
  picker: 'orange',
  packer: 'green',
  driver: 'purple',
  manager: 'red',
};

const ConversationList = () => {
  const { 
    conversations, 
    currentConversation, 
    loading, 
    createConversation, 
    selectConversation, 
    deleteConversation,
    selectedRole 
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  // Filter conversations based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.agent_role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  const handleCreateConversation = async () => {
    try {
      await createConversation(`New ${selectedRole} conversation`, selectedRole);
      message.success('New conversation created!');
    } catch (error) {
      message.error('Failed to create conversation');
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    try {
      await deleteConversation(conversationId);
      message.success('Conversation deleted');
    } catch (error) {
      message.error('Failed to delete conversation');
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return 'No messages';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <MessageSquare size={18} />
          <span>Conversations</span>
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          onClick={handleCreateConversation}
          loading={loading}
        >
          New Chat
        </Button>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
    >
      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <SearchInput
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </div>

      {/* Conversations List */}
      <div style={{ height: 'calc(100% - 72px)', overflow: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              conversations.length === 0 
                ? "No conversations yet" 
                : "No conversations match your search"
            }
            style={{ marginTop: 60 }}
          >
            {conversations.length === 0 && (
              <Button 
                type="primary" 
                icon={<Plus size={16} />}
                onClick={handleCreateConversation}
              >
                Start First Conversation
              </Button>
            )}
          </Empty>
        ) : (
          <List
            dataSource={filteredConversations}
            renderItem={(conversation) => (
              <List.Item
                key={conversation.conversation_id}
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: 
                    currentConversation?.conversation_id === conversation.conversation_id 
                      ? '#e6f7ff' 
                      : 'transparent',
                  borderLeft: 
                    currentConversation?.conversation_id === conversation.conversation_id
                      ? '3px solid #1890ff'
                      : '3px solid transparent'
                }}
                onClick={() => selectConversation(conversation.conversation_id)}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text strong style={{ flex: 1, marginRight: 8 }}>
                        {conversation.title}
                      </Text>
                      <Space>
                        <Tag 
                          color={ROLE_COLORS[conversation.agent_role]} 
                          size="small"
                          icon={ROLE_ICONS[conversation.agent_role]}
                        >
                          {conversation.agent_role}
                        </Tag>
                        <Popconfirm
                          title="Delete this conversation?"
                          description="This action cannot be undone."
                          onConfirm={(e) => handleDeleteConversation(conversation.conversation_id, e)}
                          okText="Delete"
                          cancelText="Cancel"
                          okType="danger"
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<Trash2 size={12} />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#ff4d4f' }}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatLastMessageTime(conversation.last_message_at)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Created {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
};

export default ConversationList;
