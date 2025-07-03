import { chatbotApi } from './apiConfig';

export const chatbotService = {
  sendMessage: async (message, { conversationId = null, role = null } = {}) => {
    if (!role) {
      throw new Error('User role is required to send messages');
    }

    try {
      const response = await chatbotApi.post('/chat', {
        role: role.toLowerCase(), // Backend expects lowercase role
        message,
        conversation_id: conversationId
      });

      // Ensure the response matches the expected format
      if (!response.data.response || !response.data.conversation_id) {
        throw new Error('Invalid response format from chatbot server');
      }

      return {
        reply: response.data.response,
        conversationId: response.data.conversation_id,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  },
  
  getConversation: async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const response = await chatbotApi.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to load conversation');
    }
  },

  getAllConversations: async () => {
    try {
      const response = await chatbotApi.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to load conversations');
    }
  },

  deleteConversation: async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const response = await chatbotApi.delete(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to delete conversation');
    }
  },

  getUserRole: async () => {
    try {
      const response = await chatbotApi.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to get user role');
    }
  }
};