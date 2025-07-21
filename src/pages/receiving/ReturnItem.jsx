import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import inventoryService from '../../services/inventoryService';
import returnsService from '../../services/returnsService';

const ReturnItem = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returnForm, setReturnForm] = useState({
    item_id: '',
    item_name: '',
    return_reason: '',
    quantity: 1,
    returned_by: '',
    notes: ''
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Load all inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory({ limit: 1000 });
      
      if (response && response.length > 0) {
        setInventoryItems(response);
      } else {
        setInventoryItems([]);
        toast('No inventory items found', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('Inventory API endpoint not found.');
      } else if (!error.response) {
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else {
        toast.error('Failed to load inventory items: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle item ID selection
  const handleItemIdChange = (itemId) => {
    const item = inventoryItems.find(i => i.itemID === parseInt(itemId));
    if (item) {
      setReturnForm(prev => ({
        ...prev,
        item_id: itemId,
        item_name: item.name
      }));
      setSelectedItem(item);
    } else {
      setReturnForm(prev => ({
        ...prev,
        item_id: itemId,
        item_name: ''
      }));
      setSelectedItem(null);
    }
  };

  // Handle item name selection
  const handleItemNameChange = (itemName) => {
    const item = inventoryItems.find(i => i.name === itemName);
    if (item) {
      setReturnForm(prev => ({
        ...prev,
        item_id: item.itemID.toString(),
        item_name: itemName
      }));
      setSelectedItem(item);
    } else {
      setReturnForm(prev => ({
        ...prev,
        item_id: '',
        item_name: itemName
      }));
      setSelectedItem(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setReturnForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle return submission
  const handleReturn = async () => {
    // Validation
    if (!returnForm.item_id || !returnForm.item_name) {
      toast.error('Please select both item ID and item name');
      return;
    }

    if (!returnForm.return_reason) {
      toast.error('Please select a return reason');
      return;
    }

    if (!returnForm.quantity || returnForm.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!returnForm.returned_by.trim()) {
      toast.error('Please enter who returned the item');
      return;
    }

    if (!selectedItem) {
      toast.error('Selected item not found in inventory');
      return;
    }

    if (returnForm.quantity > selectedItem.stock_level) {
      toast.error(`Return quantity (${returnForm.quantity}) exceeds available stock (${selectedItem.stock_level})`);
      return;
    }

    try {
      setLoading(true);
      
      // Get current user info from localStorage
      const currentUserId = localStorage.getItem('userId') || '2'; // Default to worker ID 2 if not found
      
      // Create return record with proper format for backend
      const returnPayload = {
        orderId: 1, // For now, using a default order ID - in real scenario, this should be selected
        customerId: 1, // For now, using a default customer ID - in real scenario, this should be selected
        workerId: parseInt(currentUserId),
        returnDate: new Date().toISOString(),
        status: 'pending',
        returnMethod: 'customer_drop_off',
        items: [{
          itemId: selectedItem.itemID,
          orderDetailId: 1, // In real scenario, this should come from the order details
          quantity: returnForm.quantity,
          reason: returnForm.return_reason === 'damaged' ? 'Damaged in shipping' : 'Wrong item',
          condition: returnForm.return_reason === 'damaged' ? 'damaged' : 'new',
          notes: `Return reason: ${returnForm.return_reason}. ${returnForm.notes || ''}`
        }],
        notes: `Returned by: ${returnForm.returned_by}. ${returnForm.notes || ''}`
      };

      const result = await returnsService.createReturns(returnPayload);
      
      if (!result.success) {
        console.error('Return creation failed:', result.error);
        console.error('Validation errors:', result.validationErrors);
        toast.error(result.error || 'Failed to create return');
        return;
      }

      // Handle inventory update based on return reason
      if (returnForm.return_reason === 'damaged') {
        // For damaged items, don't update inventory - they can't be restocked
        toast('Damaged item recorded. Item will not be restocked to inventory.', { icon: '⚠️' });
        
        // Log damaged item for tracking
        console.log('DAMAGED ITEM TRACKING:', {
          type: 'damaged_return',
          item: selectedItem.name,
          itemId: selectedItem.itemID,
          quantity: returnForm.quantity,
          returned_by: returnForm.returned_by,
          timestamp: new Date().toISOString()
        });
      } else if (returnForm.return_reason === 'exchanged') {
        // For exchanged items, notify manager - no inventory update yet (manager will approve first)
        
        // Send notification to manager (the return was already created above)
        console.log('MANAGER NOTIFICATION:', {
          type: 'exchange_request',
          item: selectedItem.name,
          itemId: selectedItem.itemID,
          quantity: returnForm.quantity,
          returned_by: returnForm.returned_by,
          returnId: result.data?.returnID,
          timestamp: new Date().toISOString()
        });
        
        toast.success('Exchange request sent to manager for approval');
      }

      toast.success('Return processed successfully');
      
      // Reset form
      setReturnForm({
        item_id: '',
        item_name: '',
        return_reason: '',
        quantity: 1,
        returned_by: '',
        notes: ''
      });
      setSelectedItem(null);
    } catch (error) {
      console.error('Error processing return:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.data?.detail) {
        toast.error(`Failed to process return: ${error.response.data.detail}`);
      } else if (error.message) {
        toast.error(`Failed to process return: ${error.message}`);
      } else {
        toast.error('Failed to process return. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique item IDs and names for dropdowns
  const itemIds = inventoryItems.map(item => item.itemID).sort((a, b) => a - b);
  const itemNames = inventoryItems.map(item => item.name).sort();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Process Item Return</h1>
        <p className="text-gray-600 mt-1">Record customer returns with item selection</p>
      </div>

      {/* Return Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Return Item Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Item Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item ID *
              </label>
              <select
                value={returnForm.item_id}
                onChange={(e) => handleItemIdChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Item ID</option>
                {itemIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <select
                value={returnForm.item_name}
                onChange={(e) => handleItemNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Item Name</option>
                {itemNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Reason *
              </label>
              <select
                value={returnForm.return_reason}
                onChange={(e) => handleInputChange('return_reason', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Return Reason</option>
                <option value="damaged">Damaged</option>
                <option value="exchanged">Exchanged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={returnForm.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                min="1"
                max={selectedItem?.stock_level || 999}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
              {selectedItem && returnForm.quantity > selectedItem.stock_level && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Exceeds available stock ({selectedItem.stock_level})
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer Info & Selected Item Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Returned By *
              </label>
              <input
                type="text"
                value={returnForm.returned_by}
                onChange={(e) => handleInputChange('returned_by', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter who returned the item"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={returnForm.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Selected Item Info */}
            {selectedItem && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Item Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">ID:</span> {selectedItem.itemID}</p>
                  <p><span className="font-medium">Name:</span> {selectedItem.name}</p>
                  <p><span className="font-medium">Category:</span> {selectedItem.category}</p>
                  <p><span className="font-medium">Available Stock:</span> {selectedItem.stock_level}</p>
                  <p><span className="font-medium">Storage Type:</span> {selectedItem.storage_type}</p>
                </div>
              </div>
            )}

            {/* Return Reason Info */}
            {returnForm.return_reason && (
              <div className={`p-4 rounded-lg ${
                returnForm.return_reason === 'damaged' 
                  ? 'bg-red-50 border-l-4 border-red-400' 
                  : 'bg-blue-50 border-l-4 border-blue-400'
              }`}>
                <div className="flex items-center">
                  {returnForm.return_reason === 'damaged' ? (
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-400 mr-2" />
                  )}
                  <h3 className={`text-sm font-medium ${
                    returnForm.return_reason === 'damaged' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {returnForm.return_reason === 'damaged' ? 'Damaged Item' : 'Exchange Request'}
                  </h3>
                </div>
                <p className={`text-sm mt-1 ${
                  returnForm.return_reason === 'damaged' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {returnForm.return_reason === 'damaged' 
                    ? 'This item will not be restocked to inventory due to damage.'
                    : 'Manager will be notified for exchange approval.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
          <button
            onClick={() => {
              setReturnForm({
                item_id: '',
                item_name: '',
                return_reason: '',
                quantity: 1,
                returned_by: '',
                notes: ''
              });
              setSelectedItem(null);
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear Form
          </button>
          <button
            onClick={handleReturn}
            disabled={loading || !returnForm.item_id || !returnForm.item_name || !returnForm.return_reason || !returnForm.returned_by}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>{loading ? 'Processing...' : 'Process Return'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnItem;