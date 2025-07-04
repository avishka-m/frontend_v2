import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import shippingService, { SHIPPING_STATUS, SHIPPING_METHODS } from '../services/shippingService';
import vehicleService from '../services/vehicleService';

const ShippingDetail = () => {
  const { shippingId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  const [dispatchForm, setDispatchForm] = useState({
    vehicleId: '',
    trackingInfo: {}
  });

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryProof: '',
    notes: ''
  });

  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const isManager = currentUser?.role === 'Manager';
  const isDriver = currentUser?.role === 'Driver';
  const canEdit = isManager || (isDriver && shipment?.workerId === currentUser?.workerID);

  useEffect(() => {
    loadShipment();
    loadAvailableVehicles();
  }, [shippingId]);

  const loadShipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await shippingService.getShipping(shippingId);
      
      if (result.success) {
        setShipment(result.data);
        setFormData({
          status: result.data.status,
          trackingNumber: result.data.trackingNumber || '',
          estimatedDelivery: result.data.estimatedDelivery ? 
            new Date(result.data.estimatedDelivery).toISOString().slice(0, 16) : '',
          notes: result.data.notes || ''
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVehicles = async () => {
    try {
      const result = await vehicleService.getAvailableVehicles();
      if (result.success) {
        setAvailableVehicles(result.data);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        status: formData.status,
        trackingNumber: formData.trackingNumber,
        estimatedDelivery: formData.estimatedDelivery,
        notes: formData.notes
      };

      const result = await shippingService.updateShipping(shippingId, updateData);

      if (result.success) {
        setShipment(result.data);
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await shippingService.dispatchShipping(shippingId, {
        vehicleId: parseInt(dispatchForm.vehicleId),
        trackingInfo: { ...dispatchForm.trackingInfo, dispatchedAt: new Date().toISOString() }
      });

      if (result.success) {
        setShipment(result.data);
        setShowDispatchForm(false);
        setDispatchForm({ vehicleId: '', trackingInfo: {} });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to dispatch shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await shippingService.deliverShipping(shippingId, {
        deliveryProof: deliveryForm.deliveryProof,
        notes: deliveryForm.notes
      });

      if (result.success) {
        setShipment(result.data);
        setShowDeliveryForm(false);
        setDeliveryForm({ deliveryProof: '', notes: '' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to mark shipment as delivered');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading shipment details...</p>
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="max-w-2xl mx-auto">
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
        <div className="mt-4">
          <button
            onClick={() => navigate('/shipping')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Shipping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/shipping')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-2">{getStatusIcon(shipment?.status)}</span>
              Shipment #{shipment?.shippingId}
            </h1>
            <p className="text-gray-600 mt-1">Order #{shipment?.orderId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(shipment?.status)}`}>
            {shipment?.status?.replace('_', ' ')}
          </span>
        </div>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-3">
          {shipment?.status === SHIPPING_STATUS.PENDING && (isDriver || isManager) && (
            <button
              onClick={() => setShowDispatchForm(!showDispatchForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Dispatch Shipment
            </button>
          )}
          
          {shipment?.status === SHIPPING_STATUS.IN_TRANSIT && (isDriver || isManager) && (
            <button
              onClick={() => setShowDeliveryForm(!showDeliveryForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Mark as Delivered
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          )}

          <button
            onClick={() => navigate(`/shipping/${shippingId}/tracking`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            View Tracking
          </button>
        </div>
      </div>

      {/* Dispatch Form */}
      {showDispatchForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Shipment</h2>
          <form onSubmit={handleDispatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vehicle *
              </label>
              <select
                value={dispatchForm.vehicleId}
                onChange={(e) => setDispatchForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a vehicle</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.model} (Capacity: {vehicle.capacity}kg)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDispatchForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !dispatchForm.vehicleId}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Dispatching...' : 'Dispatch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Form */}
      {showDeliveryForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark as Delivered</h2>
          <form onSubmit={handleDeliver} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Proof *
              </label>
              <input
                type="text"
                value={deliveryForm.deliveryProof}
                onChange={(e) => setDeliveryForm(prev => ({ ...prev, deliveryProof: e.target.value }))}
                placeholder="e.g., Signature received, Photo taken, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Notes
              </label>
              <textarea
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Optional notes about the delivery..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeliveryForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !deliveryForm.deliveryProof}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Marking as Delivered...' : 'Mark as Delivered'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipment Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipment Information</h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="datetime-local"
                    name="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order ID</h3>
                <p className="text-gray-900">#{shipment?.orderId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Method</h3>
                <p className="text-gray-900 capitalize">{shipment?.shippingMethod}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tracking Number</h3>
                <p className="text-gray-900">{shipment?.trackingNumber || 'Not assigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned Driver</h3>
                <p className="text-gray-900">Worker #{shipment?.workerId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vehicle</h3>
                <p className="text-gray-900">{shipment?.vehicleId ? `Vehicle #${shipment.vehicleId}` : 'Not assigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Delivery</h3>
                <p className="text-gray-900">
                  {shipment?.estimatedDelivery 
                    ? new Date(shipment.estimatedDelivery).toLocaleString()
                    : 'Not set'}
                </p>
              </div>
              {shipment?.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-gray-900">{shipment.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recipient</h3>
              <p className="text-gray-900">{shipment?.recipientName || 'Customer #' + shipment?.orderId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
              <p className="text-gray-900">{shipment?.deliveryAddress || 'Not specified'}</p>
            </div>
            {shipment?.departureTime && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Departure Time</h3>
                <p className="text-gray-900">{new Date(shipment.departureTime).toLocaleString()}</p>
              </div>
            )}
            {shipment?.actualDelivery && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Actual Delivery</h3>
                <p className="text-gray-900">{new Date(shipment.actualDelivery).toLocaleString()}</p>
              </div>
            )}
            {shipment?.deliveryProof && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Proof</h3>
                <p className="text-gray-900">{shipment.deliveryProof}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <p className="text-gray-900">
                {shipment?.createdAt
                  ? new Date(shipment.createdAt).toLocaleString()
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
              <p className="text-gray-900">
                {shipment?.updatedAt
                  ? new Date(shipment.updatedAt).toLocaleString()
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetail;
