import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { chatbotService } from '../../services/chatbotService';

const WMSChatInterface = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'history', 'analytics'
  const messagesEndRef = useRef(null);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotService.getUserHistoryOverview();
      const conversations = response.recent_conversations || [];
      
      // Add preview to each conversation
      const conversationsWithPreviews = conversations.map(conv => ({
        ...conv,
        preview: getConversationPreview(conv)
      }));
      
      setConversations(conversationsWithPreviews);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const getConversationPreview = (conversation) => {
    if (conversation.last_message) {
      return conversation.last_message.length > 60 
        ? conversation.last_message.substring(0, 60) + '...'
        : conversation.last_message;
    }
    return 'New conversation';
  };

  const startNewConversation = async () => {
    setIsCreatingNew(true);
    try {
      const response = await chatbotService.createConversation({
        title: `Warehouse Chat ${new Date().toLocaleTimeString()}`,
        agentRole: getUserAgentRole(user?.role)
      });
      
      setCurrentConversation(response);
      setMessages([]);
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await chatbotService.getConversation(conversationId);
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      // Create new conversation if none exists
      if (!currentConversation) {
        await startNewConversation();
      }

      const response = await chatbotService.sendMessage(messageToSend, {
        conversationId: currentConversation?.conversation_id,
        role: getUserAgentRole(user?.role)
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh conversations to update previews
      await loadConversations();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAgentRole = (userRole) => {
    const roleMapping = {
      'Manager': 'manager',
      'ReceivingClerk': 'clerk',
      'Clerk': 'clerk', 
      'Picker': 'picker',
      'Packer': 'packer',
      'Driver': 'driver'
    };
    return roleMapping[userRole] || 'clerk';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded">👑</div>
            <span className="font-semibold">Warehouse Assistant</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>🟢 Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('chat')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              currentView === 'chat' 
                ? 'bg-white bg-opacity-20' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Chat
          </button>
          <button 
            onClick={() => setCurrentView('agents')}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentView === 'agents' 
                ? 'bg-white bg-opacity-20 font-medium' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Agents
          </button>
          <button 
            onClick={() => setCurrentView('history')}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentView === 'history' 
                ? 'bg-white bg-opacity-20 font-medium' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            History
          </button>
          <button 
            onClick={() => setCurrentView('analytics')}
            className={`px-3 py-1 rounded-lg text-sm ${
              currentView === 'analytics' 
                ? 'bg-white bg-opacity-20 font-medium' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Analytics
          </button>
          <button className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>

      {/* Smart Suggestions Section */}
      <div className="bg-orange-50 border-b border-orange-100 px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span>🧠</span>
          <span className="font-medium text-orange-800">Smart Suggestions</span>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-lg text-sm text-orange-700">
            <span>⚡</span>
            <span>Test Quick Actions</span>
          </button>
          <button className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded-lg text-sm text-orange-700">
            <span>📊</span>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Work Context Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="text-gray-600">Warehouse A-1</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔍</span>
            <span className="text-gray-600">Inventory Check</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌅</span>
            <span className="text-gray-600">Morning</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-red-600 font-medium">2 urgent</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Only show for chat view */}
        {currentView === 'chat' && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewConversation}
            disabled={isCreatingNew}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isCreatingNew ? 'Creating...' : 'New Chat'}
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-2">📝</div>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to begin!</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  onClick={() => loadConversation(conv.conversation_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    currentConversation?.conversation_id === conv.conversation_id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {conv.title || 'Warehouse Chat'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.preview}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(conv.created_at)}
                      </p>
                    </div>
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
        )}

      {/* Main Content Area */}
      {currentView === 'chat' ? (
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  🤖
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{currentConversation.title}</h1>
                  <p className="text-sm text-gray-500">Warehouse Assistant • {getUserAgentRole(user?.role)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-3xl px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    🤖
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
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

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about warehouse operations, inventory, orders..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    style={{ minHeight: '50px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 p-6">
            {/* AI Assistant Message */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  👑
                </div>
                <span className="font-medium text-gray-800">AI Assistant</span>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-700">
                  👋 Hello! I'm your {getUserAgentRole(user?.role)} Assistant. I'm here to help you with warehouse operations.
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">🎯</span>
                  <span className="text-gray-700">I can help you with:</span>
                  <span className="text-sm text-gray-600">
                    • Analytics • Management • Reporting
                  </span>
                </div>
                
                <p className="text-gray-700 mt-4">
                  What would you like to do today?
                </p>
                
                <div className="text-xs text-gray-500 mt-3">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Input Area for Welcome */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your assistant anything... (Ctrl+Enter to send)"
                    rows={1}
                    className="w-full px-4 py-3 border-0 focus:ring-0 outline-none resize-none text-gray-700 placeholder-gray-400"
                    style={{ minHeight: '50px', maxHeight: '120px' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
                <span>💡 Tip: Press</span>
                <kbd className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd>
                <span>to send,</span>
                <kbd className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Esc</kbd>
                <span>to close,</span>
                <kbd className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">F11</kbd>
                <span>for fullscreen</span>
              </div>
            </div>
          </div>
        )}
      </div>
      ) : currentView === 'history' ? (
        /* History View */
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Conversation History</h1>
              <p className="text-gray-600">Review your past interactions</p>
            </div>
            
            <div className="space-y-4">
              {conversations.map((conv, index) => (
                <div key={conv.conversation_id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                      🕒
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(conv.created_at)} ago
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {getUserAgentRole(user?.role)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {conv.title || 'Warehouse Assistant Session'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {conv.message_count || 2} messages
                  </p>
                  
                  <div className="text-right text-xs text-gray-400">
                    ID: {conv.conversation_id?.slice(-8) || `session${index + 1}`}
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-500">No conversation history yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start chatting to see your conversations here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentView === 'analytics' ? (
        /* Analytics View */
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your warehouse operations and performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    💬
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Conversations</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{conversations.length}</p>
                <p className="text-sm text-gray-500 mt-2">All time conversations</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    👤
                  </div>
                  <h3 className="font-semibold text-gray-900">Active Agent</h3>
                </div>
                <p className="text-2xl font-bold text-green-600 capitalize">{getUserAgentRole(user?.role)}</p>
                <p className="text-sm text-gray-500 mt-2">Current assistant role</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <h3 className="font-semibold text-gray-900">Usage This Week</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">Active</p>
                <p className="text-sm text-gray-500 mt-2">Regular user</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agents View */
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Available Agents</h1>
              <p className="text-gray-600">Choose the right assistant for your warehouse tasks</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['manager', 'clerk', 'picker', 'packer', 'driver'].map((agentRole) => (
                <div key={agentRole} className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all ${
                  getUserAgentRole(user?.role) === agentRole 
                    ? 'border-blue-500 ring-2 ring-blue-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                      {agentRole === 'manager' ? '👑' : 
                       agentRole === 'clerk' ? '📋' :
                       agentRole === 'picker' ? '📦' :
                       agentRole === 'packer' ? '📮' : '🚛'}
                    </div>
                    <h3 className="font-semibold text-gray-900 capitalize mb-2">{agentRole} Agent</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {agentRole === 'manager' ? 'Analytics, reporting, and oversight' :
                       agentRole === 'clerk' ? 'Receiving, returns, and inventory' :
                       agentRole === 'picker' ? 'Order picking and fulfillment' :
                       agentRole === 'packer' ? 'Packing and shipping preparation' : 
                       'Delivery and logistics'}
                    </p>
                    {getUserAgentRole(user?.role) === agentRole && (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        Current Agent
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default WMSChatInterface; 