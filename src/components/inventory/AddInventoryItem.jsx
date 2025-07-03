import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';
import { inventoryService } from '../../services/inventoryService';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  // Form state - Updated to match backend model
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    size: 'M',
    storage_type: 'standard',
    stock_level: 0,
    min_stock_level: 10,
    max_stock_level: 100,
    supplierID: 1,
    locationID: 1
  });

  // Categories based on backend sample data
  const categories = [
    'Electronics',
    'Clothing', 
    'Food',
    'Other'
  ];

  // Storage types based on backend model
  const storageTypes = [
    'standard',
    'refrigerated',
    'hazardous'
  ];

  // Size options based on backend model
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Mock supplier and location options (would come from backend in real app)
  const suppliers = [
    { id: 1, name: 'TechCorp Electronics' },
    { id: 2, name: 'Fashion World' },
    { id: 3, name: 'Food Supply Co' }
  ];

  const locations = [
    { id: 1, name: 'Warehouse A-1' },
    { id: 2, name: 'Warehouse A-2' },
    { id: 3, name: 'Warehouse B-1' },
    { id: 4, name: 'Warehouse B-2' },
    { id: 5, name: 'Cold Storage' },
    { id: 6, name: 'Receiving Dock' },
    { id: 7, name: 'Shipping Dock' },
    { id: 8, name: 'Hazmat Storage' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['stock_level', 'min_stock_level', 'max_stock_level', 'supplierID', 'locationID'].includes(name) 
        ? parseInt(value) || 0 
        : value
    });
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

    if (!formData.category) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Category is required.'
      });
      return false;
    }

    if (formData.stock_level < 0) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Stock level cannot be negative.'
      });
      return false;
    }

    if (formData.min_stock_level < 0) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Minimum stock level cannot be negative.'
      });
      return false;
    }

    if (formData.max_stock_level <= formData.min_stock_level) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Maximum stock level must be greater than minimum stock level.'
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
      const createdItem = await inventoryService.addInventoryItem(formData);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Item added successfully',
        description: `${formData.name} has been added to inventory with ID ${createdItem.itemID}.`
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
                Category *
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
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
                Size
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Storage Type
                <select
                  name="storage_type"
                  value={formData.storage_type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {storageTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Supplier *
                <select
                  name="supplierID"
                  value={formData.supplierID}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Location *
                <select
                  name="locationID"
                  value={formData.locationID}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Stock Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Current Stock Level *
                <input
                  type="number"
                  name="stock_level"
                  value={formData.stock_level}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Minimum Stock Level *
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Maximum Stock Level *
                <input
                  type="number"
                  name="max_stock_level"
                  value={formData.max_stock_level}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
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
              <span className="font-medium">Stock Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                formData.stock_level === 0
                  ? 'bg-red-100 text-red-800' 
                  : formData.stock_level <= formData.min_stock_level 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : formData.stock_level >= formData.max_stock_level 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
              }`}>
                {formData.stock_level === 0
                  ? 'Out of Stock' 
                  : formData.stock_level <= formData.min_stock_level 
                    ? 'Low Stock' 
                    : formData.stock_level >= formData.max_stock_level 
                      ? 'Overstock' 
                      : 'Normal'}
              </span>
            </div>
            <div>
              <span className="font-medium">Storage:</span> {formData.storage_type.charAt(0).toUpperCase() + formData.storage_type.slice(1)}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formData.size}
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