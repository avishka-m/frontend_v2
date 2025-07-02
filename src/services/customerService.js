import { BaseService, wmsApi } from './apiConfig';

class CustomerService extends BaseService {
  constructor() {
    super(wmsApi, '/customers');
  }

  // Additional customer-specific methods
  searchByEmail(email) {
    return this.api.get(`${this.endpoint}/search`, { 
      params: { email } 
    });
  }

  getOrderHistory(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/orders`, { params });
  }

  updatePreferences(id, preferences) {
    return this.api.patch(`${this.endpoint}/${id}/preferences`, preferences);
  }

  getActiveCustomers(params = {}) {
    return this.api.get(this.endpoint, { 
      params: { status: 'active', ...params } 
    });
  }
}

export const customerService = new CustomerService();
