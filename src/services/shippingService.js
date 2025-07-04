import api from './api';

/**
 * Shipping Service
 * 
 * Handles all shipping-related API operations with proper error handling,
 * data transformation, and validation.
 */

// Shipping status constants
export const SHIPPING_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered'
};

// Shipping method constants
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SAME_DAY: 'same_day',
  OVERNIGHT: 'overnight'
};

/**
 * Transform shipping data from backend format to frontend format
 */
const transformShippingData = (shipping) => {
  if (!shipping) return null;
  
  return {
    id: shipping.shippingID,
    shippingId: shipping.shippingID,
    orderId: shipping.orderID,
    workerId: shipping.workerID,
    shipDate: shipping.ship_date,
    status: shipping.status,
    shippingMethod: shipping.shipping_method,
    trackingNumber: shipping.tracking_number,
    estimatedDelivery: shipping.estimated_delivery,
    packingIds: shipping.packingIDs || [],
    vehicleId: shipping.vehicleID,
    departureTime: shipping.departure_time,
    actualDelivery: shipping.actual_delivery,
    notes: shipping.notes,
    deliveryProof: shipping.delivery_proof,
    deliveryAddress: shipping.delivery_address,
    recipientName: shipping.recipient_name,
    recipientPhone: shipping.recipient_phone,
    createdAt: shipping.created_at,
    updatedAt: shipping.updated_at
  };
};

/**
 * Transform shipping data from frontend format to backend format
 */
const transformShippingForBackend = (shipping) => {
  return {
    orderID: shipping.orderId,
    workerID: shipping.workerId,
    ship_date: shipping.shipDate,
    shipping_method: shipping.shippingMethod,
    estimated_delivery: shipping.estimatedDelivery,
    packingIDs: shipping.packingIds || [],
    vehicleID: shipping.vehicleId
  };
};

/**
 * Handle API response and errors
 */
const handleApiResponse = (response) => {
  return response.data;
};

/**
 * Validate shipping data
 */
