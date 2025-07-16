import React, { Suspense, lazy } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ManagerChatbot = lazy(() => import('../../components/chatbot/ManagerChatbot'));
const ReceivingClerkChatbot = lazy(() => import('../../components/chatbot/ReceivingClerkChatbot'));
const PickerChatbot = lazy(() => import('../../components/chatbot/PickerChatbot'));
const PackerChatbot = lazy(() => import('../../components/chatbot/PackerChatbot'));
const DriverChatbot = lazy(() => import('../../components/chatbot/DriverChatbot'));

const RoleBasedChatbot = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Route users to their specific chatbot interface based on role
  const renderChatbot = () => {
    switch (currentUser.role) {
      case 'ReceivingClerk':
        return <ReceivingClerkChatbot />;
      case 'Picker':
        return <PickerChatbot />;
      case 'Packer':
        return <PackerChatbot />;
      case 'Driver':
        return <DriverChatbot />;
      case 'Manager':
        return <ManagerChatbot />;
      default:
        // Fallback for unknown roles - show basic chatbot
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white shadow rounded-lg p-6 max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                WMS Chatbot Access
              </h1>
              <p className="text-gray-600 mb-4">
                Welcome, {currentUser.name || currentUser.username}!
              </p>
              <div className="p-4 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-800">
                  Role: {currentUser.role}
                </p>
                <p className="text-sm text-yellow-800">
                  User ID: {currentUser.workerID}
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  Your role doesn't have chatbot access configured. Please contact your administrator.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      {renderChatbot()}
    </Suspense>
  );
};

export default RoleBasedChatbot; 