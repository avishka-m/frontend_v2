import axios from "axios";

const API_BASE_URL = "http://localhost:8002/api/v1";

class RoleBasedService {
  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Receiving Clerk methods
  async getOrdersForReceivingClerk() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/receiving-clerk/orders`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for receiving clerk:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch orders",
      };
    }
  }

  async getProcessedOrdersByWorker(workerId, stage) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/receiving-clerk/processed-orders/${workerId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching processed orders:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail || "Failed to fetch processed orders",
      };
    }
  }

  async getReceivingClerkStats() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/receiving-clerk/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching receiving clerk stats:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch stats",
      };
    }
  }

  // Picker methods
  async getOrdersForPicker() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/picker/orders`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for picker:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch orders",
      };
    }
  }

  // Packer methods
  async getOrdersForPacker() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/packer/orders`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for packer:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch orders",
      };
    }
  }

  // Driver methods
  async getOrdersForDriver() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/driver/orders`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders for driver:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch orders",
      };
    }
  }

  // Get orders assigned to current user
  async getMyAssignedOrders() {
    try {
      const response = await axios.get(`${API_BASE_URL}/role-based/my-orders`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my assigned orders:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail || "Failed to fetch assigned orders",
      };
    }
  }

  // Assign order to current user
  async assignOrderToMe(orderId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/role-based/assign-order`,
        {
          order_id: orderId,
          worker_id: 0, // Will be set by backend based on current user
        },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning order:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to assign order",
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        null, // No body needed
        {
          headers: this.getAuthHeaders(),
          params: { new_status: newStatus },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update order status",
      };
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role-based/order/${orderId}/details`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch order details",
      };
    }
  }

  // Role-based order fetching helper
  async getOrdersForCurrentRole(role) {
    switch (role) {
      case "ReceivingClerk":
        return await this.getOrdersForReceivingClerk();
      case "Picker":
        return await this.getOrdersForPicker();
      case "Packer":
        return await this.getOrdersForPacker();
      case "Driver":
        return await this.getOrdersForDriver();
      case "Manager":
        // Managers can see all orders - use the regular orders API
        return await this.getAllOrders();
      default:
        return { success: false, error: "Unknown role" };
    }
  }

  // Get all orders (for managers)
  async getAllOrders() {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch orders",
      };
    }
  }

  // Get manager statistics
  async getManagerStats() {
    try {
      const orders = await this.getAllOrders();

      // Handle the response format
      let orderList = [];
      if (Array.isArray(orders)) {
        orderList = orders;
      } else if (orders.success && Array.isArray(orders.data)) {
        orderList = orders.data;
      } else {
        return { success: false, error: "Invalid response format" };
      }

      // Calculate comprehensive statistics
      const totalOrders = orderList.length;
      const pendingOrders = orderList.filter((o) =>
        ["pending", "confirmed"].includes(o.order_status)
      ).length;
      const inProgressOrders = orderList.filter((o) =>
        ["receiving", "picking", "packing", "shipping"].includes(o.order_status)
      ).length;
      const completedOrders = orderList.filter((o) =>
        ["delivered"].includes(o.order_status)
      ).length;
      const cancelledOrders = orderList.filter((o) =>
        ["cancelled"].includes(o.order_status)
      ).length;

      // Calculate orders created today
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const ordersToday = orderList.filter((o) => {
        const orderDate = new Date(o.order_date);
        return orderDate >= todayStart;
      }).length;

      // Calculate critical orders (high priority or overdue)
      const criticalOrders = orderList.filter((o) => {
        const isHighPriority = o.priority === "high" || o.priority === 1;
        const isOverdue =
          new Date(o.order_date) <
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        return (
          (isHighPriority || isOverdue) &&
          !["delivered", "cancelled"].includes(o.order_status)
        );
      }).length;

      // Calculate orders by status for detailed breakdown
      const statusBreakdown = {
        pending: orderList.filter((o) => o.order_status === "pending").length,
        confirmed: orderList.filter((o) => o.order_status === "confirmed")
          .length,
        receiving: orderList.filter((o) => o.order_status === "receiving")
          .length,
        picking: orderList.filter((o) => o.order_status === "picking").length,
        packing: orderList.filter((o) => o.order_status === "packing").length,
        shipping: orderList.filter((o) => o.order_status === "shipping").length,
        shipped: orderList.filter((o) => o.order_status === "shipped").length,
        delivered: orderList.filter((o) => o.order_status === "delivered")
          .length,
        cancelled: orderList.filter((o) => o.order_status === "cancelled")
          .length,
      };

      // Get recent orders (last 10, sorted by date)
      const sortedOrders = orderList.sort(
        (a, b) => new Date(b.order_date) - new Date(a.order_date)
      );
      const recentOrders = sortedOrders.slice(0, 10);

      return {
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          inProgressOrders,
          completedOrders,
          cancelledOrders,
          ordersToday,
          criticalOrders,
          statusBreakdown,
          recentOrders,
          averageProcessingTime: 0, // Could calculate this if we have timestamps
        },
      };
    } catch (error) {
      console.error("Error getting manager statistics:", error);
      return {
        success: false,
        error: error.message || "Failed to get manager statistics",
      };
    }
  }

  // Get status color for UI
  getStatusColor(status) {
    switch (status) {
      case "confirmed":
        return "blue";
      case "receiving":
        return "yellow";
      case "picking":
        return "orange";
      case "packing":
        return "purple";
      case "shipping":
        return "indigo";
      case "shipped":
        return "green";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  }

  // Get next status based on current status
  getNextStatus(currentStatus) {
    const statusFlow = {
      confirmed: "receiving",
      receiving: "picking",
      picking: "packing",
      packing: "shipping",
      shipping: "shipped",
      shipped: "delivered",
    };
    return statusFlow[currentStatus] || null;
  }

  // Check if user can perform action on order
  canPerformAction(userRole, orderStatus) {
    const roleActions = {
      ReceivingClerk: ["confirmed", "receiving"],
      Picker: ["picking"],
      Packer: ["packing"],
      Driver: ["shipping", "shipped"],
      Manager: [
        "confirmed",
        "receiving",
        "picking",
        "packing",
        "shipping",
        "shipped",
      ],
    };

    return roleActions[userRole]?.includes(orderStatus) || false;
  }
}

export default new RoleBasedService();
