import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

// Notification types for backward compatibility
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Notification actions
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const MARK_AS_READ = 'MARK_AS_READ';
const CLEAR_ALL = 'CLEAR_ALL';

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return [action.payload, ...state];
    
    case REMOVE_NOTIFICATION:
      return state.filter(notification => notification.id !== action.payload);
    
    case MARK_AS_READ:
      return state.map(notification => 
        notification.id === action.payload 
          ? { ...notification, read: true }
          : notification
      );
    
    case CLEAR_ALL:
      return [];
    
    default:
      return state;
  }
};

// Notification provider
export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info', // info, success, warning, error
      role: notification.role || 'all', // role-specific filtering
      timestamp: new Date(),
      read: false,
      autoHide: notification.autoHide !== false, // default true
      duration: notification.duration || 5000, // 5 seconds default
      ...notification
    };

    dispatch({ type: ADD_NOTIFICATION, payload: newNotification });

    // Auto-remove after duration if autoHide is true
    if (newNotification.autoHide) {
      setTimeout(() => {
        dispatch({ type: REMOVE_NOTIFICATION, payload: id });
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: REMOVE_NOTIFICATION, payload: id });
  }, []);

  // Mark as read
  const markAsRead = useCallback((id) => {
    dispatch({ type: MARK_AS_READ, payload: id });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: CLEAR_ALL });
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Get notifications by role
  const getNotificationsByRole = useCallback((role) => {
    return notifications.filter(n => n.role === 'all' || n.role === role);
  }, [notifications]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    getUnreadCount,
    getNotificationsByRole
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Backward compatibility - alias for the old hook name
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  // Return context with backward compatible methods
  return {
    ...context,
    // Legacy method aliases for backward compatibility
    success: (message, description) => context.addNotification({
      type: 'success',
      title: 'Success',
      message: message,
      description: description
    }),
    error: (message, description) => context.addNotification({
      type: 'error', 
      title: 'Error',
      message: message,
      description: description
    }),
    warning: (message, description) => context.addNotification({
      type: 'warning',
      title: 'Warning', 
      message: message,
      description: description
    }),
    info: (message, description) => context.addNotification({
      type: 'info',
      title: 'Info',
      message: message,
      description: description
    })
  };
};

export default NotificationContext;