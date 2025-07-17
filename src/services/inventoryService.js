import { api } from './apiConfig';

export const inventoryService = {
  // Get all inventory items with optional filters
  getInventory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters that match backend API
      if (params.skip) queryParams.append('skip', params.skip);
      // Use reasonable limit that doesn't exceed backend maximum of 100
      if (params.limit) queryParams.append('limit', Math.min(params.limit, 100));
      if (params.category && params.category !== 'All') queryParams.append('category', params.category);
      if (params.low_stock) queryParams.append('low_stock', params.low_stock);

      const response = await api.get(`/inventory/?${queryParams.toString()}`);
      
      // Backend returns {items: [...], pagination: {...}}
      // Access the items array from the response
      const items = response.data.items || [];
      const pagination = response.data.pagination || {};
      
      // Transform backend data to frontend format for compatibility
      const transformedData = items.map(item => ({
        id: item.itemID,
        itemID: item.itemID,
        name: item.name,
        itemName: item.name, // Add compatibility field
        category: item.category,
        size: item.size,
        storage_type: item.storage_type,
        quantity: item.stock_level,
        stock_level: item.stock_level,
        current_stock: item.stock_level, // Add compatibility field
        reorderLevel: item.min_stock_level,
        min_stock_level: item.min_stock_level,
        maxStockLevel: item.max_stock_level,
        max_stock_level: item.max_stock_level,
        supplierID: item.supplierID,
        locationID: item.locationID,
        status: item.stock_level === 0 ? 'out_of_stock' : 
                item.stock_level <= item.min_stock_level ? 'low_stock' : 'active',
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Add computed fields for compatibility
        sku: `SKU-${item.itemID.toString().padStart(4, '0')}`,
        supplier: `Supplier ${item.supplierID}`,
        location: `Location ${item.locationID}`,
        unit_price: 0, // Backend doesn't have this field
        price: 0, // Add compatibility field
        last_updated: item.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));
      
      // Return both transformed items and pagination metadata
      return {
        items: transformedData,
        total: pagination.total_items || transformedData.length,
        total_pages: Math.ceil((pagination.total_items || transformedData.length) / (params.limit || 50)),
        current_page: pagination.current_page || 1,
        has_next: pagination.has_next || false,
        has_prev: pagination.has_prev || false
      };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },
  
  // Get a single inventory item by ID
  getInventoryItem: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: ID must be provided.");
    }

    try {
      const response = await api.get(`/inventory/${id}`);
      
      // Transform backend data to frontend format
      const item = response.data;
      return {
        id: item.itemID,
        itemID: item.itemID,
        name: item.name,
        itemName: item.name, // Add compatibility field
        category: item.category,
        size: item.size,
        storage_type: item.storage_type,
        quantity: item.stock_level,
        stock_level: item.stock_level,
        current_stock: item.stock_level, // Add compatibility field
        reorderLevel: item.min_stock_level,
        min_stock_level: item.min_stock_level,
        maxStockLevel: item.max_stock_level,
        max_stock_level: item.max_stock_level,
        supplierID: item.supplierID,
        locationID: item.locationID,
        status: item.stock_level === 0 ? 'out_of_stock' : 
                item.stock_level <= item.min_stock_level ? 'low_stock' : 'active',
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Add computed fields for compatibility
        sku: `SKU-${item.itemID.toString().padStart(4, '0')}`,
        supplier: `Supplier ${item.supplierID}`,
        location: `Location ${item.locationID}`,
        unit_price: 0,
        price: 0, // Add compatibility field
        last_updated: item.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error(`Error fetching inventory item with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch inventory item: ${error.message}`);
    }
  },

  // Create a new inventory item (convert frontend format to backend format)
  addInventoryItem: async (item) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: item.name,
        category: item.category,
        size: item.size || 'M',
        storage_type: item.storage_type || 'standard',
        stock_level: parseInt(item.quantity || item.stock_level || 0),
        min_stock_level: parseInt(item.reorderLevel || item.min_stock_level || 10),
        max_stock_level: parseInt(item.maxStockLevel || item.max_stock_level || 100),
        supplierID: item.supplierID || 1,
        locationID: item.locationID || 1
      };

      const response = await api.post('/inventory', backendData);
      
      // Transform response back to frontend format
      const createdItem = response.data;
      return {
        id: createdItem.itemID,
        itemID: createdItem.itemID,
        name: createdItem.name,
        category: createdItem.category,
        size: createdItem.size,
        storage_type: createdItem.storage_type,
        quantity: createdItem.stock_level,
        stock_level: createdItem.stock_level,
        reorderLevel: createdItem.min_stock_level,
        min_stock_level: createdItem.min_stock_level,
        maxStockLevel: createdItem.max_stock_level,
        max_stock_level: createdItem.max_stock_level,
        supplierID: createdItem.supplierID,
        locationID: createdItem.locationID,
        status: 'active',
        created_at: createdItem.created_at,
        updated_at: createdItem.updated_at,
        sku: `SKU-${createdItem.itemID.toString().padStart(4, '0')}`,
        supplier: `Supplier ${createdItem.supplierID}`,
        location: `Location ${createdItem.locationID}`,
        unit_price: 0,
        last_updated: createdItem.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },
  // Update an existing inventory item
  updateInventoryItem: async (id, item) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: item.name,
        category: item.category,
        size: item.size,
        storage_type: item.storage_type,
        stock_level: parseInt(item.quantity || item.stock_level || 0),
        min_stock_level: parseInt(item.reorderLevel || item.min_stock_level || 10),
        max_stock_level: parseInt(item.maxStockLevel || item.max_stock_level || 100),
        supplierID: item.supplierID,
        locationID: item.locationID
      };

      const response = await api.put(`/inventory/${id}`, backendData);
      
      // Transform response back to frontend format
      const updatedItem = response.data;
      return {
        id: updatedItem.itemID,
        itemID: updatedItem.itemID,
        name: updatedItem.name,
        category: updatedItem.category,
        size: updatedItem.size,
        storage_type: updatedItem.storage_type,
        quantity: updatedItem.stock_level,
        stock_level: updatedItem.stock_level,
        reorderLevel: updatedItem.min_stock_level,
        min_stock_level: updatedItem.min_stock_level,
        maxStockLevel: updatedItem.max_stock_level,
        max_stock_level: updatedItem.max_stock_level,
        supplierID: updatedItem.supplierID,
        locationID: updatedItem.locationID,
        status: updatedItem.stock_level === 0 ? 'out_of_stock' : 
                updatedItem.stock_level <= updatedItem.min_stock_level ? 'low_stock' : 'active',
        created_at: updatedItem.created_at,
        updated_at: updatedItem.updated_at,
        sku: `SKU-${updatedItem.itemID.toString().padStart(4, '0')}`,
        supplier: `Supplier ${updatedItem.supplierID}`,
        location: `Location ${updatedItem.locationID}`,
        unit_price: 0,
        last_updated: updatedItem.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },
  
  // Delete an inventory item
  deleteInventoryItem: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Bulk delete inventory items (fallback implementation)
  bulkDeleteInventoryItems: async (itemIds) => {
    try {
      // Since backend doesn't have bulk delete, delete items one by one
      const results = [];
      for (const id of itemIds) {
        try {
          const result = await this.deleteInventoryItem(id);
          results.push({ id, success: true, result });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      return {
        message: `Deleted ${successCount} items successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        results,
        success: failCount === 0
      };
    } catch (error) {
      console.error('Error bulk deleting inventory items:', error);
      throw error;
    }
  },

  // Get inventory categories (based on backend data structure)
  getCategories: async () => {
    try {
      // Backend doesn't have a specific categories endpoint, 
      // so we get all inventory and extract unique categories
      // Use reasonable limit and fetch multiple pages if needed
      let allInventory = [];
      let skip = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const batch = await inventoryService.getInventory({ skip, limit });
        allInventory = [...allInventory, ...batch.items];
        hasMore = batch.has_next;
        skip += limit;
        // Safety limit to prevent infinite loops
        if (skip > 1000) break;
      }

      const categories = [...new Set(allInventory.map(item => item.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      // Backend returns {items: [...], pagination: {...}}
      const items = response.data.items || [];
      return items.map(item => ({
        id: item.itemID,
        itemID: item.itemID,
        name: item.name,
        category: item.category,
        quantity: item.stock_level,
        stock_level: item.stock_level,
        reorderLevel: item.min_stock_level,
        min_stock_level: item.min_stock_level,
        status: 'low_stock',
        sku: `SKU-${item.itemID.toString().padStart(4, '0')}`,
        supplier: `Supplier ${item.supplierID}`,
        location: `Location ${item.locationID}`
      }));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Update stock level of an item
  updateStockLevel: async (itemId, quantityChange, reason = 'Manual adjustment') => {
    try {
      const response = await api.post(`/inventory/${itemId}/stock?quantity_change=${quantityChange}&reason=${encodeURIComponent(reason)}`);
      return response.data;
    } catch (error) {
      console.error('Error updating stock level:', error);
      throw error;
    }
  },

  // Transfer inventory between locations
  transferInventory: async (itemId, sourceLocationId, destinationLocationId, quantity) => {
    try {
      const response = await api.post('/inventory/transfer', null, {
        params: {
          item_id: itemId,
          source_location_id: sourceLocationId,
          destination_location_id: destinationLocationId,
          quantity: quantity
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error transferring inventory:', error);
      throw error;
    }
  },

  // Get inventory anomalies
  getInventoryAnomalies: async () => {
    try {
      const response = await api.get('/inventory/anomalies');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory anomalies:', error);
      throw error;
    }
  },

  // Get inventory statistics (computed from current data)
  getInventoryStats: async () => {
    try {
      // Get inventory data with reasonable pagination
      let allInventory = [];
      let skip = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const batch = await this.getInventory({ skip, limit });
        allInventory = [...allInventory, ...batch.items];
        hasMore = batch.has_next;
        skip += limit;
        // Safety limit to prevent infinite loops
        if (skip > 1000) break;
      }

      const lowStockItems = await this.getLowStockItems();
      
      const stats = {
        total_items: allInventory.length,
        low_stock_items: lowStockItems.length,
        out_of_stock_items: allInventory.filter(item => item.stock_level === 0).length,
        total_stock_value: allInventory.reduce((sum, item) => sum + (item.stock_level * (item.unit_price || 0)), 0),
        categories: [...new Set(allInventory.map(item => item.category))].length,
        avg_stock_level: Math.round(allInventory.reduce((sum, item) => sum + item.stock_level, 0) / allInventory.length)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  },

  // Note: Export and Import functionality may not be available in backend
  // These are kept for frontend compatibility but will likely fail
  exportInventory: async (format = 'csv') => {
    try {
      const response = await api.get(`/inventory/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting inventory:', error);
      // Fallback: create CSV from current data with pagination
      let inventory = [];
      let skip = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const batch = await this.getInventory({ skip, limit });
        inventory = [...inventory, ...batch.items];
        hasMore = batch.has_next;
        skip += limit;
        // Safety limit to prevent infinite loops
        if (skip > 1000) break;
      }

      const csvContent = this.convertToCSV(inventory);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return blob;
    }
  },

  // Helper function to convert data to CSV
  convertToCSV: (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = ['ID', 'Name', 'Category', 'Size', 'Stock Level', 'Min Stock', 'Max Stock', 'Supplier ID', 'Location ID', 'Storage Type'];
    const rows = data.map(item => [
      item.itemID,
      item.name,
      item.category,
      item.size,
      item.stock_level,
      item.min_stock_level,
      item.max_stock_level,
      item.supplierID,
      item.locationID,
      item.storage_type
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  },

  // Import inventory data
  importInventory: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/inventory/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing inventory:', error);
      throw new Error('Import functionality may not be available in the backend.');
    }
  },

  // Alias for getInventory to maintain compatibility with CreateOrder component
  getItems: async (params = {}) => {
    return await inventoryService.getInventory(params);
  }
};

export default inventoryService;