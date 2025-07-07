import React from 'react';
import ChatbotDashboard from './ChatbotDashboard';
import { ShoppingCart } from 'lucide-react';

const PickerChatbot = () => {
  return (
    <ChatbotDashboard 
      title="WMS Chatbot"
      role="Picker"
      iconComponent={ShoppingCart}
      gradientColors="from-primary-600 to-indigo-600"
      showAssistantSelection={false} // Regular users only see their role-specific assistant
    />
  );
};

export default PickerChatbot; 