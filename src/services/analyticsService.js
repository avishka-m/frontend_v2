import { wmsApi } from './apiConfig';

export const analyticsService = {
  // Core analytics endpoints
  getInventoryAnalytics: (params = {}) => wmsApi.get('/analytics/inventory', { params }),
  getOrdersAnalytics: (params = {}) => wmsApi.get('/analytics/orders', { params }),
  getWorkforceAnalytics: (params = {}) => wmsApi.get('/analytics/workforce', { params }),
  getOperationsAnalytics: (params = {}) => wmsApi.get('/analytics/operations', { params }),
  getWarehouseUtilization: (params = {}) => wmsApi.get('/analytics/warehouse-utilization', { params }),

  // Dashboard specific analytics
  getDashboardMetrics: (days = 30) => wmsApi.get('/analytics/dashboard', { params: { days } }),

  // Performance metrics
  getPerformanceMetrics: (type, period = '30d') => wmsApi.get(`/analytics/performance/${type}`, { 
    params: { period } 
  }),

  // Trend analysis
  getTrends: (metric, timeframe = '7d') => wmsApi.get(`/analytics/trends/${metric}`, { 
    params: { timeframe } 
  }),

  // Custom reports
  generateReport: (reportType, params = {}) => wmsApi.post(`/analytics/reports/${reportType}`, params),
  
  // Export functionality
  exportData: (type, format = 'csv', params = {}) => wmsApi.get(`/analytics/export/${type}`, { 
    params: { format, ...params },
    responseType: 'blob'
  }),
};
