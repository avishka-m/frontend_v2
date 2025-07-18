import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { aiAssistantService } from '../services/aiAssistantService';

// Action types for the reducer
const ASSISTANT_ACTIONS = {
  // Initialization
  INITIALIZE_START: 'INITIALIZE_START',
  INITIALIZE_SUCCESS: 'INITIALIZE_SUCCESS',
  INITIALIZE_ERROR: 'INITIALIZE_ERROR',
  
  // Agent Management
  SELECT_AGENT_START: 'SELECT_AGENT_START',
  SELECT_AGENT_SUCCESS: 'SELECT_AGENT_SUCCESS',
  SELECT_AGENT_ERROR: 'SELECT_AGENT_ERROR',
  
  // Messaging
  SEND_MESSAGE_START: 'SEND_MESSAGE_START',
  SEND_MESSAGE_SUCCESS: 'SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_ERROR: 'SEND_MESSAGE_ERROR',
  ADD_MESSAGE: 'ADD_MESSAGE',
  
  // Conversations
  LOAD_CONVERSATIONS_START: 'LOAD_CONVERSATIONS_START',
  LOAD_CONVERSATIONS_SUCCESS: 'LOAD_CONVERSATIONS_SUCCESS',
  LOAD_CONVERSATIONS_ERROR: 'LOAD_CONVERSATIONS_ERROR',
  
  // Context & Suggestions
  UPDATE_WORK_CONTEXT: 'UPDATE_WORK_CONTEXT',
  UPDATE_PROACTIVE_SUGGESTIONS: 'UPDATE_PROACTIVE_SUGGESTIONS',
  UPDATE_QUICK_ACTIONS: 'UPDATE_QUICK_ACTIONS',
  
  // UI State
  TOGGLE_ASSISTANT: 'TOGGLE_ASSISTANT',
  SET_ASSISTANT_MODE: 'SET_ASSISTANT_MODE',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  SET_MINIMIZED: 'SET_MINIMIZED',
  
  // Analytics
  UPDATE_USAGE_ANALYTICS: 'UPDATE_USAGE_ANALYTICS',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Initial state
const initialState = {
  // Initialization
  isInitialized: false,
  isInitializing: false,
  initError: null,
  
  // Agent Management
  availableAgents: [],
  currentAgent: null,
  isSelectingAgent: false,
  
  // Messaging
  messages: [],
  isLoading: false,
  messageError: null,
  activeConversation: null,
  
  // Conversations
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  
  // Context & Intelligence
  workContext: {},
  proactiveSuggestions: [],
  quickActions: [],
  
  // UI State
  isOpen: false,
  isMinimized: false,
  assistantMode: 'companion', // companion, focused, proactive
  currentView: 'chat', // chat, agents, history, analytics
  
  // Analytics
  usageAnalytics: {},
  
  // Settings
  settings: {
    autoSuggestions: true,
    voiceEnabled: false,
    notifications: true,
    proactiveMode: true,
    contextTracking: true
  }
};

// Reducer function
const assistantReducer = (state, action) => {
  switch (action.type) {
    case ASSISTANT_ACTIONS.INITIALIZE_START:
      return {
        ...state,
        isInitializing: true,
        initError: null
      };
      
    case ASSISTANT_ACTIONS.INITIALIZE_SUCCESS:
      return {
        ...state,
        isInitialized: true,
        isInitializing: false,
        availableAgents: action.payload.agents,
        workContext: action.payload.workContext,
        settings: { ...state.settings, ...action.payload.settings }
      };
      
    case ASSISTANT_ACTIONS.INITIALIZE_ERROR:
      return {
        ...state,
        isInitializing: false,
        initError: action.payload
      };
      
    case ASSISTANT_ACTIONS.SELECT_AGENT_START:
      return {
        ...state,
        isSelectingAgent: true
      };
      
    case ASSISTANT_ACTIONS.SELECT_AGENT_SUCCESS:
      return {
        ...state,
        isSelectingAgent: false,
        currentAgent: action.payload.agent,
        activeConversation: action.payload.conversationId,
        messages: action.payload.welcomeMessage ? [{
          id: Date.now(),
          role: 'assistant',
          content: action.payload.welcomeMessage,
          timestamp: new Date(),
          type: 'welcome'
        }] : state.messages,
        quickActions: action.payload.quickActions || []
      };
      
    case ASSISTANT_ACTIONS.SELECT_AGENT_ERROR:
      return {
        ...state,
        isSelectingAgent: false,
        messageError: action.payload
      };
      
    case ASSISTANT_ACTIONS.SEND_MESSAGE_START:
      return {
        ...state,
        isLoading: true,
        messageError: null
      };
      
    case ASSISTANT_ACTIONS.SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        messages: [...state.messages, action.payload.userMessage, action.payload.assistantMessage],
        workContext: { ...state.workContext, ...action.payload.context }
      };
      
    case ASSISTANT_ACTIONS.SEND_MESSAGE_ERROR:
      return {
        ...state,
        isLoading: false,
        messageError: action.payload,
        messages: [...state.messages, {
          id: Date.now(),
          role: 'error',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }]
      };
      
    case ASSISTANT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
      
    case ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_START:
      return {
        ...state,
        conversationsLoading: true,
        conversationsError: null
      };
      
    case ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_SUCCESS:
      return {
        ...state,
        conversationsLoading: false,
        conversations: action.payload
      };
      
    case ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_ERROR:
      return {
        ...state,
        conversationsLoading: false,
        conversationsError: action.payload
      };
      
    case ASSISTANT_ACTIONS.UPDATE_WORK_CONTEXT:
      return {
        ...state,
        workContext: { ...state.workContext, ...action.payload }
      };
      
    case ASSISTANT_ACTIONS.UPDATE_PROACTIVE_SUGGESTIONS:
      return {
        ...state,
        proactiveSuggestions: action.payload
      };
      
    case ASSISTANT_ACTIONS.UPDATE_QUICK_ACTIONS:
      return {
        ...state,
        quickActions: action.payload
      };
      
    case ASSISTANT_ACTIONS.TOGGLE_ASSISTANT:
      return {
        ...state,
        isOpen: !state.isOpen
      };
      
    case ASSISTANT_ACTIONS.SET_ASSISTANT_MODE:
      return {
        ...state,
        assistantMode: action.payload
      };
      
    case ASSISTANT_ACTIONS.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload
      };
      
    case ASSISTANT_ACTIONS.SET_MINIMIZED:
      return {
        ...state,
        isMinimized: action.payload
      };
      
    case ASSISTANT_ACTIONS.UPDATE_USAGE_ANALYTICS:
      return {
        ...state,
        usageAnalytics: action.payload
      };
      
    case ASSISTANT_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create context
const EnhancedChatbotContext = createContext();

// Provider component
// export const EnhancedChatbotProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const [state, dispatch] = useReducer(assistantReducer, initialState);
  
//   // Initialize assistant
//   const initializeAssistant = useCallback(async () => {
//     if (!currentUser || state.isInitialized) return;
    
//     dispatch({ type: ASSISTANT_ACTIONS.INITIALIZE_START });
    
//     try {
//       // Get available agents
//       const agents = await aiAssistantService.getAvailableAgents();
      
//       // Set initial work context
//       const workContext = {
//         userId: currentUser.id,
//         userRole: currentUser.role,
//         userName: currentUser.name,
//         department: currentUser.department,
//         shift: getCurrentShift(),
//         location: 'Unknown',
//         sessionStart: new Date().toISOString()
//       };
      
//       // Auto-select the best agent
//       let selectedAgent = null;
//       if (agents.allowedAgents.length > 0) {
//         const defaultAgent = agents.allowedAgents.find(a => a.id === agents.userRole) || agents.allowedAgents[0];
//         const result = await aiAssistantService.selectAgent(defaultAgent.id, workContext);
//         selectedAgent = {
//           agent: defaultAgent.id,
//           conversationId: result.conversationId,
//           welcomeMessage: result.welcomeMessage,
//           quickActions: aiAssistantService.getContextualQuickActions(defaultAgent.id, workContext)
//         };
//       }
      
//       dispatch({
//         type: ASSISTANT_ACTIONS.INITIALIZE_SUCCESS,
//         payload: {
//           agents: agents.allowedAgents,
//           workContext,
//           settings: {}
//         }
//       });
      
//       // Select the default agent
//       if (selectedAgent) {
//         dispatch({
//           type: ASSISTANT_ACTIONS.SELECT_AGENT_SUCCESS,
//           payload: selectedAgent
//         });
//       }
      
//       // Load initial proactive suggestions
//       loadProactiveSuggestions(workContext);
      
//       // Load usage analytics
//       loadUsageAnalytics();
      
//     } catch (error) {
//       console.error('Failed to initialize assistant:', error);
//       dispatch({
//         type: ASSISTANT_ACTIONS.INITIALIZE_ERROR,
//         payload: error.message
//       });
//     }
//   }, [currentUser, state.isInitialized]);
  
//   // Select agent
//   const selectAgent = useCallback(async (agentId, context = {}) => {
//     dispatch({ type: ASSISTANT_ACTIONS.SELECT_AGENT_START });
    
//     try {
//       const result = await aiAssistantService.selectAgent(agentId, { ...state.workContext, ...context });
//       const quickActions = aiAssistantService.getContextualQuickActions(agentId, state.workContext);
      
//       dispatch({
//         type: ASSISTANT_ACTIONS.SELECT_AGENT_SUCCESS,
//         payload: {
//           agent: agentId,
//           conversationId: result.conversationId,
//           welcomeMessage: result.welcomeMessage,
//           quickActions
//         }
//       });
      
//       // Load agent-specific proactive suggestions
//       loadProactiveSuggestions(state.workContext);
      
//     } catch (error) {
//       console.error('Failed to select agent:', error);
//       dispatch({
//         type: ASSISTANT_ACTIONS.SELECT_AGENT_ERROR,
//         payload: error.message
//       });
//     }
//   }, [state.workContext]);
  
//   // Send message
//   const sendMessage = useCallback(async (message, options = {}) => {
//     if (!message.trim() || state.isLoading) return;
    
//     dispatch({ type: ASSISTANT_ACTIONS.SEND_MESSAGE_START });
    
//     const userMessage = {
//       id: Date.now(),
//       role: 'user',
//       content: message,
//       timestamp: new Date(),
//       attachments: options.attachments || []
//     };
    
//     try {
//       const response = await aiAssistantService.sendMessage(message, {
//         ...options,
//         context: state.workContext
//       });
      
//       const assistantMessage = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: response.response,
//         timestamp: new Date(),
//         metadata: response.metadata
//       };
      
//       dispatch({
//         type: ASSISTANT_ACTIONS.SEND_MESSAGE_SUCCESS,
//         payload: {
//           userMessage,
//           assistantMessage,
//           context: response.context
//         }
//       });
      
//       // Update proactive suggestions based on the conversation
//       loadProactiveSuggestions({ ...state.workContext, ...response.context });
      
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       dispatch({
//         type: ASSISTANT_ACTIONS.SEND_MESSAGE_ERROR,
//         payload: error.message
//       });
//     }
//   }, [state.workContext, state.isLoading]);
  
//   // Send quick action
//   const sendQuickAction = useCallback(async (actionId, data = {}) => {
//     try {
//       const response = await aiAssistantService.sendQuickAction(actionId, { ...state.workContext, ...data });
      
//       const userMessage = {
//         id: Date.now(),
//         role: 'user',
//         content: `Quick Action: ${actionId}`,
//         timestamp: new Date(),
//         type: 'quick_action'
//       };
      
//       const assistantMessage = {
//         id: Date.now() + 1,
//         role: 'assistant',
//         content: response.response,
//         timestamp: new Date(),
//         type: 'quick_action_response'
//       };
      
//       dispatch({ type: ASSISTANT_ACTIONS.ADD_MESSAGE, payload: userMessage });
//       dispatch({ type: ASSISTANT_ACTIONS.ADD_MESSAGE, payload: assistantMessage });
      
//     } catch (error) {
//       console.error('Failed to execute quick action:', error);
//     }
//   }, [state.workContext]);
  
//   // Load conversations
//   const loadConversations = useCallback(async (options = {}) => {
//     dispatch({ type: ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_START });
    
//     try {
//       const conversations = await aiAssistantService.getConversations(options);
//       dispatch({
//         type: ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_SUCCESS,
//         payload: conversations.conversations
//       });
//     } catch (error) {
//       console.error('Failed to load conversations:', error);
//       dispatch({
//         type: ASSISTANT_ACTIONS.LOAD_CONVERSATIONS_ERROR,
//         payload: error.message
//       });
//     }
//   }, []);
  
//   // Search conversations
//   const searchConversations = useCallback(async (query, filters = {}) => {
//     try {
//       const results = await aiAssistantService.searchConversations(query, filters);
//       return results;
//     } catch (error) {
//       console.error('Failed to search conversations:', error);
//       throw error;
//     }
//   }, []);
  
//   // Update work context
//   const updateWorkContext = useCallback((context) => {
//     dispatch({
//       type: ASSISTANT_ACTIONS.UPDATE_WORK_CONTEXT,
//       payload: context
//     });
    
//     aiAssistantService.updateUserContext({ ...state.workContext, ...context });
    
//     // Update proactive suggestions with new context
//     loadProactiveSuggestions({ ...state.workContext, ...context });
//   }, [state.workContext]);
  
//   // Load proactive suggestions
//   const loadProactiveSuggestions = useCallback(async (context = state.workContext) => {
//     try {
//       const suggestions = await aiAssistantService.getProactiveSuggestions(context);
//       dispatch({
//         type: ASSISTANT_ACTIONS.UPDATE_PROACTIVE_SUGGESTIONS,
//         payload: suggestions
//       });
//     } catch (error) {
//       console.error('Failed to load proactive suggestions:', error);
//     }
//   }, [state.workContext]);
  
//   // Load usage analytics
//   const loadUsageAnalytics = useCallback(async (timeRange = '7d') => {
//     try {
//       const analytics = await aiAssistantService.getUsageAnalytics(timeRange);
//       dispatch({
//         type: ASSISTANT_ACTIONS.UPDATE_USAGE_ANALYTICS,
//         payload: analytics
//       });
//     } catch (error) {
//       console.error('Failed to load usage analytics:', error);
//     }
//   }, []);
  
//   // UI Actions
//   const toggleAssistant = useCallback(() => {
//     dispatch({ type: ASSISTANT_ACTIONS.TOGGLE_ASSISTANT });
//   }, []);
  
//   const setAssistantMode = useCallback((mode) => {
//     dispatch({ type: ASSISTANT_ACTIONS.SET_ASSISTANT_MODE, payload: mode });
//     aiAssistantService.setAssistantMode(mode);
//   }, []);
  
//   const setCurrentView = useCallback((view) => {
//     dispatch({ type: ASSISTANT_ACTIONS.SET_CURRENT_VIEW, payload: view });
//   }, []);
  
//   const setMinimized = useCallback((minimized) => {
//     dispatch({ type: ASSISTANT_ACTIONS.SET_MINIMIZED, payload: minimized });
//   }, []);
  
//   // Update settings
//   const updateSettings = useCallback((newSettings) => {
//     dispatch({
//       type: ASSISTANT_ACTIONS.UPDATE_SETTINGS,
//       payload: newSettings
//     });
    
//     // Save to localStorage
//     localStorage.setItem('assistant_settings', JSON.stringify({ ...state.settings, ...newSettings }));
//   }, [state.settings]);
  
//   // Initialize on mount
//   useEffect(() => {
//     initializeAssistant();
//   }, [initializeAssistant]);
  
//   // Load settings from localStorage
//   useEffect(() => {
//     const savedSettings = localStorage.getItem('assistant_settings');
//     if (savedSettings) {
//       try {
//         const settings = JSON.parse(savedSettings);
//         updateSettings(settings);
//       } catch (error) {
//         console.error('Failed to load saved settings:', error);
//       }
//     }
//   }, []);
  
//   // Auto-update work context periodically
//   useEffect(() => {
//     if (!state.isInitialized || !state.settings.contextTracking) return;
    
//     const interval = setInterval(() => {
//       updateWorkContext({
//         timestamp: new Date().toISOString(),
//         sessionDuration: Date.now() - new Date(state.workContext.sessionStart).getTime()
//       });
//     }, 60000); // Every minute
    
//     return () => clearInterval(interval);
//   }, [state.isInitialized, state.settings.contextTracking, updateWorkContext]);
  
//   // Utility function to get current shift
//   function getCurrentShift() {
//     const hour = new Date().getHours();
//     if (hour >= 6 && hour < 14) return 'Morning';
//     if (hour >= 14 && hour < 22) return 'Afternoon';
//     return 'Night';
//   }
  
//   // Context value
//   const value = {
//     // State
//     ...state,
    
//     // Actions
//     initializeAssistant,
//     selectAgent,
//     sendMessage,
//     sendQuickAction,
//     loadConversations,
//     searchConversations,
//     updateWorkContext,
//     loadProactiveSuggestions,
//     loadUsageAnalytics,
    
//     // UI Actions
//     toggleAssistant,
//     setAssistantMode,
//     setCurrentView,
//     setMinimized,
//     updateSettings
//   };
  
//   return (
//     <EnhancedChatbotContext.Provider value={value}>
//       {children}
//     </EnhancedChatbotContext.Provider>
//   );
// }; // End EnhancedChatbotProvider

// Custom hook to use the context
export const useEnhancedChatbot = () => {
  const context = useContext(EnhancedChatbotContext);
  
  if (!context) {
    throw new Error('useEnhancedChatbot must be used within an EnhancedChatbotProvider');
  }
  
  return context;
};

export default EnhancedChatbotContext; 