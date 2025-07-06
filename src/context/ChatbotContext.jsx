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

  // Load allowed roles and conversation history when user is available
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.role) return;
      
      try {
        // Load user roles
        const { allowed_chatbot_roles } = await chatbotService.getUserRole();
        setAllowedRoles(allowed_chatbot_roles || []);

        // Load conversation history
        await loadConversationHistory();
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      }
    };

    loadUserData();
  }, [currentUser]);

  // Load conversation history for the current user
  const loadConversationHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoadingConversations(true);
      const conversationData = await chatbotService.getAllConversations();
      
      if (conversationData && Array.isArray(conversationData.conversations)) {
        // Sort conversations by last activity (most recent first)
        const sortedConversations = conversationData.conversations.sort((a, b) => 
          new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at)
        );
        setConversations(sortedConversations);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error loading conversation history:', err);
      // Don't show error for conversation history as it's not critical
      setConversations([]);
    } finally {
      setLoadingConversations(false);
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
        const data = await chatbotService.getConversation(conversationId);
        
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages.map(msg => ({
            id: msg.message_id || msg.timestamp || Date.now() + Math.random(),
            role: msg.message_type === 'USER' ? 'user' : 'assistant',
            content: msg.content || msg.message || msg.response,
            timestamp: msg.timestamp
          })));
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

  const sendMessage = async (message) => {
    if (!currentUser?.role) {
      setError('User role not found. Please log in again.');
      return;
    }

    // Use the first allowed role or the user's current role
    const chatRole = allowedRoles[0] || currentUser.role.toLowerCase();

    try {
      setLoading(true);
      setError(null);
      
      const userMessage = { 
        id: Date.now(), 
        role: 'user', 
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      const response = await chatbotService.sendMessage(message, {
        conversationId,
        role: chatRole
      });
      
      // Update conversation ID if this is a new conversation
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        // Reload conversation history to include the new conversation
        await loadConversationHistory();
      }
      
      const assistantMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.reply,
        timestamp: response.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      return response;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (convId) => {
    setConversationId(convId);
    setError(null);
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  };

  const deleteConversation = async (convId) => {
    try {
      await chatbotService.deleteConversation(convId);
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.conversation_id !== convId));
      
      // If the deleted conversation is currently active, start a new one
      if (conversationId === convId) {
        startNewConversation();
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      return false;
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  return (
    <ChatbotContext.Provider value={{
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
      allowedRoles
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;