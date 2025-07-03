import { createContext, useState, useEffect } from 'react';
import { chatbotService } from '../services';
import { useAuth } from '../hooks/useAuth';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState([]);

  // Load allowed roles when user is available
  useEffect(() => {
    const loadUserRoles = async () => {
      if (!currentUser?.role) return;
      
      try {
        const { allowed_chatbot_roles } = await chatbotService.getUserRole();
        setAllowedRoles(allowed_chatbot_roles || []);
      } catch (err) {
        console.error('Error loading user roles:', err);
        setError('Failed to load user roles');
      }
    };

    loadUserRoles();
  }, [currentUser]);

  // Load conversation when ID changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await chatbotService.getConversation(conversationId);
        
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages.map(msg => ({
            id: msg.timestamp || Date.now() + Math.random(),
            role: msg.role,
            content: msg.message || msg.response
          })));
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation history');
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
        content: message 
      };
      setMessages(prev => [...prev, userMessage]);
      
      const response = await chatbotService.sendMessage(message, {
        conversationId,
        role: chatRole
      });
      
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }
      
      const assistantMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.reply 
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

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  return (
    <ChatbotContext.Provider value={{
      messages,
      loading,
      error,
      isChatOpen,
      sendMessage,
      clearConversation,
      toggleChat,
      allowedRoles
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;