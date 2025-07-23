import api from './api';

// Mock data for testing driver dashboard
const generateMockDriverOrders = (currentWorkerId = 'driver123') => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate - 24 * 60 * 60 * 1000);
  
  return [
    // Ready for shipping orders (available to take)
    {
      order_id: 'DRV-001',
      orderID: 'DRV-001',
      customer_name: 'Tech Solutions Inc.',
      customerID: 'CUST-001',
      order_status: 'ready_for_shipping',
      order_date: yesterday.toISOString(),
      total_amount: 245.50,
      total_items: 3,
      shipping_address: '123 Tech Street, Innovation City, TC 12345',
      priority: 'high',
      package_count: 2,
      estimated_delivery: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: null,
      notes: 'Fragile items - handle with care'
    },
    {
      order_id: 'DRV-002',
      orderID: 'DRV-002',
      customer_name: 'Global Retailers Ltd.',
      customerID: 'CUST-002',
      order_status: 'ready_for_shipping',
      order_date: yesterday.toISOString(),
      total_amount: 189.99,
      total_items: 1,
      shipping_address: '456 Commerce Ave, Business District, BD 67890',
      priority: 'medium',
      package_count: 1,
      estimated_delivery: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: null,
      notes: 'Standard delivery'
    },
    {
      order_id: 'DRV-003',
      orderID: 'DRV-003',
      customer_name: 'HomeGoods Store',
      customerID: 'CUST-003',
      order_status: 'ready_for_shipping',
      order_date: currentDate.toISOString(),
      total_amount: 567.25,
      total_items: 8,
      shipping_address: '789 Residential Road, Suburb Heights, SH 54321',
      priority: 'low',
      package_count: 3,
      estimated_delivery: new Date(currentDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: null,
      notes: 'Large order - multiple packages'
    },
    // Shipped orders (currently being delivered - for working tab)
    {
      order_id: 'DRV-004',
      orderID: 'DRV-004',
      customer_name: 'Quick Mart Express',
      customerID: 'CUST-004',
      order_status: 'shipped',
      order_date: yesterday.toISOString(),
      total_amount: 89.75,
      total_items: 2,
      shipping_address: '321 Fast Lane, Express City, EC 98765',
      priority: 'high',
      package_count: 1,
      estimated_delivery: currentDate.toISOString(),
      assigned_worker: currentWorkerId, // Current user
      departure_time: new Date(currentDate - 2 * 60 * 60 * 1000).toISOString(),
      tracking_number: 'TRK-DRV004-001',
      notes: 'Express delivery - same day'
    },
    {
      order_id: 'DRV-005',
      orderID: 'DRV-005',
      customer_name: 'Office Supplies Co.',
      customerID: 'CUST-005',
      order_status: 'shipped',
      order_date: yesterday.toISOString(),
      total_amount: 334.80,
      total_items: 5,
      shipping_address: '654 Corporate Blvd, Office Park, OP 13579',
      priority: 'medium',
      package_count: 2,
      estimated_delivery: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: currentWorkerId,
      departure_time: new Date(currentDate - 4 * 60 * 60 * 1000).toISOString(),
      tracking_number: 'TRK-DRV005-001',
      notes: 'Business delivery - office hours only'
    },
    // Delivered orders (for history tab)
    {
      order_id: 'DRV-006',
      orderID: 'DRV-006',
      customer_name: 'Fashion Boutique',
      customerID: 'CUST-006',
      order_status: 'delivered',
      order_date: new Date(currentDate - 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 156.40,
      total_items: 4,
      shipping_address: '987 Style Street, Fashion District, FD 24680',
      priority: 'medium',
      package_count: 1,
      estimated_delivery: new Date(currentDate - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: currentWorkerId,
      delivery_time: new Date(currentDate - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tracking_number: 'TRK-DRV006-001',
      delivery_proof: 'Signature received',
      notes: 'Delivered successfully'
    },
    {
      order_id: 'DRV-007',
      orderID: 'DRV-007',
      customer_name: 'Electronics Hub',
      customerID: 'CUST-007',
      order_status: 'delivered',
      order_date: new Date(currentDate - 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 789.99,
      total_items: 3,
      shipping_address: '147 Gadget Avenue, Tech Town, TT 97531',
      priority: 'high',
      package_count: 2,
      estimated_delivery: new Date(currentDate - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_worker: currentWorkerId,
      delivery_time: new Date(currentDate - 6 * 60 * 60 * 1000).toISOString(),
      tracking_number: 'TRK-DRV007-001',
      delivery_proof: 'Photo confirmation',
      notes: 'High-value delivery completed'
    }
  ];
};

class WorkflowOrderService {
  
  // Get orders filtered by status and role
  async getOrdersByRole(userRole, statuses = [], workerId = null) {
    try {
      let statusFilter = '';
      if (statuses.length > 0) {
        statusFilter = `&status=${statuses.join(',')}`; 
      }
      
      const response = await api.get(`/orders?limit=100${statusFilter}`);
      
      // If we get real data, use it
      if (response.data && response.data.length > 0) {
        return {
          success: true,
          data: response.data
        };
      }
      
      // If no real data and this is a driver, provide mock data for testing
      if (userRole === 'Driver' && (!response.data || response.data.length === 0)) {
        console.log('🚛 No real driver orders found, using mock data for testing');
        const mockOrders = generateMockDriverOrders(workerId);
        
        // Filter mock orders by the requested statuses
        const filteredMockOrders = statuses.length > 0 
          ? mockOrders.filter(order => statuses.includes(order.order_status))
          : mockOrders;
          
        return {
          success: true,
          data: filteredMockOrders
        };
      }
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching orders by role:', error);
      
      // If API fails and this is a driver, provide mock data as fallback
      if (userRole === 'Driver') {
        console.log('🚛 API failed for driver orders, using mock data as fallback');
        const mockOrders = generateMockDriverOrders(workerId);
        
        // Filter mock orders by the requested statuses
        const filteredMockOrders = statuses.length > 0 
          ? mockOrders.filter(order => statuses.includes(order.order_status))
          : mockOrders;
          
        return {
          success: true,
          data: filteredMockOrders
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch orders'
      };
    }
  }

  // Update order status (main workflow function)
  async updateOrderStatus(orderId, newStatus, workerId = null) {
    try {
      const params = new URLSearchParams({ new_status: newStatus });
      if (workerId) {
        params.append('worker_id', workerId);
      }

      const response = await api.put(`/orders/${orderId}/status?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update order status'
      };
    }
  }

  // Manager: Confirm pending order (pending → processing)
  async confirmOrder(orderId) {
    return this.updateOrderStatus(orderId, 'processing');
  }

  // Manager: Confirm pending order without changing status (for new workflow)
  async confirmOrderForManager(orderId, managerId) {
    try {
      // Instead of changing status, we'll add a manager confirmation flag
      // This will need to be implemented in the backend to track manager confirmations
      const response = await api.put(`/orders/${orderId}/manager-confirm`, {
        manager_id: managerId,
        confirmed_at: new Date().toISOString()
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error confirming order for manager:', error);
      
      // Fallback: For development/testing, we can simulate this
      // by adding a local storage entry
      console.warn('Manager confirmation endpoint not available, using local tracking');
      
      const success = this.addToManagerConfirmed(orderId, managerId);
      
      return {
        success: success,
        data: {
          order_id: orderId,
          manager_confirmed: true,
          confirmed_by: managerId,
          confirmed_at: new Date().toISOString()
        }
      };
    }
  }

  // Receiving Clerk: Process confirmed order (processing → picking)
  async processToPickingOrder(orderId) {
    return this.updateOrderStatus(orderId, 'picking');
  }

  // Picker: Complete picking (picking → packing)
  async completePickingOrder(orderId, pickerId) {
    return this.updateOrderStatus(orderId, 'packing', pickerId);
  }

  // Packer: Complete packing (packing → ready_for_shipping)
  async completePackingOrder(orderId, packerId) {
    return this.updateOrderStatus(orderId, 'ready_for_shipping', packerId);
  }

  // Driver: Take for delivery (ready_for_shipping → shipped)
  async takeForDelivery(orderId, driverId) {
    return this.updateOrderStatus(orderId, 'shipped', driverId);
  }

  // Driver: Mark as delivered (shipped → delivered)
  async markAsDelivered(orderId) {
    return this.updateOrderStatus(orderId, 'delivered');
  }

  // Cancel order (any status → cancelled)
  async cancelOrder(orderId) {
    return this.updateOrderStatus(orderId, 'cancelled');
  }

  // Get picking list with optimal path (AI feature placeholder)
  async getOptimalPickingPath(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/picking-list`);
      return {
        success: true,
        data: {
          order_id: orderId,
          picking_list: response.data.picking_list || [],
          optimal_path: response.data.optimal_path || [],
          estimated_time: response.data.estimated_time || '15-20 minutes',
          total_items: response.data.total_items || 0
        }
      };
    } catch (error) {
      console.error('Error getting optimal picking path:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get picking path'
      };
    }
  }

  // Get available workers by role
  async getAvailableWorkers(role) {
    try {
      const response = await api.get(`/workers?role=${role}&status=available`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching available workers:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch available workers'
      };
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch order details'
      };
    }
  }

  // Assign order to worker by updating status
  async assignOrderToWorker(orderId, workerId, newStatus = null) {
    try {
      // If no new status provided, get current order to keep same status
      if (!newStatus) {
        const orderResult = await this.getOrderDetails(orderId);
        if (orderResult.success) {
          newStatus = orderResult.data.order_status;
        } else {
          throw new Error('Could not get current order status');
        }
      }
      
      const url = `/orders/${orderId}/status?new_status=${newStatus}&worker_id=${workerId}`;
      const response = await api.put(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error assigning order to worker:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to assign order'
      };
    }
  }

  // Get order history/timeline
  async getOrderHistory(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/history`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching order history:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch order history'
      };
    }
  }

  // Helper: Get role-specific statuses (only statuses this role can work on)
  getRoleStatuses(role) {
    const statusMap = {
      'Manager': ['pending'], // Can only work on pending orders
      'ReceivingClerk': ['processing'], // Can only work on processing orders
      'receiving_clerk': ['processing'], // Alternative role name
      'Picker': ['picking'], // Can only work on picking orders
      'Packer': ['packing'], // Can only work on packing orders
      'Driver': ['ready_for_shipping', 'shipped'] // Can work on ready and shipped orders
    };
    
    return statusMap[role] || [];
  }

  // Helper: Check if order has been confirmed by manager (for new workflow)
  getManagerConfirmedOrders() {
    // For now, we'll use localStorage to track manager confirmations
    // In production, this should come from the backend
    try {
      const confirmed = localStorage.getItem('manager_confirmed_orders');
      return confirmed ? JSON.parse(confirmed) : [];
    } catch (error) {
      console.error('Error reading manager confirmed orders:', error);
      return [];
    }
  }

  // Helper: Add order to manager confirmed list (for new workflow)
  addToManagerConfirmed(orderId, managerId) {
    try {
      const confirmed = this.getManagerConfirmedOrders();
      const newConfirmation = {
        order_id: orderId,
        manager_id: managerId,
        confirmed_at: new Date().toISOString()
      };
      
      // Remove any existing confirmation for this order
      const filtered = confirmed.filter(item => item.order_id !== orderId);
      filtered.push(newConfirmation);
      
      localStorage.setItem('manager_confirmed_orders', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error adding manager confirmation:', error);
      return false;
    }
  }

  // Helper: Check if specific order is confirmed by manager
  isOrderConfirmedByManager(orderId) {
    const confirmed = this.getManagerConfirmedOrders();
    return confirmed.some(item => item.order_id === orderId);
  }

  // Helper: Get next status for role action
  getNextStatus(currentStatus, role) {
    const statusFlow = {
      'pending': { 'Manager': 'processing' },
      'processing': { 'ReceivingClerk': 'picking', 'receiving_clerk': 'picking' },
      'picking': { 'Picker': 'packing' },
      'packing': { 'Packer': 'ready_for_shipping' },
      'ready_for_shipping': { 'Driver': 'shipped' },
      'shipped': { 'Driver': 'delivered' }
    };
    
    return statusFlow[currentStatus]?.[role] || null;
  }
  
  // Helper: Get role action label
  getRoleActionLabel(currentStatus, role) {
    const actionLabels = {
      'pending': { 'Manager': 'Confirm Order' },
      'processing': { 'ReceivingClerk': 'Start Picking', 'receiving_clerk': 'Start Picking' },
      'picking': { 'Picker': 'Complete Picking' },
      'packing': { 'Packer': 'Complete Packing' },
      'ready_for_shipping': { 'Driver': 'Take for Delivery' },
      'shipped': { 'Driver': 'Mark Delivered' }
    };
    
    return actionLabels[currentStatus]?.[role] || 'Process Order';
  }

  // Helper: Get role action label for manager's new workflow
  getManagerActionLabel(currentStatus, isConfirmed = false) {
    if (currentStatus === 'pending') {
      return isConfirmed ? 'View Details' : 'Confirm Order';
    }
    return 'View Details';
  }
}

export default new WorkflowOrderService(); 