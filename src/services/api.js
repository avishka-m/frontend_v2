import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
const api1 = axios.create({
  baseURL: 'http://localhost:8001/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
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

// Add response interceptor for error handling
api.interceptors.response.use(
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

// Auth services
export const authService = {
  login: (credentials) => {
    // Convert to form data format as required by FastAPI's token endpoint
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Inventory services
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Order services
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Worker services
export const workerService = {
  getAll: (params) => api.get('/workers', { params }),
  getById: (id) => api.get(`/workers/${id}`),
  create: (data) => api.post('/workers', data),
  update: (id, data) => api.put(`/workers/${id}`, data),
  delete: (id) => api.delete(`/workers/${id}`),
};

// Customer services
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Location services
export const locationService = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

// Warehouse operation services
export const warehouseService = {
  // Receiving
  getReceivingAll: (params) => api.get('/receiving', { params }),
  getReceivingById: (id) => api.get(`/receiving/${id}`),
  createReceiving: (data) => api.post('/receiving', data),
  
  // Picking
  getPickingAll: (params) => api.get('/picking', { params }),
  getPickingById: (id) => api.get(`/picking/${id}`),
  createPicking: (data) => api.post('/picking', data),
  
  // Packing
  getPackingAll: (params) => api.get('/packing', { params }),
  getPackingById: (id) => api.get(`/packing/${id}`),
  createPacking: (data) => api.post('/packing', data),
  
  // Shipping
  getShippingAll: (params) => api.get('/shipping', { params }),
  getShippingById: (id) => api.get(`/shipping/${id}`),
  createShipping: (data) => api.post('/shipping', data),
  
  // Returns
  getReturnsAll: (params) => api.get('/returns', { params }),
  getReturnsById: (id) => api.get(`/returns/${id}`),
  createReturns: (data) => api.post('/returns', data),
};

// Vehicle services
export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Analytics services
export const analyticsService = {
  getInventoryAnalytics: () => api.get('/analytics/inventory'),
  getOrdersAnalytics: () => api.get('/analytics/orders'),
  getWorkforceAnalytics: () => api.get('/analytics/workforce'),
};

// Dashboard services
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getLowStockItems: () => api.get('/dashboard/low-stock'),
  getPendingTasks: () => api.get('/dashboard/pending-tasks'),
};

// Chatbot services
export const chatbotService = {
  // Create a new conversation
  createConversation: (data) => api1.post('/api/conversations', data),
  // Send a chat message
  chat: (data) => api1.post('/api/chat', data),
  // Get all user conversations
  getUserConversations: () => api1.get('/api/conversations'),
  // Get a specific conversation by ID
  getConversationById: (conversationId) => api1.get(`/api/conversations/${conversationId}`),
  // Update conversation metadata (title)
  updateConversation: (conversationId, data) => api1.put(`/api/conversations/${conversationId}`, data),
  // Delete a conversation
  deleteConversation: (conversationId) => api1.delete(`/api/conversations/${conversationId}`),
  // Get current user's allowed chatbot roles
  getUserRole: () => api1.get('/api/user/role'),
};

export default api; 