/**
 * Chat Message Component
 * Displays individual chat messages with proper formatting and styling
 */

import React from 'react';
import { 
  FiUser, 
  FiMessageCircle, 
  FiClock, 
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiMoreVertical
} from 'react-icons/fi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { chatbotService } from '../../services/chatbotService';

const ChatMessage = ({ 
  message, 
  isCurrentUser = false, 
  agentRole = 'manager',
  showTimestamp = true,
  onCopy = null,
  onFeedback = null 
}) => {
  
  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content);
      if (onCopy) onCopy();
    }
  };

  const handleFeedback = (positive) => {
    if (onFeedback) {
      onFeedback(message.id, positive);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCurrentUser 
            ? 'bg-blue-500' 
            : 'bg-gray-500'
        }`}>
          {isCurrentUser ? (
            <FiUser className="h-4 w-4 text-white" />
          ) : (
            <FiMessageCircle className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl ${
        isCurrentUser ? 'text-right' : 'text-left'
      }`}>
        {/* Message Header */}
        <div className={`flex items-center space-x-2 mb-1 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-sm font-medium text-gray-900">
            {message.sender || (isCurrentUser ? 'You' : chatbotService.getAgentDisplayName(agentRole))}
          </span>
          
          {!isCurrentUser && agentRole && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${chatbotService.getAgentColor(agentRole)}`}
            >
              {chatbotService.getAgentDisplayName(agentRole)}
            </Badge>
          )}
          
          {showTimestamp && (
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`relative p-3 rounded-lg shadow-sm ${
          isCurrentUser
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          {/* Message Content */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Message Actions */}
          <div className={`flex items-center space-x-2 mt-2 ${
            isCurrentUser ? 'justify-start' : 'justify-end'
          }`}>
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className={`h-6 w-6 p-0 ${
                isCurrentUser 
                  ? 'text-blue-100 hover:text-white hover:bg-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiCopy className="h-3 w-3" />
            </Button>

            {/* Feedback Buttons (for AI messages only) */}
            {!isCurrentUser && onFeedback && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                >
                  <FiThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <FiThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${
                    isCurrentUser 
                      ? 'text-blue-100 hover:text-white hover:bg-blue-600' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiMoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <FiCopy className="h-4 w-4 mr-2" />
                  Copy message
                </DropdownMenuItem>
                {!isCurrentUser && (
                  <>
                    <DropdownMenuItem onClick={() => handleFeedback(true)}>
                      <FiThumbsUp className="h-4 w-4 mr-2" />
                      Helpful
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFeedback(false)}>
                      <FiThumbsDown className="h-4 w-4 mr-2" />
                      Not helpful
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Message metadata */}
        {message.metadata && (
          <div className="mt-1 text-xs text-gray-500">
            {message.metadata.processing_time && (
              <span>Processed in {Math.round(message.metadata.processing_time * 1000)}ms</span>
            )}
            {message.metadata.tokens_used && (
              <span className="ml-2">• {message.metadata.tokens_used} tokens</span>
            )}
            {message.metadata.model_used && (
              <span className="ml-2">• {message.metadata.model_used}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;