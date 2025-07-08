 import { useState, useEffect, useCallback } from 'react';
import orderService from '../../services/orderService';
import { masterDataService } from '../../services/masterDataService';
import { workerService } from '../../services/workerService';

/**
 * Optimized hook for order data with progressive loading
 * Uses REAL API endpoints instead of mock data
 */
export const useOrderData = (orderId) => {
  // Separate loading states for different data sections
  const [basicInfo, setBasicInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);
  const [actions, setActions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  
  const [loading, setLoading] = useState({
    basicInfo: false,
    items: false,
    customerDetails: false,
    workerDetails: false,
    actions: false,
    orderHistory: false
  });
  
  const [errors, setErrors] = useState({});

  // Helper to update loading state
  const setLoadingState = useCallback((section, isLoading) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  }, []);

  // Helper to set errors
  const setError = useCallback((section, error) => {
    setErrors(prev => ({ ...prev, [section]: error }));
  }, []);

  // 1. Load basic order info first (highest priority - shows immediately)
  const loadBasicInfo = useCallback(async () => {
    if (!orderId) return;
    
    setLoadingState('basicInfo', true);
    try {
      // Use REAL orderService.getOrder API call
      const orderData = await orderService.getOrder(orderId);
      
      // Extract basic info that's needed immediately
      const basicData = {
        order_id: orderData.order_id,
        orderID: orderData.orderID,
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        order_date: orderData.order_date,
        order_status: orderData.order_status,
        priority: orderData.priority,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes,
        total_amount: orderData.total_amount,
        assigned_worker: orderData.assigned_worker,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        // Computed fields from orderService
        status_display: orderData.status_display,
        priority_display: orderData.priority_display,
        status_color: orderData.status_color,
        priority_color: orderData.priority_color,
        items_count: orderData.items_count,
        items_total_quantity: orderData.items_total_quantity,
        is_fulfilled: orderData.is_fulfilled,
        worker_name: orderData.worker_name
      };
      
      setBasicInfo(basicData);
      
      // Also set items immediately since they come with the order
      if (orderData.items) {
        setItems(orderData.items);
      }
      
      setError('basicInfo', null);
    } catch (err) {
      console.error('Error loading order basic info:', err);
      setError('basicInfo', err.message || 'Failed to load order information');
    } finally {
      setLoadingState('basicInfo', false);
    }
  }, [orderId, setLoadingState, setError]);

  // 2. Load customer details (second priority - for customer info panel)
  const loadCustomerDetails = useCallback(async () => {
    if (!basicInfo?.customer_id) return;
    
    setLoadingState('customerDetails', true);
    try {
      // Use REAL masterDataService to get customer details
      const customers = await masterDataService.getCustomers();
      const customer = customers.find(c => c.customer_id === basicInfo.customer_id);
      
      if (customer) {
        setCustomerDetails(customer);
        setError('customerDetails', null);
      } else {
        // Customer not found, use basic info
        setCustomerDetails({
          customer_id: basicInfo.customer_id,
          customer_name: basicInfo.customer_name,
          email: null,
          phone: null,
          address: null
        });
      }
    } catch (err) {
      console.error('Error loading customer details:', err);
      setError('customerDetails', 'Failed to load customer details');
    } finally {
      setLoadingState('customerDetails', false);
    }
  }, [basicInfo?.customer_id, basicInfo?.customer_name, setLoadingState, setError]);

  // 3. Load worker details (third priority - for worker info)
  const loadWorkerDetails = useCallback(async () => {
    if (!basicInfo?.assigned_worker) return;
    
    setLoadingState('workerDetails', true);
    try {
      // Use REAL workerService to get worker details
      const workers = await workerService.getActiveWorkers();
      const worker = workers.find(w => w.worker_id === basicInfo.assigned_worker);
      
      if (worker) {
        setWorkerDetails(worker);
        setError('workerDetails', null);
      } else {
        // Worker not found, use basic info
        setWorkerDetails({
          worker_id: basicInfo.assigned_worker,
          worker_name: basicInfo.worker_name,
          role: 'Unknown',
          department: 'Unknown'
        });
      }
    } catch (err) {
      console.error('Error loading worker details:', err);
      setError('workerDetails', 'Failed to load worker details');
    } finally {
      setLoadingState('workerDetails', false);
    }
  }, [basicInfo?.assigned_worker, basicInfo?.worker_name, setLoadingState, setError]);

  // 4. Load available actions (fourth priority - for action buttons)
  const loadActions = useCallback(async () => {
    if (!basicInfo) return;
    
    setLoadingState('actions', true);
    try {
      // Determine available actions based on order status and business rules
      const availableActions = [];
      
      // Status-based actions
      switch (basicInfo.order_status) {
        case 'pending':
          availableActions.push('confirm', 'cancel', 'edit');
          break;
        case 'confirmed':
          availableActions.push('start_receiving', 'cancel', 'edit');
          break;
        case 'receiving':
          availableActions.push('complete_receiving', 'start_picking');
          break;
        case 'picking':
          availableActions.push('complete_picking', 'start_packing');
          break;
        case 'packing':
          availableActions.push('complete_packing', 'start_shipping');
          break;
        case 'shipping':
          availableActions.push('mark_shipped');
          break;
        case 'shipped':
          availableActions.push('mark_delivered');
          break;
        case 'delivered':
          availableActions.push('create_return');
          break;
        case 'cancelled':
          availableActions.push('reopen');
          break;
      }
      
      // Always allow viewing details and generating reports
      availableActions.push('view_details', 'generate_report', 'print_order');
      
      // Priority-based actions
      if (basicInfo.priority === 1) { // High priority
        availableActions.push('expedite');
      }
      
      setActions(availableActions);
      setError('actions', null);
    } catch (err) {
      console.error('Error determining available actions:', err);
      setError('actions', 'Failed to load available actions');
    } finally {
      setLoadingState('actions', false);
    }
  }, [basicInfo, setLoadingState, setError]);

  // 5. Load order history (lowest priority - only when requested)
  const loadOrderHistory = useCallback(async () => {
    if (!orderId) return;
    
    setLoadingState('orderHistory', true);
    try {
      // For now, create history from order data
      // In a real implementation, this would be a separate API call to get order audit log
      const history = [];
      
      if (basicInfo?.created_at) {
        history.push({
          id: 1,
          action: 'Order Created',
          timestamp: basicInfo.created_at,
          user: 'System',
          details: `Order created for ${basicInfo.customer_name}`,
          status: 'pending'
        });
      }
      
      if (basicInfo?.order_status !== 'pending') {
        history.push({
          id: 2,
          action: 'Status Changed',
          timestamp: basicInfo.updated_at || basicInfo.created_at,
          user: basicInfo.worker_name || 'System',
          details: `Status changed to ${basicInfo.status_display}`,
          status: basicInfo.order_status
        });
      }
      
      if (basicInfo?.assigned_worker) {
        history.push({
          id: 3,
          action: 'Worker Assigned',
          timestamp: basicInfo.updated_at || basicInfo.created_at,
          user: 'Manager',
          details: `Assigned to ${basicInfo.worker_name}`,
          status: basicInfo.order_status
        });
      }
      
      setOrderHistory(history);
      setError('orderHistory', null);
    } catch (err) {
      console.error('Error loading order history:', err);
      setError('orderHistory', 'Failed to load order history');
    } finally {
      setLoadingState('orderHistory', false);
    }
  }, [orderId, basicInfo, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    if (orderId) {
      // Load basic info immediately
      loadBasicInfo();
    }
  }, [orderId, loadBasicInfo]);

  useEffect(() => {
    if (basicInfo) {
      // Load additional details after basic info is available
      loadCustomerDetails();
      loadWorkerDetails();
      loadActions();
    }
  }, [basicInfo, loadCustomerDetails, loadWorkerDetails, loadActions]);

  // Refresh functions for updating data after actions
  const refreshBasicInfo = useCallback(() => {
    loadBasicInfo();
  }, [loadBasicInfo]);

  const refreshAll = useCallback(() => {
    loadBasicInfo();
    loadCustomerDetails();
    loadWorkerDetails();
    loadActions();
  }, [loadBasicInfo, loadCustomerDetails, loadWorkerDetails, loadActions]);

  // Update order using real API
  const updateOrder = useCallback(async (updateData) => {
    if (!orderId) return false;
    
    try {
      setLoadingState('basicInfo', true);
      // Use REAL orderService.updateOrder API call
      const updatedOrder = await orderService.updateOrder(orderId, updateData);
      
      // Update local state with new data
      setBasicInfo(prevBasicInfo => ({
        ...prevBasicInfo,
        ...updatedOrder
      }));
      
      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      setError('basicInfo', err.message || 'Failed to update order');
      return false;
    } finally {
      setLoadingState('basicInfo', false);
    }
  }, [orderId, setLoadingState, setError]);

  // Computed loading states
  const isLoadingAny = Object.values(loading).some(Boolean);
  const isLoadingCritical = loading.basicInfo || loading.items;

  // Helper functions for status and condition checking
  const canUpdateStatus = useCallback((newStatus) => {
    if (!basicInfo) return false;
    
    // Define valid status transitions
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['receiving', 'cancelled'],
      'receiving': ['picking', 'confirmed'],
      'picking': ['packing', 'receiving'],
      'packing': ['shipping', 'picking'],
      'shipping': ['shipped', 'packing'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': ['pending']
    };
    
    return validTransitions[basicInfo.order_status]?.includes(newStatus) || false;
  }, [basicInfo]);

  const canEdit = useCallback(() => {
    return basicInfo?.order_status === 'pending' || basicInfo?.order_status === 'confirmed';
  }, [basicInfo]);

  const canCancel = useCallback(() => {
    return ['pending', 'confirmed', 'receiving'].includes(basicInfo?.order_status);
  }, [basicInfo]);

  return {
    // Data
    basicInfo,
    items,
    customerDetails,
    workerDetails,
    actions,
    orderHistory,
    
    // Loading states
    loading,
    isLoadingAny,
    isLoadingCritical,
    
    // Errors
    errors,
    
    // Actions
    loadOrderHistory, // Call this when history tab is opened
    refreshBasicInfo,
    refreshAll,
    updateOrder, // Real API update function
    
    // Helper functions
    canUpdateStatus,
    canEdit,
    canCancel
  };
};

export default useOrderData; 