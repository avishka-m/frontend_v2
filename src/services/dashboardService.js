import { analyticsService } from './analyticsService';
import { orderService } from './orderService';
import { inventoryService } from './inventoryService';

export const dashboardService = {
  // Main dashboard summary
  getSummary: () => analyticsService.getDashboardMetrics(),
  
  // Quick access to common dashboard data
  getRecentOrders: (limit = 10) => orderService.getRecent(limit),
  getLowStockItems: (limit = 10) => inventoryService.getLowStock(limit),
  getPendingTasks: (limit = 10) => orderService.getPending(limit),
  
  // Role-based dashboard stats
  getStats: (role, days = 30) => analyticsService.getDashboardMetrics(days),
  
  // Dashboard widgets data
  getKPIs: () => analyticsService.getDashboardMetrics(7), // Weekly KPIs
  getChartData: (chartType, period = '30d') => analyticsService.getTrends(chartType, period),
  
  // Quick actions
  getQuickActions: (role) => {
    // Return role-specific quick actions
    const actions = {
      Manager: ['create-order', 'view-analytics', 'manage-inventory'],
      Picker: ['view-picking-tasks', 'update-status'],
      Packer: ['view-packing-tasks', 'generate-labels'],
      Driver: ['view-deliveries', 'update-location'],
    };
    return Promise.resolve(actions[role] || []);
  },
};
