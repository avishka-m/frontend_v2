import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  RefreshCw, 
  Calendar,
  Clock,
  Bot,
  User,
  Trash2,
  Archive,
  MoreVertical
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';

const ChatHistorySidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onRefresh,
  onDeleteConversation,
  onArchiveConversation,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Handle ESC key to close dialogs
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDeleteConfirm(null);
        setShowArchiveConfirm(null);
      }
    };

    if (showDeleteConfirm || showArchiveConfirm) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDeleteConfirm, showArchiveConfirm]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.agent_role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get agent icon and color
  const getAgentInfo = (agentRole) => {
    const agentMap = {
      'general': { icon: Bot, color: 'text-blue-600', bg: 'bg-blue-100' },
      'clerk': { icon: User, color: 'text-green-600', bg: 'bg-green-100' },
      'picker': { icon: User, color: 'text-orange-600', bg: 'bg-orange-100' },
      'packer': { icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
      'driver': { icon: User, color: 'text-red-600', bg: 'bg-red-100' }
    };
    return agentMap[agentRole] || agentMap['general'];
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!onDeleteConversation) return;
    
    setProcessing(true);
    try {
      await onDeleteConversation(conversationId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    if (!onArchiveConversation) return;
    
    setProcessing(true);
    try {
      await onArchiveConversation(conversationId);
      setShowArchiveConfirm(null);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* New Chat Button */}
        <Button
          onClick={onNewConversation}
          className="w-full mb-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 transition-all"
          />
        </div>
      </div>

      {/* Conversations List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && conversations.length === 0 ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
            </p>
            {conversations.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Start by creating a new chat</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const agentInfo = getAgentInfo(conversation.agent_role);
              const AgentIcon = agentInfo.icon;
              const isActive = activeConversation?.conversation_id === conversation.conversation_id;
              
              return (
                <div
                  key={conversation.conversation_id}
                  className={`p-3 cursor-pointer transition-colors relative group ${
                    isActive 
                      ? 'bg-blue-50 border-r-2 border-blue-600' 
                      : 'hover:bg-gray-50'
                  } ${processing ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !processing && onSelectConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Agent Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${agentInfo.bg} flex items-center justify-center`}>
                      <AgentIcon className={`h-4 w-4 ${agentInfo.color}`} />
                    </div>
                    
                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium truncate ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {conversation.title || 'Untitled Chat'}
                        </h4>
                        
                        {/* Options Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all rounded hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowArchiveConfirm(conversation.conversation_id);
                              }}
                              disabled={processing}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(conversation.conversation_id);
                              }}
                              disabled={processing}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Agent Role */}
                      <p className={`text-xs capitalize mb-1 ${
                        isActive ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {conversation.agent_role || 'general'} assistant
                      </p>
                      
                      {/* Message Count & Date */}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {conversation.message_count || 0} messages
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(conversation.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l"></div>
                  )}
                  
                  {/* Processing Indicator */}
                  {processing && (showDeleteConfirm === conversation.conversation_id || showArchiveConfirm === conversation.conversation_id) && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {conversations.length} total chats
          </span>
          <span className="flex items-center">
            <Bot className="h-3 w-3 mr-1" />
            AI Assistant
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Conversation</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this conversation? All messages will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Archive className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Archive Conversation</h3>
                <p className="text-sm text-gray-500">Move to archived conversations</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              This conversation will be moved to your archived conversations. You can restore it later if needed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowArchiveConfirm(null)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveConversation(showArchiveConfirm)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Archive'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySidebar; 