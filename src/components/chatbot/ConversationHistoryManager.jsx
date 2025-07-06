import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';

const ConversationHistoryManager = ({ 
  isOpen, 
  onClose, 
  onConversationSelect, 
  currentConversationId 
}) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'timeline'
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [userOverview, setUserOverview] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  const searchInputRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load conversations and analytics on open
  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadUserOverview();
    }
  }, [isOpen]);

  // Filter conversations based on search and category
  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, selectedCategory]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatbotService.getAllConversations({
        limit: 100,
        status: 'active'
      });
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOverview = async () => {
    try {
      const overview = await chatbotService.getUserHistoryOverview();
      setUserOverview(overview);
    } catch (error) {
      console.error('Failed to load user overview:', error);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(conv => {
        const lastMsg = conv.last_message?.toLowerCase() || '';
        switch (selectedCategory) {
          case 'inventory':
            return ['inventory', 'stock', 'item'].some(keyword => lastMsg.includes(keyword));
          case 'orders':
            return ['order', 'shipping', 'delivery'].some(keyword => lastMsg.includes(keyword));
          case 'analytics':
            return ['analytics', 'report', 'data'].some(keyword => lastMsg.includes(keyword));
          case 'recent':
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(conv.last_message_at || conv.created_at) > dayAgo;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query) ||
        conv.agent_role?.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(filtered);
  };

  const handleSmartSearch = async (query) => {
    if (!query.trim()) {
      setSearchQuery('');
      return;
    }

    try {
      setIsSearching(true);
      const results = await chatbotService.smartSearchConversations(query);
      setFilteredConversations(results.results || []);
      setSearchQuery(query);
    } catch (error) {
      console.error('Smart search failed:', error);
      // Fallback to local filtering
      setSearchQuery(query);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      try {
        const suggestions = await chatbotService.getSearchSuggestions(value);
        setSearchSuggestions(suggestions);
        setShowSearchSuggestions(true);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const handleItemSelect = (conversationId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkAction = async (action) => {
    try {
      const conversationIds = Array.from(selectedItems);
      await chatbotService.bulkConversationActions(conversationIds, action);
      
      // Refresh conversations
      await loadConversations();
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleSummarizeConversation = async (conversationId) => {
    try {
      const summary = await chatbotService.summarizeConversation(conversationId);
      // Display summary in a modal or expand the conversation item
      console.log('Conversation summary:', summary);
    } catch (error) {
      console.error('Failed to summarize:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Conversations', icon: '💬', count: conversations.length },
    { id: 'recent', name: 'Recent (24h)', icon: '🕐', count: conversations.filter(c => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(c.last_message_at || c.created_at) > dayAgo;
    }).length },
    { id: 'inventory', name: 'Inventory', icon: '📦', count: conversations.filter(c => 
      ['inventory', 'stock', 'item'].some(keyword => 
        c.last_message?.toLowerCase().includes(keyword)
      )
    ).length },
    { id: 'orders', name: 'Orders', icon: '🚚', count: conversations.filter(c => 
      ['order', 'shipping', 'delivery'].some(keyword => 
        c.last_message?.toLowerCase().includes(keyword)
      )
    ).length },
    { id: 'analytics', name: 'Analytics', icon: '📊', count: conversations.filter(c => 
      ['analytics', 'report', 'data'].some(keyword => 
        c.last_message?.toLowerCase().includes(keyword)
      )
    ).length }
  ];

  const ConversationCard = ({ conversation, isSelected, onSelect }) => (
    <div 
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        currentConversationId === conversation.conversation_id
          ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-300'
          : isSelected
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => onConversationSelect(conversation.conversation_id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(conversation.conversation_id);
              }}
              className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {chatbotService.formatConversationTitle(conversation)}
            </h4>
          </div>
          
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {conversation.last_message || 'No messages yet'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                chatbotService.getAgentColor(conversation.agent_role)
              }`}>
                {chatbotService.getAgentDisplayName(conversation.agent_role)}
              </span>
              <span className="text-xs text-gray-500">
                {conversation.message_count || 0} msgs
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSummarizeConversation(conversation.conversation_id);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                title="Summarize conversation"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <span className="text-xs text-gray-400">
                {chatbotService.formatLastActivity(conversation.last_message_at || conversation.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsPanel = () => (
    <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        📊 Your Chat Analytics
      </h3>
      
      {userOverview?.overview && (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary-600">
              {userOverview.overview.total_conversations}
            </div>
            <div className="text-xs text-gray-600">Total Chats</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {userOverview.overview.recent_conversations}
            </div>
            <div className="text-xs text-gray-600">This Month</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {userOverview.overview.average_conversation_length}
            </div>
            <div className="text-xs text-gray-600">Avg Messages</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {userOverview.overview.most_used_agent?.role || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Fav Agent</div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">
              💬 Chat History - {currentUser?.username}
            </h2>
            <span className="text-sm opacity-75">
              ({filteredConversations.length} conversations)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-white hover:text-gray-200 p-1 rounded"
              title="Toggle Analytics"
            >
              📊
            </button>
            
            <div className="flex bg-white bg-opacity-20 rounded">
              {['list', 'grid', 'timeline'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 text-xs rounded ${
                    viewMode === mode ? 'bg-white text-primary-600' : 'text-white'
                  }`}
                >
                  {mode === 'list' ? '📋' : mode === 'grid' ? '⊞' : '📅'}
                </button>
              ))}
            </div>
            
            <button onClick={onClose} className="text-white hover:text-gray-200 p-1 rounded">
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="🔍 Smart search conversations... (try 'inventory status' or 'recent orders')"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSmartSearch(e.target.value);
                  setShowSearchSuggestions(false);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Search Suggestions */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSmartSearch(suggestion);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    🔍 {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto">
            <div className="p-3">
              {showAnalytics && <AnalyticsPanel />}
              
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedItems.size} conversation(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    📁 Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItems(new Set());
                      setShowBulkActions(false);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading conversations...</p>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery 
                      ? 'Try adjusting your search terms or selecting a different category.'
                      : 'Start a new conversation to see it appear here.'
                    }
                  </p>
                </div>
              ) : (
                <div className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : ''}`}>
                  {filteredConversations.map(conversation => (
                    <ConversationCard
                      key={conversation.conversation_id}
                      conversation={conversation}
                      isSelected={selectedItems.has(conversation.conversation_id)}
                      onSelect={handleItemSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <div>
            User: <strong>{currentUser?.username}</strong> | 
            Role: <strong>{currentUser?.role}</strong>
          </div>
          <div>
            Showing {filteredConversations.length} of {conversations.length} conversations
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistoryManager; 