import { wmsApi } from './apiConfig';

export const warehouseService = {
  // Receiving operations
  receiving: {
    getAll: (params) => wmsApi.get('/receiving', { params }),
    getById: (id) => wmsApi.get(`/receiving/${id}`),
    create: (data) => wmsApi.post('/receiving', data),
    update: (id, data) => wmsApi.put(`/receiving/${id}`, data),
    updateStatus: (id, status) => wmsApi.patch(`/receiving/${id}/status`, { status }),
  },

  // Picking operations
  picking: {
    getAll: (params) => wmsApi.get('/picking', { params }),
    getById: (id) => wmsApi.get(`/picking/${id}`),
    create: (data) => wmsApi.post('/picking', data),
    update: (id, data) => wmsApi.put(`/picking/${id}`, data),
    assignWorker: (id, workerId) => wmsApi.patch(`/picking/${id}/assign`, { worker_id: workerId }),
    markComplete: (id) => wmsApi.patch(`/picking/${id}/complete`),
  },

  // Packing operations
  packing: {
    getAll: (params) => wmsApi.get('/packing', { params }),
    getById: (id) => wmsApi.get(`/packing/${id}`),
    create: (data) => wmsApi.post('/packing', data),
    update: (id, data) => wmsApi.put(`/packing/${id}`, data),
    addItems: (id, items) => wmsApi.post(`/packing/${id}/items`, { items }),
    generateLabel: (id) => wmsApi.post(`/packing/${id}/label`),
  },

  // Shipping operations
  shipping: {
    getAll: (params) => wmsApi.get('/shipping', { params }),
    getById: (id) => wmsApi.get(`/shipping/${id}`),
    create: (data) => wmsApi.post('/shipping', data),
    update: (id, data) => wmsApi.put(`/shipping/${id}`, data),
    schedulePickup: (id, schedule) => wmsApi.post(`/shipping/${id}/schedule`, schedule),
    trackShipment: (id) => wmsApi.get(`/shipping/${id}/tracking`),
  },

  // Returns operations
  returns: {
    getAll: (params) => wmsApi.get('/returns', { params }),
    getById: (id) => wmsApi.get(`/returns/${id}`),
    create: (data) => wmsApi.post('/returns', data),
    update: (id, data) => wmsApi.put(`/returns/${id}`, data),
    processReturn: (id, action) => wmsApi.post(`/returns/${id}/process`, { action }),
    generateRefund: (id, amount) => wmsApi.post(`/returns/${id}/refund`, { amount }),
  },
};
