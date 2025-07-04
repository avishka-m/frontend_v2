import api from './apiConfig';

class ReceivingService {
  // Get all receiving records with filtering
  async getAllReceivings(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
      if (filters.worker_id) params.append('worker_id', filters.worker_id);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/receiving?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.map(receiving => this.transformReceivingData(receiving)),
        pagination: response.pagination || null
      };
    } catch (error) {
      console.error('Error fetching receiving records:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch receiving records'
      };
    }
  }

  // Get receiving by ID
  async getReceivingById(id) {
    try {
      const response = await api.get(`/receiving/${id}`);
      return {
        success: true,
        data: this.transformReceivingData(response.data)
      };
    } catch (error) {
      console.error('Error fetching receiving details:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch receiving details'
      };
    }
  }

  // Create new receiving record
  async createReceiving(receivingData) {
    try {
      const response = await api.post('/receiving', receivingData);
      return {
        success: true,
        data: this.transformReceivingData(response.data)
      };
    } catch (error) {
      console.error('Error creating receiving record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create receiving record'
      };
    }
  }

  // Update receiving record
  async updateReceiving(id, updateData) {
    try {
      const response = await api.put(`/receiving/${id}`, updateData);
      return {
        success: true,
        data: this.transformReceivingData(response.data)
      };
    } catch (error) {
      console.error('Error updating receiving record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update receiving record'
      };
    }
  }

  // Process receiving (complete workflow)
  async processReceiving(id) {
    try {
      const response = await api.post(`/receiving/${id}/process`);
      return {
        success: true,
        data: this.transformReceivingData(response.data)
      };
    } catch (error) {
      console.error('Error processing receiving:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to process receiving'
      };
    }
  }

  // Get receiving statistics (calculated from receiving data)
  async getReceivingStats() {
    try {
      // Since there's no dedicated analytics endpoint, calculate from all receiving data
      const allReceivingResult = await this.getAllReceivings();
      
      if (!allReceivingResult.success) {
        throw new Error(allReceivingResult.error);
      }
      
      const receivings = allReceivingResult.data;
      const stats = this.calculateStats(receivings);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching receiving statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch receiving statistics',
        data: this.getDefaultStats()
      };
    }
  }

  // Calculate statistics from receiving data
  calculateStats(receivings) {
    if (!receivings || !Array.isArray(receivings)) {
      return this.getDefaultStats();
    }

    const stats = {
      total_receiving: receivings.length,
      pending_receiving: 0,
      processing_receiving: 0,
      completed_receiving: 0,
      discrepancy_count: 0,
      total_items_received: 0,
      avg_processing_time: 0,
      recent_activity: []
    };

    let totalProcessingTime = 0;
    let processedCount = 0;

    receivings.forEach(receiving => {
      // Count by status
      switch (receiving.status) {
        case 'pending':
          stats.pending_receiving++;
          break;
        case 'processing':
          stats.processing_receiving++;
          break;
        case 'completed':
          stats.completed_receiving++;
          break;
      }

      // Count items and discrepancies
      if (receiving.items && Array.isArray(receiving.items)) {
        receiving.items.forEach(item => {
          stats.total_items_received += item.quantity || 0;
          if (item.quantity !== item.expected_quantity) {
            stats.discrepancy_count++;
          }
        });
      }

      // Calculate processing time for completed items
      if (receiving.status === 'completed' && receiving.created_at && receiving.updated_at) {
        const createdAt = new Date(receiving.created_at);
        const updatedAt = new Date(receiving.updated_at);
        const processingTime = (updatedAt - createdAt) / (1000 * 60); // minutes
        totalProcessingTime += processingTime;
        processedCount++;
      }
    });

    // Calculate average processing time
    if (processedCount > 0) {
      stats.avg_processing_time = Math.round(totalProcessingTime / processedCount);
    }

    // Get recent activity (last 5 receivings)
    stats.recent_activity = receivings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(receiving => ({
        receivingID: receiving.receivingID,
        supplierID: receiving.supplierID,
        status: receiving.status,
        items_count: receiving.items?.length || 0,
        created_at: receiving.created_at
      }));

    return stats;
  }

  // Transform receiving data from API
  transformReceivingData(receiving) {
    return {
      ...receiving,
      
      // Basic calculated fields
      items_count: receiving.items?.length || 0,
      total_quantity: receiving.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      expected_quantity: receiving.items?.reduce((sum, item) => sum + (item.expected_quantity || 0), 0) || 0,
      processed_count: receiving.items?.filter(item => item.processed).length || 0,
      
      // Status and progress
      is_complete: receiving.items?.every(item => item.processed) || false,
      progress_percentage: this.calculateProgressPercentage(receiving.items || []),
      has_discrepancy: receiving.items?.some(item => item.quantity !== item.expected_quantity) || false,
      
      // Status display
      status_display: this.getStatusDisplay(receiving.status),
      status_color: this.getStatusColor(receiving.status),
      condition_display: this.getConditionDisplay(receiving.items || []),
      
      // Formatted dates
      received_date_formatted: this.formatDate(receiving.received_date),
      created_at_formatted: this.formatDate(receiving.created_at),
      updated_at_formatted: this.formatDate(receiving.updated_at),
      
      // Validation
      is_valid: this.validateReceivingData(receiving)
    };
  }

  // Calculate progress percentage
  calculateProgressPercentage(items) {
    if (!items || items.length === 0) return 0;
    
    const processedCount = items.filter(item => item.processed).length;
    return Math.round((processedCount / items.length) * 100);
  }

  // Get status display text
  getStatusDisplay(status) {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  }

  // Get status color
  getStatusColor(status) {
    const colorMap = {
      'pending': 'yellow',
      'processing': 'blue',
      'completed': 'green',
      'cancelled': 'red'
    };
    return colorMap[status] || 'gray';
  }

  // Get condition display
  getConditionDisplay(items) {
    if (!items || items.length === 0) return 'No items';
    
    const conditions = items.map(item => item.condition || 'unknown');
    const uniqueConditions = [...new Set(conditions)];
    
    if (uniqueConditions.length === 1) {
      return this.getConditionText(uniqueConditions[0]);
    } else {
      return 'Mixed conditions';
    }
  }

  // Get condition text
  getConditionText(condition) {
    const conditionMap = {
      'good': 'Good',
      'damaged': 'Damaged',
      'defective': 'Defective',
      'expired': 'Expired'
    };
    return conditionMap[condition] || 'Unknown';
  }

  // Format date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  // Validate receiving data
  validateReceivingData(receiving) {
    const errors = [];
    
    if (!receiving.supplierID) errors.push('Supplier ID is required');
    if (!receiving.workerID) errors.push('Worker ID is required');
    if (!receiving.items || receiving.items.length === 0) errors.push('At least one item is required');
    
    receiving.items?.forEach((item, index) => {
      if (!item.itemID) errors.push(`Item ${index + 1}: Item ID is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      if (!item.expected_quantity || item.expected_quantity <= 0) errors.push(`Item ${index + 1}: Expected quantity must be greater than 0`);
      if (!item.condition) errors.push(`Item ${index + 1}: Condition is required`);
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Get available conditions
  getConditions() {
    return [
      { value: 'good', label: 'Good' },
      { value: 'damaged', label: 'Damaged' },
      { value: 'defective', label: 'Defective' },
      { value: 'expired', label: 'Expired' }
    ];
  }

  // Get available statuses
  getStatuses() {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
  }

  // Get default statistics
  getDefaultStats() {
    return {
      total_receiving: 0,
      pending_receiving: 0,
      processing_receiving: 0,
      completed_receiving: 0,
      discrepancy_count: 0,
      total_items_received: 0,
      avg_processing_time: 0,
      recent_activity: []
    };
  }

  // Search receiving records
  async searchReceivings(query, filters = {}) {
    const allFilters = {
      ...filters,
      search: query
    };
    
    return await this.getAllReceivings(allFilters);
  }

  // Get receiving by reference number
  async getReceivingByReference(referenceNumber) {
    try {
      const response = await api.get(`/receiving?reference_number=${referenceNumber}`);
      
      if (response.data.length === 0) {
        return {
          success: false,
          error: 'No receiving record found with this reference number'
        };
      }
      
      return {
        success: true,
        data: this.transformReceivingData(response.data[0])
      };
    } catch (error) {
      console.error('Error fetching receiving by reference:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch receiving record'
      };
    }
  }

  // Helper method to check if user can perform actions
  canPerformAction(action, receiving, user) {
    const userRole = user?.role;
    const isManager = userRole === 'Manager';
    const isReceivingClerk = userRole === 'ReceivingClerk';
    const isAssignedWorker = receiving?.workerID === user?.workerID;
    
    switch (action) {
      case 'create':
        return isManager || isReceivingClerk;
      case 'update':
        return isManager || (isReceivingClerk && (isAssignedWorker || receiving?.status !== 'completed'));
      case 'process':
        return isManager || (isReceivingClerk && isAssignedWorker);
      case 'view':
        return true; // All authenticated users can view
      default:
        return false;
    }
  }

  // Data transformation utilities
  prepareCreateData(formData) {
    return {
      supplierID: parseInt(formData.supplierID),
      workerID: parseInt(formData.workerID),
      reference_number: formData.reference_number || null,
      items: formData.items.map(item => ({
        itemID: parseInt(item.itemID),
        quantity: parseInt(item.quantity),
        expected_quantity: parseInt(item.expected_quantity),
        condition: item.condition || 'good',
        notes: item.notes || null
      }))
    };
  }

  prepareUpdateData(formData) {
    const updateData = {};
    
    if (formData.status !== undefined) updateData.status = formData.status;
    if (formData.reference_number !== undefined) updateData.reference_number = formData.reference_number;
    if (formData.notes !== undefined) updateData.notes = formData.notes;
    
    return updateData;
  }
}

const receivingService = new ReceivingService();
export default receivingService;
