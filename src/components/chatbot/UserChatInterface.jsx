/**
 * User Chat Interface
 * Clean chat interface for non-manager users with personal conversation management
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../common/Card';
import { 
  FiMessageCircle, 
  FiSend, 
  FiUser, 
  FiClock,
  FiPlus,
  FiSearch,
  FiArchive,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiMoreVertical
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { useAuth } from '../../hooks/useAuth';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../common/Notification';
import ChatMessage from './ChatMessage';

const UserChatInterface = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Available agents for regular users
  const availableAgents = [
    { id: 'general', name: 'General Assistant', color: 'blue' },
    { id: 'clerk', name: 'Receiving Clerk', color: 'green' },
    { id: 'picker', name: 'Picker Assistant', color: 'blue' },
    { id: 'packer', name: 'Packing Assistant', color: 'orange' },
    { id: 'driver', name: 'Driver Assistant', color: 'red' }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatbotService.getAllConversations({ limit: 50 });
      setConversations(response.conversations || []);
      
      // Auto-select first conversation if available
      if (response.conversations?.length > 0 && !activeConversation) {
        selectConversation(response.conversations[0]);
      }
    } catch (error) {
      showNotification('Failed to load conversations', 'error');
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setActiveConversation(conversation);
      setIsLoading(true);
      
      const response = await chatbotService.getConversation(
        conversation.conversation_id,
        { include_context: true, limit: 100 }
      );
      
      setMessages(response.messages || []);
      setSelectedAgent(conversation.agent_role || 'general');
    } catch (error) {
      showNotification('Failed to load conversation', 'error');
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
          const response = await chatbotService.createConversation({
      title: `Chat ${new Date().toLocaleString()}`,
      agentRole: selectedAgent
    });
      
      const newConversation = {
        conversation_id: response.conversation_id,
        title: response.title,
        agent_role: selectedAgent,
        created_at: new Date().toISOString(),
        message_count: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
      showNotification('New conversation created', 'success');
    } catch (error) {
      showNotification('Failed to create conversation', 'error');
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isSending) return;
    
    const messageText = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    try {
      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        content: messageText,
        timestamp: new Date().toISOString(),
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      let conversationId = activeConversation?.conversation_id;
      
      if (!conversationId) {
        // Create new conversation if none exists
        const response = await chatbotService.createConversation({
          title: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
          agentRole: selectedAgent
        });
        conversationId = response.conversation_id;
        
        const newConversation = {
          conversation_id: conversationId,
          title: response.title,
          agent_role: selectedAgent,
          created_at: new Date().toISOString(),
          message_count: 1
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
      }

      // Send message and get AI response
      const response = await chatbotService.sendMessage(messageText, {
        conversationId,
        role: selectedAgent
      });

      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + 1,
        content: response.reply,
        timestamp: response.timestamp,
        sender: 'assistant'
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation count
      if (activeConversation) {
        setActiveConversation(prev => ({
          ...prev,
          message_count: (prev.message_count || 0) + 2,
          last_message_at: new Date().toISOString()
        }));
      }
      
    } catch (error) {
      showNotification('Failed to send message', 'error');
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const archiveConversation = async (conversationId) => {
    try {
      await chatbotService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      
      if (activeConversation?.conversation_id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      
      showNotification('Conversation archived', 'success');
    } catch (error) {
      showNotification('Failed to archive conversation', 'error');
      console.error('Failed to archive conversation:', error);
    }
  };

  const exportConversation = async (conversationId) => {
    try {
      const response = await chatbotService.exportConversations({
        conversationIds: [conversationId],
        format: 'json',
        includeMetadata: true
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversationId}.json`;
      a.click();
      
      showNotification('Conversation exported', 'success');
    } catch (error) {
      showNotification('Failed to export conversation', 'error');
      console.error('Failed to export conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.agent_role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          <Button onClick={createNewConversation} size="sm">
            <FiPlus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        {/* Agent Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Assistant
          </label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <FiMessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No conversations found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.conversation_id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  activeConversation?.conversation_id === conversation.conversation_id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {availableAgents.find(a => a.id === conversation.agent_role)?.name || 'Assistant'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {conversation.message_count || 0} messages
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <FiClock className="inline h-3 w-3 mr-1" />
                      {chatbotService.formatLastActivity(conversation.created_at)}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <FiMoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => selectConversation(conversation)}>
                        <FiEye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportConversation(conversation.conversation_id)}>
                        <FiDownload className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archiveConversation(conversation.conversation_id)}>
                        <FiArchive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {activeConversation?.title || 'Select a conversation to start chatting'}
            </h3>
            {activeConversation && (
              <p className="text-sm text-gray-500">
                with {availableAgents.find(a => a.id === selectedAgent)?.name || 'AI Assistant'}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              disabled={isLoading}
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeConversation ? (
          messages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-500">Send a message to begin chatting with your AI assistant</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                isCurrentUser={message.sender === 'user'}
                agentRole={selectedAgent}
                onCopy={() => showNotification('Message copied to clipboard', 'success')}
              />
            ))
          )
        ) : (
          <div className="text-center py-12">
            <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Assistant</h3>
            <p className="text-gray-500 mb-4">Select a conversation from the sidebar or create a new one to get started</p>
            <Button onClick={createNewConversation}>
              <FiPlus className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      {activeConversation && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                disabled={isSending}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!currentMessage.trim() || isSending}
              className="flex-shrink-0"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSend className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex">
      {renderSidebar()}
      {renderChatArea()}
      
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default UserChatInterface; 