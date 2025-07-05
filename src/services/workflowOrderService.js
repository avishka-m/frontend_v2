import api from './api';

class WorkflowOrderService {
  
  // Get orders filtered by status and role
  async getOrdersByRole(userRole, statuses = []) {
    try {
      let statusFilter = '';
      if (statuses.length > 0) {
        statusFilter = `&status=${statuses.join(',')}`; 
      }
      
      const response = await api.get(`/orders?limit=100${statusFilter}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching orders by role:', error);
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
}

export default new WorkflowOrderService(); 