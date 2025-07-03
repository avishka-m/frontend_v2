import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Customer form state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Fetch available inventory on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // API call to fetch available inventory would go here
        // Using mock data for now
        setAvailableItems([
          { id: '1', name: 'Product A', sku: 'SKU001', availableQuantity: 50, price: 20.00 },
          { id: '2', name: 'Product B', sku: 'SKU002', availableQuantity: 35, price: 30.00 },
          { id: '3', name: 'Product C', sku: 'SKU003', availableQuantity: 15, price: 25.00 }
        ]);
      } catch (error) {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Failed to fetch inventory',
          description: error.message || 'An unexpected error occurred.'
        });
      }
    };

    fetchInventory();
  }, [addNotification]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value
    });
  };

  const handleAddItem = (item) => {
    const existingItemIndex = selectedItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * item.price;
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          total: item.price
        }
      ]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedItems = selectedItems.map(item => {
      if (item.id === itemId) {
        const quantity = Math.max(1, parseInt(newQuantity));
        return {
          ...item,
          quantity,
          total: quantity * item.price
        };
      }
      return item;
    });
    
    setSelectedItems(updatedItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (selectedItems.length === 0) {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Empty order',
          description: 'Please add at least one item to the order.'
        });
        setLoading(false);
        return;
      }
      
      // API call to create order would go here
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order created successfully',
        description: `Order for ${customerDetails.name} has been created.`
      });
      
      navigate('/orders');
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to create order',
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Order</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Customer Details */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Shipping Address
                <input
                  type="text"
                  name="address"
                  value={customerDetails.address}
                  onChange={handleCustomerChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="mb-6 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          
          {/* Available Products */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Add Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableItems.map(item => (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAddItem(item)}
                >
                  <p className="font-medium">{item.name}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>SKU: {item.sku}</p>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-gray-500">Available: {item.availableQuantity}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected Items */}
          <div>
            <h3 className="text-md font-medium mb-2">Order Items</h3>
            
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 italic">No items added yet. Click on products above to add them to the order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">${item.total.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-4 py-3 text-right font-medium">Total:</td>
                      <td colSpan="2" className="px-4 py-3 font-bold">${calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
            disabled={loading || selectedItems.length === 0}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;