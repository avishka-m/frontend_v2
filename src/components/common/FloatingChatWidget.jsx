import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  X,
  Send,
  Bot,
  ArrowUp,
  Maximize2,
  Zap,
  Package,
  Truck,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { chatbotService } from '../../services/chatbotService';

const FloatingChatWidget = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [hasNewFeatures, setHasNewFeatures] = useState(true); // Show notification for new users
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when opened and hide notification
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewFeatures(false); // Hide notification after first use
      
      // Add welcome message if no messages exist
      if (messages.length === 0) {
        setTimeout(() => {
          const getWelcomeMessage = (role) => {
            switch (role) {
              case 'Manager':
                return `Hello Manager! I'm your Executive Assistant with full warehouse oversight capabilities. I can help with analytics, system monitoring, workforce management, and strategic insights. Use the quick actions below or ask me anything about warehouse operations.`;
              case 'ReceivingClerk':
                return `Hi! I'm your Inventory Specialist assistant, focused on receiving and stock management. Use the quick actions for common tasks or ask me about inventory operations.`;
              case 'Picker':
                return `Hello! I'm your Picking Assistant, here to help optimize your picking routes and manage order fulfillment. Try the quick actions or ask me about picking operations.`;
              case 'Packer':
                return `Hi! I'm your Packing Specialist assistant, ready to help with packing workflows and shipping preparation. Use the actions below or ask me about packing tasks.`;
              case 'Driver':
                return `Hello! I'm your Delivery Coordinator assistant, here to help with routes, deliveries, and vehicle management. Try the quick actions for common tasks.`;
              default:
                return `Hi! I'm your warehouse assistant. Use the buttons above for quick actions, or type a question. For advanced features, click "Open Full Chat".`;
            }
          };

          const welcomeMessage = {
            id: Date.now(),
            role: 'assistant',
            content: getWelcomeMessage(currentUser?.role),
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }, 500);
      }
    }
  }, [isOpen, messages.length, currentUser?.role]);

  // Get role-based quick actions
  const getQuickActions = () => {
    const actionMap = {
      'Manager': [
        { id: 'overview', label: 'System Overview', icon: BarChart3, description: 'Get comprehensive warehouse status' },
        { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, description: 'View detailed performance metrics' },
        { id: 'alerts', label: 'Critical Alerts', icon: Zap, description: 'Review urgent system notifications' },
        { id: 'workforce', label: 'Workforce Status', icon: Package, description: 'Check worker performance and attendance' }
      ],
      'ReceivingClerk': [
        { id: 'inventory', label: 'Check Inventory', icon: Package, description: 'View current stock levels' },
        { id: 'receiving', label: 'Process Receiving', icon: ArrowUp, description: 'Handle incoming shipments' }
      ],
      'Picker': [
        { id: 'orders', label: 'Pending Orders', icon: Package, description: 'View picking tasks' },
        { id: 'route', label: 'Optimize Route', icon: Truck, description: 'Get optimal picking path' }
      ],
      'Packer': [
        { id: 'packing', label: 'Packing Queue', icon: Package, description: 'View packing tasks' },
        { id: 'shipping', label: 'Ready to Ship', icon: Truck, description: 'Check completed orders' }
      ],
      'Driver': [
        { id: 'deliveries', label: 'Today\'s Routes', icon: Truck, description: 'View delivery schedule' },
        { id: 'vehicle', label: 'Vehicle Check', icon: Zap, description: 'Vehicle status and maintenance' }
      ]
    };
    
    return actionMap[currentUser?.role] || actionMap['Manager'];
  };

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);
    
    try {
      // Map user roles to proper chatbot assistant roles
      const getChatbotRole = (userRole) => {
        const roleMapping = {
          'Manager': 'manager',
          'ReceivingClerk': 'clerk', 
          'Picker': 'picker',
          'Packer': 'packer',
          'Driver': 'driver'
        };
        return roleMapping[userRole] || 'manager'; // Default managers get manager assistant
      };

      const chatbotRole = getChatbotRole(currentUser?.role);
      console.log('Sending message with role:', chatbotRole, 'for user role:', currentUser?.role);
      
      const response = await chatbotService.sendMessage(message, {
        role: chatbotRole
      });
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try the full chat page for better support.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const message = `Quick Action: ${action.label} - ${action.description}`;
    sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const openFullChat = () => {
    navigate('/chatbot/enhanced');
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {/* Notification dot */}
          {hasNewFeatures && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div className="w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">
                {currentUser?.role === 'Manager' ? 'Executive Assistant' : 
                 currentUser?.role === 'ReceivingClerk' ? 'Inventory Specialist' :
                 currentUser?.role === 'Picker' ? 'Picking Assistant' :
                 currentUser?.role === 'Packer' ? 'Packing Specialist' :
                 currentUser?.role === 'Driver' ? 'Delivery Coordinator' :
                 'Quick Assistant'}
              </h3>
              <p className="text-xs text-white/80">{currentUser?.role || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openFullChat}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
              title="Open Full Chat"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && showQuickActions && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center mb-3">Quick actions for {currentUser?.role}:</p>
              {getQuickActions().map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="w-full p-2 text-left border border-gray-200 rounded-md hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              <div className="border-t border-gray-200 pt-2 mt-3">
                <button
                  onClick={openFullChat}
                  className="w-full p-2 text-center bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Maximize2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Open Full Chat</span>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Press Enter to send • <button onClick={openFullChat} className="text-primary-600 hover:underline">Open full chat</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingChatWidget; 