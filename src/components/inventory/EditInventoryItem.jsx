import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const EditInventoryItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    description: '',
    location: ''
  });

  // Fetch item data on component mount
  useEffect(() => {
    const fetchItemData = async () => {
      try {
        // API call to get inventory item would go here
        // For now using mock data
        setFormData({
          name: 'Sample Item',
          sku: 'SKU-12345',
          category: 'Electronics',
          quantity: 100,
          unitPrice: 19.99,
          description: 'This is a sample item',
          location: 'Warehouse A'
        });
      } catch (error) {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Failed to fetch item details',
          description: error.message || 'An error occurred while getting the inventory item.'
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchItemData();
  }, [id, addNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to update inventory would go here
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Item updated successfully',
        description: `${formData.name} has been updated.`
      });
      
      navigate('/inventory');
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update item',
        description: error.message || 'An error occurred while updating the inventory item.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Inventory Item</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Item Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </label>
          </div>
          
          {/* More form fields would go here */}
          
          <div className="col-span-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInventoryItem;