import { chatbotApi } from './apiConfig';

/**
 * Enhanced AI Assistant Service
 * Leverages the full power of the backend agentic AI system
 * Provides personal assistant capabilities for WMS workers
 */
export class AIAssistantService {
  constructor() {
    this.currentAgent = null;
    this.activeConversation = null;
    this.userContext = {};
    this.assistantMode = 'companion'; // companion, focused, proactive
  }

  // =============================================
  // AGENT MANAGEMENT
  // =============================================

  /**
   * Get all available agents with their capabilities
   */
  async getAvailableAgents() {
    try {
      const response = await chatbotApi.get('/roles');
      const { user_role, allowed_chatbot_roles } = response.data;
      
      const agentCapabilities = {
        manager: {
          name: 'Executive Assistant',
          description: 'Full system oversight, analytics, and strategic decisions',
          icon: '👑',
          color: 'purple',
          capabilities: [
            'Complete warehouse analytics',
            'Worker performance management',
            'System-wide anomaly detection',
            'Strategic planning support',
            'Advanced reporting',
            'Cross-department coordination'
          ],
          tools: ['analytics', 'worker_management', 'system_oversight', 'reporting']
        },
        clerk: {
          name: 'Inventory Specialist',
          description: 'Your inventory and receiving operations expert',
          icon: '📦',
          color: 'blue',
          capabilities: [
            'Inventory tracking and updates',
            'Receiving process guidance',
            'Stock level monitoring',
            'Supplier coordination',
            'Item location assistance',
            'Return processing'
          ],
          tools: ['inventory_management', 'receiving', 'supplier_coordination', 'returns']
        },
        picker: {
          name: 'Fulfillment Guide',
          description: 'Optimizes your picking routes and order fulfillment',
          icon: '🎯',
          color: 'orange',
          capabilities: [
            'Optimal path planning',
            'Order picking guidance',
            'Location finding',
            'Task prioritization',
            'Efficiency optimization',
            'Real-time order updates'
          ],
          tools: ['path_optimization', 'order_management', 'location_services', 'task_management']
        },
        packer: {
          name: 'Packing Expert',
          description: 'Ensures perfect packaging and shipping preparation',
          icon: '📦',
          color: 'purple',
          capabilities: [
            'Packing optimization',
            'Quality control checks',
            'Shipping preparation',
            'Package verification',
            'Damage prevention',
            'Tracking preparation'
          ],
          tools: ['packing_optimization', 'quality_control', 'shipping_prep', 'verification']
        },
        driver: {
          name: 'Logistics Coordinator',
          description: 'Your delivery and transportation specialist',
          icon: '🚛',
          color: 'green',
          capabilities: [
            'Route optimization',
            'Vehicle management',
            'Delivery scheduling',
            'Traffic updates',
            'Fuel efficiency',
            'Customer coordination'
          ],
          tools: ['route_planning', 'vehicle_management', 'delivery_coordination', 'logistics']
        }
      };

      return {
        userRole: user_role,
        allowedAgents: allowed_chatbot_roles.map(role => ({
          id: role,
          ...agentCapabilities[role]
        })),
        allAgents: agentCapabilities
      };
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to load AI assistants');
    }
  }

  /**
   * Select and activate an AI agent
   */
  async selectAgent(agentId, context = {}) {
    try {
      this.currentAgent = agentId;
      this.userContext = { ...this.userContext, ...context };
      
      // Create a new conversation with the selected agent
      const response = await chatbotApi.post('/conversations', {
        title: `${agentId} Assistant Session - ${new Date().toLocaleString()}`,
        agent_role: agentId,
        initial_context: {
          user_context: this.userContext,
          assistant_mode: this.assistantMode,
          session_start: new Date().toISOString()
        }
      });

      this.activeConversation = response.data.conversation_id;
      
      return {
        agent: agentId,
        conversationId: this.activeConversation,
        welcomeMessage: this.getWelcomeMessage(agentId)
      };
    } catch (error) {
      console.error('Error selecting agent:', error);
      throw new Error('Failed to activate AI assistant');
    }
  }

  /**
   * Get personalized welcome message for agent
   */
  getWelcomeMessage(agentId) {
    const messages = {
      manager: "Hello! I'm your Executive Assistant. I'm here to help you oversee operations, analyze performance, and make strategic decisions. What would you like to focus on today?",
      clerk: "Hi there! I'm your Inventory Specialist. I can help you with stock management, receiving processes, and supplier coordination. What do you need assistance with?",
      picker: "Hey! I'm your Fulfillment Guide. Ready to optimize your picking routes and help you fulfill orders efficiently. What orders are you working on?",
      packer: "Hello! I'm your Packing Expert. I'll help you pack orders perfectly, ensure quality, and prepare shipments. What needs to be packed?",
      driver: "Hi! I'm your Logistics Coordinator. I can help plan routes, manage vehicles, and coordinate deliveries. Where are we heading today?"
    };
    
    return messages[agentId] || "Hello! I'm your AI assistant. How can I help you today?";
  }

