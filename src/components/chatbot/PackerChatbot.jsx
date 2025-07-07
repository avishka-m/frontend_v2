import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Box } from 'lucide-react';

const PackerChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Packer"
      iconComponent={Box}
      gradientColors="from-purple-600 to-indigo-600"
      showAssistantSelection={false} // Regular users only see their role-specific assistant
    />
  );
};

export default PackerChatbot; 