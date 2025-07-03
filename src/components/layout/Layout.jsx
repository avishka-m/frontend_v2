import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useChatbot } from '../../hooks/useChatbot';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatBot from '../chatbot/ChatBot';

const Layout = () => {
  const { isChatOpen } = useChatbot();
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen size is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Add ChatBot component */}
        <ChatBot />
      </div>
    </div>
  );
};

export default Layout;