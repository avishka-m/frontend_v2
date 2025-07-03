import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('wms_token'));

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('wms_token');
      if (storedToken) {
        try {
          // Verify token and get user info
          const userInfo = await authService.getCurrentUser();
          setUser(userInfo);
          setToken(storedToken);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('wms_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login({ username, password });
      
      setUser(response.user);
      setToken(response.access_token);
      // Note: localStorage is already set in authService.login()
      
      // Return success - don't throw error
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      // Throw error so LoginPage can catch it
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wms_token');
  };

  // Role-based helper functions
  const hasRole = (roles) => {
    if (!user) return false;
    const userRole = user.role;
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  };

  const isManager = () => hasRole('manager');
  const isClerk = () => hasRole('clerk');
  const isPicker = () => hasRole('picker');
  const isPacker = () => hasRole('packer');
  const isDriver = () => hasRole('driver');

  // Get allowed features based on role
  const getAllowedFeatures = () => {
    if (!user) return [];
    
    const roleFeatures = {
      manager: [
        'dashboard', 'inventory', 'orders', 'workers', 'customers', 
        'locations', 'receiving', 'picking', 'packing', 'shipping', 
        'returns', 'vehicles', 'analytics', 'ai-assistant', 'predictions'
      ],
      clerk: [
        'dashboard', 'inventory', 'orders', 'customers', 'receiving', 
        'returns', 'ai-assistant'
      ],
      picker: [
        'dashboard', 'inventory', 'orders', 'picking', 'ai-assistant'
      ],
      packer: [
        'dashboard', 'inventory', 'orders', 'packing', 'shipping', 'ai-assistant'
      ],
      driver: [
        'dashboard', 'orders', 'shipping', 'vehicles', 'ai-assistant'
      ]
    };

    return roleFeatures[user.role] || ['dashboard'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    
    // Role checks
    hasRole,
    isManager,
    isClerk,
    isPicker,
    isPacker,
    isDriver,
    
    // Feature access
    getAllowedFeatures,
    
    // User info helpers
    getUserDisplayName: () => user?.username || 'User',
    getUserRole: () => user?.role || 'Unknown',
    getWarehouseId: () => user?.warehouse_id || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
