import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { Truck } from 'lucide-react';

const DriverChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Driver"
      iconComponent={Truck}
      gradientColors="from-primary-600 to-blue-700"
      showAssistantSelection={false} // Regular users only see their role-specific assistant
    />
  );
};

export default DriverChatbot; 