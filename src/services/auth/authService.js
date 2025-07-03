/**
 * Authentication Service
 * Phase 2A: Uses mock authentication for demo purposes
 * Phase 2B: Will be replaced with real backend API integration
 */

import axios from 'axios';

// NOTE: API configuration kept for Phase 2B backend integration
const API_BASE_URL = 'http://localhost:8002/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('wms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Mock login for Phase 2A (replace with real API in Phase 2B)
  async login(credentials) {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock credentials validation
    const mockUsers = {
      'demo_manager': { username: 'demo_manager', role: 'manager', id: 1 },
      'demo_picker': { username: 'demo_picker', role: 'picker', id: 2 },
      'demo_packer': { username: 'demo_packer', role: 'packer', id: 3 },
      'demo_driver': { username: 'demo_driver', role: 'driver', id: 4 },
      'demo_clerk': { username: 'demo_clerk', role: 'clerk', id: 5 }
    };

    const user = mockUsers[credentials.username];
    if (user && credentials.password === 'demo123') {
      // Generate mock JWT token
      const mockToken = `mock_jwt_${user.id}_${Date.now()}`;
      localStorage.setItem('wms_token', mockToken);
      localStorage.setItem('wms_user', JSON.stringify(user));
      
      return {
        access_token: mockToken,
        token_type: 'bearer',
        user: user
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  // Mock get current user
  async getCurrentUser() {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userStr = localStorage.getItem('wms_user');
    if (userStr) {
      return JSON.parse(userStr);
    } else {
      throw new Error('No user found');
    }
  },

  // Logout (client-side only)
  logout() {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
    return Promise.resolve();
  },

  // Mock verify token
  async verifyToken() {
    try {
      const token = localStorage.getItem('wms_token');
      const userStr = localStorage.getItem('wms_user');
      
      if (token && userStr) {
        return { valid: true, user: JSON.parse(userStr) };
      } else {
        return { valid: false, error: 'No valid token' };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
};

export default authService;
