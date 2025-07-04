import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import shippingService, { SHIPPING_METHODS } from '../services/shippingService';
import { orderService } from '../services/orderService';
import workerService from '../services/workerService';

const CreateShipping = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [packedOrders, setPackedOrders] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [formData, setFormData] = useState({
    orderId: '',
    workerId: '',
    shippingMethod: '',
    estimatedDelivery: '',
    packingIds: []
  });

  // Redirect if not a manager
  if (currentUser?.role !== 'Manager') {
    navigate('/shipping');
    return null;
  }

  useEffect(() => {
    loadPackedOrders();
    loadWorkers();
  }, []);

  const loadPackedOrders = async () => {
    try {
      const orders = await orderService.getOrders({ status: 'packed' });
      setPackedOrders(orders || []);
    } catch (err) {
      console.error('Error loading packed orders:', err);
    }
  };

  const loadWorkers = async () => {
    try {
      const workers = await workerService.getWorkers({ role: 'Driver' });
      setWorkers(workers || []);
    } catch (err) {
      console.error('Error loading workers:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOrderChange = (e) => {
    const orderId = parseInt(e.target.value);
    const selectedOrder = packedOrders.find(order => order.id === orderId);
    
    setFormData(prev => ({
      ...prev,
      orderId: orderId,
      packingIds: selectedOrder?.packingIds || []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const result = await shippingService.createShipping(formData);

      if (result.success) {
        navigate('/shipping', { 
          state: { 
            message: 'Shipping record created successfully!',
            type: 'success'
          }
        });
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Failed to create shipping record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/shipping');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Shipping Record</h1>
          <p className="text-gray-600 mt-1">Create a new shipment for a packed order</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Packed Order *
              </label>
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleOrderChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.orderId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select a packed order</option>
                {packedOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - {order.customerName} ({order.items?.length || 0} items)
                  </option>
                ))}
              </select>
              {validationErrors.orderId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.orderId}</p>
              )}
              {packedOrders.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">No packed orders available for shipping</p>
              )}
            </div>

            {/* Driver Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Driver *
              </label>
              <select
                name="workerId"
                value={formData.workerId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.workerId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select a driver</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.fullName} (ID: {worker.id})
                  </option>
                ))}
              </select>
              {validationErrors.workerId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.workerId}</p>
              )}
            </div>

            {/* Shipping Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Method *
              </label>
              <select
                name="shippingMethod"
                value={formData.shippingMethod}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.shippingMethod ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select shipping method</option>
                <option value={SHIPPING_METHODS.STANDARD}>Standard</option>
                <option value={SHIPPING_METHODS.EXPRESS}>Express</option>
                <option value={SHIPPING_METHODS.SAME_DAY}>Same Day</option>
                <option value={SHIPPING_METHODS.OVERNIGHT}>Overnight</option>
              </select>
              {validationErrors.shippingMethod && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.shippingMethod}</p>
              )}
            </div>

            {/* Estimated Delivery */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="datetime-local"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.estimatedDelivery ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.estimatedDelivery && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.estimatedDelivery}</p>
              )}
            </div>
          </div>

          {/* Selected Order Details */}
          {formData.orderId && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Order Details</h3>
              {(() => {
                const selectedOrder = packedOrders.find(order => order.id === parseInt(formData.orderId));
                return selectedOrder ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <span className="ml-2 text-gray-900">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Total:</span>
                        <span className="ml-2 text-gray-900">${selectedOrder.totalAmount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-2 text-gray-900">{selectedOrder.items?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Shipping Address:</span>
                        <span className="ml-2 text-gray-900">{selectedOrder.shippingAddress}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || packedOrders.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Shipping Record'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only orders with "packed" status can be shipped. 
              Make sure the order has been packed before creating a shipping record.
              The estimated delivery date should account for the selected shipping method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipping;
