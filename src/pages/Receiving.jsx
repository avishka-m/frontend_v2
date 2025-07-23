import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Truck,
  Eye,
  Edit,
  Play,
  RefreshCw
} from 'lucide-react';
import receivingService from '../services/receivingService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Receiving = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch receivings with React Query
  const {
    data: receivings = [],
    isLoading: loadingReceivings,
    isError: errorReceivings
  } = useQuery({
    queryKey: ['receivings', { statusFilter }],
    queryFn: async () => {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const result = await receivingService.getAllReceivings(filters);
      if (result.success) {
        return Array.isArray(result.data) ? result.data : [];
      } else {
        throw new Error(result.error || 'Failed to fetch receiving records');
      }
    },
    // Add default data to ensure it's always an array
    initialData: []
  });

  // Fetch stats with React Query
  const {
    data: stats,
    isLoading: loadingStats,
    isError: errorStats
  } = useQuery({
    queryKey: ['receivingStats'],
    queryFn: async () => {
      const result = await receivingService.getReceivingStats();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch receiving stats');
      }
    }
  });

  // Process receiving mutation
  const processReceivingMutation = useMutation({
    mutationFn: (receivingId) => receivingService.processReceiving(receivingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivings']);
      queryClient.invalidateQueries(['receivingStats']);
      alert('Receiving processed successfully!');
    },
    onError: (error) => {
      alert('Failed to process receiving: ' + (error.message || 'Unknown error'));
    }
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(['receivings']);
    queryClient.invalidateQueries(['receivingStats']);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const handleProcess = (receivingId) => {
    processReceivingMutation.mutate(receivingId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
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

  const canCreateReceiving = () => {
    return receivingService.canPerformAction('create', null, currentUser);
  };

  const canProcessReceiving = (receiving) => {
    return receivingService.canPerformAction('process', receiving, currentUser);
  };

  const canUpdateReceiving = (receiving) => {
    return receivingService.canPerformAction('update', receiving, currentUser);
  };

  const filteredReceivings = Array.isArray(receivings) ? receivings.filter(receiving => {
    const matchesSearch = !searchTerm || 
      receiving.receivingID.toString().includes(searchTerm) ||
      receiving.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.supplierID.toString().includes(searchTerm);
    return matchesSearch;
  }) : [];

  if (loadingReceivings || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorReceivings || errorStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          Failed to load receiving records or stats. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receiving Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage incoming shipments and deliveries
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loadingReceivings || loadingStats}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingReceivings || loadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canCreateReceiving() && (
            <button
              onClick={() => navigate('/receiving/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Receiving
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Receiving</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total_receiving}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending_receiving}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Play className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.processing_receiving}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completed_receiving}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by ID, reference, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500 self-center">
              {filteredReceivings.length} of {Array.isArray(receivings) ? receivings.length : 0} receiving records
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorReceivings && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Failed to fetch receiving records. Please try again later.</p>
            </div>
          </div>
        </div>
      )}
      {errorStats && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Failed to fetch receiving stats. Please try again later.</p>
            </div>
          </div>
        </div>
      )}

      {/* Receiving List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceivings.map((receiving) => (
                <tr key={receiving.receivingID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{receiving.receivingID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receiving.reference_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-gray-400" />
                      Supplier #{receiving.supplierID}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      Worker #{receiving.workerID}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{receiving.items_count} items</span>
                      {receiving.has_discrepancy && (
                        <AlertCircle className="w-4 h-4 ml-2 text-orange-500" title="Has discrepancy" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(receiving.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {receiving.received_date_formatted}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/receiving/${receiving.receivingID}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {canUpdateReceiving(receiving) && (
                        <Link
                          to={`/receiving/${receiving.receivingID}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      
                      {canProcessReceiving(receiving) && receiving.status !== 'completed' && (
                        <button
                          onClick={() => handleProcess(receiving.receivingID)}
                          className="text-green-600 hover:text-green-900"
                          title="Process Receiving"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReceivings.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No receiving records found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Get started by creating a new receiving record'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receiving;