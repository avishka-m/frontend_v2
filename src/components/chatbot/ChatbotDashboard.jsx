import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { chatbotService } from '../../services/chatbotService';
import ChatHistorySidebar from './ChatHistorySidebar';
import AssistantSelectionPanel from './AssistantSelectionPanel';
import ChatWindow from './ChatWindow';
import { toast } from 'react-hot-toast';
import {
  MessageSquare,
  Sparkles,
  Crown,
  User,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Bot
} from 'lucide-react';

const ChatbotDashboard = ({ 
  title = "WMS Chatbot",
  role = "User",
  iconComponent: IconComponent = Bot,
  gradientColors = "from-primary-500 to-blue-600",
  showAssistantSelection = false // Only true for managers
}) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('general');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);

  // Available agents based on role
  const getAvailableAgents = () => {
    const baseAgents = [
      { id: 'general', name: 'General Assistant', icon: Bot, color: 'from-blue-500 to-blue-600' },
    ];

    if (showAssistantSelection) {
      // Manager gets all agents
      return [
        ...baseAgents,
        { id: 'clerk', name: 'Receiving Clerk', icon: User, color: 'from-green-500 to-green-600' },
        { id: 'picker', name: 'Picker Assistant', icon: User, color: 'from-orange-500 to-orange-600' },
        { id: 'packer', name: 'Packer Assistant', icon: User, color: 'from-purple-500 to-purple-600' },
        { id: 'driver', name: 'Driver Assistant', icon: User, color: 'from-red-500 to-red-600' }
      ];
    } else {
      // Other roles get role-specific agent
      const roleAgentMap = {
        'ReceivingClerk': { id: 'clerk', name: 'Receiving Assistant', icon: User, color: 'from-green-500 to-green-600' },
        'Picker': { id: 'picker', name: 'Picker Assistant', icon: User, color: 'from-orange-500 to-orange-600' },
        'Packer': { id: 'packer', name: 'Packer Assistant', icon: User, color: 'from-purple-500 to-purple-600' },
        'Driver': { id: 'driver', name: 'Driver Assistant', icon: User, color: 'from-red-500 to-red-600' }
      };
      
      const roleAgent = roleAgentMap[currentUser?.role];
      if (roleAgent) {
        return [baseAgents[0], roleAgent];
      }
      return baseAgents;
    }
  };

  const availableAgents = getAvailableAgents();

  // Auto-select role-specific agent for non-managers
  useEffect(() => {
    if (!showAssistantSelection && currentUser?.role) {
      const roleAgentMap = {
        'ReceivingClerk': 'clerk',
        'Picker': 'picker',
        'Packer': 'packer',
        'Driver': 'driver'
      };
      
      const roleAgentId = roleAgentMap[currentUser.role];
      if (roleAgentId) {
        setSelectedAgent(roleAgentId);
      }
    }
  }, [currentUser?.role, showAssistantSelection]);

  // Initialize
  useEffect(() => {
    initializeChatbot();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatbot = async () => {
    try {
      setLoading(true);
      await loadConversations();
      toast.success(`${title} initialized successfully!`);
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      toast.error('Failed to initialize chatbot');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotService.getAllConversations({ limit: 50 });
      setConversations(response.conversations || []);
      
      // Auto-select first conversation if available
      if (response.conversations?.length > 0 && !activeConversation) {
        selectConversation(response.conversations[0]);
      }
    } catch (error) {
      console.warn('Could not load conversations:', error);
      setConversations([]);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setActiveConversation(conversation);
      setLoading(true);
      
      const response = await chatbotService.getConversation(
        conversation.conversation_id,
        { include_context: true, limit: 100 }
      );
      
      setMessages(response.messages || []);
      
      // Set agent based on conversation or current selection
      if (conversation.agent_role && showAssistantSelection) {
        setSelectedAgent(conversation.agent_role);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await chatbotService.createConversation({
        title: `New Chat ${new Date().toLocaleString()}`,
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
      toast.success('New conversation created');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || sending) return;
    
    setSending(true);
    
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
        await createNewConversation();
        conversationId = activeConversation?.conversation_id;
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
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations();
      toast.success('Conversations refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await chatbotService.deleteConversation(conversationId, false); // Soft delete
      
      // Remove from UI
      setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
      
      // Clear if it was the active conversation
      if (activeConversation?.conversation_id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      
      toast.success('Conversation deleted successfully');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
      throw error; // Re-throw to handle in component
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      await chatbotService.archiveConversation(conversationId);
      
      // Remove from UI (archived conversations won't show in main list)
      setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
      
      // Clear if it was the active conversation
      if (activeConversation?.conversation_id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      
      toast.success('Conversation archived successfully');
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      toast.error('Failed to archive conversation');
      throw error; // Re-throw to handle in component
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Auto-collapse sidebar on mobile and handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, start with sidebar collapsed
        if (!sidebarCollapsed) {
          setSidebarCollapsed(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  // Header component
  const renderHeader = () => (
    <div className={`bg-gradient-to-r ${gradientColors} text-white shadow-lg relative overflow-hidden flex-shrink-0`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-3xl"></div>
      
      <div className="relative px-4 sm:px-6 py-4 min-h-[5rem]">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{title}</h1>
                <div className="flex items-center space-x-2 text-white/80 text-xs sm:text-sm">
                  <span className="hidden sm:inline">AI-powered assistant</span>
                  <span className="sm:hidden">AI Assistant</span>
                  <span className="text-white/60">•</span>
                  <span>{role}</span>
                  {activeConversation && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="hidden sm:inline">{messages.length} messages</span>
                      <span className="sm:hidden">{messages.length}msg</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status indicator - Desktop only */}
            <div className="hidden lg:flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-white/90 font-medium">Online</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User info - Desktop only */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium truncate max-w-24 lg:max-w-none">
                {currentUser?.username || 'User'}
              </p>
              <p className="text-xs text-white/70">{role}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                title="Refresh conversations"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={toggleSidebar}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && conversations.length === 0) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading {title}</h2>
          <p className="text-gray-600">Initializing AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      isFullscreen 
        ? 'fixed inset-0 z-50' 
        : 'min-h-screen max-h-screen'
    } bg-gray-50 flex flex-col overflow-hidden`}>
      {/* Header */}
      {renderHeader()}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Left Sidebar - Chat History */}
        <div className={`
          transition-all duration-300 ease-in-out z-50
          ${sidebarCollapsed 
            ? 'w-0 min-w-0 -translate-x-full md:translate-x-0' 
            : 'w-80 min-w-80 translate-x-0'
          } 
          ${sidebarCollapsed ? 'md:w-0' : 'md:w-72 lg:w-80'}
          bg-white border-r border-gray-200 
          flex flex-col overflow-hidden
          fixed md:relative top-0 left-0 h-full md:h-auto
          ${sidebarCollapsed ? 'opacity-0 pointer-events-none md:pointer-events-auto' : 'opacity-100'}
          shadow-xl md:shadow-none
        `}>
          <div className="flex flex-col h-full overflow-hidden">
            <ChatHistorySidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={selectConversation}
              onNewConversation={createNewConversation}
              onRefresh={handleRefresh}
              onDeleteConversation={handleDeleteConversation}
              onArchiveConversation={handleArchiveConversation}
              loading={loading}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ChatWindow
            messages={messages}
            onSendMessage={sendMessage}
            sending={sending}
            selectedAgent={availableAgents.find(a => a.id === selectedAgent)}
            activeConversation={activeConversation}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatbotDashboard; 