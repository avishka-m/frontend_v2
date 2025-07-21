import api from './api';

/**
 * Returns Service
 * 
 * Handles all returns-related API operations with proper error handling,
 * data transformation, and validation.
 */

// Returns status constants
export const RETURNS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Returns method constants
export const RETURNS_METHODS = {
  CUSTOMER_DROP_OFF: 'customer_drop_off',
  MAIL_RETURN: 'mail_return',
  PICKUP: 'pickup'
};

// Return reason constants
export const RETURN_REASONS = {
  DEFECTIVE: 'Defective',
  WRONG_SIZE: 'Wrong size',
  WRONG_ITEM: 'Wrong item',
  NOT_AS_DESCRIBED: 'Not as described',
  DAMAGED_SHIPPING: 'Damaged in shipping',
  CUSTOMER_CHANGED_MIND: 'Customer changed mind',
  QUALITY_ISSUES: 'Quality issues',
  OTHER: 'Other'
};

// Item condition constants
export const ITEM_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'damaged',
  DEFECTIVE: 'defective'
};

// Refund status constants
export const REFUND_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  DENIED: 'denied'
};

/**
 * Transform returns data from backend format to frontend format
 */
const transformReturnsData = (returns) => {
  if (!returns) return null;
  
  return {
    id: returns._id,
    returnId: returns.returnID,
    orderId: returns.orderID,
    customerId: returns.customerID,
    workerId: returns.workerID,
    returnDate: returns.return_date,
    status: returns.status,
    returnMethod: returns.return_method,
    items: returns.items?.map(item => ({
      id: item._id,
      itemId: item.itemID,
      orderDetailId: item.orderDetailID,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition,
      processed: item.processed,
      resellable: item.resellable,
      locationId: item.locationID,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [],
    notes: returns.notes,
    refundAmount: returns.refund_amount,
    refundStatus: returns.refund_status,
    refundDate: returns.refund_date,
    createdAt: returns.created_at,
    updatedAt: returns.updated_at,
    // Computed fields
    isComplete: returns.items ? returns.items.every(item => item.processed) : false,
    itemsCount: returns.items ? returns.items.length : 0,
    totalQuantity: returns.items ? returns.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
    resellableQuantity: returns.items ? returns.items.filter(item => item.resellable).reduce((sum, item) => sum + item.quantity, 0) : 0
  };
};

/**
 * Transform returns data from frontend format to backend format
 */
const transformReturnsForBackend = (returns) => {
  return {
    orderID: returns.orderId,
    customerID: returns.customerId,
    workerID: returns.workerId,
    return_date: returns.returnDate,
    status: returns.status,
    return_method: returns.returnMethod,
    items: returns.items?.map(item => ({
      itemID: item.itemId,
      orderDetailID: item.orderDetailId,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition,
      notes: item.notes
    })) || [],
    notes: returns.notes
  };
};

/**
 * Handle API response and errors
 */
const handleApiResponse = (response) => {
  return response.data;
};

/**
 * Validate returns data
 */
const validateReturnsData = (returns) => {
  const errors = {};
  
  if (!returns.orderId) {
    errors.orderId = 'Order ID is required';
  }
  
  if (!returns.customerId) {
    errors.customerId = 'Customer ID is required';
  }
  
  if (!returns.workerId) {
    errors.workerId = 'Worker ID is required';
  }
  
  if (!returns.returnMethod?.trim()) {
    errors.returnMethod = 'Return method is required';
  }
  
  if (!returns.items || returns.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    // Validate each item
    returns.items.forEach((item, index) => {
      if (!item.itemId) {
        errors[`items.${index}.itemId`] = 'Item ID is required';
      }
      if (!item.orderDetailId) {
        errors[`items.${index}.orderDetailId`] = 'Order detail ID is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.reason?.trim()) {
        errors[`items.${index}.reason`] = 'Return reason is required';
      }
      if (!item.condition?.trim()) {
        errors[`items.${index}.condition`] = 'Item condition is required';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate refund data
 */
const validateRefundData = (refund) => {
  const errors = {};
  
  if (!refund.refundAmount || refund.refundAmount <= 0) {
    errors.refundAmount = 'Refund amount must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Returns Service Class
 */
class ReturnsService {
  /**
   * Get all returns records with optional filtering
   */
  async getReturns(filters = {}) {
    try {
      const params = {};
      
      if (filters.skip) params.skip = filters.skip;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.orderId) params.order_id = filters.orderId;
      if (filters.customerId) params.customer_id = filters.customerId;
      
      const response = await api.get('/returns', { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data.map(transformReturnsData) : [],
        count: data.length
      };
    } catch (error) {
      console.error('Error fetching returns records:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch returns records',
        data: []
      };
    }
  }

  /**
   * Get a specific returns record by ID
   */
  async getReturn(returnId) {
    try {
      if (!returnId) {
        throw new Error('Return ID is required');
      }
      
      const response = await api.get(`/returns/${returnId}`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformReturnsData(data)
      };
    } catch (error) {
      console.error('Error fetching returns record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch returns record'
      };
    }
  }

  /**
   * Create a new returns record
   */
  async createReturns(returnsData) {
    try {
      // Validate returns data
      const validation = validateReturnsData(returnsData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const response = await api.post('/returns/', transformReturnsForBackend(returnsData));
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformReturnsData(data),
        message: 'Returns record created successfully'
      };
    } catch (error) {
      console.error('Error creating returns record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to create returns record'
      };
    }
  }

  /**
   * Update a returns record
   */
  async updateReturns(returnId, returnsData) {
    try {
      if (!returnId) {
        throw new Error('Return ID is required');
      }
      
      const updateData = {};
      if (returnsData.status) updateData.status = returnsData.status;
      if (returnsData.notes) updateData.notes = returnsData.notes;
      if (returnsData.refundAmount) updateData.refund_amount = returnsData.refundAmount;
      if (returnsData.refundStatus) updateData.refund_status = returnsData.refundStatus;
      
      const response = await api.put(`/returns/${returnId}`, updateData);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformReturnsData(data),
        message: 'Returns record updated successfully'
      };
    } catch (error) {
      console.error('Error updating returns record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to update returns record'
      };
    }
  }

  /**
   * Process a returns record
   */
  async processReturns(returnId) {
    try {
      if (!returnId) {
        throw new Error('Return ID is required');
      }
      
      const response = await api.post(`/returns/${returnId}/process`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformReturnsData(data),
        message: 'Returns processing started successfully'
      };
    } catch (error) {
      console.error('Error processing returns:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to process returns'
      };
    }
  }

  /**
   * Complete returns processing
   */
  async completeReturns(returnId, processedItems, refundDetails = null) {
    try {
      if (!returnId) {
        throw new Error('Return ID is required');
      }
      
      if (!processedItems || processedItems.length === 0) {
        throw new Error('Processed items are required');
      }
      
      const response = await api.post(`/returns/${returnId}/complete`, {
        processed_items: processedItems,
        refund_details: refundDetails
      });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformReturnsData(data),
        message: 'Returns processing completed successfully'
      };
    } catch (error) {
      console.error('Error completing returns processing:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to complete returns processing'
      };
    }
  }

  /**
   * Process refund for a return
   */
  async processRefund(returnId, refundData) {
    try {
      if (!returnId) {
        throw new Error('Return ID is required');
      }
      
      // Validate refund data
      const validation = validateRefundData(refundData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const params = {
        refund_amount: refundData.refundAmount,
        refund_status: refundData.refundStatus || 'processed'
      };
      
      const response = await api.post(`/returns/${returnId}/refund`, null, { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: data,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to process refund'
      };
    }
  }

  /**
   * Get returns statistics
   */
  async getReturnsStats(filters = {}) {
    try {
      const result = await this.getReturns(filters);
      
      if (!result.success) {
        return result;
      }
      
      const returns = result.data;
      
      const stats = {
        total: returns.length,
        pending: returns.filter(r => r.status === RETURNS_STATUS.PENDING).length,
        processing: returns.filter(r => r.status === RETURNS_STATUS.PROCESSING).length,
        completed: returns.filter(r => r.status === RETURNS_STATUS.COMPLETED).length,
        byMethod: {},
        byReason: {},
        totalRefundAmount: 0,
        averageProcessingTime: 0
      };
      
      // Count by return method
      returns.forEach(returnRecord => {
        const method = returnRecord.returnMethod;
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;
      });
      
      // Count by return reason
      returns.forEach(returnRecord => {
        returnRecord.items.forEach(item => {
          const reason = item.reason;
          stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;
        });
      });
      
      // Calculate total refund amount
      stats.totalRefundAmount = returns.reduce((sum, returnRecord) => {
        return sum + (returnRecord.refundAmount || 0);
      }, 0);
      
      // Calculate average processing time for completed returns
      const completedReturns = returns.filter(r => 
        r.status === RETURNS_STATUS.COMPLETED && 
        r.returnDate && 
        r.updatedAt
      );
      
      if (completedReturns.length > 0) {
        const totalTime = completedReturns.reduce((sum, returnRecord) => {
          const start = new Date(returnRecord.returnDate);
          const end = new Date(returnRecord.updatedAt);
          return sum + (end - start);
        }, 0);
        
        stats.averageProcessingTime = Math.round(totalTime / completedReturns.length / (1000 * 60 * 60)); // Hours
      }
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting returns stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get returns statistics'
      };
    }
  }

  /**
   * Get returns for a specific customer
   */
  async getCustomerReturns(customerId, filters = {}) {
    try {
      const allFilters = { ...filters, customerId };
      return await this.getReturns(allFilters);
    } catch (error) {
      console.error('Error fetching customer returns:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch customer returns',
        data: []
      };
    }
  }

  /**
   * Get returns for a specific order
   */
  async getOrderReturns(orderId) {
    try {
      return await this.getReturns({ orderId });
    } catch (error) {
      console.error('Error fetching order returns:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order returns',
        data: []
      };
    }
  }
}

// Export singleton instance
export const returnsService = new ReturnsService();
export default returnsService;
