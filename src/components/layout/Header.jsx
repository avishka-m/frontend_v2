import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChatbot } from '../../hooks/useChatbot';
import {
  Bell,
  MessageCircle,
  Search,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { toggleChat } = useChatbot();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <h1 className="hidden md:block text-lg md:text-xl font-semibold text-gray-800">
          Warehouse Management System
        </h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <form onSubmit={handleSearch} className="hidden md:flex relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </form>

        <button
          onClick={toggleChat}
          className="p-2 rounded-full text-gray-700 hover:bg-gray-100 relative"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        <button
          className="p-2 rounded-full text-gray-700 hover:bg-gray-100 relative"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-sm bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {currentUser?.firstName?.charAt(0).toUpperCase() || currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="font-medium text-gray-800">
                {currentUser?.fullName || currentUser?.firstName || currentUser?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {currentUser?.role?.replace(/([A-Z])/g, ' $1').trim() || 'Staff'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  Your Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;