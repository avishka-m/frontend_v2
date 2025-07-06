/**
 * Conversation Management Panel
 * Bulk operations and management features for conversations
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../common/Card';
import { 
  FiCheck, 
  FiArchive, 
  FiTrash2, 
  FiDownload,
  FiEdit,
  FiMoreVertical,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMessageCircle,
  FiClock,
  FiTag,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiSettings,
  FiEye,
  FiStar,
  FiBookmark,
  FiShare2,
  FiCopy
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../common/Dialog';
import { chatbotService } from '../../services/chatbotService';
import { Notification } from '../common/Notification';

const ConversationManagementPanel = ({ 
  conversations, 
  onConversationUpdate, 
  onConversationSelect,
  onRefresh 
}) => {
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [bulkActionType, setBulkActionType] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);

  const filteredConversations = conversations.filter(conv => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!conv.title?.toLowerCase().includes(query) && 
          !conv.last_message?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Filter by status
    if (filterBy === 'active') return conv.status === 'active';
    if (filterBy === 'archived') return conv.status === 'archived';
    if (filterBy === 'deleted') return conv.status === 'deleted';
    
    return true;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at);
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'messages':
        return (b.message_count || 0) - (a.message_count || 0);
      case 'agent':
        return (a.agent_role || '').localeCompare(b.agent_role || '');
      default:
        return 0;
    }
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSelectConversation = (conversationId, checked) => {
    setSelectedConversations(prev => 
      checked 
        ? [...prev, conversationId]
        : prev.filter(id => id !== conversationId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedConversations(
      checked ? sortedConversations.map(conv => conv.conversation_id) : []
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedConversations.length === 0) {
      showNotification('Please select conversations first', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      switch (action) {
        case 'archive':
          result = await chatbotService.bulkConversationActions(selectedConversations, 'archive');
          break;
        case 'delete':
          result = await chatbotService.bulkConversationActions(selectedConversations, 'delete');
          break;
        case 'export':
          result = await chatbotService.exportConversations({
            conversationIds: selectedConversations,
            format: 'json',
            includeMetadata: true
          });
          
          // Create download
          const blob = new Blob([result.data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `conversations-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          
          showNotification('Export completed', 'success');
          setSelectedConversations([]);
          return;
        default:
          throw new Error('Unknown bulk action');
      }
      
      showNotification(
        `${action} completed: ${result.successful} successful, ${result.failed} failed`, 
        'success'
      );
      
      setSelectedConversations([]);
      if (onRefresh) onRefresh();
      
    } catch (error) {
      showNotification(`Bulk ${action} failed`, 'error');
      console.error('Bulk action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditConversation = async (conversationId, updates) => {
    try {
      // For now, we'll just update the title locally
      // In a real implementation, this would call an API
      showNotification('Conversation updated', 'success');
      setEditingConversation(null);
      setShowEditDialog(false);
      
      if (onConversationUpdate) {
        onConversationUpdate(conversationId, updates);
      }
      
    } catch (error) {
      showNotification('Failed to update conversation', 'error');
      console.error('Update conversation error:', error);
    }
  };

  const handleDeleteConversation = async (conversationId, hardDelete = false) => {
    try {
      await chatbotService.deleteConversation(conversationId, hardDelete);
      showNotification('Conversation deleted', 'success');
      
      if (onRefresh) onRefresh();
      
    } catch (error) {
      showNotification('Failed to delete conversation', 'error');
      console.error('Delete conversation error:', error);
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      await chatbotService.archiveConversation(conversationId);
      showNotification('Conversation archived', 'success');
      
      if (onRefresh) onRefresh();
      
    } catch (error) {
      showNotification('Failed to archive conversation', 'error');
      console.error('Archive conversation error:', error);
    }
  };

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedConversations.length === sortedConversations.length && sortedConversations.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedConversations.length > 0 
              ? `${selectedConversations.length} selected`
              : `${sortedConversations.length} conversations`
            }
          </span>
        </div>
        
        {selectedConversations.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('archive')}
              disabled={isLoading}
            >
              <FiArchive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              disabled={isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="messages">Messages</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );

  const renderConversationRow = (conversation) => (
    <tr key={conversation.conversation_id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">
        <Checkbox
          checked={selectedConversations.includes(conversation.conversation_id)}
          onCheckedChange={(checked) => handleSelectConversation(conversation.conversation_id, checked)}
        />
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="font-medium text-gray-900 truncate max-w-xs">
              {conversation.title || 'Untitled Conversation'}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {conversation.last_message || 'No messages yet'}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <Badge 
          variant="secondary" 
          className={chatbotService.getAgentColor(conversation.agent_role)}
        >
          {chatbotService.getAgentDisplayName(conversation.agent_role)}
        </Badge>
      </td>
      <td className="p-4 text-sm text-gray-600">
        {conversation.message_count || 0} messages
      </td>
      <td className="p-4 text-sm text-gray-600">
        {chatbotService.formatLastActivity(conversation.last_message_at)}
      </td>
      <td className="p-4 text-sm text-gray-600">
        {new Date(conversation.created_at).toLocaleDateString()}
      </td>
      <td className="p-4">
        <Badge 
          variant={conversation.status === 'active' ? 'default' : 'secondary'}
        >
          {conversation.status || 'active'}
        </Badge>
      </td>
      <td className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onConversationSelect(conversation)}>
              <FiEye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setEditingConversation(conversation);
              setShowEditDialog(true);
            }}>
                                  <FiEdit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.conversation_id)}>
              <FiArchive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteConversation(conversation.conversation_id)}>
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );

  const renderConversationTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="p-4 text-left">
              <Checkbox
                checked={selectedConversations.length === sortedConversations.length && sortedConversations.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="p-4 text-left font-medium text-gray-900">Conversation</th>
            <th className="p-4 text-left font-medium text-gray-900">Agent</th>
            <th className="p-4 text-left font-medium text-gray-900">Messages</th>
            <th className="p-4 text-left font-medium text-gray-900">Last Activity</th>
            <th className="p-4 text-left font-medium text-gray-900">Created</th>
            <th className="p-4 text-left font-medium text-gray-900">Status</th>
            <th className="p-4 text-left font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedConversations.map(renderConversationRow)}
        </tbody>
      </table>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
      <p className="text-gray-500">
        {searchQuery || filterBy !== 'all' 
          ? 'Try adjusting your search or filter settings'
          : 'Start a new conversation to see it here'
        }
      </p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Management</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {renderToolbar()}
        
        {sortedConversations.length === 0 ? (
          renderEmptyState()
        ) : (
          renderConversationTable()
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Conversations</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete {selectedConversations.length} conversation(s)? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleBulkAction('delete');
                    setShowDeleteDialog(false);
                  }}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Conversation Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  defaultValue={editingConversation?.title || ''}
                  placeholder="Enter conversation title..."
                  id="edit-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent
                </label>
                <Select defaultValue={editingConversation?.agent_role || ''}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clerk">Receiving Clerk</SelectItem>
                    <SelectItem value="picker">Picker Assistant</SelectItem>
                    <SelectItem value="packer">Packing Assistant</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="driver">Driver Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  const title = document.getElementById('edit-title').value;
                  handleEditConversation(editingConversation.conversation_id, { title });
                }}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Card>
  );
};

export default ConversationManagementPanel; 