const validateShippingData = (shipping) => {
  const errors = {};
  
  if (!shipping.orderId) {
    errors.orderId = 'Order ID is required';
  }
  
  if (!shipping.workerId) {
    errors.workerId = 'Worker ID is required';
  }
  
  if (!shipping.shippingMethod?.trim()) {
    errors.shippingMethod = 'Shipping method is required';
  }
  
  if (!shipping.packingIds || shipping.packingIds.length === 0) {
    errors.packingIds = 'At least one packing ID is required';
  }
  
  if (shipping.estimatedDelivery && new Date(shipping.estimatedDelivery) <= new Date()) {
    errors.estimatedDelivery = 'Estimated delivery must be in the future';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate delivery data
 */
const validateDeliveryData = (delivery) => {
  const errors = {};
  
  if (!delivery.deliveryProof?.trim()) {
    errors.deliveryProof = 'Delivery proof is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Shipping Service Class
 */
class ShippingService {
  /**
   * Get all shipping records with optional filtering
   */
  async getShippings(filters = {}) {
    try {
      const params = {};
      
      if (filters.skip) params.skip = filters.skip;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.orderId) params.order_id = filters.orderId;
      if (filters.workerId) params.worker_id = filters.workerId;
      
      const response = await api.get('/shipping', { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data.map(transformShippingData) : [],
        count: data.length
      };
    } catch (error) {
      console.error('Error fetching shipping records:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch shipping records',
        data: []
      };
    }
  }

  /**
   * Get a specific shipping record by ID
   */
  async getShipping(shippingId) {
    try {
      if (!shippingId) {
        throw new Error('Shipping ID is required');
      }
      
      const response = await api.get(`/shipping/${shippingId}`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformShippingData(data)
      };
    } catch (error) {
      console.error('Error fetching shipping record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch shipping record'
      };
    }
  }

  /**
   * Create a new shipping record
   */
  async createShipping(shippingData) {
    try {
      // Validate shipping data
      const validation = validateShippingData(shippingData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const response = await api.post('/shipping/', transformShippingForBackend(shippingData));
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformShippingData(data),
        message: 'Shipping record created successfully'
      };
    } catch (error) {
      console.error('Error creating shipping record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to create shipping record'
      };
    }
  }

  /**
   * Update a shipping record
   */
  async updateShipping(shippingId, shippingData) {
    try {
      if (!shippingId) {
        throw new Error('Shipping ID is required');
      }
      
      const updateData = {};
      if (shippingData.status) updateData.status = shippingData.status;
      if (shippingData.trackingNumber) updateData.tracking_number = shippingData.trackingNumber;
      if (shippingData.estimatedDelivery) updateData.estimated_delivery = shippingData.estimatedDelivery;
      if (shippingData.actualDelivery) updateData.actual_delivery = shippingData.actualDelivery;
      if (shippingData.vehicleId) updateData.vehicleID = shippingData.vehicleId;
      if (shippingData.notes) updateData.notes = shippingData.notes;
      if (shippingData.deliveryProof) updateData.delivery_proof = shippingData.deliveryProof;
      
      const response = await api.put(`/shipping/${shippingId}`, updateData);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformShippingData(data),
        message: 'Shipping record updated successfully'
      };
    } catch (error) {
      console.error('Error updating shipping record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to update shipping record'
      };
    }
  }

  /**
   * Dispatch a shipment
   */
  async dispatchShipping(shippingId, dispatchData) {
    try {
      if (!shippingId) {
        throw new Error('Shipping ID is required');
      }
      
      if (!dispatchData.vehicleId) {
        throw new Error('Vehicle ID is required for dispatch');
      }
      
      const params = { vehicle_id: dispatchData.vehicleId };
      const trackingInfo = dispatchData.trackingInfo || {};
      
      const response = await api.post(`/shipping/${shippingId}/dispatch`, trackingInfo, { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformShippingData(data),
        message: 'Shipment dispatched successfully'
      };
    } catch (error) {
      console.error('Error dispatching shipment:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to dispatch shipment'
      };
    }
  }

  /**
   * Mark shipment as delivered
   */
  async deliverShipping(shippingId, deliveryData) {
    try {
      if (!shippingId) {
        throw new Error('Shipping ID is required');
      }
      
      // Validate delivery data
      const validation = validateDeliveryData(deliveryData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const params = {
        delivery_proof: deliveryData.deliveryProof
      };
      
      if (deliveryData.notes) {
        params.notes = deliveryData.notes;
      }
      
      const response = await api.post(`/shipping/${shippingId}/deliver`, null, { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformShippingData(data),
        message: 'Shipment marked as delivered successfully'
      };
    } catch (error) {
      console.error('Error marking shipment as delivered:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to mark shipment as delivered'
      };
    }
  }

  /**
   * Get tracking information for a shipment
   */
  async getTrackingInfo(shippingId) {
    try {
      if (!shippingId) {
        throw new Error('Shipping ID is required');
      }
      
      const response = await api.get(`/shipping/${shippingId}/tracking`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: {
          shippingId: data.shippingID,
          orderId: data.orderID,
          status: data.status,
          trackingNumber: data.tracking_number,
          shippedAt: data.shipped_at,
          estimatedDelivery: data.estimated_delivery,
          deliveryAddress: data.delivery_address,
          trackingHistory: data.tracking_history || [],
          deliveredAt: data.delivered_at,
          deliveryProof: data.delivery_proof
        }
      };
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch tracking information'
      };
    }
  }

  /**
   * Get shipping statistics
   */
  async getShippingStats(filters = {}) {
    try {
      const result = await this.getShippings(filters);
      
      if (!result.success) {
        return result;
      }
      
      const shippings = result.data;
      
      const stats = {
        total: shippings.length,
        pending: shippings.filter(s => s.status === SHIPPING_STATUS.PENDING).length,
        inTransit: shippings.filter(s => s.status === SHIPPING_STATUS.IN_TRANSIT).length,
        delivered: shippings.filter(s => s.status === SHIPPING_STATUS.DELIVERED).length,
        byMethod: {},
        averageDeliveryTime: 0
      };
      
      // Count by shipping method
      shippings.forEach(shipping => {
        const method = shipping.shippingMethod;
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;
      });
      
      // Calculate average delivery time for delivered shipments
      const deliveredShipments = shippings.filter(s => 
        s.status === SHIPPING_STATUS.DELIVERED && 
        s.departureTime && 
        s.actualDelivery
      );
      
      if (deliveredShipments.length > 0) {
        const totalTime = deliveredShipments.reduce((sum, shipping) => {
          const departure = new Date(shipping.departureTime);
          const delivery = new Date(shipping.actualDelivery);
          return sum + (delivery - departure);
        }, 0);
        
        stats.averageDeliveryTime = Math.round(totalTime / deliveredShipments.length / (1000 * 60 * 60)); // Hours
      }
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting shipping stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get shipping statistics'
      };
    }
  }

  /**
   * Get shipments for a specific driver
   */
  async getDriverShipments(workerId, filters = {}) {
    try {
      const allFilters = { ...filters, workerId };
      return await this.getShippings(allFilters);
    } catch (error) {
      console.error('Error fetching driver shipments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch driver shipments',
        data: []
      };
    }
  }

  /**
   * Get shipments for a specific order
   */
  async getOrderShipments(orderId) {
    try {
      return await this.getShippings({ orderId });
    } catch (error) {
      console.error('Error fetching order shipments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order shipments',
        data: []
      };
    }
  }
}

// Export singleton instance
export const shippingService = new ShippingService();
export default shippingService;
