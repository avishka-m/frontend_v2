import React, { useRef, useEffect, useState } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useAuth } from '../../hooks/useAuth';
import { chatbotService } from '../../services/chatbotService';
import ConversationHistoryManager from './ConversationHistoryManager';

const ChatBot = () => {
  const { currentUser } = useAuth();
  const { 
    messages, 
    conversations, 
    conversationId,
    loading, 
    loadingConversations,
    error, 
    isChatOpen, 
    sendMessage, 
    loadConversation,
    startNewConversation,
    deleteConversation,
    toggleChat 
  } = useChatbot();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showFullHistoryManager, setShowFullHistoryManager] = useState(false);
  const [quickHistory, setQuickHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [showUserInsights, setShowUserInsights] = useState(false);
  const [userOverview, setUserOverview] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('clerk');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [newChatAnimation, setNewChatAnimation] = useState(false);
  const [lastActiveConversation, setLastActiveConversation] = useState(null);

  // Load user preferences and quick history when chat opens
  useEffect(() => {
    if (isChatOpen) {
      loadUserPreferences();
      loadQuickHistory();
      loadUserInsights();
      loadLastActiveConversation();
    }
  }, [isChatOpen]);

  // Save current conversation state when it changes
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      saveCurrentConversationState();
    }
  }, [conversationId, messages]);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserPreferences = () => {
    const preferences = chatbotService.getCachedUserPreferences();
    setUserPreferences(preferences);
    setSelectedAgent(preferences.defaultAgent || 'clerk');
  };

  const loadQuickHistory = async () => {
    try {
      const response = await chatbotService.getQuickHistory(5);
      setQuickHistory(response.conversations || []);
    } catch (error) {
      console.error('Failed to load quick history:', error);
    }
  };

  const loadUserInsights = async () => {
    try {
      const overview = await chatbotService.getUserHistoryOverview();
      setUserOverview(overview);
    } catch (error) {
      console.error('Failed to load user insights:', error);
    }
  };

  const saveUserPreferences = (newPreferences) => {
    chatbotService.setCachedUserPreferences(newPreferences);
    setUserPreferences(newPreferences);
  };

  const saveCurrentConversationState = () => {
    if (!conversationId || !currentUser?.username) return;
    
    const state = {
      conversationId,
      userId: currentUser.username,
      lastMessageCount: messages.length,
      lastActivity: new Date().toISOString(),
      selectedAgent,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(`wms_chat_last_conversation_${currentUser.username}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save conversation state:', error);
    }
  };

  const loadLastActiveConversation = () => {
    if (!currentUser?.username) return;
    
    try {
      const saved = localStorage.getItem(`wms_chat_last_conversation_${currentUser.username}`);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if it's recent (within last 24 hours)
        const isRecent = (Date.now() - state.timestamp) < (24 * 60 * 60 * 1000);
        
        if (isRecent && state.conversationId) {
          setLastActiveConversation(state);
        }
      }
    } catch (error) {
      console.warn('Failed to load last conversation state:', error);
    }
  };

  const clearConversationState = () => {
    if (!currentUser?.username) return;
    
    try {
      localStorage.removeItem(`wms_chat_last_conversation_${currentUser.username}`);
      setLastActiveConversation(null);
    } catch (error) {
      console.warn('Failed to clear conversation state:', error);
    }
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputRef.current.value.trim();
    if (!message) return;

    try {
      await sendMessage(message);
      inputRef.current.value = '';
      
      // Refresh quick history after sending a message
      setTimeout(loadQuickHistory, 1000);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (convId) => {
    loadConversation(convId);
    setShowHistory(false);
    setShowFullHistoryManager(false);
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(convId);
      loadQuickHistory(); // Refresh quick history
    }
  };

  // Handle agent selection
  const handleAgentChange = (agentRole) => {
    setSelectedAgent(agentRole);
    const newPreferences = { ...userPreferences, defaultAgent: agentRole };
    saveUserPreferences(newPreferences);
    setShowAgentSelector(false);
  };

  // Handle new conversation with specific agent
  const handleNewConversationWithAgent = async (agentRole) => {
    try {
      setNewChatAnimation(true);
      clearConversationState(); // Clear any saved conversation state
      
      const response = await chatbotService.createConversation({
        title: `${chatbotService.getAgentDisplayName(agentRole)} Chat`,
        agentRole: agentRole
      });
      
      if (response.conversation_id) {
        loadConversation(response.conversation_id);
        loadQuickHistory(); // Refresh quick history
        
        // Show success feedback
        setTimeout(() => {
          setNewChatAnimation(false);
        }, 1000);
        
        // Close history panel if open
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setNewChatAnimation(false);
      // Fallback to regular new conversation
      startNewConversation();
    }
  };

  // Handle continuing last conversation
  const handleContinueLastConversation = () => {
    if (lastActiveConversation?.conversationId) {
      loadConversation(lastActiveConversation.conversationId);
      setSelectedAgent(lastActiveConversation.selectedAgent || 'clerk');
      setLastActiveConversation(null);
    }
  };

  // Handle creating a completely new chat
  const handleCreateNewChat = async () => {
    setNewChatAnimation(true);
    clearConversationState();
    
    try {
      await handleNewConversationWithAgent(selectedAgent);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      setNewChatAnimation(false);
    }
  };

  // Format conversation display
  const formatConversationTitle = (conv) => {
    return chatbotService.formatConversationTitle(conv);
  };

  const formatLastActivity = (dateString) => {
    return chatbotService.formatLastActivity(dateString);
  };

  const agentRoles = [
    { id: 'clerk', name: 'Receiving Clerk', icon: '📦', description: 'Inventory & receiving help' },
    { id: 'picker', name: 'Picker Assistant', icon: '🎯', description: 'Order picking guidance' },
    { id: 'packer', name: 'Packing Assistant', icon: '📋', description: 'Packing & shipping support' },
    { id: 'manager', name: 'Warehouse Manager', icon: '👔', description: 'Analytics & management' },
    { id: 'driver', name: 'Driver Assistant', icon: '🚚', description: 'Delivery & transportation' }
  ];

  const QuickHistoryPanel = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-700">Quick Access</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateNewChat}
            className={`relative text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-all duration-300 ${
              newChatAnimation ? 'animate-pulse scale-110' : ''
            }`}
            title="Create New Chat"
          >
            {newChatAnimation ? (
              <div className="relative">
                <span className="text-lg animate-spin">✨</span>
                <span className="absolute -top-1 -right-1 text-xs animate-bounce">🎉</span>
                <span className="ml-1 font-medium text-green-600">Creating...</span>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-1">
                  <div className="relative">
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs animate-pulse">✨</span>
                    </div>
                  </div>
                  <span className="font-medium group-hover:text-purple-600 transition-colors">New</span>
                </div>
              </div>
            )}
          </button>
          <button
            onClick={() => setShowFullHistoryManager(true)}
            className="text-xs text-primary-600 hover:text-primary-800 transition-colors hover:underline"
          >
            View All
          </button>
        </div>
      </div>
      
      {quickHistory.length === 0 ? (
        <div className="text-center py-4">
          <div className="mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">No recent conversations</p>
          <button
            onClick={handleCreateNewChat}
            className="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
          >
            <span className="text-sm animate-pulse">✨</span>
            <span className="font-medium">Start your first chat</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {quickHistory.map((conv, index) => (
            <ConversationHistoryCard
              key={conv.conversation_id}
              conversation={conv}
              isActive={conversationId === conv.conversation_id}
              isNew={index === 0 && newChatAnimation}
              onSelect={() => handleConversationSelect(conv.conversation_id)}
              onDelete={(e) => handleDeleteConversation(conv.conversation_id, e)}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Enhanced Conversation History Card with Message Preview
  const ConversationHistoryCard = ({ conversation, isActive, isNew, onSelect, onDelete }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [previewMessages, setPreviewMessages] = useState([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const loadMessagePreview = async () => {
      if (previewMessages.length > 0) return; // Already loaded
      
      try {
        setLoadingPreview(true);
        const response = await chatbotService.getConversation(conversation.conversation_id, {
          limit: 3,
          includeContext: false
        });
        setPreviewMessages(response.messages || []);
      } catch (error) {
        console.error('Failed to load message preview:', error);
        setPreviewMessages([]);
      } finally {
        setLoadingPreview(false);
      }
    };

    const handleMouseEnter = () => {
      setShowPreview(true);
      loadMessagePreview();
    };

    const handleMouseLeave = () => {
      setShowPreview(false);
    };

    const formatPreviewMessage = (message) => {
      if (message.content.length > 60) {
        return message.content.substring(0, 60) + '...';
      }
      return message.content;
    };

    return (
      <div className="relative">
        <div
          onClick={onSelect}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`p-2 rounded cursor-pointer transition-all duration-300 text-xs border ${
            isActive 
              ? 'bg-primary-100 border-primary-200 shadow-sm' 
              : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm'
          } ${
            isNew ? 'animate-bounce bg-green-50 border-green-200 shadow-md' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1 flex-1">
              <span className="font-medium text-gray-900 truncate">
                {formatConversationTitle(conversation)}
              </span>
              {isNew && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500 text-xs animate-pulse">✨</span>
                  <span className="text-xs text-green-600 font-medium">New</span>
                </div>
              )}
            </div>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              chatbotService.getAgentColor(conversation.agent_role)
            }`}>
              {conversation.agent_role}
            </span>
            <span className="text-xs text-gray-500">
              {formatLastActivity(conversation.last_activity)}
            </span>
          </div>

          {/* Message count indicator */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {conversation.message_count || 0} messages
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-blue-500">👁️</span>
              <span className="text-xs text-blue-500">Preview</span>
            </div>
          </div>
        </div>

        {/* Message Preview Tooltip */}
        {showPreview && (
          <div className="absolute z-50 left-full top-0 ml-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-3 transform transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-gray-800">Message Preview</h5>
              <span className="text-xs text-gray-500">Last {Math.min(previewMessages.length, 3)} messages</span>
            </div>
            
            {loadingPreview ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2 text-xs text-gray-500">Loading...</span>
              </div>
            ) : previewMessages.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previewMessages.slice(-3).map((msg, index) => (
                  <div key={index} className={`p-2 rounded text-xs ${
                    msg.message_type === 'user' || msg.role === 'user' 
                      ? 'bg-blue-50 border-l-2 border-blue-400' 
                      : 'bg-gray-50 border-l-2 border-gray-400'
                  }`}>
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`font-medium ${
                        msg.message_type === 'user' || msg.role === 'user' ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {msg.message_type === 'user' || msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {formatPreviewMessage(msg)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-gray-400 text-2xl">💬</span>
                <p className="text-xs text-gray-500 mt-1">No messages yet</p>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="w-full text-xs bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition-colors"
              >
                Open Conversation
              </button>
            </div>

            {/* Arrow pointer */}
            <div className="absolute top-4 -left-2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  const UserInsightsPanel = () => (
    <div className="p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
      <h4 className="text-xs font-semibold text-gray-800 mb-2">
        📊 Your Activity
      </h4>
      
      {userOverview?.overview ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-1">
            <div className="font-bold text-primary-600">
              {userOverview.overview.total_conversations}
            </div>
            <div className="text-gray-600">Total</div>
          </div>
          
          <div className="text-center p-1">
            <div className="font-bold text-green-600">
              {userOverview.overview.recent_conversations}
            </div>
            <div className="text-gray-600">Recent</div>
          </div>
          
          <div className="text-center p-1 col-span-2">
            <div className="font-bold text-purple-600">
              {userOverview.overview.most_used_agent?.role || 'N/A'}
            </div>
            <div className="text-gray-600">Favorite Agent</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500">
          Loading insights...
        </div>
      )}
    </div>
  );

  const AgentSelector = () => (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-72 z-10">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Choose an Assistant</h4>
      <div className="space-y-2">
        {agentRoles.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleAgentChange(agent.id)}
            className={`w-full text-left p-2 rounded-lg transition-colors ${
              selectedAgent === agent.id
                ? 'bg-primary-100 border border-primary-200 text-primary-800'
                : 'hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{agent.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-gray-600">{agent.description}</div>
              </div>
              {selectedAgent === agent.id && (
                <span className="text-primary-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (!isChatOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChat}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105 relative"
        title="Open Warehouse Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
          
          {/* Notification badges */}
          {(userOverview?.overview?.recent_conversations > 0 || lastActiveConversation) && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {lastActiveConversation ? '💬' : Math.min(userOverview.overview.recent_conversations, 9)}
            </span>
          )}
      </button>
      </div>
    );
  }

  return (
    <>
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
              <h3 className="text-sm font-semibold">
                {chatbotService.getAgentDisplayName(selectedAgent)}
              </h3>
              <p className="text-xs opacity-90">
                Hello, {currentUser?.username}
              </p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUserInsights(!showUserInsights)}
              className="text-white hover:text-gray-200 transition-colors"
              title="User Insights"
            >
              📊
            </button>
            
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white hover:text-gray-200 transition-colors"
            title="Conversation History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
            
            <div className="relative">
          <button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="text-white hover:text-gray-200 transition-colors"
                title="Change Assistant"
              >
                🤖
              </button>
              {showAgentSelector && <AgentSelector />}
            </div>
            
            <div className="relative group">
              <button
                onClick={handleCreateNewChat}
                className={`relative text-white hover:text-gray-200 transition-all duration-300 ${
                  newChatAnimation ? 'animate-pulse scale-110' : 'hover:scale-110'
                }`}
                title="Start New Chat"
              >
                {/* Background glow effect */}
                <div className="absolute -inset-2 bg-white bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-300"></div>
                
                {newChatAnimation ? (
                  <div className="relative flex items-center justify-center">
                    <span className="text-lg animate-spin">✨</span>
                    <span className="absolute text-xs animate-bounce">🎉</span>
                  </div>
                ) : (
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
                    
                    {/* Sparkle effects on hover */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs animate-pulse">✨</span>
                    </div>
                    <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <span className="text-xs animate-pulse">⭐</span>
                    </div>
                  </div>
                )}
          </button>
              
              {/* Enhanced new chat indicator */}
              {newChatAnimation && (
                <div className="absolute -top-2 -right-2 flex items-center justify-center">
                  <div className="bg-green-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-lg">
                    ✓
                  </div>
                  <div className="absolute w-5 h-5 bg-green-400 rounded-full animate-ping opacity-30"></div>
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                Create new chat ✨
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black border-t-opacity-75"></div>
              </div>
            </div>
            
          <button onClick={toggleChat} className="text-white hover:text-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

        {/* Continue Conversation Banner */}
        {lastActiveConversation && !conversationId && (
          <div className="border-b p-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Continue your last conversation?
                  </p>
                  <p className="text-xs text-gray-600">
                    {chatbotService.formatLastActivity(lastActiveConversation.lastActivity)} • 
                    {lastActiveConversation.lastMessageCount} messages
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleContinueLastConversation}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={() => setLastActiveConversation(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Insights Panel */}
        {showUserInsights && (
          <div className="border-b p-3 bg-gray-50">
            <UserInsightsPanel />
          </div>
        )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="flex-1 border-b bg-gray-50 overflow-y-auto">
          <div className="p-3">
              <QuickHistoryPanel />
              
              {loadingConversations && (
                <div className="flex justify-center py-3">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">
                  {agentRoles.find(a => a.id === selectedAgent)?.icon || '🤖'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Hi! I'm your {chatbotService.getAgentDisplayName(selectedAgent).toLowerCase()}.
              </p>
              <p className="text-xs text-gray-500">
                Ask me about inventory, orders, analytics, or any warehouse operations.
              </p>
              
              {/* Quick action buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => inputRef.current && (inputRef.current.value = 'What is my current inventory status?')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                >
                  📦 Check inventory status
                </button>
                <button
                  onClick={() => inputRef.current && (inputRef.current.value = 'Show me recent orders')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                >
                  🚚 View recent orders
                </button>
                <button
                  onClick={() => inputRef.current && (inputRef.current.value = 'Generate analytics report')}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                >
                  📊 Get analytics report
                </button>
              </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start space-x-2 max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs">
                      {agentRoles.find(a => a.id === selectedAgent)?.icon || '🤖'}
                    </span>
                </div>
              )}
              <div
                className={`rounded-lg p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.timestamp && (
                  <div className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs">
                    {agentRoles.find(a => a.id === selectedAgent)?.icon || '🤖'}
                  </span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-gray-600 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
              placeholder={`Ask ${chatbotService.getAgentDisplayName(selectedAgent)} about warehouse operations...`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>

      {/* Full History Manager Modal */}
      <ConversationHistoryManager
        isOpen={showFullHistoryManager}
        onClose={() => setShowFullHistoryManager(false)}
        onConversationSelect={handleConversationSelect}
        currentConversationId={conversationId}
      />
    </>
  );
};

export default ChatBot;