import React, { useState, useEffect } from 'react';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing...');
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Loading conversations...');
      setError(null);

      console.log('Current User:', currentUser);
      console.log('Auth Token:', localStorage.getItem('token'));

      const response = await chatbotService.getAllConversations({
        limit: 10,
        status: 'active'
      });

      console.log('API Response:', response);
      
      setConversations(response.conversations || []);
      setStatus(`✅ Success! Found ${response.conversations?.length || 0} conversations`);
      
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message);
      setStatus('❌ Failed to connect');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg m-4">
      <h2 className="text-xl font-bold mb-4">🔗 Chatbot API Connection Test</h2>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <strong>User:</strong> {currentUser?.username || 'Not logged in'}
      </div>

      <div className="mb-4">
        <strong>Auth Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
      </div>

      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        🔄 Test Again
      </button>

      {conversations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">📋 Real Conversations from MongoDB:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {conversations.map((conv, index) => (
              <div key={conv.conversation_id || index} className="p-3 bg-gray-50 rounded border">
                <div className="text-sm font-medium">ID: {conv.conversation_id}</div>
                <div className="text-sm">Title: {conv.title}</div>
                <div className="text-sm">Agent: {conv.agent_role}</div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(conv.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConnection; 