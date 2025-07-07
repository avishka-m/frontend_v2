import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Crown, Sparkles } from 'lucide-react';

const ManagerChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Manager"
      iconComponent={Crown}
      gradientColors="from-purple-600 to-pink-600"
      showAssistantSelection={true} // Managers can select different assistants
    />
  );
};

export default ManagerChatbot; 