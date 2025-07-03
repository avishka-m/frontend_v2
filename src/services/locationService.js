import { api } from './apiConfig';

export const locationService = {
  getLocations: async (params = {}) => {
    try {
      const response = await api.get('/locations', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getLocation: async (id) => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};