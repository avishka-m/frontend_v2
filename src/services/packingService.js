import api from './api';

class PackingService {
  // Get all packing records with filtering and pagination
  async getAllPackings(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters if provided
      if (filters.status) params.append('status', filters.status);
      if (filters.worker_id) params.append('worker_id', filters.worker_id);
      if (filters.order_id) params.append('order_id', filters.order_id);
      if (filters.package_type) params.append('package_type', filters.package_type);
      if (filters.is_partial !== undefined) params.append('is_partial', filters.is_partial);
      if (filters.label_printed !== undefined) params.append('label_printed', filters.label_printed);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      // Add pagination
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/packing?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.map(packing => this.transformPackingData(packing)),
        pagination: response.pagination || null
      };
    } catch (error) {
      console.error('Error fetching packing records:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch packing records'
      };
    }
  }

  // Get a single packing record by ID
  async getPackingById(packingId) {
    try {
      const response = await api.get(`/packing/${packingId}`);
      return {
        success: true,
        data: this.transformPackingData(response.data)
      };
    } catch (error) {
      console.error('Error fetching packing record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch packing record'
      };
    }
  }

  // Create a new packing record
  async createPacking(packingData) {
    try {
      const payload = {
        orderID: packingData.orderID,
        workerID: packingData.workerID,
        status: packingData.status || 'pending',
        is_partial: packingData.is_partial || false,
        package_type: packingData.package_type || 'box',
        items: packingData.items || []
      };

      const response = await api.post('/packing', payload);
      return {
        success: true,
        data: this.transformPackingData(response.data)
      };
    } catch (error) {
      console.error('Error creating packing record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create packing record'
      };
    }
  }

  // Update a packing record
  async updatePacking(packingId, updateData) {
    try {
      const payload = {};
      
      if (updateData.status !== undefined) payload.status = updateData.status;
      if (updateData.is_partial !== undefined) payload.is_partial = updateData.is_partial;
      if (updateData.package_type !== undefined) payload.package_type = updateData.package_type;
      if (updateData.weight !== undefined) payload.weight = updateData.weight;
      if (updateData.dimensions !== undefined) payload.dimensions = updateData.dimensions;
      if (updateData.notes !== undefined) payload.notes = updateData.notes;

      const response = await api.put(`/packing/${packingId}`, payload);
      return {
        success: true,
        data: this.transformPackingData(response.data)
      };
    } catch (error) {
      console.error('Error updating packing record:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update packing record'
      };
    }
  }

  // Start packing process
  async startPacking(packingId) {
    try {
      const response = await api.post(`/packing/${packingId}/start`);
      return {
        success: true,
        data: this.transformPackingData(response.data),
        message: 'Packing process started successfully'
      };
    } catch (error) {
      console.error('Error starting packing process:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to start packing process'
      };
    }
  }

  // Complete packing process
  async completePacking(packingId, completionData) {
    try {
      const payload = {
        packed_items: completionData.packed_items || [],
        package_details: {
          weight: completionData.weight,
          dimensions: completionData.dimensions,
          package_type: completionData.package_type
        }
      };

      const response = await api.post(`/packing/${packingId}/complete`, payload);
      return {
        success: true,
        data: this.transformPackingData(response.data),
        message: 'Packing completed successfully'
      };
    } catch (error) {
      console.error('Error completing packing:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to complete packing'
      };
    }
  }

  // Print shipping label
  async printShippingLabel(packingId) {
    try {
      const response = await api.post(`/packing/${packingId}/label`);
      return {
        success: true,
        data: response.data,
        message: 'Shipping label printed successfully'
      };
    } catch (error) {
      console.error('Error printing shipping label:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to print shipping label'
      };
    }
  }

  // Get packing statistics from analytics
  async getPackingStats(days = 30) {
    try {
      const response = await api.get(`/analytics/operations?days=${days}`);
      return {
        success: true,
        data: response.data.packing || {}
      };
    } catch (error) {
      console.error('Error fetching packing statistics:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch packing statistics'
      };
    }
  }

  // Get packing queue for a worker
  async getPackingQueue(workerId, filters = {}) {
    try {
      const queueFilters = {
        ...filters,
        worker_id: workerId,
        status: 'pending,in_progress'
      };
      
      return await this.getAllPackings(queueFilters);
    } catch (error) {
      console.error('Error fetching packing queue:', error);
      return {
        success: false,
        error: 'Failed to fetch packing queue'
      };
    }
  }

  // Get packing history for a worker
  async getPackingHistory(workerId, filters = {}) {
    try {
      const historyFilters = {
        ...filters,
        worker_id: workerId,
        status: 'completed'
      };
      
      return await this.getAllPackings(historyFilters);
    } catch (error) {
      console.error('Error fetching packing history:', error);
      return {
        success: false,
        error: 'Failed to fetch packing history'
      };
    }
  }

  // Transform packing data from API response
  transformPackingData(packing) {
    if (!packing) return null;

    return {
      id: packing._id || packing.id,
      packingID: packing.packingID,
      orderID: packing.orderID,
      workerID: packing.workerID,
      pack_date: packing.pack_date,
      status: packing.status,
      is_partial: packing.is_partial,
      package_type: packing.package_type,
      items: packing.items || [],
      notes: packing.notes,
      start_time: packing.start_time,
      complete_time: packing.complete_time,
      weight: packing.weight,
      dimensions: packing.dimensions,
      label_printed: packing.label_printed,
      created_at: packing.created_at,
      updated_at: packing.updated_at,
      
      // Computed properties
      items_count: packing.items?.length || 0,
      total_quantity: packing.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      packed_quantity: packing.items?.reduce((sum, item) => sum + (item.actual_quantity || 0), 0) || 0,
      is_complete: packing.items?.every(item => item.packed) || false,
      progress_percentage: this.calculateProgressPercentage(packing.items || []),
      
      // Status display
      status_display: this.getStatusDisplay(packing.status),
      status_color: this.getStatusColor(packing.status),
      
      // Formatted dates
      pack_date_formatted: packing.pack_date ? new Date(packing.pack_date).toLocaleDateString() : null,
      start_time_formatted: packing.start_time ? new Date(packing.start_time).toLocaleString() : null,
      complete_time_formatted: packing.complete_time ? new Date(packing.complete_time).toLocaleString() : null,
      
      // Package type display
      package_type_display: this.getPackageTypeDisplay(packing.package_type)
    };
  }

  // Calculate progress percentage for items
  calculateProgressPercentage(items) {
    if (!items || items.length === 0) return 0;
    const packedItems = items.filter(item => item.packed);
    return Math.round((packedItems.length / items.length) * 100);
  }

  // Get status display text
  getStatusDisplay(status) {
    const statusMap = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      partial: 'Partially Completed'
    };
    return statusMap[status] || status;
  }

  // Get status color for UI
  getStatusColor(status) {
    const colorMap = {
      pending: 'yellow',
      in_progress: 'blue',
      completed: 'green',
      partial: 'orange'
    };
    return colorMap[status] || 'gray';
  }

  // Get package type display text
  getPackageTypeDisplay(packageType) {
    const typeMap = {
      box: 'Box',
      envelope: 'Envelope',
      pallet: 'Pallet',
      bag: 'Bag',
      tube: 'Tube'
    };
    return typeMap[packageType] || packageType;
  }

  // Validate packing data
  validatePackingData(data) {
    const errors = [];

    if (!data.orderID) errors.push('Order ID is required');
    if (!data.workerID) errors.push('Worker ID is required');
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('At least one item is required');
    }

    // Validate items
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        if (!item.itemID) errors.push(`Item ${index + 1}: Item ID is required`);
        if (!item.pickingID) errors.push(`Item ${index + 1}: Picking ID is required`);
        if (!item.orderDetailID) errors.push(`Item ${index + 1}: Order Detail ID is required`);
        if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index + 1}: Valid quantity is required`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get available package types
  getPackageTypes() {
    return [
      { value: 'box', label: 'Box' },
      { value: 'envelope', label: 'Envelope' },
      { value: 'pallet', label: 'Pallet' },
      { value: 'bag', label: 'Bag' },
      { value: 'tube', label: 'Tube' }
    ];
  }

  // Get available status options
  getStatusOptions() {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'partial', label: 'Partially Completed' }
    ];
  }
}

export default new PackingService();
