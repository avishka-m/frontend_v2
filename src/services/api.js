/**
 * API Configuration and Base Service
 * Handles all communication with the backend API
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8002/api/v1';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token and redirect to login
      localStorage.removeItem('authToken');
      // Could dispatch a logout action here
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);



export default api;

// Export convenience methods
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

// Also export as named exports object for compatibility
export const apiMethods = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
};