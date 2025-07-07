import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Package } from 'lucide-react';

const ReceivingClerkChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Receiving Clerk"
      iconComponent={Package}
      gradientColors="from-green-600 to-emerald-600"
      showAssistantSelection={false} // Regular users only see their role-specific assistant
    />
  );
};

export default ReceivingClerkChatbot; 