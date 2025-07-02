import axios from 'axios';

// Create main WMS API instance
export const wmsApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create chatbot API instance
export const chatbotApi = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8001/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication to main API
wmsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling to main API
wmsApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add request interceptor for chatbot API (if needed)
chatbotApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Base service class for common CRUD operations
export class BaseService {
  constructor(apiInstance, endpoint) {
    this.api = apiInstance;
    this.endpoint = endpoint;
  }

  getAll(params = {}) {
    return this.api.get(this.endpoint, { params });
  }

  getById(id) {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  create(data) {
    return this.api.post(this.endpoint, data);
  }

  update(id, data) {
    return this.api.put(`${this.endpoint}/${id}`, data);
  }

  delete(id) {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}
