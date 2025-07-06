import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';

// Icons for different notification types
const icons = {
  success: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

const NotificationItem = ({ notification, onClose }) => {
  const { id, type, message, description, duration = 5000 } = notification;
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return; // Don't auto-dismiss if duration is 0

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Allow exit animation to complete
  };

  const bgColors = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    info: 'bg-blue-50 border-blue-300',
    warning: 'bg-yellow-50 border-yellow-300',
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
    warning: 'text-yellow-900',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  const progressColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  const buttonHoverColors = {
    success: 'hover:text-green-700 focus:ring-green-500',
    error: 'hover:text-red-700 focus:ring-red-500',
    info: 'hover:text-blue-700 focus:ring-blue-500',
    warning: 'hover:text-yellow-700 focus:ring-yellow-500',
  };

  return (
    <div 
      className={`w-full max-w-md ${bgColors[type]} shadow-xl rounded-lg pointer-events-auto border-l-4 overflow-hidden transition-all duration-300 transform ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      } hover:scale-[1.02] hover:shadow-2xl`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1.5 bg-gray-200 bg-opacity-50">
          <div 
            className={`h-full ${progressColors[type]} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Time remaining"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${iconColors[type]} mt-0.5`}>
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-base font-semibold ${textColors[type]} leading-5`}>
              {typeof message === 'string' ? message : JSON.stringify(message)}
            </p>
            {description && (
              <p className={`mt-2 text-sm ${textColors[type]} opacity-85 leading-relaxed`}>
                {typeof description === 'string' ? description : JSON.stringify(description)}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className={`inline-flex rounded-md p-1.5 ${textColors[type]} ${buttonHoverColors[type]} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 bg-transparent hover:bg-black hover:bg-opacity-5`}
              onClick={handleClose}
              aria-label="Close notification"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] w-full max-w-md pointer-events-none px-4 sm:px-0"
      role="region"
      aria-label="Notifications"
    >
      <div className="flex flex-col space-y-4">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id}
            className="pointer-events-auto transform transition-all duration-500 ease-out animate-slide-in-right"
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <NotificationItem
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
export { NotificationContainer as Notification };