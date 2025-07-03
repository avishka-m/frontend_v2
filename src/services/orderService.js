import { api } from './apiConfig';

export const orderService = {
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createOrder: async (order) => {
    try {
      const response = await api.post('/orders', order);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateOrder: async (id, order) => {
    try {
      const response = await api.put(`/orders/${id}`, order);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};