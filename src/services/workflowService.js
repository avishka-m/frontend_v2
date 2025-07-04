import api from './apiConfig';

class WorkflowService {
  // ===== RECEIVING WORKFLOWS =====
  
  async processReceiving(receivingId, workerId) {
    try {
      const response = await api.post('/workflow/receiving/process', {
        receiving_id: receivingId,
        worker_id: workerId
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error processing receiving workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to process receiving workflow'
      };
    }
  }

  // ===== PICKING WORKFLOWS =====
  
  async startPickingWorkflow(pickingId, workerId) {
    try {
      const response = await api.post('/workflow/picking/start', null, {
        params: {
          picking_id: pickingId,
          worker_id: workerId
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error starting picking workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to start picking workflow'
      };
    }
  }

  async completePickingWorkflow(pickingId, workerId, pickedItems) {
    try {
      const response = await api.post('/workflow/picking/complete', {
        picking_id: pickingId,
        worker_id: workerId,
        picked_items: pickedItems
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error completing picking workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to complete picking workflow'
      };
    }
  }

  // ===== PACKING WORKFLOWS =====
  
  async startPackingWorkflow(packingId, workerId) {
    try {
      const response = await api.post('/workflow/packing/start', null, {
        params: {
          packing_id: packingId,
          worker_id: workerId
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error starting packing workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to start packing workflow'
      };
    }
  }

  async completePackingWorkflow(packingId, workerId, packedItems, packageDetails) {
    try {
      const response = await api.post('/workflow/packing/complete', {
        packing_id: packingId,
        worker_id: workerId,
        packed_items: packedItems,
        package_details: packageDetails
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error completing packing workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to complete packing workflow'
      };
    }
  }

  // ===== SHIPPING WORKFLOWS =====
  
  async startShippingWorkflow(shippingId, workerId, vehicleId, trackingInfo) {
    try {
      const response = await api.post('/workflow/shipping/start', {
        shipping_id: shippingId,
        worker_id: workerId,
        vehicle_id: vehicleId,
        tracking_info: trackingInfo
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error starting shipping workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to start shipping workflow'
      };
    }
  }

  async completeShippingWorkflow(shippingId, workerId, deliveryProof, notes = null) {
    try {
      const response = await api.post('/workflow/shipping/complete', {
        shipping_id: shippingId,
        worker_id: workerId,
        delivery_proof: deliveryProof,
        notes: notes
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error completing shipping workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to complete shipping workflow'
      };
    }
  }

  // ===== RETURN WORKFLOWS =====
  
  async startReturnWorkflow(returnId, workerId) {
    try {
      const response = await api.post('/workflow/returns/start', null, {
        params: {
          return_id: returnId,
          worker_id: workerId
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error starting return workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to start return workflow'
      };
    }
  }

  async completeReturnWorkflow(returnId, workerId, processedItems, refundDetails = null) {
    try {
      const response = await api.post('/workflow/returns/complete', {
        return_id: returnId,
        worker_id: workerId,
        processed_items: processedItems,
        refund_details: refundDetails
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error completing return workflow:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to complete return workflow'
      };
    }
  }

  // ===== OPTIMIZATION & ANALYTICS =====
  
  async getWorkflowOptimization(workerRoles = null) {
    try {
      const response = await api.post('/workflow/optimization/analyze', {
        worker_roles: workerRoles
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error getting workflow optimization:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get workflow optimization',
        data: this.getDefaultOptimization()
      };
    }
  }

  async getWorkflowStatusOverview() {
    try {
      const response = await api.get('/workflow/status/overview');
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get workflow status',
        data: this.getDefaultStatus()
      };
    }
  }

  // ===== WORKFLOW ORCHESTRATION =====
  
  async getOrderWorkflowStatus(orderId) {
    try {
      const response = await api.get(`/workflow/order/${orderId}/status`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error getting order workflow status:', error);
      
      // Fallback to the existing method if the new endpoint fails
      return this.getOrderWorkflowStatusFallback(orderId);
    }
  }

  async getOrderWorkflowStatusFallback(orderId) {
    try {
      // Get the order and its related workflow records
      const [orderResult, pickingResult, packingResult, shippingResult] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/picking?order_id=${orderId}`),
        api.get(`/packing?order_id=${orderId}`),
        api.get(`/shipping?order_id=${orderId}`)
      ]);

      const order = orderResult.data;
      const picking = pickingResult.data.length > 0 ? pickingResult.data[0] : null;
      const packing = packingResult.data.length > 0 ? packingResult.data[0] : null;
      const shipping = shippingResult.data.length > 0 ? shippingResult.data[0] : null;

      return {
        success: true,
        data: {
          order: order,
          picking: picking,
          packing: packing,
          shipping: shipping,
          workflow_status: this.calculateWorkflowStatus(order, picking, packing, shipping)
        }
      };
    } catch (error) {
      console.error('Error getting order workflow status (fallback):', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get order workflow status'
      };
    }
  }

  async getActiveWorkflowTasks() {
    try {
      const response = await api.get('/workflow/active-tasks');
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error getting active workflow tasks:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get active workflow tasks',
        data: []
      };
    }
  }

  async getWorkflowMetrics() {
    try {
      const [statusResult, optimizationResult, tasksResult] = await Promise.all([
        this.getWorkflowStatusOverview(),
        this.getWorkflowOptimization(),
        this.getActiveWorkflowTasks()
      ]);

      return {
        success: true,
        data: {
          status: statusResult.data,
          optimization: optimizationResult.data,
          activeTasks: tasksResult.data,
          metrics: {
            totalActiveTasks: tasksResult.data?.length || 0,
            criticalTasks: tasksResult.data?.filter(t => t.priority === 'high')?.length || 0,
            bottlenecks: optimizationResult.data?.bottlenecks || [],
            utilizationRate: this.calculateUtilizationRate(statusResult.data)
          }
        }
      };
    } catch (error) {
      console.error('Error getting workflow metrics:', error);
      return {
        success: false,
        error: 'Failed to get workflow metrics',
        data: this.getDefaultMetrics()
      };
    }
  }

  calculateUtilizationRate(statusData) {
    if (!statusData || !statusData.capacity) return 0;
    
    const totalCurrent = (statusData.current_workload?.active_picking || 0) + 
                        (statusData.current_workload?.active_packing || 0) + 
                        (statusData.current_workload?.active_shipping || 0);
    
    const totalCapacity = (statusData.capacity?.picking || 0) + 
                         (statusData.capacity?.packing || 0) + 
                         (statusData.capacity?.shipping || 0);
    
    return totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
  }

  getDefaultMetrics() {
    return {
      status: this.getDefaultStatus(),
      optimization: this.getDefaultOptimization(),
      activeTasks: [],
      metrics: {
        totalActiveTasks: 0,
        criticalTasks: 0,
        bottlenecks: [],
        utilizationRate: 0
      }
    };
  }

  // ===== WORKFLOW UTILITIES =====
  
  getNextWorkflowAction(currentStatus) {
    const actionMap = {
      'pending': 'start_picking',
      'picking': 'complete_picking',
      'picked': 'start_packing',
      'packing': 'complete_packing',
      'packed': 'start_shipping',
      'shipped': 'complete_delivery',
      'delivered': 'completed'
    };
    
    return actionMap[currentStatus] || 'unknown';
  }

  getWorkflowActionLabel(action) {
    const labelMap = {
      'start_picking': 'Start Picking',
      'complete_picking': 'Complete Picking',
      'start_packing': 'Start Packing',
      'complete_packing': 'Complete Packing',
      'start_shipping': 'Start Shipping',
      'complete_delivery': 'Complete Delivery',
      'completed': 'Completed'
    };
    
    return labelMap[action] || 'Unknown Action';
  }

  getStatusColor(status) {
    const colorMap = {
      'pending': 'yellow',
      'in_progress': 'blue',
      'processing': 'blue',
      'completed': 'green',
      'picked': 'green',
      'packed': 'green',
      'shipped': 'blue',
      'in_transit': 'blue',
      'delivered': 'green',
      'cancelled': 'red',
      'error': 'red'
    };
    
    return colorMap[status] || 'gray';
  }

  // ===== DEFAULT DATA =====
  
  getDefaultOptimization() {
    return {
      current_workload: {
        active_picking: 0,
        active_packing: 0,
        active_shipping: 0
      },
      capacity: {
        picking: 0,
        packing: 0,
        shipping: 0
      },
      bottlenecks: [],
      optimizations: [],
      recommended_sequence: []
    };
  }

  getDefaultStatus() {
    return {
      current_workload: {
        active_picking: 0,
        active_packing: 0,
        active_shipping: 0
      },
      capacity: {
        picking: 0,
        packing: 0,
        shipping: 0
      },
      bottlenecks: [],
      optimizations: []
    };
  }

  // ===== VALIDATION =====
  
  validatePickedItems(pickedItems) {
    const errors = [];
    
    if (!Array.isArray(pickedItems) || pickedItems.length === 0) {
      errors.push('At least one picked item is required');
      return { isValid: false, errors };
    }
    
    pickedItems.forEach((item, index) => {
      if (!item.itemID) errors.push(`Item ${index + 1}: Item ID is required`);
      if (!item.locationID) errors.push(`Item ${index + 1}: Location ID is required`);
      if (!item.orderDetailID) errors.push(`Item ${index + 1}: Order Detail ID is required`);
      if (item.actual_quantity === undefined || item.actual_quantity < 0) {
        errors.push(`Item ${index + 1}: Valid actual quantity is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validatePackedItems(packedItems) {
    const errors = [];
    
    if (!Array.isArray(packedItems) || packedItems.length === 0) {
      errors.push('At least one packed item is required');
      return { isValid: false, errors };
    }
    
    packedItems.forEach((item, index) => {
      if (!item.itemID) errors.push(`Item ${index + 1}: Item ID is required`);
      if (!item.pickingID) errors.push(`Item ${index + 1}: Picking ID is required`);
      if (!item.orderDetailID) errors.push(`Item ${index + 1}: Order Detail ID is required`);
      if (item.actual_quantity === undefined || item.actual_quantity < 0) {
        errors.push(`Item ${index + 1}: Valid actual quantity is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validatePackageDetails(packageDetails) {
    const errors = [];
    
    if (!packageDetails.weight || packageDetails.weight <= 0) {
      errors.push('Package weight is required and must be greater than 0');
    }
    
    if (!packageDetails.dimensions) {
      errors.push('Package dimensions are required');
    }
    
    if (!packageDetails.package_type) {
      errors.push('Package type is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateTrackingInfo(trackingInfo) {
    const errors = [];
    
    if (!trackingInfo.tracking_number) {
      errors.push('Tracking number is required');
    }
    
    if (!trackingInfo.estimated_delivery) {
      errors.push('Estimated delivery date is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  calculateWorkflowStatus(order, picking, packing, shipping) {
    const status = {
      current_stage: 'pending',
      progress_percentage: 0,
      stages: {
        picking: { status: 'not_started', completed: false },
        packing: { status: 'not_started', completed: false },
        shipping: { status: 'not_started', completed: false }
      },
      timeline: []
    };

    // Calculate picking status
    if (picking) {
      if (picking.status === 'completed') {
        status.stages.picking.status = 'completed';
        status.stages.picking.completed = true;
        status.current_stage = 'picking';
        status.progress_percentage = 33;
      } else if (picking.status === 'in_progress') {
        status.stages.picking.status = 'in_progress';
        status.current_stage = 'picking';
        status.progress_percentage = 25;
      } else if (picking.status === 'pending') {
        status.stages.picking.status = 'pending';
        status.current_stage = 'picking';
        status.progress_percentage = 10;
      }
    }

    // Calculate packing status
    if (packing) {
      if (packing.status === 'completed') {
        status.stages.packing.status = 'completed';
        status.stages.packing.completed = true;
        status.current_stage = 'packing';
        status.progress_percentage = 66;
      } else if (packing.status === 'in_progress') {
        status.stages.packing.status = 'in_progress';
        status.current_stage = 'packing';
        status.progress_percentage = 50;
      } else if (packing.status === 'pending') {
        status.stages.packing.status = 'pending';
        if (status.stages.picking.completed) {
          status.current_stage = 'packing';
          status.progress_percentage = 40;
        }
      }
    }

    // Calculate shipping status
    if (shipping) {
      if (shipping.status === 'delivered') {
        status.stages.shipping.status = 'delivered';
        status.stages.shipping.completed = true;
        status.current_stage = 'shipping';
        status.progress_percentage = 100;
      } else if (shipping.status === 'in_transit') {
        status.stages.shipping.status = 'in_transit';
        status.current_stage = 'shipping';
        status.progress_percentage = 90;
      } else if (shipping.status === 'pending') {
        status.stages.shipping.status = 'pending';
        if (status.stages.packing.completed) {
          status.current_stage = 'shipping';
          status.progress_percentage = 75;
        }
      }
    }

    // Build timeline
    const timeline = [];
    
    if (order && order.order_date) {
      timeline.push({
        stage: 'order_created',
        timestamp: order.order_date,
        status: 'completed',
        description: `Order ${order.orderID} created`
      });
    }

    if (picking) {
      if (picking.start_time) {
        timeline.push({
          stage: 'picking',
          timestamp: picking.start_time,
          status: 'started',
          description: 'Picking started'
        });
      }
      if (picking.complete_time) {
        timeline.push({
          stage: 'picking',
          timestamp: picking.complete_time,
          status: 'completed',
          description: 'Picking completed'
        });
      }
    }

    if (packing) {
      if (packing.start_time) {
        timeline.push({
          stage: 'packing',
          timestamp: packing.start_time,
          status: 'started',
          description: 'Packing started'
        });
      }
      if (packing.complete_time) {
        timeline.push({
          stage: 'packing',
          timestamp: packing.complete_time,
          status: 'completed',
          description: 'Packing completed'
        });
      }
    }

    if (shipping) {
      if (shipping.departure_time) {
        timeline.push({
          stage: 'shipping',
          timestamp: shipping.departure_time,
          status: 'shipped',
          description: 'Order shipped'
        });
      }
      if (shipping.actual_delivery) {
        timeline.push({
          stage: 'shipping',
          timestamp: shipping.actual_delivery,
          status: 'delivered',
          description: 'Order delivered'
        });
      }
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    status.timeline = timeline;

    return status;
  }
}

const workflowService = new WorkflowService();
export default workflowService;
