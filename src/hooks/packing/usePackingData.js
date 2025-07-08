import { useState, useEffect, useCallback } from 'react';
import packingService from '../../services/packingService';

/**
 * Optimized hook for packing data with progressive loading
 * Breaks down the monolithic data fetch into smaller, focused calls
 */
export const usePackingData = (packingId) => {
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
    if (!packingId) return;
    
    setLoadingState('basicInfo', true);
    try {
      // For now, use existing service but only extract basic info
      const result = await packingService.getPackingById(packingId);
      
      if (result.success) {
        const basicData = {
          packing_id: result.data.packing_id,
          order_id: result.data.order_id,
          status: result.data.status,
          created_at: result.data.created_at,
          assigned_worker: result.data.assigned_worker,
          worker_name: result.data.worker_name,
          reference_number: result.data.reference_number,
          package_type: result.data.package_type,
          weight: result.data.weight,
          dimensions: result.data.dimensions
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
  }, [packingId, setLoadingState, setError]);

  // 2. Load items (second priority - needed for main content)
  const loadItems = useCallback(async () => {
    if (!packingId) return;
    
    setLoadingState('items', true);
    try {
      const result = await packingService.getPackingById(packingId);
      
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
  }, [packingId, setLoadingState, setError]);

  // 3. Load available actions (third priority - for action buttons)
  const loadActions = useCallback(async () => {
    if (!packingId || !basicInfo) return;
    
    setLoadingState('actions', true);
    try {
      // Determine available actions based on status and permissions
      const availableActions = [];
      
      if (basicInfo.status === 'pending') {
        availableActions.push('start');
      }
      if (basicInfo.status === 'in_progress') {
        availableActions.push('complete', 'pause');
      }
      if (basicInfo.status === 'completed') {
        availableActions.push('print_label', 'reopen');
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
  }, [packingId, basicInfo, setLoadingState, setError]);

  // 4. Load history (lowest priority - only when requested)
  const loadHistory = useCallback(async () => {
    if (!packingId) return;
    
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
          details: 'Packing task created'
        }
      ];
      
      setHistory(mockHistory);
      setError('history', null);
    } catch (err) {
      setError('history', 'Failed to load history');
    } finally {
      setLoadingState('history', false);
    }
  }, [packingId, basicInfo, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    if (packingId) {
      // Load basic info immediately
      loadBasicInfo();
    }
  }, [packingId, loadBasicInfo]);

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
    refreshAll
  };
};

export default usePackingData; 