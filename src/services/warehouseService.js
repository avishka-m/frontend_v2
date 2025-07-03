import { api } from './apiConfig';

export const warehouseService = {
  // Picking Operations
  getPickingTasks: async (params = {}) => {
    try {
      const response = await api.get('/picking', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createPickingTask: async (task) => {
    try {
      const response = await api.post('/picking', task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updatePickingTask: async (id, task) => {
    try {
      const response = await api.put(`/picking/${id}`, task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Packing Operations
  getPackingTasks: async (params = {}) => {
    try {
      const response = await api.get('/packing', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createPackingTask: async (task) => {
    try {
      const response = await api.post('/packing', task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updatePackingTask: async (id, task) => {
    try {
      const response = await api.put(`/packing/${id}`, task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Shipping Operations
  getShippingTasks: async (params = {}) => {
    try {
      const response = await api.get('/shipping', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createShippingTask: async (task) => {
    try {
      const response = await api.post('/shipping', task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateShippingTask: async (id, task) => {
    try {
      const response = await api.put(`/shipping/${id}`, task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Returns Operations
  getReturns: async (params = {}) => {
    try {
      const response = await api.get('/returns', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  processReturn: async (returnData) => {
    try {
      const response = await api.post('/returns', returnData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};