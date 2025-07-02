import { BaseService, wmsApi } from './apiConfig';

class WorkerService extends BaseService {
  constructor() {
    super(wmsApi, '/workers');
  }

  // Additional worker-specific methods
  getByRole(role, params = {}) {
    return this.api.get(this.endpoint, { 
      params: { role, ...params } 
    });
  }

  updateRole(id, role) {
    return this.api.patch(`${this.endpoint}/${id}/role`, { role });
  }

  getWorkSchedule(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/schedule`, { params });
  }

  updateSchedule(id, schedule) {
    return this.api.put(`${this.endpoint}/${id}/schedule`, schedule);
  }

  getPerformanceMetrics(id, params = {}) {
    return this.api.get(`${this.endpoint}/${id}/performance`, { params });
  }
}

export const workerService = new WorkerService();
