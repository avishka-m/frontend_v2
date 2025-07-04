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
  Ruler,
  Tag,
  FileText,
  Save,
  X
} from 'lucide-react';
import packingService from '../services/packingService';

const PackingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [packing, setPacking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [completionData, setCompletionData] = useState({
    packed_items: [],
    weight: '',
    dimensions: '',
    package_type: ''
  });

  useEffect(() => {
    fetchPackingDetails();
  }, [id]);

  const fetchPackingDetails = async () => {
    try {
      setLoading(true);
      const result = await packingService.getPackingById(id);
      
      if (result.success) {
        setPacking(result.data);
        setEditData({
          status: result.data.status,
          is_partial: result.data.is_partial,
          package_type: result.data.package_type,
          weight: result.data.weight || '',
          dimensions: result.data.dimensions || '',
          notes: result.data.notes || ''
        });
        
        // Initialize completion data
        setCompletionData({
          packed_items: result.data.items?.map(item => ({
            itemID: item.itemID,
            pickingID: item.pickingID,
            orderDetailID: item.orderDetailID,
            actual_quantity: item.packed ? item.actual_quantity : item.quantity,
            notes: item.notes || ''
          })) || [],
          weight: result.data.weight || '',
          dimensions: result.data.dimensions || '',
          package_type: result.data.package_type || 'box'
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch packing details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPacking = async () => {
    try {
      setProcessingAction('starting');
      const result = await packingService.startPacking(id);
      
      if (result.success) {
        setPacking(result.data);
        alert('Packing process started successfully!');
      } else {
        alert('Failed to start packing: ' + result.error);
      }
    } catch (err) {
      alert('Failed to start packing process');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCompletePacking = async () => {
    try {
      setProcessingAction('completing');
      const result = await packingService.completePacking(id, completionData);
      
      if (result.success) {
        setPacking(result.data);
        setShowCompleteModal(false);
        alert('Packing completed successfully!');
      } else {
        alert('Failed to complete packing: ' + result.error);
      }
    } catch (err) {
      alert('Failed to complete packing');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUpdatePacking = async () => {
    try {
      setProcessingAction('updating');
      const result = await packingService.updatePacking(id, editData);
      
      if (result.success) {
        setPacking(result.data);
        setShowEditModal(false);
        alert('Packing updated successfully!');
      } else {
        alert('Failed to update packing: ' + result.error);
      }
    } catch (err) {
      alert('Failed to update packing');
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePrintLabel = async () => {
    try {
      setProcessingAction('printing');
      const result = await packingService.printShippingLabel(id);
      
      if (result.success) {
        fetchPackingDetails(); // Refresh data
        alert('Shipping label printed successfully!');
      } else {
        alert('Failed to print label: ' + result.error);
      }
    } catch (err) {
      alert('Failed to print shipping label');
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePackedItemChange = (index, field, value) => {
    const updatedItems = [...completionData.packed_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCompletionData({ ...completionData, packed_items: updatedItems });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{packingService.getStatusDisplay(status)}</span>
      </span>
    );
  };

  const canStartPacking = () => {
    return packing?.status === 'pending' && 
           (currentUser?.role === 'Packer' || currentUser?.role === 'Manager') &&
           (currentUser?.role === 'Manager' || packing?.workerID === currentUser?.workerID);
  };

  const canCompletePacking = () => {
    return packing?.status === 'in_progress' && 
           (currentUser?.role === 'Packer' || currentUser?.role === 'Manager') &&
           (currentUser?.role === 'Manager' || packing?.workerID === currentUser?.workerID);
  };

  const canEditPacking = () => {
    return packing?.status !== 'completed' && 
           (currentUser?.role === 'Manager' || 
            (currentUser?.role === 'Packer' && packing?.workerID === currentUser?.workerID));
  };

  const canPrintLabel = () => {
    return packing?.status === 'completed' && 
           !packing?.label_printed && 
           (currentUser?.role === 'Manager' || currentUser?.role === 'Packer');
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Packing Details</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/packing')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packing
          </button>
        </div>
      </div>
    );
  }

  if (!packing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Packing Record Not Found</h3>
          <p className="text-sm text-gray-500 mb-4">The packing record you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/packing')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packing
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
                onClick={() => navigate('/packing')}
                className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Packing #{packing.packingID}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Order #{packing.orderID} • Worker #{packing.workerID}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canStartPacking() && (
                <button
                  onClick={handleStartPacking}
                  disabled={processingAction === 'starting'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {processingAction === 'starting' ? 'Starting...' : 'Start Packing'}
                </button>
              )}
              {canCompletePacking() && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Packing
                </button>
              )}
              {canEditPacking() && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              {canPrintLabel() && (
                <button
                  onClick={handlePrintLabel}
                  disabled={processingAction === 'printing'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {processingAction === 'printing' ? 'Printing...' : 'Print Label'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Packing Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Packing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(packing.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Type</label>
                  <div className="mt-1 flex items-center">
                    <Box className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{packing.package_type_display}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created Date</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{packing.pack_date_formatted}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Worker</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">Worker #{packing.workerID}</span>
                  </div>
                </div>
                {packing.start_time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <div className="mt-1 flex items-center">
                      <Play className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{packing.start_time_formatted}</span>
                    </div>
                  </div>
                )}
                {packing.complete_time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complete Time</label>
                    <div className="mt-1 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{packing.complete_time_formatted}</span>
                    </div>
                  </div>
                )}
                {packing.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <div className="mt-1 flex items-center">
                      <Scale className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{packing.weight} kg</span>
                    </div>
                  </div>
                )}
                {packing.dimensions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                    <div className="mt-1 flex items-center">
                      <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{packing.dimensions} cm</span>
                    </div>
                  </div>
                )}
              </div>
              {packing.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-1 flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-900">{packing.notes}</span>
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
                  Items ({packing.items_count})
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Progress: {packing.progress_percentage}%
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${packing.progress_percentage}%` }}
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
                        Picking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Packed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {packing.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{item.itemID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{item.pickingID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.actual_quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.packed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.packed ? 'Packed' : 'Pending'}
                          </span>
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
                Progress Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Items</span>
                  <span className="text-sm text-gray-900">{packing.items_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Requested Quantity</span>
                  <span className="text-sm text-gray-900">{packing.total_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Packed Quantity</span>
                  <span className="text-sm text-gray-900">{packing.packed_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Completion</span>
                  <span className="text-sm text-gray-900">{packing.progress_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Partial Packing</span>
                  <span className="text-sm text-gray-900">{packing.is_partial ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Label Printed</span>
                  <span className="text-sm text-gray-900">{packing.label_printed ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Link */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Related Records
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/orders/${packing.orderID}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Box className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Order #{packing.orderID}</span>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={`/workers/${packing.workerID}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Worker #{packing.workerID}</span>
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
                <h3 className="text-lg font-medium text-gray-900">Edit Packing</h3>
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
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="partial">Partially Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Type
                  </label>
                  <select
                    value={editData.package_type}
                    onChange={(e) => setEditData({ ...editData, package_type: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="box">Box</option>
                    <option value="envelope">Envelope</option>
                    <option value="pallet">Pallet</option>
                    <option value="bag">Bag</option>
                    <option value="tube">Tube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editData.weight}
                    onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions (LxWxH cm)
                  </label>
                  <input
                    type="text"
                    value={editData.dimensions}
                    onChange={(e) => setEditData({ ...editData, dimensions: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 30x20x15"
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
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.is_partial}
                    onChange={(e) => setEditData({ ...editData, is_partial: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    This is a partial packing
                  </label>
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
                  onClick={handleUpdatePacking}
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

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Complete Packing</h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Type
                  </label>
                  <select
                    value={completionData.package_type}
                    onChange={(e) => setCompletionData({ ...completionData, package_type: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="box">Box</option>
                    <option value="envelope">Envelope</option>
                    <option value="pallet">Pallet</option>
                    <option value="bag">Bag</option>
                    <option value="tube">Tube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={completionData.weight}
                    onChange={(e) => setCompletionData({ ...completionData, weight: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions (LxWxH cm)
                  </label>
                  <input
                    type="text"
                    value={completionData.dimensions}
                    onChange={(e) => setCompletionData({ ...completionData, dimensions: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 30x20x15"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Items to Pack</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completionData.packed_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{item.itemID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {packing.items[index]?.quantity || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={packing.items[index]?.quantity || 0}
                              value={item.actual_quantity}
                              onChange={(e) => handlePackedItemChange(index, 'actual_quantity', parseInt(e.target.value) || 0)}
                              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handlePackedItemChange(index, 'notes', e.target.value)}
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
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompletePacking}
                  disabled={processingAction === 'completing'}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processingAction === 'completing' ? 'Completing...' : 'Complete Packing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingDetail;
