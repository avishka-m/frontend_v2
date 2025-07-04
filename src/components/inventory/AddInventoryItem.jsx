import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';
import { inventoryService } from '../../services/inventoryService';
import { locationService, supplierService, categoryService } from '../../services/masterDataService';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
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

  // Master data states
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  // Storage types based on backend model
  const storageTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'refrigerated', label: 'Refrigerated' },
    { value: 'hazardous', label: 'Hazardous' }
  ];

  // Size options based on backend model
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Load master data on component mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setDataLoading(true);
        
        // Load all master data in parallel
        const [categoriesData, suppliersData, locationsData] = await Promise.all([
          categoryService.getCategories(),
          supplierService.getSuppliers(),
          locationService.getLocations()
        ]);

        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setLocations(locationsData);

        // Set default values if data is available
        if (suppliersData.length > 0) {
          setFormData(prev => ({ ...prev, supplierID: suppliersData[0].id }));
        }
        if (locationsData.length > 0) {
          setFormData(prev => ({ ...prev, locationID: locationsData[0].id }));
        }
        
        addNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: 'Form loaded successfully',
          description: 'Master data loaded and form is ready for input.'
        });
      } catch (error) {
        console.error('Error loading master data:', error);
        addNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: 'Warning: Some data failed to load',
          description: 'Using default values. The form will still work normally.'
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadMasterData();
  }, [addNotification]);

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
      console.error('Error adding inventory item:', error);
      
      let errorMessage = 'An error occurred while adding the inventory item.';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'Invalid data provided.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to add inventory items.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You need Manager or Receiving Clerk permissions.';
      }
      
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to add item',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (formData.stock_level === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (formData.stock_level <= formData.min_stock_level) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (formData.stock_level >= formData.max_stock_level) return { label: 'Overstock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();

  if (dataLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Inventory Item</h1>
        <button
          onClick={() => navigate('/inventory')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Inventory
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                placeholder="Enter item name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Type
              </label>
              <select
                name="storage_type"
                value={formData.storage_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {storageTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                name="supplierID"
                value={formData.supplierID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                name="locationID"
                value={formData.locationID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock Level *
              </label>
              <input
                type="number"
                name="stock_level"
                value={formData.stock_level}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock Level *
              </label>
              <input
                type="number"
                name="max_stock_level"
                value={formData.max_stock_level}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">Stock Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.label}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Storage:</span> 
              <span className="ml-2 text-gray-600">{formData.storage_type.charAt(0).toUpperCase() + formData.storage_type.slice(1)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Size:</span> 
              <span className="ml-2 text-gray-600">{formData.size}</span>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventoryItem;