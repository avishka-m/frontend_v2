import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Default duration for notifications in milliseconds
const DEFAULT_DURATION = 5000;

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = useCallback(({ type, message, description, duration = DEFAULT_DURATION }) => {
    // Create a new notification
    const id = uuidv4();
    const notification = {
      id,
      type,
      message,
      description,
      duration,
      timestamp: new Date(),
    };

    // Add the notification to the state
    setNotifications((prevNotifications) => [...prevNotifications, notification]);

    // Set a timeout to remove the notification
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    // Return the notification ID in case it needs to be removed manually
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notification context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;