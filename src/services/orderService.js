import { api } from './apiConfig';

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PICKING: 'picking',
  PACKING: 'packing',
  READY_FOR_SHIPPING: 'ready_for_shipping',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
  CANCELLED: 'cancelled'
};

// Order priority constants
export const ORDER_PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

// Order status display names
export const ORDER_STATUS_DISPLAY = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.PICKING]: 'Picking',
  [ORDER_STATUS.PACKING]: 'Packing',
  [ORDER_STATUS.READY_FOR_SHIPPING]: 'Ready for Shipping',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.RETURNED]: 'Returned',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

// Order priority display names
export const ORDER_PRIORITY_DISPLAY = {
  [ORDER_PRIORITY.HIGH]: 'High',
  [ORDER_PRIORITY.MEDIUM]: 'Medium',
  [ORDER_PRIORITY.LOW]: 'Low'
};

// Order status colors for UI
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PICKING]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.PACKING]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUS.READY_FOR_SHIPPING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUS.SHIPPED]: 'bg-cyan-100 text-cyan-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.RETURNED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
};

// Order priority colors for UI
export const ORDER_PRIORITY_COLORS = {
  [ORDER_PRIORITY.HIGH]: 'bg-red-100 text-red-800',
  [ORDER_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [ORDER_PRIORITY.LOW]: 'bg-green-100 text-green-800'
};

export const orderService = {
  // Get all orders with optional filters
  getOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters that match backend API
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);

      const response = await api.get(`/api/v1/orders?${queryParams.toString()}`);
      
      // Transform backend data to frontend format for compatibility
      const transformedData = response.data.map(order => ({
        id: order.orderID,
        orderID: order.orderID,
        customerID: order.customerID,
        order_date: order.order_date,
        shipping_address: order.shipping_address,
        order_status: order.order_status,
        priority: order.priority,
        notes: order.notes,
        items: order.items || [],
        total_amount: order.total_amount,
        assigned_worker: order.assigned_worker,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Add computed fields for compatibility
        status: order.order_status,
        status_display: ORDER_STATUS_DISPLAY[order.order_status] || order.order_status,
        priority_display: ORDER_PRIORITY_DISPLAY[order.priority] || 'Unknown',
        status_color: ORDER_STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800',
        priority_color: ORDER_PRIORITY_COLORS[order.priority] || 'bg-gray-100 text-gray-800',
        order_date_formatted: order.order_date ? new Date(order.order_date).toLocaleDateString() : '',
        items_count: order.items ? order.items.length : 0,
        items_total_quantity: order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
        is_fulfilled: order.items ? order.items.every(item => item.fulfilled_quantity >= item.quantity) : false,
        customer_name: `Customer ${order.customerID}`, // Would come from customer service in real app
        worker_name: order.assigned_worker ? `Worker ${order.assigned_worker}` : 'Unassigned'
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  // Get a single order by ID
  getOrder: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: ID must be provided.");
    }

    try {
      const response = await api.get(`/api/v1/orders/${id}`);
      
      // Transform backend data to frontend format
      const order = response.data;
      return {
        id: order.orderID,
        orderID: order.orderID,
        customerID: order.customerID,
        order_date: order.order_date,
        shipping_address: order.shipping_address,
        order_status: order.order_status,
        priority: order.priority,
        notes: order.notes,
        items: order.items || [],
        total_amount: order.total_amount,
        assigned_worker: order.assigned_worker,
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Add computed fields for compatibility
        status: order.order_status,
        status_display: ORDER_STATUS_DISPLAY[order.order_status] || order.order_status,
        priority_display: ORDER_PRIORITY_DISPLAY[order.priority] || 'Unknown',
        status_color: ORDER_STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800',
        priority_color: ORDER_PRIORITY_COLORS[order.priority] || 'bg-gray-100 text-gray-800',
        order_date_formatted: order.order_date ? new Date(order.order_date).toLocaleDateString() : '',
        items_count: order.items ? order.items.length : 0,
        items_total_quantity: order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
        is_fulfilled: order.items ? order.items.every(item => item.fulfilled_quantity >= item.quantity) : false,
        customer_name: `Customer ${order.customerID}`, // Would come from customer service in real app
        worker_name: order.assigned_worker ? `Worker ${order.assigned_worker}` : 'Unassigned'
      };
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  },

  // Create a new order (convert frontend format to backend format)
  createOrder: async (order) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        customerID: order.customerID,
        shipping_address: order.shipping_address,
        order_status: order.order_status || ORDER_STATUS.PENDING,
        priority: order.priority || ORDER_PRIORITY.LOW,
        notes: order.notes || '',
        items: order.items.map(item => ({
          itemID: item.itemID,
          quantity: item.quantity,
          price: item.price || 0
        }))
      };

      const response = await api.post('/api/v1/orders', backendData);
      
      // Transform response back to frontend format
      const createdOrder = response.data;
      return {
        id: createdOrder.orderID,
        orderID: createdOrder.orderID,
        customerID: createdOrder.customerID,
        order_date: createdOrder.order_date,
        shipping_address: createdOrder.shipping_address,
        order_status: createdOrder.order_status,
        priority: createdOrder.priority,
        notes: createdOrder.notes,
        items: createdOrder.items || [],
        total_amount: createdOrder.total_amount,
        assigned_worker: createdOrder.assigned_worker,
        created_at: createdOrder.created_at,
        updated_at: createdOrder.updated_at,
        status: createdOrder.order_status,
        status_display: ORDER_STATUS_DISPLAY[createdOrder.order_status] || createdOrder.order_status,
        priority_display: ORDER_PRIORITY_DISPLAY[createdOrder.priority] || 'Unknown',
        status_color: ORDER_STATUS_COLORS[createdOrder.order_status] || 'bg-gray-100 text-gray-800',
        priority_color: ORDER_PRIORITY_COLORS[createdOrder.priority] || 'bg-gray-100 text-gray-800',
        order_date_formatted: createdOrder.order_date ? new Date(createdOrder.order_date).toLocaleDateString() : '',
        items_count: createdOrder.items ? createdOrder.items.length : 0,
        items_total_quantity: createdOrder.items ? createdOrder.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
        customer_name: `Customer ${createdOrder.customerID}`,
        worker_name: createdOrder.assigned_worker ? `Worker ${createdOrder.assigned_worker}` : 'Unassigned'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update an existing order
  updateOrder: async (id, order) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        order_status: order.order_status || order.status,
        shipping_address: order.shipping_address,
        priority: order.priority,
        notes: order.notes
      };

      const response = await api.put(`/api/v1/orders/${id}`, backendData);
      
      // Transform response back to frontend format
      const updatedOrder = response.data;
      return {
        id: updatedOrder.orderID,
        orderID: updatedOrder.orderID,
        customerID: updatedOrder.customerID,
        order_date: updatedOrder.order_date,
        shipping_address: updatedOrder.shipping_address,
        order_status: updatedOrder.order_status,
        priority: updatedOrder.priority,
        notes: updatedOrder.notes,
        items: updatedOrder.items || [],
        total_amount: updatedOrder.total_amount,
        assigned_worker: updatedOrder.assigned_worker,
        created_at: updatedOrder.created_at,
        updated_at: updatedOrder.updated_at,
        status: updatedOrder.order_status,
        status_display: ORDER_STATUS_DISPLAY[updatedOrder.order_status] || updatedOrder.order_status,
        priority_display: ORDER_PRIORITY_DISPLAY[updatedOrder.priority] || 'Unknown',
        status_color: ORDER_STATUS_COLORS[updatedOrder.order_status] || 'bg-gray-100 text-gray-800',
        priority_color: ORDER_PRIORITY_COLORS[updatedOrder.priority] || 'bg-gray-100 text-gray-800',
        order_date_formatted: updatedOrder.order_date ? new Date(updatedOrder.order_date).toLocaleDateString() : '',
        items_count: updatedOrder.items ? updatedOrder.items.length : 0,
        items_total_quantity: updatedOrder.items ? updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
        is_fulfilled: updatedOrder.items ? updatedOrder.items.every(item => item.fulfilled_quantity >= item.quantity) : false,
        customer_name: `Customer ${updatedOrder.customerID}`,
        worker_name: updatedOrder.assigned_worker ? `Worker ${updatedOrder.assigned_worker}` : 'Unassigned'
      };
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },
  
  // Delete an order
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/api/v1/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const response = await api.get('/api/v1/orders?limit=1000'); // Get all orders for stats
      const orders = response.data;
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.order_status === ORDER_STATUS.PENDING).length,
        processing: orders.filter(o => o.order_status === ORDER_STATUS.PROCESSING).length,
        picking: orders.filter(o => o.order_status === ORDER_STATUS.PICKING).length,
        packing: orders.filter(o => o.order_status === ORDER_STATUS.PACKING).length,
        shipped: orders.filter(o => o.order_status === ORDER_STATUS.SHIPPED).length,
        delivered: orders.filter(o => o.order_status === ORDER_STATUS.DELIVERED).length,
        cancelled: orders.filter(o => o.order_status === ORDER_STATUS.CANCELLED).length,
        high_priority: orders.filter(o => o.priority === ORDER_PRIORITY.HIGH).length,
        medium_priority: orders.filter(o => o.priority === ORDER_PRIORITY.MEDIUM).length,
        low_priority: orders.filter(o => o.priority === ORDER_PRIORITY.LOW).length,
        total_value: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        avg_order_value: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length : 0
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  // Assign worker to order
  assignWorker: async (orderId, workerId) => {
    try {
      const response = await api.put(`/api/v1/orders/${orderId}/assign-worker`, {
        worker_id: workerId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning worker:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const response = await api.put(`/api/v1/orders/${orderId}/status`, {
        status: newStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};