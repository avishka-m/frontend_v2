import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Play, 
  Truck, 
  AlertCircle,
  Edit,
  Eye,
  Box,
  Scale,
  FileText,
  Save,
  X,
  MapPin,
  Hash
} from 'lucide-react';
import receivingService from '../services/receivingService';

const ReceivingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [receiving, setReceiving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [processData, setProcessData] = useState({
    items: []
  });

  useEffect(() => {
    fetchReceivingDetails();
  }, [id]);

  const fetchReceivingDetails = async () => {
    try {
      setLoading(true);
      const result = await receivingService.getReceivingById(id);
      
      if (result.success) {
        setReceiving(result.data);
        setEditData({
          status: result.data.status,
          reference_number: result.data.reference_number || '',
          notes: result.data.notes || ''
        });
        
        // Initialize process data
        setProcessData({
          items: result.data.items?.map(item => ({
            ...item,
            actual_quantity: item.quantity,
            condition: item.condition || 'good',
            notes: item.notes || '',
            locationID: item.locationID || null
          })) || []
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch receiving details');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReceiving = async () => {
    try {
      setProcessingAction('processing');
      const result = await receivingService.processReceiving(id);
      
      if (result.success) {
        setReceiving(result.data);
        setShowProcessModal(false);
        alert('Receiving processed successfully!');
      } else {
        alert('Failed to process receiving: ' + result.error);
      }
    } catch (err) {
      alert('Failed to process receiving');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUpdateReceiving = async () => {
    try {
      setProcessingAction('updating');
      const result = await receivingService.updateReceiving(id, editData);
      
      if (result.success) {
        setReceiving(result.data);
        setShowEditModal(false);
        alert('Receiving updated successfully!');
      } else {
        alert('Failed to update receiving: ' + result.error);
      }
    } catch (err) {
      alert('Failed to update receiving');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...processData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setProcessData({ ...processData, items: updatedItems });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{receivingService.getStatusDisplay(status)}</span>
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const colorMap = {
      good: 'bg-green-100 text-green-800',
      damaged: 'bg-orange-100 text-orange-800',
      defective: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[condition] || 'bg-gray-100 text-gray-800'}`}>
        {receivingService.getConditionText(condition)}
      </span>
    );
  };

  const canProcessReceiving = () => {
    return receiving?.status !== 'completed' && 
           receivingService.canPerformAction('process', receiving, currentUser);
  };

  const canUpdateReceiving = () => {
    return receiving?.status !== 'completed' && 
           receivingService.canPerformAction('update', receiving, currentUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Receiving Details</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/receiving')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Receiving
          </button>
        </div>
      </div>
    );
  }

  if (!receiving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Receiving Record Not Found</h3>
          <p className="text-sm text-gray-500 mb-4">The receiving record you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/receiving')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Receiving
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/receiving')}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Receiving #{receiving.receivingID}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Supplier #{receiving.supplierID} • Worker #{receiving.workerID}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canProcessReceiving() && (
                <button
                  onClick={() => setShowProcessModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Process Receiving
                </button>
              )}
              {canUpdateReceiving() && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Receiving Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Receiving Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(receiving.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                  <div className="mt-1 flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{receiving.reference_number || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Received Date</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{receiving.received_date_formatted}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <div className="mt-1 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">Supplier #{receiving.supplierID}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Worker</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">Worker #{receiving.workerID}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <div className="mt-1">
                    <span className="text-sm text-gray-900">{receiving.condition_display}</span>
                  </div>
                </div>
              </div>
              {receiving.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-1 flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-900">{receiving.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Items ({receiving.items_count})
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Progress: {receiving.progress_percentage}%
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${receiving.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receiving.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{item.itemID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.expected_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={item.quantity !== item.expected_quantity ? 'text-orange-600 font-medium' : ''}>
                            {item.quantity}
                          </span>
                          {item.quantity !== item.expected_quantity && (
                            <AlertCircle className="w-4 h-4 inline ml-1 text-orange-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getConditionBadge(item.condition)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.processed ? 'Processed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.locationID ? (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                              Location #{item.locationID}
                            </div>
                          ) : (
                            'Not assigned'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Items</span>
                  <span className="text-sm text-gray-900">{receiving.items_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Expected Quantity</span>
                  <span className="text-sm text-gray-900">{receiving.expected_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Received Quantity</span>
                  <span className="text-sm text-gray-900">{receiving.total_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Processed Items</span>
                  <span className="text-sm text-gray-900">{receiving.processed_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-900">{receiving.progress_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Has Discrepancy</span>
                  <span className={`text-sm ${receiving.has_discrepancy ? 'text-orange-600' : 'text-green-600'}`}>
                    {receiving.has_discrepancy ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Complete</span>
                  <span className={`text-sm ${receiving.is_complete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {receiving.is_complete ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Related Records
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/suppliers/${receiving.supplierID}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Supplier #{receiving.supplierID}</span>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={`/workers/${receiving.workerID}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Worker #{receiving.workerID}</span>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Receiving</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={editData.reference_number}
                    onChange={(e) => setEditData({ ...editData, reference_number: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter reference number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateReceiving}
                  disabled={processingAction === 'updating'}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processingAction === 'updating' ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Process Receiving</h3>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Review and process the received items. This will update inventory levels and complete the receiving workflow.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expected
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual Received
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{item.itemID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.expected_quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={item.actual_quantity}
                              onChange={(e) => handleItemChange(index, 'actual_quantity', parseInt(e.target.value) || 0)}
                              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={item.condition}
                              onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="good">Good</option>
                              <option value="damaged">Damaged</option>
                              <option value="defective">Defective</option>
                              <option value="expired">Expired</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Optional notes"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessReceiving}
                  disabled={processingAction === 'processing'}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processingAction === 'processing' ? 'Processing...' : 'Process Receiving'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingDetail;
