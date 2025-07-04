import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import returnsService, { RETURNS_STATUS, REFUND_STATUS, ITEM_CONDITIONS } from '../services/returnsService';

const ReturnDetail = () => {
  const { returnId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [returnRecord, setReturnRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const [refundForm, setRefundForm] = useState({
    refundAmount: '',
    refundStatus: 'processed'
  });

  const [processedItems, setProcessedItems] = useState([]);

  const isManager = currentUser?.role === 'Manager';
  const isReceivingClerk = currentUser?.role === 'ReceivingClerk';
  const canProcess = isReceivingClerk || isManager;
  const canRefund = isManager;

  useEffect(() => {
    loadReturn();
  }, [returnId]);

  const loadReturn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await returnsService.getReturn(returnId);
      
      if (result.success) {
        setReturnRecord(result.data);
        // Initialize processed items from existing data
        setProcessedItems(result.data.items.map(item => ({
          itemId: item.itemId,
          processed: item.processed,
          resellable: item.resellable,
          locationId: item.locationId,
          notes: item.notes || ''
        })));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load return record');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async () => {
    try {
      setIsProcessing(true);
      const result = await returnsService.processReturns(returnId);
      
      if (result.success) {
        await loadReturn();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to process return');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteReturn = async () => {
    try {
      setIsProcessing(true);
      
      const result = await returnsService.completeReturns(returnId, processedItems);
      
      if (result.success) {
        await loadReturn();
        setShowCompleteForm(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to complete return processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setIsProcessing(true);
      
      const result = await returnsService.processRefund(returnId, {
        refundAmount: parseFloat(refundForm.refundAmount),
        refundStatus: refundForm.refundStatus
      });
      
      if (result.success) {
        await loadReturn();
        setShowRefundForm(false);
        setRefundForm({ refundAmount: '', refundStatus: 'processed' });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessedItemChange = (index, field, value) => {
    setProcessedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RETURNS_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RETURNS_STATUS.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case RETURNS_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case REFUND_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case REFUND_STATUS.PROCESSED:
        return 'bg-green-100 text-green-800';
      case REFUND_STATUS.DENIED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading return details...</span>
      </div>
    );
  }

  if (!returnRecord) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Return record not found</h2>
        <button
          onClick={() => navigate('/returns')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Returns
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return #{returnRecord.returnId}</h1>
          <p className="text-gray-600">Return details and processing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/returns')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Returns
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Return Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Return Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Return ID</label>
            <p className="text-sm text-gray-900">#{returnRecord.returnId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Order ID</label>
            <p className="text-sm text-gray-900">#{returnRecord.orderId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Customer ID</label>
            <p className="text-sm text-gray-900">#{returnRecord.customerId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnRecord.status)}`}>
              {returnRecord.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Return Method</label>
            <p className="text-sm text-gray-900">{returnRecord.returnMethod}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Return Date</label>
            <p className="text-sm text-gray-900">{formatDate(returnRecord.returnDate)}</p>
          </div>
          {returnRecord.refundStatus && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Refund Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRefundStatusColor(returnRecord.refundStatus)}`}>
                {returnRecord.refundStatus}
              </span>
            </div>
          )}
          {returnRecord.refundAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Refund Amount</label>
              <p className="text-sm text-gray-900">{formatCurrency(returnRecord.refundAmount)}</p>
            </div>
          )}
        </div>
        {returnRecord.notes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">Notes</label>
            <p className="text-sm text-gray-900">{returnRecord.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canProcess && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {returnRecord.status === RETURNS_STATUS.PENDING && (
              <button
                onClick={handleProcessReturn}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </button>
            )}
            {returnRecord.status === RETURNS_STATUS.PROCESSING && (
              <button
                onClick={() => setShowCompleteForm(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Complete Processing
              </button>
            )}
            {canRefund && returnRecord.status === RETURNS_STATUS.COMPLETED && !returnRecord.refundAmount && (
              <button
                onClick={() => setShowRefundForm(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Process Refund
              </button>
            )}
          </div>
        </div>
      )}

      {/* Return Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Return Items</h2>
        <div className="space-y-4">
          {returnRecord.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Item ID</label>
                  <p className="text-sm text-gray-900">#{item.itemId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm text-gray-900">{item.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-sm text-gray-900">{item.reason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Condition</label>
                  <p className="text-sm text-gray-900">{item.condition}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Processed</label>
                  <p className="text-sm text-gray-900">{item.processed ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Resellable</label>
                  <p className="text-sm text-gray-900">{item.resellable ? 'Yes' : 'No'}</p>
                </div>
                {item.notes && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{item.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Processing Form */}
      {showCompleteForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Complete Processing</h2>
          <div className="space-y-4">
            {processedItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Item #{item.itemId}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.processed}
                        onChange={(e) => handleProcessedItemChange(index, 'processed', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Processed</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.resellable}
                        onChange={(e) => handleProcessedItemChange(index, 'resellable', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Resellable</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Notes
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleProcessedItemChange(index, 'notes', e.target.value)}
                      placeholder="Processing notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCompleteForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteReturn}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Completing...' : 'Complete Processing'}
            </button>
          </div>
        </div>
      )}

      {/* Refund Form */}
      {showRefundForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Process Refund</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={refundForm.refundAmount}
                onChange={(e) => setRefundForm(prev => ({ ...prev, refundAmount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Status
              </label>
              <select
                value={refundForm.refundStatus}
                onChange={(e) => setRefundForm(prev => ({ ...prev, refundStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="processed">Processed</option>
                <option value="pending">Pending</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowRefundForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessRefund}
              disabled={isProcessing || !refundForm.refundAmount}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnDetail;
