import { createContext, useState, useEffect } from 'react';
import { chatbotService } from '../services';
import { useAuth } from '../hooks/useAuth';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('clerk');
  const [userPreferences, setUserPreferences] = useState(null);
  const [conversationCategories, setConversationCategories] = useState({});
  const [searchHistory, setSearchHistory] = useState([]);

  // Load user data and preferences when user is available
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.role) return;
      
      try {
        // Load user roles
        const { allowed_chatbot_roles } = await chatbotService.getUserRole();
        setAllowedRoles(allowed_chatbot_roles || []);

        // Load user preferences
        const preferences = chatbotService.getCachedUserPreferences();
        setUserPreferences(preferences);
        setSelectedAgent(preferences.defaultAgent || 'clerk');

        // Load conversation history with enhanced data
        await loadConversationHistory();
        
        // Load conversation categories
        await loadConversationCategories();
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      }
    };

    loadUserData();
  }, [currentUser]);

  // Load conversation history for the current user with enhanced functionality
  const loadConversationHistory = async (options = {}) => {
    if (!currentUser) return;
    
    try {
      setLoadingConversations(true);
      const conversationData = await chatbotService.getAllConversations({
        limit: options.limit || 50,
        offset: options.offset || 0,
        status: options.status || 'active'
      });
      
      if (conversationData && Array.isArray(conversationData.conversations)) {
        // Sort conversations by last activity (most recent first)
        const sortedConversations = conversationData.conversations.sort((a, b) => 
          new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at)
        );
        
        setConversations(sortedConversations);
        
        // Cache conversations for offline access
        chatbotService.setCachedConversations(sortedConversations.slice(0, 10));
        
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error loading conversation history:', err);
      // Load cached conversations as fallback
      const cachedConversations = chatbotService.getCachedConversations();
      if (cachedConversations.length > 0) {
        setConversations(cachedConversations);
      } else {
        setConversations([]);
      }
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load conversation categories based on content analysis
  const loadConversationCategories = async () => {
    try {
      const overview = await chatbotService.getUserHistoryOverview();
      if (overview?.overview?.conversation_categories) {
        setConversationCategories(overview.overview.conversation_categories);
      }
    } catch (err) {
      console.error('Error loading conversation categories:', err);
    }
  };

  // Load conversation when ID changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await chatbotService.getConversation(conversationId, {
          includeContext: true,
          limit: 100 // Load more messages for better context
        });
        
        if (data && Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map(msg => ({
            id: msg.message_id || msg.timestamp || Date.now() + Math.random(),
            role: msg.message_type === 'USER' ? 'user' : 'assistant',
            content: msg.content || msg.message || msg.response,
            timestamp: msg.timestamp,
            metadata: msg.metadata || {}
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation history');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const sendMessage = async (message, options = {}) => {
    if (!currentUser?.role) {
      setError('User role not found. Please log in again.');
      return;
    }

    // Use the selected agent or first allowed role or the user's current role
    const chatRole = options.agentRole || selectedAgent || allowedRoles[0] || currentUser.role.toLowerCase();

    try {
      setLoading(true);
      setError(null);
      
      // Create optimistic user message
      const userMessage = { 
        id: Date.now(), 
        role: 'user', 
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send message with enhanced options
      const response = await chatbotService.sendMessage(message, {
        conversationId,
        role: chatRole,
        context: options.context || {},
        metadata: options.metadata || {}
      });
      
      // Update conversation ID if this is a new conversation
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        // Reload conversation history to include the new conversation
        setTimeout(() => loadConversationHistory(), 500);
      }
      
      // Create assistant message
      const assistantMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.reply,
        timestamp: response.timestamp || new Date().toISOString(),
        metadata: response.metadata || {}
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update search history for analytics
      updateSearchHistory(message);
      
      return response;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      // Remove the optimistic user message if the request failed
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSearchHistory = (query) => {
    setSearchHistory(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 10);
      localStorage.setItem('wms_chat_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const loadConversation = async (convId) => {
    setConversationId(convId);
    setError(null);
  };

  const startNewConversation = async (options = {}) => {
    try {
      if (options.agentRole || options.title) {
        // Create a new conversation with specific options
        const response = await chatbotService.createConversation({
          title: options.title,
          agentRole: options.agentRole || selectedAgent,
          initialContext: options.initialContext
        });
        
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
          setMessages([]);
          setError(null);
          
          // Reload conversation history
          setTimeout(() => loadConversationHistory(), 500);
          return response.conversation_id;
        }
      }
      
      // Fallback to simple new conversation
      setConversationId(null);
      setMessages([]);
      setError(null);
      
    } catch (err) {
      console.error('Error creating new conversation:', err);
      // Fallback to simple new conversation
      setConversationId(null);
      setMessages([]);
      setError(null);
    }
  };

  const deleteConversation = async (convId, hardDelete = false) => {
    try {
      await chatbotService.deleteConversation(convId, hardDelete);
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.conversation_id !== convId));
      
      // If the deleted conversation is currently active, start a new one
      if (conversationId === convId) {
        await startNewConversation();
      }
      
      // Update cached conversations
      const updatedConversations = conversations.filter(conv => conv.conversation_id !== convId);
      chatbotService.setCachedConversations(updatedConversations.slice(0, 10));
      
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      return false;
    }
  };

  const archiveConversation = async (convId) => {
    try {
      await chatbotService.archiveConversation(convId);
      
      // Remove from active conversations list
      setConversations(prev => prev.filter(conv => conv.conversation_id !== convId));
      
      // If the archived conversation is currently active, start a new one
      if (conversationId === convId) {
        await startNewConversation();
      }
      
      return true;
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError('Failed to archive conversation');
      return false;
    }
  };

  const bulkConversationActions = async (conversationIds, action) => {
    try {
      const result = await chatbotService.bulkConversationActions(conversationIds, action);
      
      // Refresh conversation list after bulk actions
      await loadConversationHistory();
      
      // If current conversation was affected, start a new one
      if (conversationIds.includes(conversationId)) {
        await startNewConversation();
      }
      
      return result;
    } catch (err) {
      console.error('Error performing bulk actions:', err);
      setError('Failed to perform bulk actions');
      return null;
    }
  };

  const smartSearchConversations = async (query, filters = {}) => {
    try {
      const results = await chatbotService.smartSearchConversations(query, filters);
      updateSearchHistory(query);
      return results;
    } catch (err) {
      console.error('Error searching conversations:', err);
      setError('Failed to search conversations');
      return null;
    }
  };

  const summarizeConversation = async (convId) => {
    try {
      return await chatbotService.summarizeConversation(convId);
    } catch (err) {
      console.error('Error summarizing conversation:', err);
      setError('Failed to summarize conversation');
      return null;
    }
  };

  const getUserInsights = async (periodDays = 30) => {
    try {
      return await chatbotService.getUserHistoryOverview(null, periodDays);
    } catch (err) {
      console.error('Error getting user insights:', err);
      return null;
    }
  };

  const updateUserPreferences = (newPreferences) => {
    const updatedPreferences = { ...userPreferences, ...newPreferences };
    setUserPreferences(updatedPreferences);
    chatbotService.setCachedUserPreferences(updatedPreferences);
    
    // Update selected agent if it was changed
    if (newPreferences.defaultAgent) {
      setSelectedAgent(newPreferences.defaultAgent);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  const getConversationsByCategory = (category) => {
    if (category === 'all') return conversations;
    
    return conversations.filter(conv => {
      const lastMsg = conv.last_message?.toLowerCase() || '';
      switch (category) {
        case 'inventory':
          return ['inventory', 'stock', 'item'].some(keyword => lastMsg.includes(keyword));
        case 'orders':
          return ['order', 'shipping', 'delivery'].some(keyword => lastMsg.includes(keyword));
        case 'analytics':
          return ['analytics', 'report', 'data'].some(keyword => lastMsg.includes(keyword));
        case 'recent':
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(conv.last_message_at || conv.created_at) > dayAgo;
        default:
          return true;
      }
    });
  };

  return (
    <ChatbotContext.Provider value={{
      // Basic chat functionality
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
      loadConversationHistory,
      clearConversation,
      toggleChat,
      
      // Enhanced functionality
      allowedRoles,
      selectedAgent,
      setSelectedAgent,
      userPreferences,
      updateUserPreferences,
      conversationCategories,
      searchHistory,
      
      // Advanced operations
      archiveConversation,
      bulkConversationActions,
      smartSearchConversations,
      summarizeConversation,
      getUserInsights,
      getConversationsByCategory,
      
      // Utility functions
      formatConversationTitle: chatbotService.formatConversationTitle,
      formatLastActivity: chatbotService.formatLastActivity,
      getAgentDisplayName: chatbotService.getAgentDisplayName,
      getAgentColor: chatbotService.getAgentColor
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;