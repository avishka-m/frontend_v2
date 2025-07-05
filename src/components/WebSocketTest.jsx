import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketTest = () => {
  const [messages, setMessages] = useState([]);
  
  const { 
    connectionStatus, 
    lastMessage, 
    connectionError, 
    isConnected,
    sendMessage 
  } = useWebSocket({
    autoConnect: true,
    onMessage: (message) => {
      console.log('WebSocket test received message:', message);
      setMessages(prev => [...prev, message]);
    },
    onConnect: () => {
      console.log('WebSocket test connected');
    },
    onDisconnect: () => {
      console.log('WebSocket test disconnected');
    },
    onError: (error) => {
      console.error('WebSocket test error:', error);
    }
  });

  const handleSendPing = () => {
    sendMessage('ping');
  };

  const handleSendMessage = () => {
    sendMessage({ type: 'test', message: 'Hello from WebSocket test!' });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">WebSocket Test</h2>
      
      <div className="space-y-4">
        <div>
          <p className="font-semibold">Status: 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              connectionStatus === 'Open' ? 'bg-green-100 text-green-800' : 
              connectionStatus === 'Connecting' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </span>
          </p>
          
          {connectionError && (
            <p className="text-red-600 text-sm mt-2">Error: {connectionError}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleSendPing}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send Ping
          </button>
          
          <button 
            onClick={handleSendMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Send Test Message
          </button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Messages Received:</h3>
          <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages received yet</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded text-sm">
                  <pre>{JSON.stringify(msg, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;
