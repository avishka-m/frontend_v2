import { BaseService, wmsApi } from './apiConfig';

class InventoryService extends BaseService {
  constructor() {
    super(wmsApi, '/inventory');
  }

  // Additional inventory-specific methods
  getLowStock(limit = 10) {
    return this.api.get(this.endpoint, { 
      params: { low_stock: true, limit } 
    });
  }

  searchByCategory(category, params = {}) {
    return this.api.get(this.endpoint, { 
      params: { category, ...params } 
    });
  }

  updateStock(id, quantity) {
    return this.api.patch(`${this.endpoint}/${id}/stock`, { quantity });
  }

  getStockHistory(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/history`, { params });
  }
}

export const inventoryService = new InventoryService();
