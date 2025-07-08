import { useState, useEffect, useCallback } from 'react';
import workflowService from '../../services/workflowService';

/**
 * Optimized hook for workflow data with progressive loading
 * Uses REAL workflowService API endpoints instead of mock data
 */
export const useWorkflowData = () => {
  // Separate loading states for different data sections
  const [basicInfo, setBasicInfo] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [statusOverview, setStatusOverview] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [actions, setActions] = useState([]);
  
  const [loading, setLoading] = useState({
    basicInfo: false,
    activeTasks: false,
    metrics: false,
    statusOverview: false,
    optimization: false,
    actions: false
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

  // 1. Load basic workflow metrics first (highest priority - shows immediately)
  const loadBasicInfo = useCallback(async () => {
    setLoadingState('basicInfo', true);
    try {
      // Use REAL workflowService.getWorkflowMetrics API call
      const result = await workflowService.getWorkflowMetrics();
      
      if (result.success) {
        // Extract basic info that's needed immediately for header
        const basicData = {
          totalTasks: result.data.totalTasks || 0,
          completedTasks: result.data.completedTasks || 0,
          pendingTasks: result.data.pendingTasks || 0,
          activeTasks: result.data.activeTasks || [],
          efficiency: result.data.efficiency || 0,
          utilizationRate: result.data.utilizationRate || 0,
          pendingActions: result.data.pendingActions || 0,
          systemStatus: result.data.systemStatus || 'operational',
          lastUpdated: result.data.lastUpdated || new Date().toISOString()
        };
        
        setBasicInfo(basicData);
        
        // Also set metrics immediately since they come together
        setMetrics(result.data);
        
        setError('basicInfo', null);
      } else {
        setError('basicInfo', result.error || 'Failed to load workflow metrics');
      }
    } catch (err) {
      console.error('Error loading workflow basic info:', err);
      setError('basicInfo', err.message || 'Failed to load workflow information');
    } finally {
      setLoadingState('basicInfo', false);
    }
  }, [setLoadingState, setError]);

  // 2. Load active tasks (second priority - for main dashboard)
  const loadActiveTasks = useCallback(async () => {
    setLoadingState('activeTasks', true);
    try {
      // Use REAL workflowService.getActiveWorkflowTasks API call
      const result = await workflowService.getActiveWorkflowTasks();
      
      if (result.success) {
        setActiveTasks(result.data || []);
        setError('activeTasks', null);
      } else {
        setError('activeTasks', result.error || 'Failed to load active tasks');
      }
    } catch (err) {
      console.error('Error loading active tasks:', err);
      setError('activeTasks', 'Failed to load active tasks');
    } finally {
      setLoadingState('activeTasks', false);
    }
  }, [setLoadingState, setError]);

  // 3. Load status overview (third priority - for dashboard widgets)
  const loadStatusOverview = useCallback(async () => {
    setLoadingState('statusOverview', true);
    try {
      // Use REAL workflowService.getWorkflowStatusOverview API call
      const result = await workflowService.getWorkflowStatusOverview();
      
      if (result.success) {
        setStatusOverview(result.data);
        setError('statusOverview', null);
      } else {
        setError('statusOverview', result.error || 'Failed to load status overview');
      }
    } catch (err) {
      console.error('Error loading status overview:', err);
      setError('statusOverview', 'Failed to load status overview');
    } finally {
      setLoadingState('statusOverview', false);
    }
  }, [setLoadingState, setError]);

  // 4. Load optimization suggestions (fourth priority - for performance insights)
  const loadOptimization = useCallback(async () => {
    setLoadingState('optimization', true);
    try {
      // Use REAL workflowService.getWorkflowOptimization API call
      const result = await workflowService.getWorkflowOptimization();
      
      if (result.success) {
        setOptimization(result.data);
        setError('optimization', null);
      } else {
        setError('optimization', result.error || 'Failed to load optimization data');
      }
    } catch (err) {
      console.error('Error loading optimization data:', err);
      setError('optimization', 'Failed to load optimization suggestions');
    } finally {
      setLoadingState('optimization', false);
    }
  }, [setLoadingState, setError]);

  // 5. Load available actions (fifth priority - for action buttons)
  const loadActions = useCallback(async () => {
    if (!basicInfo) return;
    
    setLoadingState('actions', true);
    try {
      // Determine available actions based on workflow state and user permissions
      const availableActions = [];
      
      // System actions
      availableActions.push('refresh_all', 'export_report');
      
      // Task management actions
      if (basicInfo.pendingTasks > 0) {
        availableActions.push('assign_workers', 'prioritize_tasks');
      }
      
      // Optimization actions
      if (basicInfo.efficiency < 80) {
        availableActions.push('optimize_workflow', 'rebalance_tasks');
      }
      
      // Status-based actions
      if (basicInfo.systemStatus === 'warning') {
        availableActions.push('investigate_issues', 'reset_alerts');
      }
      
      // Always available management actions
      availableActions.push('view_analytics', 'configure_settings', 'bulk_actions');
      
      setActions(availableActions);
      setError('actions', null);
    } catch (err) {
      console.error('Error determining available actions:', err);
      setError('actions', 'Failed to load available actions');
    } finally {
      setLoadingState('actions', false);
    }
  }, [basicInfo, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    // Load basic info immediately
    loadBasicInfo();
  }, [loadBasicInfo]);

  useEffect(() => {
    if (basicInfo) {
      // Load additional data after basic info is available
      loadActiveTasks();
      loadStatusOverview();
      loadOptimization();
      loadActions();
    }
  }, [basicInfo, loadActiveTasks, loadStatusOverview, loadOptimization, loadActions]);

  // Refresh functions for updating data
  const refreshBasicInfo = useCallback(() => {
    loadBasicInfo();
  }, [loadBasicInfo]);

  const refreshActiveTasks = useCallback(() => {
    loadActiveTasks();
  }, [loadActiveTasks]);

  const refreshAll = useCallback(() => {
    loadBasicInfo();
    loadActiveTasks();
    loadStatusOverview();
    loadOptimization();
  }, [loadBasicInfo, loadActiveTasks, loadStatusOverview, loadOptimization]);

  // Execute workflow actions using real API
  const executeWorkflowAction = useCallback(async (action, taskId = null, workerId = null, payload = {}) => {
    try {
      let result;
      
      switch (action) {
        case 'start_picking':
          result = await workflowService.startPickingWorkflow(taskId, workerId);
          break;
        case 'complete_picking':
          result = await workflowService.completePickingWorkflow(taskId, workerId, payload.pickedItems);
          break;
        case 'start_packing':
          result = await workflowService.startPackingWorkflow(taskId, workerId);
          break;
        case 'complete_packing':
          result = await workflowService.completePackingWorkflow(taskId, workerId, payload.packedItems, payload.packageDetails);
          break;
        case 'start_shipping':
          result = await workflowService.startShippingWorkflow(taskId, workerId, payload.vehicleId, payload.trackingInfo);
          break;
        case 'complete_shipping':
          result = await workflowService.completeShippingWorkflow(taskId, workerId, payload.deliveryProof, payload.notes);
          break;
        case 'process_receiving':
          result = await workflowService.processReceiving(taskId, workerId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      if (result.success) {
        // Refresh relevant data after action
        refreshAll();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error(`Error executing workflow action ${action}:`, err);
      return { success: false, error: err.message || `Failed to execute ${action}` };
    }
  }, [refreshAll]);

  // Get order workflow status using real API
  const getOrderWorkflowStatus = useCallback(async (orderId) => {
    try {
      const result = await workflowService.getOrderWorkflowStatus(orderId);
      return result;
    } catch (err) {
      console.error('Error getting order workflow status:', err);
      return { success: false, error: err.message || 'Failed to get order status' };
    }
  }, []);

  // Computed loading states
  const isLoadingAny = Object.values(loading).some(Boolean);
  const isLoadingCritical = loading.basicInfo || loading.activeTasks;

  // Helper functions for workflow management
  const getTasksByType = useCallback((type) => {
    return activeTasks.filter(task => task.type === type);
  }, [activeTasks]);

  const getTasksByStatus = useCallback((status) => {
    return activeTasks.filter(task => task.status === status);
  }, [activeTasks]);

  const getTasksByPriority = useCallback((priority) => {
    return activeTasks.filter(task => task.priority === priority);
  }, [activeTasks]);

  const getTasksByWorker = useCallback((workerId) => {
    return activeTasks.filter(task => task.worker_id === workerId);
  }, [activeTasks]);

  // Calculate real-time metrics
  const calculateRealTimeMetrics = useCallback(() => {
    if (!basicInfo || !activeTasks.length) return null;

    const highPriorityTasks = getTasksByPriority('high').length;
    const overdueTasks = activeTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date()
    ).length;

    return {
      ...basicInfo,
      highPriorityTasks,
      overdueTasks,
      avgTaskDuration: activeTasks.reduce((sum, task) => 
        sum + (task.estimated_duration || 0), 0) / activeTasks.length || 0
    };
  }, [basicInfo, activeTasks, getTasksByPriority]);

  return {
    // Data
    basicInfo,
    activeTasks,
    metrics,
    statusOverview,
    optimization,
    actions,
    
    // Loading states
    loading,
    isLoadingAny,
    isLoadingCritical,
    
    // Errors
    errors,
    
    // Actions
    refreshBasicInfo,
    refreshActiveTasks,
    refreshAll,
    executeWorkflowAction, // Real API workflow actions
    getOrderWorkflowStatus, // Real API order status
    
    // Helper functions
    getTasksByType,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByWorker,
    calculateRealTimeMetrics
  };
};

export default useWorkflowData; 