  // =============================================
  // ENHANCED MESSAGING
  // =============================================

  /**
   * Send a message with rich context and metadata
   */
  async sendMessage(message, options = {}) {
    const {
      messageType = 'text',
      attachments = [],
      context = {},
      priority = 'normal',
      tags = []
    } = options;

    if (!this.activeConversation) {
      throw new Error('No active conversation. Please select an assistant first.');
    }

    try {
      // Prepare rich message context
      const messageContext = {
        ...this.userContext,
        ...context,
        currentLocation: this.userContext.currentLocation,
        currentTask: this.userContext.currentTask,
        workshift: this.userContext.workshift,
        department: this.userContext.department,
        timestamp: new Date().toISOString(),
        messageType,
        priority,
        tags
      };

      const response = await chatbotApi.post(`/conversations/${this.activeConversation}/messages`, {
        content: message,
        context: messageContext,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data // This would be base64 encoded for file uploads
        }))
      });

      return {
        response: response.data.response,
        conversationId: response.data.conversation_id,
        timestamp: response.data.timestamp,
        context: messageContext,
        metadata: response.data.metadata || {}
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message to assistant');
    }
  }

  /**
   * Send a quick action message (optimized for common tasks)
   */
  async sendQuickAction(action, data = {}) {
    const quickActions = {
      'find_item': `Help me find ${data.item} in the warehouse`,
      'check_inventory': `Check inventory levels for ${data.items?.join(', ') || 'current items'}`,
      'get_directions': `Show me the optimal path to ${data.location}`,
      'process_order': `Help me process order ${data.orderId}`,
      'check_tasks': 'What tasks should I prioritize right now?',
      'report_issue': `I need help with: ${data.issue}`,
      'get_analytics': `Show me ${data.metric} analytics`,
      'schedule_break': 'When should I take my break for optimal workflow?',
      'handoff_shift': 'Help me prepare for shift handoff',
      'emergency_help': `Emergency assistance needed: ${data.details}`
    };

    const message = quickActions[action] || action;
    return this.sendMessage(message, {
      context: { actionType: action, quickAction: true },
      priority: action === 'emergency_help' ? 'urgent' : 'normal',
      tags: ['quick_action', action]
    });
  }

  // =============================================
  // CONVERSATION MANAGEMENT
  // =============================================

  /**
   * Get all conversations with enhanced metadata
   */
  async getConversations(options = {}) {
    const {
      limit = 20,
      offset = 0,
      status = null,
      agentType = null,
      dateRange = null
    } = options;

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (status) params.append('status', status);
      if (agentType) params.append('agent_type', agentType);
      if (dateRange) {
        params.append('start_date', dateRange.start);
        params.append('end_date', dateRange.end);
      }

      const response = await chatbotApi.get(`/conversations?${params}`);
      
      return {
        conversations: response.data.conversations.map(conv => ({
          ...conv,
          agentInfo: this.getAgentInfo(conv.agent_role),
          summary: this.generateConversationSummary(conv),
          productivity: this.calculateProductivityMetrics(conv)
        })),
        total: response.data.total,
        hasMore: response.data.has_more
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to load conversation history');
    }
  }

  /**
   * Search conversations with advanced filters
   */
  async searchConversations(query, filters = {}) {
    try {
      const response = await chatbotApi.post('/conversations/search', {
        query,
        filters: {
          agent_roles: filters.agentRoles || [],
          date_range: filters.dateRange || null,
          message_types: filters.messageTypes || ['text'],
          priority_levels: filters.priorityLevels || ['normal', 'high', 'urgent'],
          tags: filters.tags || [],
          has_attachments: filters.hasAttachments || false,
          min_messages: filters.minMessages || 1,
          max_messages: filters.maxMessages || null
        },
        sort_by: filters.sortBy || 'relevance',
        limit: filters.limit || 10
      });

      return {
        results: response.data.results.map(result => ({
          ...result,
          agentInfo: this.getAgentInfo(result.agent_role),
          highlights: result.highlights || [],
          relevanceScore: result.relevance_score || 0
        })),
        total: response.data.total,
        searchTime: response.data.search_time
      };
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw new Error('Failed to search conversations');
    }
  }

  /**
   * Get conversation details with full context
   */
  async getConversationDetails(conversationId, options = {}) {
    const {
      includeContext = true,
      limit = null,
      offset = 0
    } = options;

    try {
      const params = new URLSearchParams({
        include_context: includeContext.toString(),
        offset: offset.toString()
      });

      if (limit) params.append('limit', limit.toString());

      const response = await chatbotApi.get(`/conversations/${conversationId}?${params}`);
      
      return {
        ...response.data,
        agentInfo: this.getAgentInfo(response.data.agent_role),
        analytics: this.calculateConversationAnalytics(response.data),
        insights: this.generateConversationInsights(response.data)
      };
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      throw new Error('Failed to load conversation details');
    }
  }

  // =============================================
  // PROACTIVE ASSISTANCE
  // =============================================

  /**
   * Get proactive suggestions based on current context
   */
  async getProactiveSuggestions(workContext = {}) {
    const suggestions = [];
    
    // Context-based suggestions
    if (workContext.currentLocation) {
      suggestions.push({
        type: 'location_optimization',
        title: 'Optimize Your Current Location',
        description: `I can help you find the most efficient tasks to complete while you're in ${workContext.currentLocation}`,
        action: 'optimize_location',
        priority: 'medium',
        icon: '🎯'
      });
    }

    if (workContext.pendingTasks?.length > 0) {
      suggestions.push({
        type: 'task_prioritization',
        title: 'Prioritize Your Tasks',
        description: `You have ${workContext.pendingTasks.length} pending tasks. Let me help you prioritize them.`,
        action: 'prioritize_tasks',
        priority: 'high',
        icon: '📋'
      });
    }

    if (workContext.lowInventoryItems?.length > 0) {
      suggestions.push({
        type: 'inventory_alert',
        title: 'Low Inventory Alert',
        description: `${workContext.lowInventoryItems.length} items are running low. Need help with restocking?`,
        action: 'manage_inventory',
        priority: 'high',
        icon: '⚠️'
      });
    }

    // Time-based suggestions
    const currentHour = new Date().getHours();
    if (currentHour === 12 || currentHour === 17) {
      suggestions.push({
        type: 'shift_planning',
        title: 'Plan Your Break',
        description: 'Perfect time to optimize your workflow for the upcoming break period.',
        action: 'plan_break',
        priority: 'low',
        icon: '⏰'
      });
    }

    return suggestions;
  }

  /**
   * Get contextual quick actions based on user role and current state
   */
  getContextualQuickActions(userRole, workContext = {}) {
    const baseActions = [
      { id: 'check_tasks', label: 'My Tasks', icon: '📋' },
      { id: 'find_item', label: 'Find Item', icon: '🔍' },
      { id: 'report_issue', label: 'Report Issue', icon: '🚨' },
      { id: 'get_help', label: 'Get Help', icon: '❓' }
    ];

    const roleSpecificActions = {
      manager: [
        { id: 'get_analytics', label: 'Analytics', icon: '📊' },
        { id: 'check_alerts', label: 'Alerts', icon: '🔔' },
        { id: 'team_status', label: 'Team Status', icon: '👥' }
      ],
      clerk: [
        { id: 'check_inventory', label: 'Check Stock', icon: '📦' },
        { id: 'process_receiving', label: 'Process Receiving', icon: '📥' },
        { id: 'update_inventory', label: 'Update Inventory', icon: '✏️' }
      ],
      picker: [
        { id: 'get_directions', label: 'Get Directions', icon: '🧭' },
        { id: 'optimize_route', label: 'Optimize Route', icon: '🎯' },
        { id: 'check_orders', label: 'My Orders', icon: '📋' }
      ],
      packer: [
        { id: 'packing_guide', label: 'Packing Guide', icon: '📦' },
        { id: 'quality_check', label: 'Quality Check', icon: '✅' },
        { id: 'shipping_prep', label: 'Shipping Prep', icon: '🚚' }
      ],
      driver: [
        { id: 'route_planning', label: 'Plan Route', icon: '🗺️' },
        { id: 'vehicle_check', label: 'Vehicle Check', icon: '🚛' },
        { id: 'delivery_status', label: 'Delivery Status', icon: '📍' }
      ]
    };

    return [...baseActions, ...(roleSpecificActions[userRole] || [])];
  }

  // =============================================
  // ANALYTICS AND INSIGHTS
  // =============================================

  /**
   * Get assistant usage analytics
   */
  async getUsageAnalytics(timeRange = '7d') {
    try {
      const conversations = await this.getConversations({
        limit: 100,
        dateRange: this.getDateRange(timeRange)
      });

      const analytics = {
        totalConversations: conversations.total,
        averageConversationLength: this.calculateAverageLength(conversations.conversations),
        mostUsedAgent: this.getMostUsedAgent(conversations.conversations),
        productivityGains: this.calculateProductivityGains(conversations.conversations),
        topQuestions: this.getTopQuestions(conversations.conversations),
        usagePatterns: this.analyzeUsagePatterns(conversations.conversations)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      throw new Error('Failed to load usage analytics');
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Update user context for better assistance
   */
  updateUserContext(context) {
    this.userContext = { ...this.userContext, ...context };
  }

  /**
   * Set assistant mode
   */
  setAssistantMode(mode) {
    this.assistantMode = mode; // companion, focused, proactive
  }

  /**
   * Get agent information
   */
  getAgentInfo(agentId) {
    const agents = {
      manager: { name: 'Executive Assistant', icon: '👑', color: 'purple' },
      clerk: { name: 'Inventory Specialist', icon: '📦', color: 'blue' },
      picker: { name: 'Fulfillment Guide', icon: '🎯', color: 'orange' },
      packer: { name: 'Packing Expert', icon: '📦', color: 'purple' },
      driver: { name: 'Logistics Coordinator', icon: '🚛', color: 'green' }
    };
    
    return agents[agentId] || { name: 'AI Assistant', icon: '🤖', color: 'gray' };
  }

  /**
   * Generate conversation summary
   */
  generateConversationSummary(conversation) {
    const messageCount = conversation.messages?.length || 0;
    const duration = this.calculateDuration(conversation.created_at, conversation.updated_at);
    
    return {
      messageCount,
      duration,
      topics: this.extractTopics(conversation.messages || []),
      outcome: this.determineOutcome(conversation.messages || [])
    };
  }

  /**
   * Calculate productivity metrics
   */
  calculateProductivityMetrics(conversation) {
    // This would calculate actual productivity metrics based on conversation content
    return {
      tasksCompleted: Math.floor(Math.random() * 5),
      timesSaved: Math.floor(Math.random() * 30),
      issuesResolved: Math.floor(Math.random() * 3),
      efficiency: Math.floor(Math.random() * 100)
    };
  }

  /**
   * Calculate conversation analytics
   */
  calculateConversationAnalytics(conversation) {
    return {
      totalMessages: conversation.messages?.length || 0,
      averageResponseTime: this.calculateAverageResponseTime(conversation.messages || []),
      topicsDiscussed: this.extractTopics(conversation.messages || []),
      sentimentAnalysis: this.analyzeSentiment(conversation.messages || [])
    };
  }

  /**
   * Generate conversation insights
   */
  generateConversationInsights(conversation) {
    return {
      helpfulnessScore: Math.floor(Math.random() * 100),
      keyInsights: [
        'Assistant helped optimize workflow efficiency',
        'Identified potential inventory issues early',
        'Provided valuable training guidance'
      ],
      recommendations: [
        'Consider scheduling regular check-ins',
        'Explore automation opportunities',
        'Review inventory management processes'
      ]
    };
  }

  /**
   * Helper methods for date ranges, calculations, etc.
   */
  getDateRange(timeRange) {
    const now = new Date();
    const ranges = {
      '1d': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
    
    return {
      start: ranges[timeRange] || ranges['7d'],
      end: now
    };
  }

  calculateDuration(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  }

  extractTopics(messages) {
    // This would use NLP to extract actual topics
    const sampleTopics = ['inventory', 'orders', 'locations', 'analytics', 'issues'];
    return sampleTopics.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  determineOutcome(messages) {
    const outcomes = ['completed', 'in_progress', 'needs_followup', 'escalated'];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  calculateAverageResponseTime(messages) {
    // This would calculate actual response times
    return Math.floor(Math.random() * 5) + 1; // 1-5 seconds
  }

  analyzeSentiment(messages) {
    return {
      positive: Math.floor(Math.random() * 100),
      neutral: Math.floor(Math.random() * 100),
      negative: Math.floor(Math.random() * 100)
    };
  }

  calculateAverageLength(conversations) {
    if (!conversations.length) return 0;
    const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
    return Math.round(totalMessages / conversations.length);
  }

  getMostUsedAgent(conversations) {
    const agentCounts = {};
    conversations.forEach(conv => {
      agentCounts[conv.agent_role] = (agentCounts[conv.agent_role] || 0) + 1;
    });
    
    return Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'manager';
  }

  calculateProductivityGains(conversations) {
    // This would calculate actual productivity gains
    return {
      timesSaved: Math.floor(Math.random() * 120), // minutes
      tasksAutomated: Math.floor(Math.random() * 10),
      errorsAvoided: Math.floor(Math.random() * 5)
    };
  }

  getTopQuestions(conversations) {
    // This would extract actual top questions
    return [
      'Where is item X located?',
      'What are my priority tasks?',
      'How do I process this return?',
      'What\'s the optimal picking route?',
      'Check inventory levels for item Y'
    ];
  }

  analyzeUsagePatterns(conversations) {
    return {
      peakHours: ['09:00', '14:00', '16:00'],
      mostActiveDay: 'Tuesday',
      averageSessionLength: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      preferredAgents: ['clerk', 'picker', 'manager']
    };
  }
}

// Create and export singleton instance
export const aiAssistantService = new AIAssistantService();
export default aiAssistantService; 