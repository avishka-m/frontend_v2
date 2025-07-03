import { api } from './apiConfig';

export const workerService = {
  getWorkers: async (params = {}) => {
    try {
      const response = await api.get('/workers', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getWorker: async (id) => {
    try {
      const response = await api.get(`/workers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  createWorker: async (worker) => {
    try {
      const response = await api.post('/workers', worker);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateWorker: async (id, worker) => {
    try {
      const response = await api.put(`/workers/${id}`, worker);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteWorker: async (id) => {
    try {
      const response = await api.delete(`/workers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};