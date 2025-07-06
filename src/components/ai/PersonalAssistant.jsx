import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Settings, 
  Minimize2, 
  Maximize2, 
  X,
  Send,
  Mic,
  Paperclip,
  Search,
  Clock,
  Star,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Target,
  Truck,
  Package,
  Crown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  Brain,
  Sparkles,
  Expand,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { aiAssistantService } from '../../services/aiAssistantService';
import ReactMarkdown from 'react-markdown';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #9ca3af #f3f4f6;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('custom-scrollbar-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'custom-scrollbar-styles';
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
}

const PersonalAssistant = () => {
  const { currentUser } = useAuth();
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [assistantMode, setAssistantMode] = useState('companion'); // companion, focused, proactive
  const [currentView, setCurrentView] = useState('chat'); // chat, agents, history, analytics
  
  // Assistant State
  const [availableAgents, setAvailableAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  // Advanced Features
  const [proactiveSuggestions, setProactiveSuggestions] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [workContext, setWorkContext] = useState({});
  const [usageAnalytics, setUsageAnalytics] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Scroll state
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Quick actions state
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [autoHideCountdown, setAutoHideCountdown] = useState(0);
  const quickActionsTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  // Initialize assistant
  useEffect(() => {
    initializeAssistant();
  }, [currentUser]);

  // Auto-scroll messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputMessage.trim()) {
        e.preventDefault();
        sendMessage(inputMessage);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      // F11 or Ctrl/Cmd + M to toggle maximize
      if (e.key === 'F11' || ((e.ctrlKey || e.metaKey) && e.key === 'm')) {
        e.preventDefault();
        toggleMaximize();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, inputMessage, isMaximized]);

  // Update work context periodically
  useEffect(() => {
    const interval = setInterval(updateWorkContext, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load proactive suggestions
  useEffect(() => {
    if (currentAgent && workContext) {
      loadProactiveSuggestions();
    }
  }, [currentAgent, workContext]);

  const initializeAssistant = async () => {
    try {
      const agents = await aiAssistantService.getAvailableAgents();
      setAvailableAgents(agents.allowedAgents);
      
      // Auto-select the best agent based on user role
      if (agents.allowedAgents.length > 0) {
        const defaultAgent = agents.allowedAgents.find(a => a.id === agents.userRole) || agents.allowedAgents[0];
        await selectAgent(defaultAgent.id);
      }
      
      // Load initial context
      updateWorkContext();
      
    } catch (error) {
      console.error('Failed to initialize assistant:', error);
      
      // Fallback: Create mock agents for demo purposes
      const mockAgents = [
        {
          id: 'manager',
          name: 'Executive Assistant',
          description: 'Full system oversight and analytics',
          capabilities: ['Analytics', 'Management', 'Reporting'],
          color: 'purple'
        },
        {
          id: 'clerk',
          name: 'Inventory Specialist',
          description: 'Inventory and receiving expert',
          capabilities: ['Inventory', 'Receiving', 'Stock Management'],
          color: 'green'
        }
      ];
      
      setAvailableAgents(mockAgents);
      setCurrentAgent('manager');
      setConversationId('demo-conversation');
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: `👋 Hello! I'm your AI Assistant (${mockAgents[0].name}). I'm currently in **demo mode** since the backend service is temporarily unavailable. 

🎯 **What you can do:**
• Explore the interface and try different views (chat, agents, history, analytics)
• Test the quick actions to see how they work
• Switch between different AI agents
• Send messages to see demo responses

I'll automatically switch to full functionality when the backend service is ready!`,
        timestamp: new Date(),
        type: 'demo'
      }]);
      
      // Load mock context
      updateWorkContext();
    }
  };

  const selectAgent = async (agentId) => {
    try {
      setIsLoading(true);
      
      // Find the agent details
      const agent = availableAgents.find(a => a.id === agentId);
      const agentName = agent?.name || 'AI Assistant';
      
      try {
        const result = await aiAssistantService.selectAgent(agentId, workContext);
        
        setCurrentAgent(agentId);
        setConversationId(result.conversationId);
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: result.welcomeMessage,
          timestamp: new Date(),
          type: 'welcome'
        }]);
        
        // Load quick actions for this agent
        const actions = aiAssistantService.getContextualQuickActions(agentId, workContext);
        setQuickActions(actions);
        
      } catch (apiError) {
        // Fallback to demo mode for this agent
        console.warn('Backend unavailable for agent selection, using demo mode:', apiError);
        
        setCurrentAgent(agentId);
        setConversationId('demo-conversation');
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: `👋 Hello! I'm your ${agentName}. I'm currently running in **demo mode** due to backend service issues.

🎯 **I can help you with:**
${agent?.capabilities?.map(cap => `• ${cap}`).join('\n') || '• General warehouse assistance'}

Try the quick actions below or ask me anything about warehouse operations!`,
          timestamp: new Date(),
          type: 'demo_welcome'
        }]);
        
        // Update quick actions for this agent
        updateWorkContext();
      }
      
    } catch (error) {
      console.error('Failed to select agent:', error);
      
      // Show error message
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: '⚠️ Sorry, I had trouble switching to that assistant. Please try again or refresh the page.',
        timestamp: new Date(),
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message, options = {}) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Check if we're in demo mode
      if (conversationId === 'demo-conversation') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoResponses = [
          `I understand you're asking about "${message}". In demo mode, I can't access the real WMS system, but I can help you explore the interface features!`,
          `That's a great question about "${message}"! While I'm in demo mode and can't access live data, I can show you how this would work in a real warehouse environment.`,
          `Regarding "${message}" - in a live system, I would access real-time data to give you specific information. For now, try the quick actions or explore different views!`,
          `Thanks for asking about "${message}"! In demo mode, I can simulate responses. Try switching agents or views to see different capabilities.`
        ];
        
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `${randomResponse}

💡 **Quick suggestions:**
• Try the quick action buttons below
• Switch to different agents (Manager, Clerk, Picker, etc.)
• Explore the Analytics or History views
• Ask about warehouse operations and processes

The interface is fully functional - I'll connect to live data once the backend service is available!`,
          timestamp: new Date(),
          metadata: { demo: true }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const response = await aiAssistantService.sendMessage(message, {
          ...options,
          attachments,
          context: workContext
        });

        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: response.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Update work context based on response
        if (response.context) {
          setWorkContext(prev => ({ ...prev, ...response.context }));
        }
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Provide helpful error response based on error type
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = '🔧 The backend service is temporarily unavailable. You can still explore the interface! Try switching to different views or agents.';
      } else if (error.message.includes('Network')) {
        errorMessage = '🌐 Network connection issue. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to process message')) {
        errorMessage = '⚙️ Message processing failed. The AI service might be starting up. Please wait a moment and try again.';
      }
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          metadata: { error: true, suggestion: 'Try exploring other features while the service recovers.' }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: `Quick Action: ${action.label}`,
        timestamp: new Date(),
        type: 'quick_action'
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Check if we're in demo mode or if backend is unavailable
      if (conversationId === 'demo-conversation') {
        // Demo mode response
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `✅ Quick Action "${action.label}" executed successfully! In demo mode, I can simulate this action but can't access the real WMS system. This would normally ${action.description || 'perform the requested warehouse operation'}.`,
          timestamp: new Date(),
          metadata: { demo: true, action: action.id }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        try {
          const response = await aiAssistantService.sendQuickAction(action.id, workContext);
          
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.response,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
        } catch (apiError) {
          // Fallback to demo mode if backend fails
          console.warn('Backend unavailable, falling back to demo mode:', apiError);
          
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `⚠️ Backend temporarily unavailable. Simulating "${action.label}" action. In a real environment, this would ${action.description || 'perform the warehouse operation'}.`,
            timestamp: new Date(),
            metadata: { demo: true, fallback: true }
          };

          setMessages(prev => [...prev, assistantMessage]);
        }
      }
      
    } catch (error) {
      console.error('Failed to execute quick action:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'error',
          content: 'Sorry, I encountered an error executing that action. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkContext = () => {
    // Mock work context data - in real implementation, this would fetch from API
    setWorkContext({
      currentLocation: 'Warehouse A-1',
      currentTask: 'Inventory Check',
      workshift: 'Morning',
      urgentTasks: 2
    });

    // Set up mock quick actions based on current agent
    const mockQuickActions = {
      manager: [
        { id: 'analytics', label: 'View Analytics', icon: '📊', description: 'view comprehensive warehouse analytics' },
        { id: 'performance', label: 'Check Performance', icon: '⚡', description: 'check worker and system performance metrics' },
        { id: 'alerts', label: 'Review Alerts', icon: '🚨', description: 'review system alerts and urgent notifications' },
        { id: 'reports', label: 'Generate Report', icon: '📈', description: 'generate detailed operational reports' }
      ],
      clerk: [
        { id: 'inventory', label: 'Check Inventory', icon: '📦', description: 'check current inventory levels' },
        { id: 'receive', label: 'Process Receiving', icon: '📥', description: 'process incoming shipments' },
        { id: 'returns', label: 'Handle Returns', icon: '🔄', description: 'process product returns' },
        { id: 'stock', label: 'Update Stock', icon: '✏️', description: 'update stock levels and locations' }
      ],
      picker: [
        { id: 'route', label: 'Optimize Route', icon: '🗺️', description: 'calculate optimal picking route' },
        { id: 'orders', label: 'View Orders', icon: '📋', description: 'view pending picking orders' },
        { id: 'location', label: 'Find Item', icon: '🔍', description: 'locate specific items in warehouse' },
        { id: 'priority', label: 'Check Priority', icon: '⏰', description: 'check high-priority orders' }
      ],
      packer: [
        { id: 'pack', label: 'Start Packing', icon: '📦', description: 'begin packing process for orders' },
        { id: 'verify', label: 'Verify Orders', icon: '✅', description: 'verify order contents before packing' },
        { id: 'shipping', label: 'Prep Shipping', icon: '🚚', description: 'prepare orders for shipping' },
        { id: 'quality', label: 'Quality Check', icon: '🔍', description: 'perform quality control checks' }
      ],
      driver: [
        { id: 'routes', label: 'Plan Route', icon: '🗺️', description: 'plan optimal delivery routes' },
        { id: 'vehicle', label: 'Check Vehicle', icon: '🚛', description: 'perform vehicle status check' },
        { id: 'deliveries', label: 'View Deliveries', icon: '📦', description: 'view scheduled deliveries' },
        { id: 'traffic', label: 'Check Traffic', icon: '🚦', description: 'check traffic conditions and updates' }
      ]
    };

    if (currentAgent && mockQuickActions[currentAgent]) {
      setQuickActions(mockQuickActions[currentAgent]);
    }
  };

  const loadProactiveSuggestions = async () => {
    // Mock proactive suggestions - in real implementation, this would be AI-generated
    const suggestions = [
      { title: 'Try Demo Features', description: 'Explore the AI assistant\'s capabilities', icon: '🎯' },
      { title: 'Switch Agents', description: 'Try different AI specialists for various tasks', icon: '🤖' },
      { title: 'View Analytics', description: 'Check out the analytics dashboard', icon: '📊' },
      { title: 'Test Quick Actions', description: 'Try the quick action buttons', icon: '⚡' }
    ];
    
    // Show different suggestions randomly
    const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 2);
    setProactiveSuggestions(randomSuggestions);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setShowScrollToTop(scrollTop > 200 && !isNearBottom);
  };

  const toggleQuickActions = () => {
    const newShowState = !showQuickActions;
    setShowQuickActions(newShowState);
    
    // Clear existing timeouts
    if (quickActionsTimeoutRef.current) {
      clearTimeout(quickActionsTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Auto-hide after 5 seconds when showing
    if (newShowState) {
      setAutoHideCountdown(5);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setAutoHideCountdown(prev => {
          if (prev <= 1) {
            setShowQuickActions(false);
            setAutoHideCountdown(0);
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoHideCountdown(0);
    }
  };

  // Clear timeouts on component unmount
  useEffect(() => {
    return () => {
      if (quickActionsTimeoutRef.current) {
        clearTimeout(quickActionsTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getAgentIcon = (agentId) => {
    const icons = {
      manager: Crown,
      clerk: Shield,
      picker: Target,
      packer: Package,
      driver: Truck
    };
    return icons[agentId] || Bot;
  };

  const getAgentColor = (agentId) => {
    const colors = {
      manager: 'purple',
      clerk: 'green',
      picker: 'blue',
      packer: 'orange',
      driver: 'red'
    };
    return colors[agentId] || 'gray';
  };

  const getModeIcon = (mode) => {
    const icons = {
      companion: MessageCircle,
      focused: Target,
      proactive: Zap
    };
    return icons[mode] || Bot;
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  // Get dynamic sizing classes
  const getContainerClasses = () => {
    if (isMaximized) {
      return 'fixed inset-0 w-full h-full max-w-none z-50';
    } else if (isMinimized) {
      return 'fixed bottom-6 right-6 w-80 h-16 z-50';
    } else {
      return 'fixed bottom-6 right-6 w-96 h-[600px] z-50';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Proactive Suggestions Bubble */}
        {proactiveSuggestions.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg max-w-xs animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Smart Suggestion</span>
            </div>
            <p className="text-sm mb-3">{proactiveSuggestions[0].description}</p>
            <button 
              onClick={() => setIsOpen(true)}
              className="w-full text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg font-medium transition-all"
            >
              Let me help →
            </button>
          </div>
        )}
        
        {/* Main Assistant Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-center">
            <Bot className="h-7 w-7" />
          </div>
          
          {/* Notification Badge */}
          {proactiveSuggestions.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {proactiveSuggestions.length}
            </div>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Your AI Assistant
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`${getContainerClasses()} bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`} style={{ height: isMaximized ? '100vh' : isMinimized ? '64px' : '600px' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          {currentAgent && (
            <div className="flex items-center gap-2">
              {React.createElement(getAgentIcon(currentAgent), { className: "h-5 w-5" })}
              <span className="text-sm font-medium">
                {availableAgents.find(a => a.id === currentAgent)?.name || 'AI Assistant'}
              </span>
            </div>
          )}
          
          {/* Mode Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {React.createElement(getModeIcon(assistantMode), { className: "h-3 w-3" })}
              <span className="capitalize">{assistantMode}</span>
            </div>
            
            {/* Backend Status Indicator */}
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              conversationId === 'demo-conversation' 
                ? 'bg-yellow-500 bg-opacity-30 text-yellow-100' 
                : 'bg-green-500 bg-opacity-30 text-green-100'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                conversationId === 'demo-conversation' ? 'bg-yellow-300' : 'bg-green-300'
              }`}></div>
              <span>{conversationId === 'demo-conversation' ? 'Demo' : 'Live'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden md:flex items-center gap-1 text-xs">
            {['chat', 'agents', 'history', 'analytics'].map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-2 py-1 rounded-full capitalize transition-all ${
                  currentView === view ? 'bg-white bg-opacity-30' : 'hover:bg-white hover:bg-opacity-20'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={toggleMaximize}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

                {/* Content */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile View Toggle */}
          <div className="md:hidden p-2 border-b bg-gray-50">
            <div className="flex items-center gap-1 text-xs">
              {['chat', 'agents', 'history', 'analytics'].map(view => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-2 py-1 rounded-full capitalize transition-all ${
                    currentView === view ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Proactive Suggestions Bar */}
          {proactiveSuggestions.length > 0 && currentView === 'chat' && (
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Smart Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {proactiveSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion.description)}
                    className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-full transition-all"
                  >
                    {suggestion.icon} {suggestion.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Work Context Bar */}
          {currentView === 'chat' && workContext.currentLocation && (
            <div className="p-3 bg-gray-50 border-b text-xs text-gray-600">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">📍 {workContext.currentLocation}</span>
                <span className="flex items-center gap-1">🎯 {workContext.currentTask}</span>
                <span className="flex items-center gap-1">⏰ {workContext.workshift}</span>
                {workContext.urgentTasks > 0 && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    ⚠️ {workContext.urgentTasks} urgent
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {currentView === 'chat' && (
              <ChatView
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                chatContainerRef={chatContainerRef}
                currentAgent={currentAgent}
                getAgentIcon={getAgentIcon}
                getAgentColor={getAgentColor}
                isMaximized={isMaximized}
                showScrollToTop={showScrollToTop}
                onScroll={handleScroll}
                onScrollToTop={scrollToTop}
              />
            )}
            
            {currentView === 'agents' && (
              <AgentSelectionView
                availableAgents={availableAgents}
                currentAgent={currentAgent}
                onSelectAgent={selectAgent}
                getAgentIcon={getAgentIcon}
                getAgentColor={getAgentColor}
              />
            )}
            
            {currentView === 'history' && (
              <ConversationHistoryView />
            )}
            
            {currentView === 'analytics' && (
              <AnalyticsView usageAnalytics={usageAnalytics} />
            )}
          </div>

          {/* Quick Actions Bar */}
          {currentView === 'chat' && quickActions.length > 0 && (
            <div className="border-t bg-gray-50">
              {/* Quick Actions Toggle Button */}
              <div className="flex items-center justify-center p-2 relative">
                <button
                  onClick={toggleQuickActions}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                    showQuickActions 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                  title={showQuickActions ? "Hide quick actions" : `Show ${quickActions.length} quick actions`}
                >
                  <Zap className="h-3 w-3" />
                  <span className="font-medium">Quick Actions</span>
                  {!showQuickActions && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {quickActions.length}
                    </span>
                  )}
                  <ChevronUp className={`h-3 w-3 transition-transform duration-300 ${showQuickActions ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Pulse indicator when actions are available */}
                {!showQuickActions && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Collapsible Quick Actions */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showQuickActions ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}
                onMouseEnter={() => {
                  // Pause countdown on hover
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                  }
                }}
                onMouseLeave={() => {
                  // Resume countdown on mouse leave
                  if (showQuickActions && autoHideCountdown > 0) {
                    countdownIntervalRef.current = setInterval(() => {
                      setAutoHideCountdown(prev => {
                        if (prev <= 1) {
                          setShowQuickActions(false);
                          setAutoHideCountdown(0);
                          clearInterval(countdownIntervalRef.current);
                          return 0;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  }
                }}
              >
                <div className="px-3 pb-3">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.slice(0, isMaximized ? 8 : 4).map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleQuickAction(action);
                          // Keep actions open for 2 more seconds after clicking
                          if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                          }
                          setAutoHideCountdown(2);
                          countdownIntervalRef.current = setInterval(() => {
                            setAutoHideCountdown(prev => {
                              if (prev <= 1) {
                                setShowQuickActions(false);
                                setAutoHideCountdown(0);
                                clearInterval(countdownIntervalRef.current);
                                return 0;
                              }
                              return prev - 1;
                            });
                          }, 1000);
                        }}
                        className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-full border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-sm"
                      >
                        <span className="text-sm">{action.icon}</span>
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Auto-hide countdown */}
                  {showQuickActions && autoHideCountdown > 0 && (
                    <div className="mt-2 text-center">
                      <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <span className="animate-pulse">⏱️</span>
                        <span>Auto-hiding in {autoHideCountdown}s</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          {currentView === 'chat' && (
            <div className="border-t p-3 bg-white">
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        <span className="truncate max-w-20">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }} className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask your assistant anything... (Ctrl+Enter to send)"
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        if (inputMessage.trim()) {
                          sendMessage(inputMessage);
                        }
                      }
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${
                      isRecording ? 'text-red-500' : 'text-gray-500'
                    }`}
                    title="Voice recording"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              {/* Keyboard shortcuts hint */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                💡 <strong>Tip:</strong> Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Enter</kbd> to send, <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Esc</kbd> to close, <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">F11</kbd> for fullscreen
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Chat View Component
const ChatView = ({ 
  messages, 
  isLoading, 
  messagesEndRef, 
  chatContainerRef, 
  currentAgent, 
  getAgentIcon, 
  getAgentColor, 
  isMaximized, 
  showScrollToTop, 
  onScroll, 
  onScrollToTop 
}) => (
  <div className="flex-1 flex flex-col relative" style={{ minHeight: 0, height: '100%' }}>
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-scroll p-4 space-y-4 custom-scrollbar"
      onScroll={onScroll}
      style={{ 
        maxHeight: '100%',
        overflowY: 'scroll'
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] ${isMaximized ? 'max-w-[70%]' : ''} rounded-xl p-3 ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : message.role === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(getAgentIcon(currentAgent), { className: "h-4 w-4" })}
                <span className="text-xs font-medium opacity-70">AI Assistant</span>
              </div>
            )}
            
            {/* Enhanced Message Content with Markdown Support */}
            <div className="text-sm leading-relaxed">
              {message.role === 'user' ? (
                // User messages as plain text (preserve line breaks)
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                // AI messages with markdown formatting
                <div className="prose prose-sm max-w-none text-gray-800 [&>*]:mb-2 [&>*:last-child]:mb-0 [&>p]:text-gray-800 [&>li]:text-gray-800">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="ml-4 mb-2 list-disc space-y-1" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="ml-4 mb-2 list-decimal space-y-1" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-sm" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-gray-900" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic text-gray-700" {...props} />
                      ),
                      code: ({ node, inline, ...props }) => 
                        inline ? (
                          <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                        ) : (
                          <code className="block bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono whitespace-pre-wrap" {...props} />
                        ),
                      pre: ({ node, ...props }) => (
                        <pre className="bg-gray-200 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-base font-bold text-gray-900 mb-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-sm font-bold text-gray-900 mb-2" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-sm font-semibold text-gray-900 mb-1" {...props} />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.attachments.map((file, index) => (
                  <div key={index} className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded-full">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs opacity-50 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-xl p-3 text-gray-800">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
    
    {/* Scroll to Top Button */}
    {showScrollToTop && (
      <button
        onClick={onScrollToTop}
        className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    )}
  </div>
);

// Agent Selection View Component
const AgentSelectionView = ({ availableAgents, currentAgent, onSelectAgent, getAgentIcon, getAgentColor }) => (
  <div className="h-full flex flex-col">
    <div className="flex-1 overflow-y-scroll p-4 space-y-4 custom-scrollbar">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Choose Your AI Assistant</h3>
        <p className="text-sm text-gray-600 mt-1">Select the specialist that best matches your current needs</p>
      </div>
      
      {availableAgents.map((agent) => (
        <div
          key={agent.id}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            currentAgent === agent.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onSelectAgent(agent.id)}
        >
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl bg-${agent.color}-100 text-${agent.color}-600`}>
              {React.createElement(getAgentIcon(agent.id), { 
                className: "h-6 w-6" 
              })}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{agent.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
              
              <div className="mt-3">
                <p className="text-xs text-gray-500 font-medium">Capabilities:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {currentAgent === agent.id && (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Conversation History View Component
const ConversationHistoryView = () => (
  <div className="h-full flex flex-col">
    <div className="flex-1 overflow-y-scroll p-4 custom-scrollbar">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-800">Conversation History</h3>
      <p className="text-sm text-gray-600 mt-1">Review your past interactions</p>
    </div>
    
    <div className="space-y-3">
      {/* Placeholder for conversation history */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Today, 10:30 AM</span>
        </div>
        <p className="text-sm text-gray-600">Discussed inventory management and restocking procedures</p>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Yesterday, 2:15 PM</span>
        </div>
        <p className="text-sm text-gray-600">Optimized picking routes for warehouse efficiency</p>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">2 days ago, 11:45 AM</span>
        </div>
        <p className="text-sm text-gray-600">Reviewed packing procedures and safety protocols</p>
      </div>
    </div>
    </div>
  </div>
);

// Analytics View Component
const AnalyticsView = ({ usageAnalytics }) => (
  <div className="h-full flex flex-col">
    <div className="flex-1 overflow-y-scroll p-4 custom-scrollbar">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-gray-800">Usage Analytics</h3>
      <p className="text-sm text-gray-600 mt-1">Track your productivity and AI assistance impact</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Productivity Boost</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">+23%</div>
        <p className="text-xs text-gray-600 mt-1">Since using AI assistant</p>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Quick Actions</span>
        </div>
        <div className="text-2xl font-bold text-green-600">142</div>
        <p className="text-xs text-gray-600 mt-1">Executed this week</p>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">Conversations</span>
        </div>
        <div className="text-2xl font-bold text-orange-600">24</div>
        <p className="text-xs text-gray-600 mt-1">This month</p>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Time Saved</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">8.5h</div>
        <p className="text-xs text-gray-600 mt-1">This week</p>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Most Used Features</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Inventory Queries</span>
          <span className="text-sm font-medium">35%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Route Optimization</span>
          <span className="text-sm font-medium">28%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Task Planning</span>
          <span className="text-sm font-medium">22%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Troubleshooting</span>
          <span className="text-sm font-medium">15%</span>
        </div>
      </div>
    </div>
    </div>
  </div>
);

export default PersonalAssistant; 