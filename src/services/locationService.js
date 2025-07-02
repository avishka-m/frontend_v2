import { BaseService, wmsApi } from './apiConfig';

class LocationService extends BaseService {
  constructor() {
    super(wmsApi, '/locations');
  }

  // Additional location-specific methods
  getByWarehouse(warehouseId, params = {}) {
    return this.api.get(this.endpoint, { 
      params: { warehouse_id: warehouseId, ...params } 
    });
  }

  getAvailable(params = {}) {
    return this.api.get(this.endpoint, { 
      params: { status: 'available', ...params } 
    });
  }

  updateCapacity(id, capacity) {
    return this.api.patch(`${this.endpoint}/${id}/capacity`, { capacity });
  }

  getUtilization(id) {
    return this.api.get(`${this.endpoint}/${id}/utilization`);
  }
}

export const locationService = new LocationService();
