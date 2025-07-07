import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Package } from 'lucide-react';

const ReceivingClerkChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Receiving Clerk"
      iconComponent={Package}
      gradientColors="from-primary-500 to-blue-500"
      showAssistantSelection={false} // Regular users only see their role-specific assistant
    />
  );
};

export default ReceivingClerkChatbot; 