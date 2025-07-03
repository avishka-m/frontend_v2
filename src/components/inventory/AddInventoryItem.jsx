import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    reorderLevel: 10,
    maxStockLevel: 100,
    description: '',
    location: '',
    supplier: '',
    barcode: '',
    expiryDate: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    }
  });

  // Categories and locations for dropdowns
  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Tools & Hardware',
    'Food & Beverages',
    'Other'
  ];

  const locations = [
    'Warehouse A - Section 1',
    'Warehouse A - Section 2',
    'Warehouse A - Section 3',
    'Warehouse B - Section 1',
    'Warehouse B - Section 2',
    'Storage Room',
    'Cold Storage',
    'Receiving Dock',
    'Shipping Dock'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData({
        ...formData,
        dimensions: {
          ...formData.dimensions,
          [dimension]: parseFloat(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: ['quantity', 'unitPrice', 'reorderLevel', 'maxStockLevel', 'weight'].includes(name) 
          ? parseFloat(value) || 0 
          : value
      });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Item name is required.'
      });
      return false;
    }

    if (!formData.sku.trim()) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'SKU is required.'
      });
      return false;
    }

    if (formData.quantity < 0) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Quantity cannot be negative.'
      });
      return false;
    }

    if (formData.unitPrice <= 0) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Unit price must be greater than 0.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // API call to add inventory would go here
      // const response = await fetch('/api/inventory', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to add inventory item');
      // }
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Item added successfully',
        description: `${formData.name} (SKU: ${formData.sku}) has been added to inventory.`
      });
      
      navigate('/inventory');
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to add item',
        description: error.message || 'An error occurred while adding the inventory item.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Inventory Item</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Item Name *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                  placeholder="Enter item name"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                SKU *
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                  placeholder="e.g., SKU001"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Supplier
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Supplier name"
                />
              </label>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Item description"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Inventory Details */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Inventory Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Current Quantity *
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Unit Price * ($)
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Reorder Level
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Max Stock Level
                <input
                  type="number"
                  name="maxStockLevel"
                  value={formData.maxStockLevel}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Location
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Barcode
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Barcode number"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Physical Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Weight (kg)
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Length (cm)
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Width (cm)
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Height (cm)
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Expiry Date
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 border border-gray-200 rounded-md p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Value:</span> ${(formData.quantity * formData.unitPrice).toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Stock Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                formData.quantity <= formData.reorderLevel 
                  ? 'bg-red-100 text-red-800' 
                  : formData.quantity >= formData.maxStockLevel 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {formData.quantity <= formData.reorderLevel 
                  ? 'Low Stock' 
                  : formData.quantity >= formData.maxStockLevel 
                    ? 'Overstock' 
                    : 'Normal'}
              </span>
            </div>
            <div>
              <span className="font-medium">Volume:</span> {(formData.dimensions.length * formData.dimensions.width * formData.dimensions.height / 1000).toFixed(2)} L
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryItem;