import { chatbotApi } from './apiConfig';

export const chatbotService = {
  // === BASIC MESSAGING ===
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

  // === CONVERSATION MANAGEMENT ===
  getConversation: async (conversationId, options = {}) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const { includeContext = false, limit = null, offset = 0 } = options;

    try {
      const params = new URLSearchParams({
        include_context: includeContext.toString(),
        offset: offset.toString()
      });
      
      if (limit !== null) {
        params.append('limit', limit.toString());
      }

      const response = await chatbotApi.get(`/conversations/${conversationId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to load conversation');
    }
  },

  getAllConversations: async (options = {}) => {
    const { limit = 20, offset = 0, status = null } = options;
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await chatbotApi.get(`/conversations?${params}`);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to load conversations');
    }
  },

  deleteConversation: async (conversationId, hardDelete = false) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const params = new URLSearchParams({
        hard_delete: hardDelete.toString()
      });
      
      const response = await chatbotApi.delete(`/conversations/${conversationId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to delete conversation');
    }
  },

  // === ENHANCED HISTORY MANAGEMENT ===
  getQuickHistory: async (limit = 5) => {
    try {
      const response = await chatbotApi.get(`/users/current/quick-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Quick history API error:', error);
      throw new Error(error.message || 'Failed to load quick history');
    }
  },

  getUserHistoryOverview: async (userId = null, periodDays = 30) => {
    try {
      // If no userId provided, use 'current' endpoint (will be handled by backend)
      const endpoint = userId 
        ? `/users/${userId}/history/overview?period_days=${periodDays}`
        : `/users/current/history/overview?period_days=${periodDays}`;
        
      const response = await chatbotApi.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('History overview API error:', error);
      throw new Error(error.message || 'Failed to load history overview');
    }
  },

  // === SMART SEARCH ===
  smartSearchConversations: async (query, filters = {}) => {
    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }

    try {
      const searchData = {
        query: query.trim(),
        ...filters
      };
      
      const response = await chatbotApi.post('/conversations/smart-search', searchData);
      return response.data;
    } catch (error) {
      console.error('Smart search API error:', error);
      throw new Error(error.message || 'Failed to search conversations');
    }
  },

  // === CONVERSATION ANALYSIS ===
  summarizeConversation: async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const response = await chatbotApi.post(`/conversations/${conversationId}/summarize`);
      return response.data;
    } catch (error) {
      console.error('Summarize API error:', error);
      throw new Error(error.message || 'Failed to summarize conversation');
    }
  },

  // === BULK OPERATIONS ===
  bulkConversationActions: async (conversationIds, action) => {
    if (!conversationIds || conversationIds.length === 0) {
      throw new Error('Conversation IDs are required');
    }
    
    if (!action || !['delete', 'archive'].includes(action)) {
      throw new Error('Valid action (delete, archive) is required');
    }

    try {
      const response = await chatbotApi.post('/conversations/bulk-actions', {
        conversation_ids: conversationIds,
        action: action
      });
      return response.data;
    } catch (error) {
      console.error('Bulk actions API error:', error);
      throw new Error(error.message || 'Failed to perform bulk actions');
    }
  },

  // === CONVERSATION LIFECYCLE ===
  createConversation: async (options = {}) => {
    const { title = null, agentRole = 'clerk', initialContext = null } = options;
    
    try {
      const response = await chatbotApi.post('/conversations', {
        title: title || `Chat ${new Date().toLocaleString()}`,
        agent_role: agentRole,
        initial_context: initialContext
      });
      return response.data;
    } catch (error) {
      console.error('Create conversation API error:', error);
      throw new Error(error.message || 'Failed to create conversation');
    }
  },

  archiveConversation: async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const response = await chatbotApi.patch(`/conversations/${conversationId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Archive API error:', error);
      throw new Error(error.message || 'Failed to archive conversation');
    }
  },

  // === USER ROLES ===
  getUserRole: async () => {
    try {
      const response = await chatbotApi.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error(error.message || 'Failed to get user role');
    }
  },

  // === ADVANCED FEATURES ===
  getConversationInsights: async (periodDays = 30) => {
    try {
      const response = await chatbotApi.get(`/conversations/insights?period_days=${periodDays}`);
      return response.data;
    } catch (error) {
      console.error('Insights API error:', error);
      throw new Error(error.message || 'Failed to get conversation insights');
    }
  },

  exportConversations: async (options = {}) => {
    try {
      const response = await chatbotApi.post('/conversations/export', options);
      return response.data;
    } catch (error) {
      console.error('Export API error:', error);
      throw new Error(error.message || 'Failed to export conversations');
    }
  },

  // === SEARCH SUGGESTIONS ===
  getSearchSuggestions: async (query = '') => {
    // Simple client-side suggestions for now
    const suggestions = [
      'inventory status',
      'order tracking',
      'analytics report',
      'shipping updates',
      'stock levels',
      'recent orders',
      'warehouse analytics',
      'delivery schedules'
    ];

    if (query.trim() === '') {
      return suggestions.slice(0, 4);
    }

    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.slice(0, 6);
  },

  // === LOCAL STORAGE HELPERS ===
  getCachedConversations: () => {
    try {
      const cached = localStorage.getItem('wms_chat_conversations');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.warn('Failed to parse cached conversations:', error);
      return [];
    }
  },

  setCachedConversations: (conversations) => {
    try {
      localStorage.setItem('wms_chat_conversations', JSON.stringify(conversations));
    } catch (error) {
      console.warn('Failed to cache conversations:', error);
    }
  },

  getCachedUserPreferences: () => {
    try {
      const cached = localStorage.getItem('wms_chat_preferences');
      return cached ? JSON.parse(cached) : {
        defaultAgent: 'clerk',
        autoSummarize: false,
        showTimestamps: true,
        compactView: false
      };
    } catch (error) {
      console.warn('Failed to parse cached preferences:', error);
      return {};
    }
  },

  setCachedUserPreferences: (preferences) => {
    try {
      localStorage.setItem('wms_chat_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to cache preferences:', error);
    }
  },

  // === UTILITIES ===
  formatConversationTitle: (conversation) => {
    if (conversation.title && conversation.title.trim() !== '') {
      return conversation.title;
    }
    
    const lastMessage = conversation.last_message || conversation.preview || 'New conversation';
    return lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;
  },

  formatLastActivity: (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.warn('Failed to format date:', error);
      return 'Unknown';
    }
  },

  getAgentDisplayName: (agentRole) => {
    const agentNames = {
      'clerk': 'Receiving Clerk',
      'picker': 'Picker Assistant', 
      'packer': 'Packing Assistant',
      'manager': 'Warehouse Manager',
      'driver': 'Driver Assistant',
      'general': 'General Assistant'
    };
    
    return agentNames[agentRole?.toLowerCase()] || 'Assistant';
  },

  getAgentColor: (agentRole) => {
    const agentColors = {
      'clerk': 'bg-blue-100 text-blue-800',
      'picker': 'bg-green-100 text-green-800',
      'packer': 'bg-purple-100 text-purple-800', 
      'manager': 'bg-red-100 text-red-800',
      'driver': 'bg-yellow-100 text-yellow-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    
    return agentColors[agentRole?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  },

  // === ROLE-BASED ENHANCED FEATURES ===
  roleBased: {
    // Dashboard and Overview
    getDashboard: async () => {
      try {
        const response = await chatbotApi.get('/role-based/dashboard');
        return response.data;
      } catch (error) {
        console.error('Dashboard API error:', error);
        throw new Error(error.message || 'Failed to load dashboard');
      }
    },

    getPermissions: async () => {
      try {
        const response = await chatbotApi.get('/role-based/permissions');
        return response.data;
      } catch (error) {
        console.error('Permissions API error:', error);
        throw new Error(error.message || 'Failed to load permissions');
      }
    },

    getActivitySummary: async (days = 7) => {
      try {
        const response = await chatbotApi.get(`/role-based/activity-summary?days=${days}`);
        return response.data;
      } catch (error) {
        console.error('Activity summary API error:', error);
        throw new Error(error.message || 'Failed to load activity summary');
      }
    },

    getQuickHistory: async (limit = 5) => {
      try {
        const response = await chatbotApi.get(`/role-based/quick/history?limit=${limit}`);
        return response.data;
      } catch (error) {
        console.error('Quick history API error:', error);
        throw new Error(error.message || 'Failed to load quick history');
      }
    },

    // Manager Analytics (Manager only)
    analytics: {
      getSystemOverview: async (periodDays = 30) => {
        try {
          const response = await chatbotApi.get(`/role-based/analytics/system-overview?period_days=${periodDays}`);
          return response.data;
        } catch (error) {
          console.error('System overview API error:', error);
          throw new Error(error.message || 'Failed to load system overview');
        }
      },

      getUserAnalytics: async (userId, periodDays = 30) => {
        try {
          const response = await chatbotApi.get(`/role-based/analytics/user/${userId}?period_days=${periodDays}`);
          return response.data;
        } catch (error) {
          console.error('User analytics API error:', error);
          throw new Error(error.message || 'Failed to load user analytics');
        }
      },

      getPerformanceMetrics: async (periodDays = 30) => {
        try {
          const response = await chatbotApi.get(`/role-based/analytics/performance?period_days=${periodDays}`);
          return response.data;
        } catch (error) {
          console.error('Performance metrics API error:', error);
          throw new Error(error.message || 'Failed to load performance metrics');
        }
      },

      getSystemAlerts: async () => {
        try {
          const response = await chatbotApi.get('/role-based/analytics/alerts');
          return response.data;
        } catch (error) {
          console.error('System alerts API error:', error);
          throw new Error(error.message || 'Failed to load system alerts');
        }
      },

      getExecutiveSummary: async (periodDays = 30) => {
        try {
          const response = await chatbotApi.get(`/role-based/analytics/executive-summary?period_days=${periodDays}`);
          return response.data;
        } catch (error) {
          console.error('Executive summary API error:', error);
          throw new Error(error.message || 'Failed to load executive summary');
        }
      }
    },

    // Agent Management (Manager only)
    agents: {
      getManagementOverview: async () => {
        try {
          const response = await chatbotApi.get('/role-based/agents/management/overview');
          return response.data;
        } catch (error) {
          console.error('Agent management API error:', error);
          throw new Error(error.message || 'Failed to load agent management overview');
        }
      },

      provideFeedback: async (agentRole, positiveFeedback = true) => {
        try {
          const response = await chatbotApi.post('/role-based/agents/feedback', {
            agent_role: agentRole,
            positive_feedback: positiveFeedback
          });
          return response.data;
        } catch (error) {
          console.error('Agent feedback API error:', error);
          throw new Error(error.message || 'Failed to provide agent feedback');
        }
      }
    },

    // Enhanced Search
    search: {
      smartSearch: async (query) => {
        try {
          const response = await chatbotApi.post('/role-based/search/smart', { query });
          return response.data;
        } catch (error) {
          console.error('Smart search API error:', error);
          throw new Error(error.message || 'Failed to perform smart search');
        }
      },

      semanticSearch: async (query, options = {}) => {
        try {
          const searchData = {
            query,
            limit: options.limit || 20,
            similarity_threshold: options.similarityThreshold || 0.7,
            content_types: options.content_types,
            agent_roles: options.agent_roles,
            date_from: options.date_from,
            date_to: options.date_to
          };
          const response = await chatbotApi.post('/role-based/search/semantic', searchData);
          return response.data;
        } catch (error) {
          console.error('Semantic search API error:', error);
          throw new Error(error.message || 'Failed to perform semantic search');
        }
      }
    },

    // Export and Bulk Operations
    exportConversations: async (conversationIds = null, options = {}) => {
      try {
        const exportData = {
          conversation_ids: conversationIds,
          format: options.format || 'json',
          include_metadata: options.includeMetadata !== false,
          include_context: options.includeContext !== false
        };
        const response = await chatbotApi.post('/role-based/export/conversations', exportData);
        return response.data;
      } catch (error) {
        console.error('Export API error:', error);
        throw new Error(error.message || 'Failed to export conversations');
      }
    },

    bulkOperations: async (conversationIds, operation, operationData = {}) => {
      try {
        const response = await chatbotApi.post('/role-based/bulk/operations', {
          conversation_ids: conversationIds,
          operation: operation,
          operation_data: operationData
        });
        return response.data;
      } catch (error) {
        console.error('Bulk operations API error:', error);
        throw new Error(error.message || 'Failed to perform bulk operations');
      }
    },

    // Features and capabilities
    getAvailableFeatures: async () => {
      try {
        const response = await chatbotApi.get('/role-based/features');
        return response.data;
      } catch (error) {
        console.error('Features API error:', error);
        throw new Error(error.message || 'Failed to load available features');
      }
    }
  }
};