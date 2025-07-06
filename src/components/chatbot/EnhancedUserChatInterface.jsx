/**
 * Enhanced User Chat Interface Component
 * Clean, user-friendly chat interface for non-manager users
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
  FiSearch,
  FiClock,
  FiArchive,
  FiDownload,
  FiSettings,
  FiUser,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/Tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../common/Dialog';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';
import { Notification } from '../common/Notification';
import ChatMessage from './ChatMessage';

const EnhancedUserChatInterface = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // State management
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);
  const [quickHistory, setQuickHistory] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');

  // Initialize data
  useEffect(() => {
    fetchPermissions();
    fetchQuickHistory();
    fetchActivitySummary();
    fetchAvailableAgents();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPermissions = async () => {
    try {
      const response = await chatbotService.get('/role-based/permissions');
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchQuickHistory = async () => {
    try {
      const response = await chatbotService.get('/role-based/quick/history?limit=10');
      setQuickHistory(response.data.conversations);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching quick history:', error);
    }
  };

  const fetchActivitySummary = async () => {
    try {
      const response = await chatbotService.get('/role-based/activity-summary?days=7');
      setActivitySummary(response.data);
    } catch (error) {
      console.error('Error fetching activity summary:', error);
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const response = await chatbotService.get('/enhanced/roles');
      setAvailableAgents(response.data.allowed_chatbot_roles || []);
      if (response.data.allowed_chatbot_roles?.length > 0) {
        setSelectedAgent(response.data.allowed_chatbot_roles[0]);
      }
    } catch (error) {
      console.error('Error fetching available agents:', error);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await chatbotService.get(`/enhanced/conversations/${conversationId}?include_context=true`);
      setMessages(response.data.messages || []);
      setCurrentConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await chatbotService.post('/enhanced/conversations', {
        title: newConversationTitle || `Chat ${new Date().toLocaleDateString()}`,
        agent_role: selectedAgent,
        initial_context: {
          user_role: user?.role,
          timestamp: new Date().toISOString()
        }
      });

      const newConv = response.data;
      setCurrentConversation(newConv);
      setMessages([]);
      setConversations(prev => [newConv, ...prev]);
      setNewConversationTitle('');
      setShowNewConversationDialog(false);
      setNotification({ type: 'success', message: 'New conversation created' });
    } catch (error) {
      console.error('Error creating conversation:', error);
      setNotification({ type: 'error', message: 'Failed to create conversation' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent) return;

    try {
      setSending(true);

      // If no current conversation, create one
      let conversationId = currentConversation?.conversation_id;
      if (!conversationId) {
        const response = await chatbotService.post('/enhanced/conversations', {
          title: `Chat ${new Date().toLocaleDateString()}`,
          agent_role: selectedAgent,
          initial_context: {
            user_role: user?.role,
            timestamp: new Date().toISOString()
          }
        });
        conversationId = response.data.conversation_id;
        setCurrentConversation(response.data);
      }

      // Add user message to UI immediately
      const userMessage = {
        message_type: 'USER',
        content: newMessage,
        timestamp: new Date().toISOString(),
        message_id: Date.now().toString()
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // Send message to backend
      const response = await chatbotService.post(`/enhanced/conversations/${conversationId}/messages`, {
        content: newMessage,
        context: {
          user_role: user?.role,
          timestamp: new Date().toISOString()
        }
      });

      // Add AI response to messages
      const aiMessage = {
        message_type: 'ASSISTANT',
        content: response.data.response,
        timestamp: response.data.timestamp,
        message_id: (Date.now() + 1).toString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Refresh conversation list
      await fetchQuickHistory();

    } catch (error) {
      console.error('Error sending message:', error);
      setNotification({ type: 'error', message: 'Failed to send message' });
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await chatbotService.post('/role-based/search/smart', {
        query: searchQuery
      });
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Error searching conversations:', error);
      setNotification({ type: 'error', message: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportConversation = async (conversationId) => {
    try {
      const response = await chatbotService.post('/role-based/export/conversations', {
        conversation_ids: [conversationId],
        format: 'json',
        include_metadata: true
      });

      // Create download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversationId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({ type: 'success', message: 'Conversation exported' });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      setNotification({ type: 'error', message: 'Export failed' });
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      await chatbotService.patch(`/enhanced/conversations/${conversationId}/archive`);
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      if (currentConversation?.conversation_id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      setNotification({ type: 'success', message: 'Conversation archived' });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      setNotification({ type: 'error', message: 'Archive failed' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center space-x-2">
                  <FiPlus className="h-4 w-4" />
                  <span>New</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conversation Title (Optional)
                    </label>
                    <Input
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                      placeholder="Enter conversation title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Assistant
                    </label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an assistant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents.map(agent => (
                          <SelectItem key={agent} value={agent}>
                            {agent.charAt(0).toUpperCase() + agent.slice(1)} Assistant
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createNewConversation} className="w-full">
                    Create Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Activity Summary */}
        {activitySummary && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">This Week</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Conversations</p>
                <p className="font-semibold">{activitySummary.activity_summary?.total_conversations || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Messages</p>
                <p className="font-semibold">{activitySummary.activity_summary?.total_messages || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Start a new conversation above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversation?.conversation_id === conversation.conversation_id
                        ? 'bg-blue-100 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => fetchConversationMessages(conversation.conversation_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.preview}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.agent_role}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {conversation.message_count} messages
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <FiMoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleExportConversation(conversation.conversation_id)}>
                            <FiDownload className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.conversation_id)}>
                            <FiArchive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(conversation.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FiSettings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowSearchDialog(true)}>
                  <FiSearch className="h-4 w-4 mr-2" />
                  Advanced Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={fetchQuickHistory}>
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentConversation.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentConversation.agent_role} Assistant • {messages.length} messages
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {currentConversation.status || 'Active'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <FiMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportConversation(currentConversation.conversation_id)}>
                        <FiDownload className="h-4 w-4 mr-2" />
                        Export Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveConversation(currentConversation.conversation_id)}>
                        <FiArchive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation below</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.message_id}
                    message={message}
                    isUser={message.message_type === 'USER'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map(agent => (
                      <SelectItem key={agent} value={agent}>
                        {agent.charAt(0).toUpperCase() + agent.slice(1)} Assistant
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="resize-none"
                    disabled={sending}
                  />
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSend className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FiMessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to your AI Assistant
              </h3>
              <p className="text-gray-500 mb-6">
                Select a conversation from the sidebar or start a new one to begin chatting with your AI assistant.
              </p>
              <Button 
                onClick={() => setShowNewConversationDialog(true)}
                className="inline-flex items-center space-x-2"
              >
                <FiPlus className="h-4 w-4" />
                <span>Start New Conversation</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Conversations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in your conversations..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <FiSearch className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      fetchConversationMessages(result.conversation_id);
                      setShowSearchDialog(false);
                    }}
                  >
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.matched_context?.join(' • ')}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{result.agent_role}</Badge>
                      <span className="text-xs text-gray-400">
                        Score: {result.relevance_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default EnhancedUserChatInterface; 