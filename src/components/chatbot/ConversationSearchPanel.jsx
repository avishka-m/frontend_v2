/**
 * Conversation Search Panel
 * Advanced search capabilities for conversations with smart and semantic search
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../common/Card';
import { 
  FiSearch, 
  FiFilter, 
  FiClock, 
  FiUser, 
  FiMessageCircle,
  FiTarget,
  FiTrendingUp,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiStar,
  FiCalendar,
  FiTag,
  FiList,
  FiGrid,
  FiArrowRight,
  FiX,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/Tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../common/Notification';

const ConversationSearchPanel = ({ 
  searchResults, 
  searchLoading, 
  onSearch, 
  onConversationSelect 
}) => {
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('smart');
  const [selectedFilters, setSelectedFilters] = useState({
    agent: '',
    dateRange: '',
    messageCount: '',
    category: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSearchHistory();
    loadSearchSuggestions();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      loadSearchSuggestions(searchQuery);
    }
  }, [searchQuery]);

  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('wms_search_history') || '[]');
      setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  };

  const saveSearchHistory = (query) => {
    try {
      const history = JSON.parse(localStorage.getItem('wms_search_history') || '[]');
      const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
      localStorage.setItem('wms_search_history', JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 5));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  };

  const loadSearchSuggestions = async (query = '') => {
    try {
      const suggestions = await chatbotService.getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load search suggestions:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      showNotification('Please enter a search query', 'warning');
      return;
    }

    try {
      saveSearchHistory(query);
      
      if (searchType === 'smart') {
        await onSearch(query);
      } else if (searchType === 'semantic') {
        const results = await chatbotService.roleBased.search.semanticSearch(query, {
          ...selectedFilters,
          limit: 20
        });
        // Handle semantic search results
        console.log('Semantic search results:', results);
      }
      
      showNotification(`Found ${searchResults.length} results`, 'success');
      
    } catch (error) {
      showNotification('Search failed', 'error');
      console.error('Search error:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      agent: '',
      dateRange: '',
      messageCount: '',
      category: ''
    });
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleConversationClick = (conversation) => {
    onConversationSelect(conversation);
  };

  const renderSearchBar = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Search Input */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4"
              />
            </div>
            
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">Smart</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => handleSearch()} disabled={searchLoading}>
              {searchLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSearch className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FiFilter className="h-4 w-4" />
              {showAdvancedFilters ? <FiChevronUp className="h-4 w-4 ml-1" /> : <FiChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
                <Select value={selectedFilters.agent} onValueChange={(value) => handleFilterChange('agent', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All agents</SelectItem>
                    <SelectItem value="clerk">Receiving Clerk</SelectItem>
                    <SelectItem value="picker">Picker Assistant</SelectItem>
                    <SelectItem value="packer">Packing Assistant</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="driver">Driver Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={selectedFilters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Count</label>
                <Select value={selectedFilters.messageCount} onValueChange={(value) => handleFilterChange('messageCount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any length</SelectItem>
                    <SelectItem value="short">Short (1-5 messages)</SelectItem>
                    <SelectItem value="medium">Medium (6-15 messages)</SelectItem>
                    <SelectItem value="long">Long (16+ messages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={selectedFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  <FiX className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => handleQuickSearch(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleQuickSearch(query)}
                  >
                    <FiClock className="h-3 w-3 mr-1" />
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSearchResults = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Search Results
            {searchResults.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {searchResults.length} results
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FiList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <FiGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No results found' : 'Start searching'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Enter a search query to find conversations'
              }
            </p>
          </div>
        ) : (
          <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
            {searchResults.map((result, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleConversationClick(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {result.title || 'Untitled Conversation'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.relevance_score && (
                          <span className="inline-flex items-center mr-2">
                            <FiTarget className="h-3 w-3 mr-1" />
                            {Math.round(result.relevance_score)} match
                          </span>
                        )}
                        <span className="inline-flex items-center">
                          <FiMessageCircle className="h-3 w-3 mr-1" />
                          {result.message_count || 0} messages
                        </span>
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={chatbotService.getAgentColor(result.agent_role)}
                    >
                      {chatbotService.getAgentDisplayName(result.agent_role)}
                    </Badge>
                  </div>
                  
                  {/* Matched Context */}
                  {result.matched_context && result.matched_context.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Matched content:</p>
                      <div className="space-y-1">
                        {result.matched_context.slice(0, 2).map((context, i) => (
                          <p key={i} className="text-xs text-gray-700 bg-yellow-50 p-1 rounded">
                            {context}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <FiClock className="h-3 w-3 mr-1" />
                      {chatbotService.formatLastActivity(result.last_activity)}
                    </span>
                    <span className="flex items-center">
                      <FiCalendar className="h-3 w-3 mr-1" />
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderSearchBar()}
      {renderSearchResults()}
      
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ConversationSearchPanel; 