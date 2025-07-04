import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import shippingService, { SHIPPING_STATUS, SHIPPING_METHODS } from '../services/shippingService';

const Shipping = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    loadShipments();
    loadStats();
  }, [filters.status]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {};
      if (filters.status) filterParams.status = filters.status;
      
      const result = await shippingService.getShippings(filterParams);
      
      if (result.success) {
        let filteredShipments = result.data;
        
        // Apply search filter
        if (filters.search) {
          filteredShipments = filteredShipments.filter(shipment =>
            shipment.trackingNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
            shipment.recipientName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            shipment.deliveryAddress?.toLowerCase().includes(filters.search.toLowerCase()) ||
            shipment.orderId?.toString().includes(filters.search)
          );
        }
        
        setShipments(filteredShipments);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const result = await shippingService.getShippingStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleStatusUpdate = async (shippingId, newStatus) => {
    try {
      const result = await shippingService.updateShipping(shippingId, { status: newStatus });
      if (result.success) {
        loadShipments();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update shipment status');
    }
  };

  const handleDispatch = async (shippingId, vehicleId) => {
    try {
      const result = await shippingService.dispatchShipping(shippingId, { 
        vehicleId,
        trackingInfo: { dispatchedAt: new Date().toISOString() }
      });
      if (result.success) {
        loadShipments();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to dispatch shipment');
    }
  };

  const handleDeliver = async (shippingId) => {
    const deliveryProof = prompt('Enter delivery proof (signature/confirmation):');
    if (!deliveryProof) return;
    
    const notes = prompt('Optional notes:') || '';
    
    try {
      const result = await shippingService.deliverShipping(shippingId, { 
        deliveryProof,
        notes
      });
      if (result.success) {
        loadShipments();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to mark shipment as delivered');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SHIPPING_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SHIPPING_STATUS.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800';
      case SHIPPING_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case SHIPPING_STATUS.PENDING:
        return '📦';
      case SHIPPING_STATUS.IN_TRANSIT:
        return '🚛';
      case SHIPPING_STATUS.DELIVERED:
        return '✅';
      default:
        return '📋';
    }
  };

  const canManageShipping = currentUser?.role === 'Manager';
  const canDispatchShipping = currentUser?.role === 'Driver' || canManageShipping;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="text-gray-600 mt-1">Manage deliveries, track shipments, and handle logistics</p>
        </div>
        {canManageShipping && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => navigate('/shipping/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Shipment
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Shipments</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <div className="text-sm text-gray-600">In Transit</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && loadShipments()}
              placeholder="Tracking number, recipient, address, order ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value={SHIPPING_STATUS.PENDING}>Pending</option>
              <option value={SHIPPING_STATUS.IN_TRANSIT}>In Transit</option>
              <option value={SHIPPING_STATUS.DELIVERED}>Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status
                ? 'No shipments match your current filters.'
                : 'There are no shipments in the system yet.'}
            </p>
            {canManageShipping && !filters.search && !filters.status && (
              <button
                onClick={() => navigate('/shipping/create')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create First Shipment
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getStatusIcon(shipment.status)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{shipment.shippingId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order #{shipment.orderId}
                          </div>
                          {shipment.trackingNumber && (
                            <div className="text-xs text-gray-500">
                              Tracking: {shipment.trackingNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.recipientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.deliveryAddress}
                        </div>
                        {shipment.recipientPhone && (
                          <div className="text-xs text-gray-500">
                            📞 {shipment.recipientPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {shipment.shippingMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {shipment.estimatedDelivery && (
                          <div className="text-xs text-gray-500">
                            Est: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}
                        {shipment.departureTime && (
                          <div className="text-xs text-gray-500">
                            Shipped: {new Date(shipment.departureTime).toLocaleDateString()}
                          </div>
                        )}
                        {shipment.actualDelivery && (
                          <div className="text-xs text-green-600">
                            Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.vehicleId ? (
                        <div>
                          <div className="text-sm">Vehicle #{shipment.vehicleId}</div>
                          <div className="text-xs text-gray-500">Worker #{shipment.workerId}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/shipping/${shipment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        
                        {shipment.status === SHIPPING_STATUS.PENDING && canDispatchShipping && (
                          <button
                            onClick={() => {
                              const vehicleId = prompt('Enter Vehicle ID:');
                              if (vehicleId) handleDispatch(shipment.id, parseInt(vehicleId));
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Dispatch
                          </button>
                        )}
                        
                        {shipment.status === SHIPPING_STATUS.IN_TRANSIT && canDispatchShipping && (
                          <button
                            onClick={() => handleDeliver(shipment.id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Deliver
                          </button>
                        )}
                        
                        {canManageShipping && (
                          <button
                            onClick={() => navigate(`/shipping/${shipment.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigate(`/shipping/${shipment.id}/tracking`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Track
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shipping;