import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import returnsService, { RETURNS_STATUS, RETURNS_METHODS, REFUND_STATUS } from '../services/returnsService';

const Returns = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // ✨ NEW: Refresh states
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    orderId: '',
    customerId: '',
    skip: 0,
    limit: 50
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    totalRefundAmount: 0
  });

  const isManager = currentUser?.role === 'Manager';
  const isReceivingClerk = currentUser?.role === 'ReceivingClerk';

  useEffect(() => {
    loadReturns();
    loadStats();
    
    // ✨ NEW: Auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      // Only do background refresh if no modal is open
      if (!showReturnModal) {
        handleBackgroundRefresh();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [filters.status, filters.orderId, filters.customerId]);

  // ✨ NEW: Background refresh function
  const handleBackgroundRefresh = async () => {
    try {
      setBackgroundRefreshing(true);
      
      // Load data without showing main loading spinner
      const [returnsResult, statsResult] = await Promise.all([
        returnsService.getReturns(filters),
        returnsService.getReturnsStats(filters)
      ]);
      
      // Check if there are changes before updating state
      const newReturnsCount = returnsResult.success ? returnsResult.data.length : 0;
      const currentReturnsCount = returns.length;
      
      if (newReturnsCount !== currentReturnsCount) {
        console.log(`📥 Returns updated: ${currentReturnsCount} → ${newReturnsCount}`);
      }
      
      if (returnsResult.success) {
        setReturns(returnsResult.data);
      }
      
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      setLastRefreshTime(new Date().toLocaleTimeString());
      
    } catch (err) {
      console.error('Background refresh failed:', err);
      // Don't show error for background refresh failures
    } finally {
      setBackgroundRefreshing(false);
    }
  };

  // ✨ NEW: Manual refresh function
  const handleManualRefresh = async () => {
    await Promise.all([loadReturns(), loadStats()]);
    setLastRefreshTime(new Date().toLocaleTimeString());
  };

  const loadReturns = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const result = await returnsService.getReturns(filters);
      
      if (result.success) {
        setReturns(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load returns records');
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const result = await returnsService.getReturnsStats(filters);
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      skip: 0 // Reset pagination when filtering
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      orderId: '',
      customerId: '',
      skip: 0,
      limit: 50
    });
  };

  const handleViewReturn = async (returnId) => {
    try {
      setModalLoading(true);
      setShowReturnModal(true);
      
      // Fetch detailed return information
      const result = await returnsService.getReturn(returnId);
      
      if (result.success) {
        setSelectedReturn(result.data);
      } else {
        setError(result.error);
        setShowReturnModal(false);
      }
    } catch (err) {
      setError('Failed to load return details');
      setShowReturnModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleProcessReturn = async (returnId) => {
    try {
      const result = await returnsService.processReturns(returnId);
      
      if (result.success) {
        await loadReturns();
        await loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to process return');
    }
  };

  const handleApproveReturn = async (returnId) => {
    try {
      const result = await returnsService.updateReturns(returnId, {
        status: 'approved',
        notes: 'Approved by manager'
      });
      
      if (result.success) {
        await loadReturns();
        await loadStats();
        setShowReturnModal(false);
        setSelectedReturn(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to approve return');
    }
  };

  const handleRejectReturn = async (returnId) => {
    try {
      const result = await returnsService.updateReturns(returnId, {
        status: 'rejected',
        notes: 'Rejected by manager'
      });
      
      if (result.success) {
        await loadReturns();
        await loadStats();
        setShowReturnModal(false);
        setSelectedReturn(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to reject return');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RETURNS_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RETURNS_STATUS.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case RETURNS_STATUS.APPROVED:
        return 'bg-emerald-100 text-emerald-800';
      case RETURNS_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      case RETURNS_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case REFUND_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case REFUND_STATUS.PROCESSED:
        return 'bg-green-100 text-green-800';
      case REFUND_STATUS.DENIED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-gray-600">Manage product returns and refunds</p>
          {/* ✨ NEW: Last refresh time display */}
          {lastRefreshTime && (
            <p className="text-sm text-gray-400 mt-1">
              Last updated: {lastRefreshTime}
              {backgroundRefreshing && (
                <span className="ml-2 inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  syncing...
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* ✨ NEW: Manual refresh button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading || backgroundRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh returns data"
          >
            <svg 
              className={`-ml-1 mr-2 h-4 w-4 ${loading || backgroundRefreshing ? 'animate-spin' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
        {isManager && (
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/returns/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Return
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Processing</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-emerald-600">{stats.approved || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Refunds</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRefundAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value={RETURNS_STATUS.PENDING}>Pending</option>
              <option value={RETURNS_STATUS.PROCESSING}>Processing</option>
              <option value={RETURNS_STATUS.APPROVED}>Approved</option>
              <option value={RETURNS_STATUS.REJECTED}>Rejected</option>
              <option value={RETURNS_STATUS.COMPLETED}>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <input
              type="text"
              name="orderId"
              value={filters.orderId}
              onChange={handleFilterChange}
              placeholder="Search by order ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
            <input
              type="text"
              name="customerId"
              value={filters.customerId}
              onChange={handleFilterChange}
              placeholder="Search by customer ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading returns...
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                returns.map((returnRecord) => (
                  <tr key={returnRecord.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{returnRecord.returnId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        #{returnRecord.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        #{returnRecord.customerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnRecord.status)}`}>
                        {returnRecord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {returnRecord.itemsCount} items ({returnRecord.totalQuantity} qty)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(returnRecord.returnDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {returnRecord.refundStatus ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRefundStatusColor(returnRecord.refundStatus)}`}>
                          {returnRecord.refundStatus}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {returnRecord.refundAmount ? formatCurrency(returnRecord.refundAmount) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewReturn(returnRecord.returnId)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
                        {isReceivingClerk && returnRecord.status === RETURNS_STATUS.PENDING && (
                          <button
                            onClick={() => handleProcessReturn(returnRecord.returnId)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Process
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Details Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Return Details #{selectedReturn?.returnId}
              </h3>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedReturn(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-gray-500">Loading return details...</span>
                  </div>
                </div>
              ) : selectedReturn ? (
                <div className="space-y-6">
                  {/* Return Status and Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReturn.status)}`}>
                        {selectedReturn.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Return Date</label>
                      <p className="text-sm text-gray-900">{new Date(selectedReturn.returnDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order ID</label>
                      <p className="text-sm text-gray-900">#{selectedReturn.orderId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer</label>
                      <p className="text-sm text-gray-900">{selectedReturn.customerName || `Customer ${selectedReturn.customerId}`}</p>
                    </div>
                  </div>

                  {/* Return Method and Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Return Method</label>
                      <p className="text-sm text-gray-900">{selectedReturn.returnMethod?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Return Reason</label>
                      <p className="text-sm text-gray-900">{selectedReturn.returnReason}</p>
                    </div>
                  </div>

                  {/* Return Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedReturn.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  {/* Returned Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Returned Items</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedReturn.items?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                                  <div className="text-sm text-gray-500">ID: {item.itemId}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.condition}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${item.refundAmount?.toFixed(2) || '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Refund Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Refund Amount</label>
                      <p className="text-lg font-semibold text-gray-900">${selectedReturn.totalRefundAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Refund Status</label>
                      <p className="text-sm text-gray-900">{selectedReturn.refundStatus}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedReturn.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-900">{selectedReturn.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Managers */}
                  {isManager && (selectedReturn.status === RETURNS_STATUS.PENDING || selectedReturn.status === RETURNS_STATUS.PROCESSING) && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRejectReturn(selectedReturn.returnId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Return
                      </button>
                      <button
                        onClick={() => handleApproveReturn(selectedReturn.returnId)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Return
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Failed to load return details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;