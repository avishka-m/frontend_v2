import { chatbotApi } from './apiConfig';

export const chatbotService = {
  // Conversation management
  createConversation: (data) => chatbotApi.post('/api/conversations', data),
  getUserConversations: () => chatbotApi.get('/api/conversations'),
  getConversationById: (conversationId) => chatbotApi.get(`/api/conversations/${conversationId}`),
  updateConversation: (conversationId, data) => chatbotApi.put(`/api/conversations/${conversationId}`, data),
  deleteConversation: (conversationId) => chatbotApi.delete(`/api/conversations/${conversationId}`),

  // Chat functionality
  sendMessage: (data) => chatbotApi.post('/api/chat', data),
  getMessageHistory: (conversationId, params = {}) => chatbotApi.get(`/api/conversations/${conversationId}/messages`, { params }),

  // User management
  getUserRole: () => chatbotApi.get('/api/user/role'),
  updateUserPreferences: (preferences) => chatbotApi.put('/api/user/preferences', preferences),

  // Chatbot capabilities
  getAvailableAgents: () => chatbotApi.get('/api/agents'),
  getChatbotCapabilities: () => chatbotApi.get('/api/capabilities'),

  // Analytics
  getChatAnalytics: (params = {}) => chatbotApi.get('/api/analytics/chat', { params }),
  getUserInteractions: (userId, params = {}) => chatbotApi.get(`/api/analytics/users/${userId}/interactions`, { params }),
};
