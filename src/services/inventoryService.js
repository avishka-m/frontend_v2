import { api } from './apiConfig';

export const inventoryService = {
  getInventory: async (params = {}) => {
    try {
      const response = await api.get('/inventory', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getInventoryItem: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: ID must be provided.");
    }

    try {
      const response = await api.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch inventory item: ${error.message}`);
    }
  },
  
  addInventoryItem: async (item) => {
    try {
      const response = await api.post('/inventory', item);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateInventoryItem: async (id, item) => {
    try {
      const response = await api.put(`/inventory/${id}`, item);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteInventoryItem: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};