/**
 * Enhanced Chatbot Interface
 * Simplified version that loads immediately with default data
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
  FiRefreshCw,
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiShield,
  FiCommand,
  FiEye,
  FiStar,
  FiTarget,
  FiActivity,
  FiDatabase,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiArrowRight,
  FiMaximize,
  FiMinimize
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
import ManagerAnalyticsPanel from './ManagerAnalyticsPanel';

const EnhancedChatbotInterface = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Core state
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Agent and conversation state
  const [selectedAgent, setSelectedAgent] = useState('clerk');
  const [availableAgents, setAvailableAgents] = useState(['clerk', 'manager', 'picker', 'packer', 'driver']);
  
  // UI state
  const [notification, setNotification] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Determine user role and permissions
  const userRole = user?.role || 'Clerk';
  const isManager = userRole.toLowerCase() === 'manager';

  // Initialize component - simplified version
  useEffect(() => {
    // Initialize immediately, don't wait for user
    initializeInterface();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeInterface = async () => {
    // Initialize immediately without any API calls
    setIsLoading(false);
    setConversations([]);
    showNotification('Enhanced chatbot ready!', 'success');
    
    // Load conversations in background (optional)
    try {
      const response = await chatbotService.getAllConversations({ limit: 20 });
      setConversations(response.conversations || []);
    } catch (error) {
      console.warn('Could not load conversations:', error);
      // This is fine, user can still create new conversations
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        content: messageContent,
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: user?.username || 'You'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send to backend
      let response;
      if (currentConversation) {
        // Send message to existing conversation
        response = await chatbotService.sendMessage(messageContent, {
          conversationId: currentConversation.conversation_id,
          role: selectedAgent
        });
      } else {
        // Create new conversation first
        const newConv = await chatbotService.createConversation({
          agentRole: selectedAgent,
          title: `Chat with ${chatbotService.getAgentDisplayName(selectedAgent)}`
        });
        
        setCurrentConversation(newConv);
        
        response = await chatbotService.sendMessage(messageContent, {
          conversationId: newConv.conversation_id,
          role: selectedAgent
        });
      }
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        content: response.reply,
        type: 'assistant',
        timestamp: response.timestamp,
        sender: chatbotService.getAgentDisplayName(selectedAgent),
        agentRole: selectedAgent
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Reload conversations
      try {
        const convResponse = await chatbotService.getAllConversations({ limit: 20 });
        setConversations(convResponse.conversations || []);
      } catch (error) {
        console.warn('Could not reload conversations:', error);
      }
      
    } catch (error) {
      showNotification('Failed to send message', 'error');
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    try {
      setIsLoading(true);
      setCurrentConversation(conversation);
      
      // Load conversation messages
      const convData = await chatbotService.getConversation(conversation.conversation_id, {
        includeContext: true
      });
      
      const formattedMessages = convData.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.message_type.toLowerCase(),
        timestamp: msg.timestamp,
        sender: msg.message_type === 'USER' ? (user?.username || 'You') : 
                chatbotService.getAgentDisplayName(conversation.agent_role),
        agentRole: conversation.agent_role
      }));
      
      setMessages(formattedMessages);
      setSelectedAgent(conversation.agent_role);
      
    } catch (error) {
      showNotification('Failed to load conversation', 'error');
      console.error('Load conversation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setShowCreateDialog(true);
  };

  const handleCreateConversation = async (agentRole, title) => {
    try {
      const newConv = await chatbotService.createConversation({
        agentRole: agentRole,
        title: title || `Chat with ${chatbotService.getAgentDisplayName(agentRole)}`
      });
      
      setCurrentConversation(newConv);
      setSelectedAgent(agentRole);
      setMessages([]);
      setShowCreateDialog(false);
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        content: `Hello! I'm your ${chatbotService.getAgentDisplayName(agentRole)} assistant. How can I help you today?`,
        type: 'assistant',
        timestamp: new Date().toISOString(),
        sender: chatbotService.getAgentDisplayName(agentRole),
        agentRole: agentRole
      };
      
      setMessages([welcomeMessage]);
      
      // Reload conversations
      try {
        const convResponse = await chatbotService.getAllConversations({ limit: 20 });
        setConversations(convResponse.conversations || []);
      } catch (error) {
        console.warn('Could not reload conversations:', error);
      }
      
      showNotification('New conversation created', 'success');
      
    } catch (error) {
      showNotification('Failed to create conversation', 'error');
      console.error('Create conversation error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderSidebar = () => (
    <div className="w-80 border-r bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Enhanced Chat</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500"
            >
              {isExpanded ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="text-blue-600"
            >
              <FiPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{conversations.length}</div>
            <div className="text-xs text-gray-500">Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{messages.length}</div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
          <div className="space-y-2">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div
                  key={conversation.conversation_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentConversation?.conversation_id === conversation.conversation_id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title || 'Untitled Conversation'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chatbotService.getAgentDisplayName(conversation.agent_role)}
                      </p>
                    </div>
                    <Badge className={chatbotService.getAgentColor(conversation.agent_role)}>
                      {conversation.agent_role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {conversation.message_count || 0} messages
                    </span>
                    <span className="text-xs text-gray-400">
                      {chatbotService.formatLastActivity(conversation.last_message_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new conversation to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiMessageCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">
                {currentConversation?.title || 'New Conversation'}
              </h3>
              <p className="text-sm text-gray-500">
                {chatbotService.getAgentDisplayName(selectedAgent)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent} value={agent}>
                    {chatbotService.getAgentDisplayName(agent)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.type === 'user'}
              timestamp={message.timestamp}
              sender={message.sender}
              agentRole={message.agentRole}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiMessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Ready to chat!</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[44px]"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="min-h-[44px] px-6"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSend className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Remove the loading screen - interface should load immediately
  // if (isLoading && conversations.length === 0) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900">Loading Enhanced Chatbot</h3>
  //         <p className="text-gray-500">Initializing AI assistant and loading your data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="h-full flex flex-col">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Interface */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">
                  <FiMessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="search">
                  <FiSearch className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
                {isManager && (
                  <TabsTrigger value="analytics">
                    <FiBarChart2 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              {renderChatArea()}
            </TabsContent>

            <TabsContent value="search" className="flex-1 p-6">
              <div className="text-center py-12 text-gray-500">
                <FiSearch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Search Coming Soon</p>
                <p className="text-sm">Advanced search functionality will be available soon</p>
              </div>
            </TabsContent>

            {isManager && (
              <TabsContent value="analytics" className="flex-1 p-6">
                <ManagerAnalyticsPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Create Conversation Dialog */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Type
                </label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map(agent => (
                      <SelectItem key={agent} value={agent}>
                        {chatbotService.getAgentDisplayName(agent)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreateConversation(selectedAgent, null)}
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedChatbotInterface; 