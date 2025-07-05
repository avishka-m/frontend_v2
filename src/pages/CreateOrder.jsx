import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';
import orderService,{ 
  ORDER_STATUS, 
  ORDER_PRIORITY, 
  ORDER_STATUS_DISPLAY, 
  ORDER_PRIORITY_DISPLAY 
} from '../services/orderService';
import { masterDataService } from '../services/masterDataService';
import { inventoryService } from '../services/inventoryService';
import { ArrowLeft, Plus, Trash2, Search, User, MapPin, Package, AlertCircle } from 'lucide-react';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    customerID: '',
    shipping_address: '',
    order_status: ORDER_STATUS.PENDING,
    priority: ORDER_PRIORITY.MEDIUM,
    notes: '',
    items: []
  });
  
  // Loading and validation states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Item selection state
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersData, inventoryData] = await Promise.all([
        masterDataService.getCustomers(),
        inventoryService.getItems({ limit: 1000 })
      ]);
      
      setCustomers(customersData);
      setInventoryItems(inventoryData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to load data',
        description: 'Unable to load customers and inventory items.'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerID) {
      newErrors.customerID = 'Customer is required';
    }
    
    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'Shipping address is required';
    }
    
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    // Validate individual items
    formData.items.forEach((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.price || item.price < 0) {
        newErrors[`item_${index}_price`] = 'Price must be 0 or greater';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create the order
      const newOrder = await orderService.createOrder(formData);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order Created Successfully',
        description: `Order #${newOrder.orderID} has been created and is now pending processing.`
      });
      
      // Navigate to order detail or orders list
      navigate(`/orders/${newOrder.orderID}`);
    } catch (error) {
      console.error('Error creating order:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to Create Order',
        description: error.message || 'Unable to create the order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addItem = (inventoryItem) => {
    const existingItemIndex = formData.items.findIndex(item => item.itemID === inventoryItem.itemID);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new item
      const newItem = {
        itemID: inventoryItem.itemID,
        itemName: inventoryItem.name || inventoryItem.itemName,
        quantity: 1,
        price: inventoryItem.price || inventoryItem.unit_price || 0,
        available_quantity: inventoryItem.stock_level || inventoryItem.current_stock || 0
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
    
    setShowItemSelector(false);
    setItemSearchTerm('');
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const updateItemPrice = (index, price) => {
    const updatedItems = [...formData.items];
    updatedItems[index].price = Math.max(0, parseFloat(price) || 0);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const filteredInventoryItems = inventoryItems.filter(item =>
    (item.name && item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.itemName && item.itemName.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.itemID && item.itemID.toString().includes(itemSearchTerm))
  );

  const selectedCustomer = customers.find(c => c.customerID === formData.customerID);

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    value={formData.customerID}
                    onChange={(e) => handleInputChange('customerID', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerID ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.customerID} value={customer.customerID}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                  {errors.customerID && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerID}</p>
                  )}
                </div>

                {selectedCustomer && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  value={formData.shipping_address}
                  onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete shipping address..."
                />
                {errors.shipping_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                )}
              </div>
            </div>

            {/* Order Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(ORDER_PRIORITY).map(([key, value]) => (
                      <option key={key} value={value}>
                        {ORDER_PRIORITY_DISPLAY[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.order_status}
                    onChange={(e) => handleInputChange('order_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(ORDER_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {ORDER_STATUS_DISPLAY[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h2>
                <button
                  type="button"
                  onClick={() => setShowItemSelector(true)}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                          <p className="text-sm text-gray-600">ID: {item.itemID}</p>
                          <p className="text-sm text-gray-600">Available: {item.available_quantity}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.available_quantity}
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItemPrice(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_price`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_price`]}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          Subtotal: ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.items && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.items}
                  </p>
                </div>
              )}

              {/* Order Total */}
              {formData.items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>

      {/* Item Selector Modal */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Select Items</h2>
                <button
                  onClick={() => setShowItemSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {filteredInventoryItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items found</p>
              ) : (
                <div className="space-y-2">
                  {filteredInventoryItems.map(item => (
                    <div
                      key={item.itemID}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => addItem(item)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name || item.itemName}</h3>
                        <p className="text-sm text-gray-600">ID: {item.itemID}</p>
                        <p className="text-sm text-gray-600">Available: {item.stock_level || item.current_stock || 0}</p>
                        <p className="text-sm text-gray-600">Price: ${(item.price || item.unit_price || 0).toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
