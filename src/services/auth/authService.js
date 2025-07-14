

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('wms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Real login: POST to /auth/token (form data)
  async login({ username, password }) {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      const response = await apiClient.post('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      // Fetch user profile
      const userResp = await apiClient.get('/auth/me');
      localStorage.setItem('wms_user', JSON.stringify(userResp.data));
      return { access_token, user: userResp.data };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  // Get current user profile from localStorage or backend
  async getCurrentUser() {
    const userStr = localStorage.getItem('wms_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    // If not in localStorage, try to fetch from backend
    try {
      const response = await apiClient.get('/auth/me');
      localStorage.setItem('wms_user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw new Error('No user found');
    }
  },

  // Logout: clear tokens and user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('wms_user');
    return Promise.resolve();
  },

  // Verify token by trying to fetch user profile
  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/me');
      return { valid: true, user: response.data };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  // Check if user is authenticated (token exists)
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
