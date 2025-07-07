import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Smile,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import ChatMessage from './ChatMessage';

const ChatWindow = ({
  messages,
  onSendMessage,
  sending,
  selectedAgent,
  activeConversation,
  messagesEndRef
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentMessage]);

  // Handle message sending
  const handleSend = async () => {
    if (!currentMessage.trim() || sending) return;
    
    const messageToSend = currentMessage;
    setCurrentMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await onSendMessage(messageToSend);
  };

  // Handle keyboard events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get agent info for display
  const getAgentDisplay = () => {
    if (selectedAgent) {
      const AgentIcon = selectedAgent.icon;
      return {
        name: selectedAgent.name,
        icon: AgentIcon,
        color: selectedAgent.color
      };
    }
    return {
      name: 'AI Assistant',
      icon: Bot,
      color: 'from-blue-500 to-blue-600'
    };
  };

  const agentDisplay = getAgentDisplay();
  const AgentIcon = agentDisplay.icon;

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${agentDisplay.color} rounded-full flex items-center justify-center shadow-lg`}>
          <AgentIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {agentDisplay.name}
        </h3>
        <p className="text-gray-600 mb-4">
          Hello! I'm your AI assistant ready to help with warehouse operations.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Try asking me about:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-gray-100 rounded-full">Inventory status</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Order details</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Location help</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render conversation header
  const renderConversationHeader = () => (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${agentDisplay.color} rounded-full flex items-center justify-center shadow-sm`}>
            <AgentIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agentDisplay.name}</h3>
            <p className="text-sm text-gray-500">
              {activeConversation ? 
                `${messages.length} messages • ${activeConversation.title || 'Untitled Chat'}` :
                'Start a new conversation'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Conversation Header */}
      <div className="flex-shrink-0">
        {renderConversationHeader()}
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="h-full">
            {renderEmptyState()}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                isUser={message.sender === 'user'}
                agentInfo={agentDisplay}
                showTimestamp={true}
              />
            ))}
            
            {/* Typing indicator */}
            {(sending || isTyping) && (
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${agentDisplay.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <AgentIcon className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-end space-x-3">
            {/* Attachment button */}
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              disabled={sending}
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${agentDisplay.name}...`}
                disabled={sending}
                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[48px] transition-all"
                rows={1}
              />
              
              {/* Emoji button */}
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={sending}
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!currentMessage.trim() || sending}
              className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {sending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Input helper text */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span className="hidden sm:block">Press Enter to send, Shift+Enter for new line</span>
            <span className="sm:hidden">Enter to send</span>
            <span className={`${currentMessage.length > 1800 ? 'text-orange-500' : ''} ${currentMessage.length > 1950 ? 'text-red-500' : ''}`}>
              {currentMessage.length}/2000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 