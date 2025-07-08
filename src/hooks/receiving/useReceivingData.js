import { useState, useEffect, useCallback } from 'react';
import receivingService from '../../services/receivingService';

/**
 * Optimized hook for receiving data with progressive loading
 * Breaks down the monolithic data fetch into smaller, focused calls
 */
export const useReceivingData = (receivingId) => {
  // Separate loading states for different data sections
  const [basicInfo, setBasicInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [actions, setActions] = useState([]);
  
  const [loading, setLoading] = useState({
    basicInfo: false,
    items: false,
    history: false,
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

  // 1. Load basic info first (highest priority - shows immediately)
  const loadBasicInfo = useCallback(async () => {
    if (!receivingId) return;
    
    setLoadingState('basicInfo', true);
    try {
      // For now, use existing service but only extract basic info
      const result = await receivingService.getReceivingById(receivingId);
      
      if (result.success) {
        const basicData = {
          receiving_id: result.data.receiving_id,
          order_id: result.data.order_id,
          status: result.data.status,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          assigned_worker: result.data.assigned_worker,
          worker_name: result.data.worker_name,
          reference_number: result.data.reference_number,
          location: result.data.location,
          notes: result.data.notes,
          total_quantity: result.data.total_quantity,
          received_quantity: result.data.received_quantity
        };
        setBasicInfo(basicData);
        setError('basicInfo', null);
      } else {
        setError('basicInfo', result.error);
      }
    } catch (err) {
      setError('basicInfo', 'Failed to load basic information');
    } finally {
      setLoadingState('basicInfo', false);
    }
  }, [receivingId, setLoadingState, setError]);

  // 2. Load items (second priority - needed for main content)
  const loadItems = useCallback(async () => {
    if (!receivingId) return;
    
    setLoadingState('items', true);
    try {
      const result = await receivingService.getReceivingById(receivingId);
      
      if (result.success && result.data.items) {
        setItems(result.data.items);
        setError('items', null);
      } else {
        setError('items', result.error || 'Failed to load items');
      }
    } catch (err) {
      setError('items', 'Failed to load items');
    } finally {
      setLoadingState('items', false);
    }
  }, [receivingId, setLoadingState, setError]);

  // 3. Load available actions (third priority - for action buttons)
  const loadActions = useCallback(async () => {
    if (!receivingId || !basicInfo) return;
    
    setLoadingState('actions', true);
    try {
      // Determine available actions based on status and permissions
      const availableActions = [];
      
      if (basicInfo.status === 'pending') {
        availableActions.push('start_processing');
      }
      if (basicInfo.status === 'processing') {
        availableActions.push('complete', 'pause');
      }
      if (basicInfo.status === 'completed') {
        availableActions.push('reopen', 'generate_report');
      }
      
      // Add edit action if user has permission
      availableActions.push('edit');
      
      setActions(availableActions);
      setError('actions', null);
    } catch (err) {
      setError('actions', 'Failed to load available actions');
    } finally {
      setLoadingState('actions', false);
    }
  }, [receivingId, basicInfo, setLoadingState, setError]);

  // 4. Load history (lowest priority - only when requested)
  const loadHistory = useCallback(async () => {
    if (!receivingId) return;
    
    setLoadingState('history', true);
    try {
      // For now, simulate history loading
      // In real implementation, this would be a separate API call
      const mockHistory = [
        {
          id: 1,
          action: 'created',
          timestamp: basicInfo?.created_at,
          user: 'System',
          details: 'Receiving task created'
        },
        {
          id: 2,
          action: 'assigned',
          timestamp: basicInfo?.created_at,
          user: basicInfo?.worker_name || 'Unknown',
          details: 'Assigned to receiving clerk'
        }
      ];
      
      setHistory(mockHistory);
      setError('history', null);
    } catch (err) {
      setError('history', 'Failed to load history');
    } finally {
      setLoadingState('history', false);
    }
  }, [receivingId, basicInfo, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    if (receivingId) {
      // Load basic info immediately
      loadBasicInfo();
    }
  }, [receivingId, loadBasicInfo]);

  useEffect(() => {
    if (basicInfo) {
      // Load items and actions after basic info is available
      loadItems();
      loadActions();
    }
  }, [basicInfo, loadItems, loadActions]);

  // Refresh functions for updating data after actions
  const refreshBasicInfo = useCallback(() => {
    loadBasicInfo();
  }, [loadBasicInfo]);

  const refreshItems = useCallback(() => {
    loadItems();
  }, [loadItems]);

  const refreshAll = useCallback(() => {
    loadBasicInfo();
    loadItems();
    loadActions();
  }, [loadBasicInfo, loadItems, loadActions]);

  // Computed loading states
  const isLoadingAny = Object.values(loading).some(Boolean);
  const isLoadingCritical = loading.basicInfo || loading.items;

  // Helper functions for status and condition checking
  const canStartProcessing = useCallback(() => {
    return basicInfo?.status === 'pending' && actions.includes('start_processing');
  }, [basicInfo, actions]);

  const canComplete = useCallback(() => {
    return basicInfo?.status === 'processing' && actions.includes('complete');
  }, [basicInfo, actions]);

  const canEdit = useCallback(() => {
    return basicInfo?.status !== 'completed' && actions.includes('edit');
  }, [basicInfo, actions]);

  return {
    // Data
    basicInfo,
    items,
    history,
    actions,
    
    // Loading states
    loading,
    isLoadingAny,
    isLoadingCritical,
    
    // Errors
    errors,
    
    // Actions
    loadHistory, // Call this when history tab is opened
    refreshBasicInfo,
    refreshItems,
    refreshAll,
    
    // Helper functions
    canStartProcessing,
    canComplete,
    canEdit
  };
};

export default useReceivingData; 