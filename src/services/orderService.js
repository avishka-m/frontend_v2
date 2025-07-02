import { BaseService, wmsApi } from './apiConfig';

class OrderService extends BaseService {
  constructor() {
    super(wmsApi, '/orders');
  }

  // Additional order-specific methods
  getRecent(limit = 10) {
    return this.api.get(this.endpoint, { 
      params: { limit, sort: '-createdAt' } 
    });
  }

  getPending(limit = 10) {
    return this.api.get(this.endpoint, { 
      params: { status: 'pending', limit } 
    });
  }

  updateStatus(id, status) {
    return this.api.patch(`${this.endpoint}/${id}/status`, { status });
  }

  getByStatus(status, params = {}) {
    return this.api.get(this.endpoint, { 
      params: { status, ...params } 
    });
  }

  getByCustomer(customerId, params = {}) {
    return this.api.get(this.endpoint, { 
      params: { customer_id: customerId, ...params } 
    });
  }

  cancelOrder(id, reason = '') {
    return this.api.post(`${this.endpoint}/${id}/cancel`, { reason });
  }
}

export const orderService = new OrderService();
