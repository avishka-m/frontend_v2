import axios from 'axios';

const API_BASE_URL = 'http://localhost:8002/api/v1';

class RoleBasedService {
  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Receiving Clerk methods
  async getOrdersForReceivingClerk() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/receiving-clerk/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for receiving clerk:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  }

  // Picker methods
  async getOrdersForPicker() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/picker/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for picker:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  }

  // Packer methods
  async getOrdersForPacker() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/packer/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for packer:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  }

  // Driver methods
  async getOrdersForDriver() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/driver/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for driver:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  }

  // Get orders assigned to current user
  async getMyAssignedOrders() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/my-orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my assigned orders:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch assigned orders' 
      };
    }
  }

  // Assign order to current user
  async assignOrderToMe(orderId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/role-based/assign-order`, {
        order_id: orderId,
        worker_id: 0 // Will be set by backend based on current user
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning order:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to assign order' 
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await axios.post(`${API_BASE_URL}/role-based/update-order-status`, {
        order_id: orderId,
        new_status: newStatus,
        worker_id: 0 // Will be set by backend based on current user
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update order status' 
      };
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/order/${orderId}/details`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch order details' 
      };
    }
  }

  // Role-based order fetching helper
  async getOrdersForCurrentRole(role) {
    switch (role) {
      case 'ReceivingClerk':
        return await this.getOrdersForReceivingClerk();
      case 'Picker':
        return await this.getOrdersForPicker();
      case 'Packer':
        return await this.getOrdersForPacker();
      case 'Driver':
        return await this.getOrdersForDriver();
      case 'Manager':
        // Managers can see all orders - use the regular orders API
        return await this.getAllOrders();
      default:
        return { success: false, error: 'Unknown role' };
    }
  }

  // Get all orders (for managers)
  async getAllOrders() {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  }

  // Get status color for UI
  getStatusColor(status) {
    switch (status) {
      case 'confirmed':
        return 'blue';
      case 'receiving':
        return 'yellow';
      case 'picking':
        return 'orange';
      case 'packing':
        return 'purple';
      case 'shipping':
        return 'indigo';
      case 'shipped':
        return 'green';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  }

  // Get next status based on current status
  getNextStatus(currentStatus) {
    const statusFlow = {
      'confirmed': 'receiving',
      'receiving': 'picking',
      'picking': 'packing',
      'packing': 'shipping',
      'shipping': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus] || null;
  }

  // Check if user can perform action on order
  canPerformAction(userRole, orderStatus) {
    const roleActions = {
      'ReceivingClerk': ['confirmed', 'receiving'],
      'Picker': ['picking'],
      'Packer': ['packing'],
      'Driver': ['shipping', 'shipped'],
      'Manager': ['confirmed', 'receiving', 'picking', 'packing', 'shipping', 'shipped']
    };
    
    return roleActions[userRole]?.includes(orderStatus) || false;
  }
}

export default new RoleBasedService();
