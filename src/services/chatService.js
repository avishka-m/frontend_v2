/**
 * Chat Service
 * Handles all chatbot-related API operations
 */

import { apiGet, apiPost } from './api.js';

/**
 * Chat API Service
 */
export const chatService = {
  // Get user roles and permissions
  async getUserRoles() {
    try {
      const response = await apiGet('/chatbot/roles');
      return response.data;
    } catch (error) {
      console.error('Failed to get user roles:', error);
      throw new Error('Failed to load user roles');
    }
  },

  // Get all conversations for the current user
  async getConversations() {
    try {
      const response = await apiGet('/chatbot/conversations');
      return response.data;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      throw new Error('Failed to load conversations');
    }
  },

  // Create a new conversation
  async createConversation(data) {
    try {
      const response = await apiPost('/chatbot/conversations', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }
  },

  // Get a specific conversation by ID
  async getConversation(conversationId) {
    try {
      const response = await apiGet(`/chatbot/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw new Error('Failed to load conversation');
    }
  },

  // Send a message to a conversation
  async sendMessage(conversationId, messageData) {
    try {
      const response = await apiPost(`/chatbot/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Search conversations
  async searchConversations(query, limit = 10) {
    try {
      const response = await apiPost('/chatbot/conversations/search', {
        query,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search conversations:', error);
      throw new Error('Failed to search conversations');
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const response = await apiDelete(`/chatbot/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  },

  // Update conversation (title, etc.)
  async updateConversation(conversationId, updateData) {
    try {
      const response = await apiPut(`/chatbot/conversations/${conversationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update conversation:', error);
      throw new Error('Failed to update conversation');
    }
  }
};

export default chatService;
