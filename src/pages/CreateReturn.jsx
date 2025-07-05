import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import returnsService, { RETURNS_METHODS, RETURN_REASONS, ITEM_CONDITIONS } from '../services/returnsService';
import orderService from '../services/orderService';
import workerService from '../services/workerService';
import { customerService } from '../services/customerService';

const CreateReturn = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    workerId: '',
    returnMethod: 'customer_drop_off',
    items: [],
    notes: ''
  });

  // Redirect if not a manager
  if (currentUser?.role !== 'Manager') {
    navigate('/returns');
    return null;
  }

  useEffect(() => {
    loadDeliveredOrders();
    loadWorkers();
    loadCustomers();
  }, []);

  const loadDeliveredOrders = async () => {
    try {
      const orders = await orderService.getOrders({ status: 'delivered' });
      setDeliveredOrders(orders || []);
    } catch (err) {
      console.error('Error loading delivered orders:', err);
    }
  };

  const loadWorkers = async () => {
    try {
      const workers = await workerService.getWorkers({ role: 'ReceivingClerk' });
      setWorkers(workers || []);
    } catch (err) {
      console.error('Error loading workers:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const result = await customerService.getCustomers();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
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
        [name]: undefined
      }));
    }
  };

  const handleOrderChange = (e) => {
    const orderId = parseInt(e.target.value);
    const order = deliveredOrders.find(o => o.orderID === orderId);
    
    setSelectedOrder(order);
    setFormData(prev => ({
      ...prev,
      orderId: orderId,
      customerId: order?.customerID || '',
      items: order?.items?.map(item => ({
        itemId: item.itemID,
        orderDetailId: item.orderDetailID || item.itemID, // Fallback if orderDetailID not available
        quantity: 1,
        maxQuantity: item.quantity,
        reason: '',
        condition: '',
        notes: ''
      })) || []
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));

    // Clear validation error
    const errorKey = `items.${index}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      // Filter out items with no reason or condition
      const itemsToReturn = formData.items.filter(item => 
        item.reason && item.condition && item.quantity > 0
      );

      if (itemsToReturn.length === 0) {
        setError('Please select at least one item to return with reason and condition');
        setLoading(false);
        return;
      }

      const returnData = {
        ...formData,
        items: itemsToReturn,
        returnDate: new Date().toISOString()
      };

      const result = await returnsService.createReturns(returnData);

      if (result.success) {
        navigate('/returns', { 
          state: { 
            message: 'Return record created successfully!',
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
      setError('Failed to create return record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/returns');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Return Record</h1>
          <p className="text-gray-600">Process a new product return</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
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

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order *
              </label>
              <select
                name="orderId"
                value={formData.orderId}
                onChange={handleOrderChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.orderId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select delivered order</option>
                {deliveredOrders.map(order => (
                  <option key={order.orderID} value={order.orderID}>
                    Order #{order.orderID} - Customer #{order.customerID}
                  </option>
                ))}
              </select>
              {validationErrors.orderId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.orderId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.orderId}
              >
                <option value="">Select customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - #{customer.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiving Clerk *
              </label>
              <select
                name="workerId"
                value={formData.workerId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.workerId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select receiving clerk</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.email}
                  </option>
                ))}
              </select>
              {validationErrors.workerId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.workerId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Method *
              </label>
              <select
                name="returnMethod"
                value={formData.returnMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={RETURNS_METHODS.CUSTOMER_DROP_OFF}>Customer Drop-off</option>
                <option value={RETURNS_METHODS.MAIL_RETURN}>Mail Return</option>
                <option value={RETURNS_METHODS.PICKUP}>Pickup</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          {selectedOrder && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return Items</h3>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Item #{item.itemId}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Max: {item.maxQuantity}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason *
                        </label>
                        <select
                          value={item.reason}
                          onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select reason</option>
                          {Object.entries(RETURN_REASONS).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Condition *
                        </label>
                        <select
                          value={item.condition}
                          onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select condition</option>
                          {Object.entries(ITEM_CONDITIONS).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          placeholder="Additional notes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes about the return"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.orderId || !formData.workerId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReturn;
