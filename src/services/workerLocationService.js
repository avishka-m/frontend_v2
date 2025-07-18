// src/services/workerLocationService.js

import { api } from './apiConfig';

export const workerLocationService = {
  // Update worker's current location
  updateLocation: async (x, y, floor = 1, status = 'online') => {
    try {
      const response = await api.post('/worker-location/update-location', {
        x,
        y,
        floor,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating worker location:', error);
      throw error;
    }
  },

  // Get worker's current location
  getCurrentLocation: async () => {
    try {
      const response = await api.get('/worker-location/current-location');
      return response.data;
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  },

  // Set worker status
  setStatus: async (status) => {
    try {
      const response = await api.post('/worker-location/set-status', {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error setting worker status:', error);
      throw error;
    }
  },

  // Get all worker locations (for managers)
  getAllWorkersLocations: async () => {
    try {
      const response = await api.get('/worker-location/all-workers-locations');
      return response.data;
    } catch (error) {
      console.error('Error getting all worker locations:', error);
      throw error;
    }
  }
};

export default workerLocationService;