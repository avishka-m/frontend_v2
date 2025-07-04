import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';
import { 
  orderService, 
  ORDER_STATUS, 
  ORDER_PRIORITY, 
  ORDER_STATUS_DISPLAY, 
  ORDER_PRIORITY_DISPLAY,
  ORDER_STATUS_COLORS,
  ORDER_PRIORITY_COLORS
} from '../services/orderService';
import { masterDataService } from '../services/masterDataService';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Truck,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';

const OrderDetail = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    shipping_address: '',
    order_status: '',
    priority: '',
    notes: '',
    assigned_worker: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadOrder();
    loadCustomers();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) {
      console.error('No order ID provided');
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Order',
        description: 'No order ID was provided in the URL.'
      });
      navigate('/orders');
      return;
    }

    try {
      setLoading(true);
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
      
      // Initialize edit form with current data
      setEditForm({
        shipping_address: orderData.shipping_address || '',
        order_status: orderData.order_status || '',
        priority: orderData.priority || '',
        notes: orderData.notes || '',
        assigned_worker: orderData.assigned_worker || ''
      });
    } catch (error) {
      console.error('Error loading order:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to load order',
        description: error.message || 'Unable to fetch order details.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await masterDataService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setErrors({});
    
    if (!isEditing) {
      // Reset form when entering edit mode
      setEditForm({
        shipping_address: order.shipping_address || '',
        order_status: order.order_status || '',
        priority: order.priority || '',
        notes: order.notes || '',
        assigned_worker: order.assigned_worker || ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.shipping_address.trim()) {
      newErrors.shipping_address = 'Shipping address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!orderId) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Order',
        description: 'No order ID available.'
      });
      return;
    }

    if (!validateForm()) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Please fix the errors in the form before saving.'
      });
      return;
    }

    try {
      setSaving(true);
      
      const updatedOrder = await orderService.updateOrder(orderId, editForm);
      setOrder(updatedOrder);
      setIsEditing(false);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Order Updated',
        description: 'Order details have been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update order',
        description: error.message || 'Unable to update order details.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!orderId) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Order',
        description: 'No order ID available.'
      });
      return;
    }

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const updatedOrder = await orderService.getOrder(orderId);
      setOrder(updatedOrder);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Status Updated',
        description: `Order status changed to ${ORDER_STATUS_DISPLAY[newStatus]}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update status',
        description: error.message || 'Unable to update order status.'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const calculateTotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="w-4 h-4" />;
      case ORDER_STATUS.PROCESSING:
        return <Package className="w-4 h-4" />;
      case ORDER_STATUS.SHIPPED:
        return <Truck className="w-4 h-4" />;
      case ORDER_STATUS.DELIVERED:
        return <CheckCircle className="w-4 h-4" />;
      case ORDER_STATUS.CANCELLED:
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const customer = customers.find(c => c.customerID === order?.customerID);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Orders
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderID}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.order_status]}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(order.order_status)}
                    <span>{order.status_display}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_PRIORITY_COLORS[order.priority]}`}>
                  {order.priority_display} Priority
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <p className="text-gray-900">{order.orderID}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(order.order_date)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(order.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <p className="text-gray-900">{order.customerID}</p>
              </div>
              {customer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            
            {isEditing ? (
              <div>
                <textarea
                  value={editForm.shipping_address}
                  onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter shipping address..."
                />
                {errors.shipping_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{order.shipping_address}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items ({order.items?.length || 0})
            </h2>
            
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.itemName || `Item ${item.itemID}`}</h3>
                        <p className="text-sm text-gray-600">ID: {item.itemID}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm text-gray-600">Price: ${(item.price || 0).toFixed(2)}</span>
                          <span className="text-sm font-medium text-gray-900">
                            Total: ${(item.quantity * (item.price || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No items in this order</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Notes
            </h2>
            
            {isEditing ? (
              <textarea
                value={editForm.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this order..."
              />
            ) : (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {order.notes || 'No notes added'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ORDER_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {ORDER_STATUS_DISPLAY[value]}
                    </option>
                  ))}
                </select>
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
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
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Count:</span>
                <span className="font-medium">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-medium">{order.items_total_quantity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Worker Assignment</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Worker
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.assigned_worker}
                    onChange={(e) => handleInputChange('assigned_worker', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter worker ID or name..."
                  />
                ) : (
                  <p className="text-gray-900">{order.worker_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
