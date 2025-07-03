import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // API call to fetch order details would go here
        // Using mock data for now
        setOrder({
          id: id,
          orderNumber: `ORD-${id}`,
          customer: {
            id: '1',
            name: 'Sample Customer',
            email: 'customer@example.com',
            phone: '123-456-7890'
          },
          items: [
            { id: '1', name: 'Product A', quantity: 2, price: 20.00, total: 40.00 },
            { id: '2', name: 'Product B', quantity: 1, price: 30.00, total: 30.00 }
          ],
          status: 'Processing',
          paymentStatus: 'Paid',
          shippingAddress: '123 Main St, Anytown, USA',
          totalAmount: 70.00,
          createdAt: '2025-04-20T10:30:00.000Z'
        });
      } catch (error) {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: 'Failed to fetch order details',
          description: error.message || 'An unexpected error occurred.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, addNotification]);

  const handleStatusChange = async (newStatus) => {
    try {
      // API call to update order status would go here
      setOrder(prev => ({...prev, status: newStatus}));
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order status updated',
        description: `Order ${order.orderNumber} status changed to ${newStatus}`
      });
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update order status',
        description: error.message || 'An unexpected error occurred.'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
          >
            Back to Orders
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-medium">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="border border-gray-200 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="border border-gray-200 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
            <p className="font-medium">{order.shippingAddress}</p>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-medium">${item.total.toFixed(2)}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 border border-gray-200 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-3">Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => handleStatusChange('Shipped')}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Mark as Shipped
              </button>
              <button 
                onClick={() => handleStatusChange('Delivered')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Delivered
              </button>
              <button 
                onClick={() => handleStatusChange('Cancelled')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;