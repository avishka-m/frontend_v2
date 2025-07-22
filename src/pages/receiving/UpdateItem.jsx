import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, Minus, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import inventoryService from '../../services/inventoryService';
import receivingService from '../../services/receivingService';

const UpdateItem = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: 0,
    reason: 'stock_arrival',
    notes: ''
  });

  // Search for inventory items
  const searchItems = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      const response = await inventoryService.getInventory({
        search: searchTerm
      });
      
      if (response && response.length > 0) {
        setInventoryItems(response);
      } else {
        setInventoryItems([]);
        toast.info('No items found matching your search');
      }
    } catch (error) {
      console.error('Error searching items:', error);
      toast.error('Failed to search items');
    } finally {
      setLoading(false);
    }
  };

  // Handle item selection
  const selectItem = (item) => {
    setSelectedItem(item);
    setUpdateData({
      quantity: 0,
      reason: 'stock_arrival',
      notes: ''
    });
  };

  // Handle update submission
  const handleUpdate = async () => {
    if (!selectedItem) {
      toast.error('Please select an item first');
      return;
    }

    if (updateData.quantity === 0) {
      toast.error('Please enter a quantity to update');
      return;
    }

    try {
      setLoading(true);
      
      // Create a receiving record
      const receivingData = {
        items: [{
          inventoryID: selectedItem.inventoryID,
          item_name: selectedItem.item_name,
          quantity: updateData.quantity,
          unit_price: selectedItem.price || 0
        }],
        supplier: updateData.reason === 'stock_arrival' ? 'Direct Stock Update' : 'Return Processing',
        notes: updateData.notes,
        status: 'completed'
      };

      await receivingService.createReceiving(receivingData);

      // Update inventory stock level
      const newStockLevel = selectedItem.stock_level + updateData.quantity;
      await inventoryService.updateInventoryItem(selectedItem.inventoryID, {
        stock_level: newStockLevel
      });

      toast.success(`Successfully updated ${selectedItem.item_name}. New stock level: ${newStockLevel}`);
      
      // Reset form
      setSelectedItem(null);
      setUpdateData({
        quantity: 0,
        reason: 'stock_arrival',
        notes: ''
      });
      setInventoryItems([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Item Stock</h1>
        <p className="text-gray-600 mt-1">Search and update inventory stock levels</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Item</h2>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by item name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchItems()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchItems}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {inventoryItems.length > 0 && !selectedItem && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
                  <div className="space-y-2">
                    {inventoryItems.map((item) => (
                      <div
                        key={item.inventoryID}
                        onClick={() => selectItem(item)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600">
                              ID: {item.inventoryID} | Current Stock: {item.stock_level} | Category: {item.category || 'N/A'}
                            </p>
                          </div>
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Item Update Form */}
            {selectedItem && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Update Stock Level</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Item Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedItem.item_name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Item ID:</span>
                      <span className="ml-2 font-medium">{selectedItem.inventoryID}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <span className="ml-2 font-medium">{selectedItem.stock_level}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Stock Level:</span>
                      <span className="ml-2 font-medium">{selectedItem.min_stock_level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{selectedItem.category || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity to Add
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setUpdateData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Minus className="h-5 w-5 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        value={updateData.quantity}
                        onChange={(e) => setUpdateData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="w-32 text-center px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setUpdateData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Plus className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      New stock level will be: <span className="font-medium">{selectedItem.stock_level + updateData.quantity}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Update
                    </label>
                    <select
                      value={updateData.reason}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="stock_arrival">New Stock Arrival</option>
                      <option value="inventory_adjustment">Inventory Adjustment</option>
                      <option value="return_processing">Return Processing</option>
                      <option value="found_items">Found Items</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={updateData.notes}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading || updateData.quantity === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>{loading ? 'Updating...' : 'Update Stock'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default UpdateItem;