/**
 * Mock data utility for providing fallback data during development
 * This file contains mock dashboard statistics for different user roles
 */

/**
 * Get mock dashboard statistics based on user role
 * @param {string} role - User role (picker, packer, driver, clerk, manager, admin)
 * @returns {Object} - Mock dashboard statistics for the specified role
 */
export const getMockDashboardStats = (role) => {
  const currentDate = new Date();
  const mockData = {
    // Picker role mock data
    picker: {
      pendingPickTasks: 12,
      completedToday: 45,
      avgPickTime: '3m 24s',
      inventoryAlerts: 5,
      recentPickTasks: [
        { id: 'PT-1001', status: 'in_progress', items: 8, priority: 'high', location: 'Zone A' },
        { id: 'PT-1002', status: 'pending', items: 5, priority: 'medium', location: 'Zone B' },
        { id: 'PT-1003', status: 'pending', items: 3, priority: 'low', location: 'Zone C' }
      ]
    },
    
    // Packer role mock data
    packer: {
      pendingPackTasks: 8,
      completedToday: 32,
      avgPackTime: '4m 12s',
      materialShortages: 2,
      recentPackTasks: [
        { id: 'PK-2001', status: 'in_progress', items: 6, priority: 'high', orderType: 'express' },
        { id: 'PK-2002', status: 'pending', items: 3, priority: 'medium', orderType: 'standard' },
        { id: 'PK-2003', status: 'pending', items: 9, priority: 'low', orderType: 'bulk' }
      ]
    },
    
    // Driver role mock data
    driver: {
      pendingDeliveries: 5,
      completedToday: 12,
      avgDeliveryTime: '35m',
      routeEfficiency: '87%',
      upcomingDeliveries: [
        { id: 'D-3001', status: 'scheduled', packages: 3, distance: '5.2 km', customer: 'Tech Solutions Inc.' },
        { id: 'D-3002', status: 'ready', packages: 1, distance: '3.7 km', customer: 'Global Retailers' },
        { id: 'D-3003', status: 'preparing', packages: 5, distance: '8.1 km', customer: 'HomeGoods Store' }
      ]
    },
    
    // Clerk role mock data
    clerk: {
      pendingOrders: 18,
      processedToday: 42,
      customerInquiries: 7,
      inventoryIssues: 4,
      recentOrders: [
        { id: 'ORD-4001', status: 'processing', items: 5, customer: 'John Smith', value: '$245.50' },
        { id: 'ORD-4002', status: 'payment_verified', items: 2, customer: 'Sarah Johnson', value: '$89.99' },
        { id: 'ORD-4003', status: 'pending_verification', items: 8, customer: 'TechCorp Ltd', value: '$1,245.00' }
      ]
    },
    
    // Manager role mock data
    manager: {
      activeWorkers: 28,
      ordersFulfilled: 156,
      dailyRevenue: '$24,386.50',
      warehouseCapacity: '72%',
      performanceMetrics: {
        pickingEfficiency: 94,
        packingEfficiency: 88, 
        deliveryOnTime: 95,
        customerSatisfaction: 92
      },
      inventorySummary: {
        totalSKUs: 1458,
        lowStock: 32,
        overstock: 15,
        inTransit: 45
      }
    },
    
    // Admin role mock data
    admin: {
      systemStatus: 'Operational',
      activeUsers: 42,
      pendingAlerts: 3,
      serverLoad: '38%',
      recentActivities: [
        { id: 'ACT-6001', type: 'system_update', user: 'system', timestamp: new Date(currentDate - 3600000).toISOString() },
        { id: 'ACT-6002', type: 'user_permission_change', user: 'admin', timestamp: new Date(currentDate - 7200000).toISOString() },
        { id: 'ACT-6003', type: 'backup_completed', user: 'system', timestamp: new Date(currentDate - 14400000).toISOString() }
      ],
      systemHealth: {
        database: 'Good',
        api: 'Good',
        frontend: 'Good',
        caching: 'Warning'
      }
    }
  };
  
  // Return role-specific mock data or default data if role not found
  return mockData[role] || {
    message: 'No role-specific data available',
    timestamp: new Date().toISOString()
  };
};

export default {
  getMockDashboardStats
};