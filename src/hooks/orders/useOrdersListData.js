import { useState, useEffect, useCallback, useMemo } from 'react';
import orderService from '../../services/orderService';

/**
 * Optimized hook for orders list data with progressive loading
 * Uses REAL orderService API endpoints instead of mock data
 */
export const useOrdersListData = () => {
  // Separate loading states for different data sections
  const [basicInfo, setBasicInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    itemsPerPage: 10
  });
  
  const [loading, setLoading] = useState({
    basicInfo: false,
    orders: false,
    stats: false,
    filtering: false
  });
  
  const [errors, setErrors] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Helper to update loading state
  const setLoadingState = useCallback((section, isLoading) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  }, []);

  // Helper to set errors
  const setError = useCallback((section, error) => {
    setErrors(prev => ({ ...prev, [section]: error }));
  }, []);

  // 1. Load basic orders info first (highest priority - for immediate display)
  const loadBasicInfo = useCallback(async () => {
    setLoadingState('basicInfo', true);
    try {
      // Get basic order information for header display
      const response = await orderService.getOrders({
        page: 1,
        limit: 1 // Just need count info initially
      });
      
      const basicData = {
        totalCount: response.total || 0,
        hasOrders: (response.total || 0) > 0,
        lastUpdated: new Date().toISOString()
      };
      
      setBasicInfo(basicData);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / prev.itemsPerPage)
      }));
      
      setError('basicInfo', null);
    } catch (err) {
      console.error('Error loading basic orders info:', err);
      setError('basicInfo', err.message || 'Failed to load basic order information');
    } finally {
      setLoadingState('basicInfo', false);
    }
  }, [setLoadingState, setError]);

  // 2. Load orders statistics (second priority - for dashboard widgets)
  const loadStats = useCallback(async () => {
    setLoadingState('stats', true);
    try {
      // Use REAL orderService.getOrderStats API call
      const statsData = await orderService.getOrderStats();
      
      setStats(statsData);
      setError('stats', null);
    } catch (err) {
      console.error('Error loading order stats:', err);
      setError('stats', err.message || 'Failed to load order statistics');
    } finally {
      setLoadingState('stats', false);
    }
  }, [setLoadingState, setError]);

  // 3. Load orders list (third priority - main content)
  const loadOrders = useCallback(async (page = 1, filters = {}) => {
    setLoadingState('orders', true);
    try {
      // Use REAL orderService.getOrders API call with pagination and filters
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      };
      
      const response = await orderService.getOrders(params);
      
      if (response.items) {
        setOrders(response.items);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          page: page,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / prev.itemsPerPage)
        }));
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        setOrders(response);
      } else {
        setOrders([]);
      }
      
      setError('orders', null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('orders', err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoadingState('orders', false);
    }
  }, [pagination.itemsPerPage, setLoadingState, setError]);

  // 4. Apply client-side filtering (for immediate UI response)
  const applyFilters = useCallback(() => {
    setLoadingState('filtering', true);
    
    try {
      const filtered = useMemo(() => {
        let result = [...orders];
        
        // Apply search filter
        if (searchTerm) {
          result = result.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            return (
              order.order_id?.toString().includes(searchTerm) ||
              order.customer_name?.toLowerCase().includes(searchLower) ||
              order.shipping_address?.toLowerCase().includes(searchLower) ||
              order.customer_email?.toLowerCase().includes(searchLower)
            );
          });
        }
        
        // Apply status filter
        if (statusFilter) {
          result = result.filter(order => order.order_status === statusFilter);
        }
        
        // Apply priority filter
        if (priorityFilter) {
          result = result.filter(order => order.priority?.toString() === priorityFilter);
        }
        
        return result;
      }, [orders, searchTerm, statusFilter, priorityFilter]);
      
      setFilteredOrders(filtered);
      setError('filtering', null);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('filtering', 'Failed to apply filters');
      setFilteredOrders(orders);
    } finally {
      setLoadingState('filtering', false);
    }
  }, [orders, searchTerm, statusFilter, priorityFilter, setLoadingState, setError]);

  // Progressive loading sequence
  useEffect(() => {
    // Load basic info immediately
    loadBasicInfo();
  }, [loadBasicInfo]);

  useEffect(() => {
    if (basicInfo) {
      // Load additional data after basic info is available
      loadStats();
      loadOrders(1, {
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        start_date: dateRange.start,
        end_date: dateRange.end
      });
    }
  }, [basicInfo, searchTerm, statusFilter, priorityFilter, dateRange, loadStats, loadOrders]);

  // Apply filters when orders or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Refresh functions
  const refreshBasicInfo = useCallback(() => {
    loadBasicInfo();
  }, [loadBasicInfo]);

  const refreshStats = useCallback(() => {
    loadStats();
  }, [loadStats]);

  const refreshOrders = useCallback(() => {
    loadOrders(pagination.page, {
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      start_date: dateRange.start,
      end_date: dateRange.end
    });
  }, [loadOrders, pagination.page, searchTerm, statusFilter, priorityFilter, dateRange]);

  const refreshAll = useCallback(() => {
    loadBasicInfo();
    loadStats();
    refreshOrders();
  }, [loadBasicInfo, loadStats, refreshOrders]);

  // Order management actions using real API
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update local state immediately for better UX
      setOrders(prev => prev.map(order => 
        order.order_id === orderId 
          ? { ...order, order_status: newStatus }
          : order
      ));
      
      // Refresh stats to reflect the change
      loadStats();
      
      return { success: true };
    } catch (err) {
      console.error('Error updating order status:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to update order status'
      };
    }
  }, [loadStats]);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      
      // Remove from local state immediately
      setOrders(prev => prev.filter(order => order.order_id !== orderId));
      
      // Refresh to get accurate counts
      refreshAll();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting order:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to delete order'
      };
    }
  }, [refreshAll]);

  const exportOrders = useCallback(async () => {
    try {
      // Get all orders for export
      const response = await orderService.getOrders({ limit: 1000 });
      const ordersToExport = response.items || response;
      
      if (!ordersToExport || ordersToExport.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      // Create CSV content
      const headers = Object.keys(ordersToExport[0]).join(',');
      const rows = ordersToExport.map(item => Object.values(item).join(','));
      const csvContent = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error('Error exporting orders:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to export orders'
      };
    }
  }, []);

  // Pagination controls
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadOrders(page, {
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        start_date: dateRange.start,
        end_date: dateRange.end
      });
    }
  }, [loadOrders, pagination.totalPages, searchTerm, statusFilter, priorityFilter, dateRange]);

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [goToPage, pagination.page]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [goToPage, pagination.page]);

  // Filter controls
  const updateSearch = useCallback((search) => {
    setSearchTerm(search);
  }, []);

  const updateStatusFilter = useCallback((status) => {
    setStatusFilter(status);
  }, []);

  const updatePriorityFilter = useCallback((priority) => {
    setPriorityFilter(priority);
  }, []);

  const updateDateRange = useCallback((range) => {
    setDateRange(range);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setDateRange({ start: '', end: '' });
  }, []);

  // Helper functions
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.order_status === status);
  }, [orders]);

  const getOrdersByPriority = useCallback((priority) => {
    return orders.filter(order => order.priority === priority);
  }, [orders]);

  // Computed loading states
  const isLoadingAny = Object.values(loading).some(Boolean);
  const isLoadingCritical = loading.basicInfo || loading.orders;

  return {
    // Data
    basicInfo,
    orders: filteredOrders,
    allOrders: orders,
    stats,
    pagination,
    
    // Loading states
    loading,
    isLoadingAny,
    isLoadingCritical,
    
    // Errors
    errors,
    
    // Filter state
    searchTerm,
    statusFilter,
    priorityFilter,
    dateRange,
    
    // Actions
    refreshBasicInfo,
    refreshStats,
    refreshOrders,
    refreshAll,
    updateOrderStatus, // Real API order status update
    deleteOrder, // Real API order deletion
    exportOrders, // Real CSV export
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Filters
    updateSearch,
    updateStatusFilter,
    updatePriorityFilter,
    updateDateRange,
    clearFilters,
    
    // Helper functions
    getOrdersByStatus,
    getOrdersByPriority
  };
};

export default useOrdersListData; 