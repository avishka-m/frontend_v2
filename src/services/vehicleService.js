import { BaseService, wmsApi } from './apiConfig';

class VehicleService extends BaseService {
  constructor() {
    super(wmsApi, '/vehicles');
  }

  // Additional vehicle-specific methods
  getAvailable(params = {}) {
    return this.api.get(this.endpoint, { 
      params: { status: 'available', ...params } 
    });
  }

  assignDriver(id, driverId) {
    return this.api.patch(`${this.endpoint}/${id}/driver`, { driver_id: driverId });
  }

  updateLocation(id, location) {
    return this.api.patch(`${this.endpoint}/${id}/location`, location);
  }

  getMaintenanceHistory(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/maintenance`, { params });
  }

  scheduleMaintenance(id, maintenance) {
    return this.api.post(`${this.endpoint}/${id}/maintenance`, maintenance);
  }

  getDeliveryHistory(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/deliveries`, { params });
  }
}

export const vehicleService = new VehicleService();
