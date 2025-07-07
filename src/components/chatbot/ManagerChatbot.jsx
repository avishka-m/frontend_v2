import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Crown, Sparkles } from 'lucide-react';

const ManagerChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Manager"
      iconComponent={Crown}
      gradientColors="from-primary-600 to-blue-600"
      showAssistantSelection={false} // Simplified interface for all users
    />
  );
};

export default ManagerChatbot; 