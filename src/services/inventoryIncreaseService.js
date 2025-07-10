import { api } from './apiConfig';

export const inventoryIncreaseService = {
  // Record a new inventory increase
  recordIncrease: async (increaseData) => {
    try {
      const response = await api.post('/inventory-increases', {
        itemID: increaseData.itemID,
        item_name: increaseData.item_name,
        size: increaseData.size,
        quantity_increased: increaseData.quantity,
        reason: increaseData.reason || 'stock_arrival',
        source: increaseData.source || 'Direct Stock Update',
        reference_id: increaseData.reference_id || null,
        performed_by: increaseData.performed_by || 'system',
        notes: increaseData.notes || '',
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error recording inventory increase:', error);
      throw error;
    }
  },

  // Get all inventory increases with optional filters
  getIncreases: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.itemID) queryParams.append('itemID', params.itemID);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.reason) queryParams.append('reason', params.reason);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.skip) queryParams.append('skip', params.skip);
      
      const response = await api.get(`/inventory-increases?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory increases:', error);
      throw error;
    }
  },

  // Get increases for a specific item
  getItemIncreases: async (itemID) => {
    try {
      const response = await api.get(`/inventory-increases/item/${itemID}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching item increases:', error);
      throw error;
    }
  },

  // Get increase summary statistics
  getIncreaseSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const response = await api.get(`/inventory-increases/summary?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching increase summary:', error);
      throw error;
    }
  },

  // Batch record multiple increases
  batchRecordIncreases: async (increases) => {
    try {
      const response = await api.post('/inventory-increases/batch', {
        increases: increases.map(increase => ({
          itemID: increase.itemID,
          item_name: increase.item_name,
          size: increase.size,
          quantity_increased: increase.quantity,
          reason: increase.reason || 'stock_arrival',
          source: increase.source || 'Direct Stock Update',
          reference_id: increase.reference_id || null,
          performed_by: increase.performed_by || 'system',
          notes: increase.notes || '',
          timestamp: new Date().toISOString()
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Error batch recording inventory increases:', error);
      throw error;
    }
  }
};

export default inventoryIncreaseService;