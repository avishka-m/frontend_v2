/**
 * Chat Context
 * Manages chat conversations and messages state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('manager');

  // Load conversations when user is available
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        loadConversations();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await chatService.getConversations();
      setConversations(data.conversations || []);
      
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title, agentRole = selectedRole) => {
    try {
      setLoading(true);
      setError(null);
      
      const conversationData = {
        title: title || `New ${agentRole} conversation`,
        agent_role: agentRole,
      };
      
      const newConversation = await chatService.createConversation(conversationData);
      
      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      // Set as current conversation
      setCurrentConversation(newConversation);
      setMessages([]); // Start with empty messages
      
      return newConversation;
      
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create conversation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const conversation = await chatService.getConversation(conversationId);
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
      
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, attachments = []) => {
    if (!currentConversation) {
      throw new Error('No conversation selected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const messageData = {
        content,
        attachments,
      };
      
      const response = await chatService.sendMessage(currentConversation.conversation_id, messageData);
      
      // Add user message and AI response to messages
      if (response.user_message) {
        setMessages(prev => [...prev, response.user_message]);
      }
      if (response.ai_response) {
        setMessages(prev => [...prev, response.ai_response]);
      }
      
      // Update conversation's last message time
      setCurrentConversation(prev => ({
        ...prev,
        last_message_at: new Date().toISOString(),
      }));
      
      return response;
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await chatService.deleteConversation(conversationId);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      
      // Clear current conversation if it was deleted
      if (currentConversation?.conversation_id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchConversations = async (query) => {
    try {
      const results = await chatService.searchConversations(query);
      return results;
    } catch (error) {
      console.error('Failed to search conversations:', error);
      throw error;
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    selectedRole,
    setSelectedRole,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    searchConversations,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
