import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { inventoryService } from '../services/inventoryService';
import inventoryIncreaseService from '../services/inventoryIncreaseService';
import { Package, X, Save } from 'lucide-react';

const UpdateInventory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    existingQuantity: 0,
    newQuantity: '',
    totalQuantity: 0
  });

  // Redirect if not a receiving clerk or manager
  useEffect(() => {
    if (currentUser?.role !== 'ReceivingClerk' && currentUser?.role !== 'Manager') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Load all inventory items on mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setSearchLoading(true);
      // Temporarily reduce limit to debug the issue
      const items = await inventoryService.getInventory({ limit: 100 });
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle item selection by ID
  const handleItemIdChange = (value) => {
    if (!value) {
      handleClear();
      return;
    }
    
    const item = inventoryItems.find(i => i.inventoryID.toString() === value);
    if (item) {
      setFormData({
        itemId: item.inventoryID,
        itemName: item.item_name,
        existingQuantity: item.stock_level,
        newQuantity: '',
        totalQuantity: item.stock_level
      });
    }
  };

  // Handle item selection by name
  const handleItemNameChange = (value) => {
    if (!value) {
      handleClear();
      return;
    }
    
    const item = inventoryItems.find(i => i.item_name === value);
    if (item) {
      setFormData({
        itemId: item.inventoryID,
        itemName: item.item_name,
        existingQuantity: item.stock_level,
        newQuantity: '',
        totalQuantity: item.stock_level
      });
    }
  };

  // Handle clear button
  const handleClear = () => {
    setFormData({
      itemId: '',
      itemName: '',
      existingQuantity: 0,
      newQuantity: '',
      totalQuantity: 0
    });
  };

  // Handle newly received stock input
  const handleNewQuantityChange = (value) => {
    const newQty = parseInt(value) || 0;
    const total = formData.existingQuantity + newQty;
    setFormData(prev => ({ 
      ...prev, 
      newQuantity: value,
      totalQuantity: total
    }));
  };

  // Handle update inventory
  const handleUpdate = async () => {
    // Validation
    if (!formData.itemId) {
      toast.error('Please select an item');
      return;
    }

    if (!formData.newQuantity || parseInt(formData.newQuantity) <= 0) {
      toast.error('Please enter a valid quantity to add');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Starting inventory update process...');
      console.log('Form Data:', formData);
      
      // Calculate total stock (existing + newly received)
      const totalStock = formData.existingQuantity + parseInt(formData.newQuantity);
      
      // Call inventory update API with the total
      console.log('Updating inventory stock level to:', totalStock);
      const result = await inventoryService.updateInventory(formData.itemId, {
        stock_level: totalStock
      });

      if (result.success) {
        console.log('Inventory stock level updated successfully');
        
        // Record the inventory increase
        const increaseData = {
          itemID: formData.itemId,
          item_name: formData.itemName,
          size: 'N/A', // You might want to add size to the form if needed
          quantity: parseInt(formData.newQuantity),
          reason: 'stock_arrival',
          source: 'Direct Stock Update',
          reference_id: null,
          notes: `Stock increased from ${formData.existingQuantity} to ${totalStock}`,
          performed_by: currentUser?.username || 'system'
        };
        
        console.log('Recording inventory increase with data:', increaseData);
        try {
          const increaseResponse = await inventoryIncreaseService.recordIncrease(increaseData);
          console.log('Inventory increase recorded successfully:', increaseResponse);
        } catch (error) {
          console.error('Error recording inventory increase:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Don't throw here, just log the error so the main update still succeeds
        }
        
        toast.success(`Inventory updated! Added ${formData.newQuantity} units. New total: ${totalStock}`);
        
        // Clear form after successful update
        handleClear();
        
        // Reload inventory items to get fresh data
        loadInventoryItems();
      } else {
        toast.error(result.error || 'Failed to update inventory');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      console.error('Full error details:', error.response?.data || error.message);
      toast.error('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Inventory</h1>
            <p className="text-gray-600">Update stock levels for inventory items</p>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Item ID and Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item ID
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => handleItemIdChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select item by ID</option>
                {inventoryItems
                  .sort((a, b) => a.inventoryID - b.inventoryID)
                  .map((item) => (
                    <option key={item.inventoryID} value={item.inventoryID}>
                      {item.inventoryID} - {item.item_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <select
                value={formData.itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select item by name</option>
                {inventoryItems
                  .sort((a, b) => a.item_name.localeCompare(b.item_name))
                  .map((item) => (
                    <option key={item.inventoryID} value={item.item_name}>
                      {item.item_name} (ID: {item.inventoryID})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Existing Quantity (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                value={formData.existingQuantity}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Newly Received Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Newly Received Stock
              </label>
              <input
                type="number"
                value={formData.newQuantity}
                onChange={(e) => handleNewQuantityChange(e.target.value)}
                placeholder="Enter quantity to add"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Total After Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total After Update
              </label>
              <input
                type="number"
                value={formData.totalQuantity}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-green-50 font-semibold text-green-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || !formData.itemId || !formData.newQuantity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Inventory'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {searchLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory items...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateInventory;
