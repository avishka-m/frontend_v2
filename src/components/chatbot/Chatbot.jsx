import React, { useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useAuth } from '../../hooks/useAuth';

const ChatBot = () => {
  const { currentUser } = useAuth();
  const { messages, loading, error, isChatOpen, sendMessage, toggleChat } = useChatbot();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = inputRef.current.value.trim();
    if (!message) return;

    try {
      await sendMessage(message);
      inputRef.current.value = '';
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Warehouse Assistant</h3>
        <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-900">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-600 rounded-lg p-3">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-primary-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;