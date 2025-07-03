/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // In development mode, the backend bypasses authentication
      // and returns default user info
      const rolesData = await chatService.getUserRoles();
      
      setUser({
        username: rolesData.username,
        role: rolesData.role,
      });
      
      setUserRoles({
        current: rolesData.role,
        allowed: rolesData.allowed_chatbot_roles,
      });

    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setError('Failed to initialize authentication');
      
      // Set fallback user for development
      setUser({
        username: 'dev_user',
        role: 'Manager',
      });
      
      setUserRoles({
        current: 'Manager',
        allowed: ['clerk', 'picker', 'packer', 'driver', 'manager'],
      });
      
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, just reinitialize auth
      // In production, this would handle actual login
      await initializeAuth();
      
    } catch (error) {
      setError('Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserRoles(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    userRoles,
    loading,
    error,
    login,
    logout,
    refreshAuth: initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;