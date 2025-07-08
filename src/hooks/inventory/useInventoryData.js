import { useState, useEffect, useCallback } from 'react';
import inventoryService from '../../services/inventoryService';

/**
 * Optimized hook for inventory data with progressive loading
 * Breaks down the monolithic data fetch into smaller, focused calls
 */
export const useInventoryData = (inventoryId) => {
  // Separate loading states for different data sections
  const [basicInfo, setBasicInfo] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [actions, setActions] = useState([]);
  
  const [loading, setLoading] = useState({
    basicInfo: false,
    stockHistory: false,
    transactions: false,
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
    if (!inventoryId) return;
    
    setLoadingState('basicInfo', true);
    try {
      // For now, use existing service but only extract basic info
      const result = await inventoryService.getInventoryItemById(inventoryId);
      
      if (result.success) {
        const basicData = {
          item_id: result.data.item_id,
          name: result.data.name,
          sku: result.data.sku,
          description: result.data.description,
          category: result.data.category,
          available_quantity: result.data.available_quantity,
          total_quantity: result.data.total_quantity,
          reserved_quantity: result.data.reserved_quantity,
          reorder_level: result.data.reorder_level,
          unit_price: result.data.unit_price,
          location: result.data.location,
          last_updated: result.data.last_updated,
          status: result.data.status,
          supplier: result.data.supplier,
          expiry_date: result.data.expiry_date,
          batch_number: result.data.batch_number
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
  }, [inventoryId, setLoadingState, setError]);

  // 2. Load stock history (second priority - for trends)
  const loadStockHistory = useCallback(async () => {
    if (!inventoryId) return;
    
    setLoadingState('stockHistory', true);
    try {
      // For now, simulate stock history loading
      // In real implementation, this would be a separate API call
      const mockHistory = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: Math.floor(Math.random() * 100) + 50,
        change: Math.floor(Math.random() * 20) - 10,
        reason: ['Received', 'Sold', 'Returned', 'Adjusted'][Math.floor(Math.random() * 4)]
      })).reverse();
      
      setStockHistory(mockHistory);
      setError('stockHistory', null);
    } catch (err) {
      setError('stockHistory', 'Failed to load stock history');
    } finally {
      setLoadingState('stockHistory', false);
    }
  }, [inventoryId, setLoadingState, setError]);

  // 3. Load available actions (third priority - for action buttons)
  const loadActions = useCallback(async () => {
    if (!inventoryId || !basicInfo) return;
    
    setLoadingState('actions', true);
    try {
      // Determine available actions based on inventory status and permissions
      const availableActions = [];
      
      if (basicInfo.status === 'active') {
        availableActions.push('adjust_stock', 'update_location', 'set_reorder_level');
      }
      
      if (basicInfo.available_quantity <= basicInfo.reorder_level) {
        availableActions.push('reorder');
      }
      
      if (basicInfo.available_quantity > 0) {
        availableActions.push('reserve_stock');
      }
      
      // Always allow editing and viewing details
      availableActions.push('edit', 'view_transactions', 'generate_report');
      
      setActions(availableActions);
      setError('actions', null);
    } catch (err) {
      setError('actions', 'Failed to load available actions');
    } finally {
      setLoadingState('actions', false);
    }
  }, [inventoryId, basicInfo, setLoadingState, setError]);

  // 4. Load transactions (lowest priority - only when requested)
  const loadTransactions = useCallback(async () => {
    if (!inventoryId) return;
    
    setLoadingState('transactions', true);
    try {
      // For now, simulate transaction loading
      // In real implementation, this would be a separate API call
      const mockTransactions = [
        {
          id: 1,
          type: 'IN',
          quantity: 50,
          date: new Date().toISOString(),
          reference: 'PO-2024-001',
          user: 'John Doe',
          notes: 'Initial stock received'
        },
        {
          id: 2,
          type: 'OUT',
          quantity: -10,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          reference: 'ORDER-2024-001',
          user: 'Jane Smith',
          notes: 'Sold to customer'
        },
        {
          id: 3,
          type: 'ADJUST',
          quantity: 5,
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          reference: 'ADJ-2024-001',
          user: 'Admin',
          notes: 'Stock count adjustment'
        }
      ];
      
      setTransactions(mockTransactions);
      setError('transactions', null);
    } catch (err) {
      setError('transactions', 'Failed to load transactions');
    } finally {
      setLoadingState('transactions', false);
    }
  }, [inventoryId, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    if (inventoryId) {
      // Load basic info immediately
      loadBasicInfo();
    }
  }, [inventoryId, loadBasicInfo]);

  useEffect(() => {
    if (basicInfo) {
      // Load stock history and actions after basic info is available
      loadStockHistory();
      loadActions();
    }
  }, [basicInfo, loadStockHistory, loadActions]);

  // Refresh functions for updating data after actions
  const refreshBasicInfo = useCallback(() => {
    loadBasicInfo();
  }, [loadBasicInfo]);

  const refreshStockHistory = useCallback(() => {
    loadStockHistory();
  }, [loadStockHistory]);

  const refreshAll = useCallback(() => {
    loadBasicInfo();
    loadStockHistory();
    loadActions();
  }, [loadBasicInfo, loadStockHistory, loadActions]);

  // Computed loading states
  const isLoadingAny = Object.values(loading).some(Boolean);
  const isLoadingCritical = loading.basicInfo || loading.stockHistory;

  // Helper functions for status and condition checking
  const isLowStock = useCallback(() => {
    return basicInfo?.available_quantity <= basicInfo?.reorder_level;
  }, [basicInfo]);

  const canAdjustStock = useCallback(() => {
    return basicInfo?.status === 'active' && actions.includes('adjust_stock');
  }, [basicInfo, actions]);

  const canReorder = useCallback(() => {
    return actions.includes('reorder');
  }, [actions]);

  const canReserveStock = useCallback(() => {
    return basicInfo?.available_quantity > 0 && actions.includes('reserve_stock');
  }, [basicInfo, actions]);

  return {
    // Data
    basicInfo,
    stockHistory,
    transactions,
    actions,
    
    // Loading states
    loading,
    isLoadingAny,
    isLoadingCritical,
    
    // Errors
    errors,
    
    // Actions
    loadTransactions, // Call this when transactions tab is opened
    refreshBasicInfo,
    refreshStockHistory,
    refreshAll,
    
    // Helper functions
    isLowStock,
    canAdjustStock,
    canReorder,
    canReserveStock
  };
};

export default useInventoryData; 