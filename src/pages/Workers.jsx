import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../context/NotificationContext';
import { 
  workerService, 
  WORKER_ROLES, 
  WORKER_ROLE_DISPLAY, 
  WORKER_ROLE_COLORS,
  WORKER_STATUS_COLORS
} from '../services/workerService';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserMinus, 
  UserCheck,
  Phone, 
  Mail, 
  Shield,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Settings
} from 'lucide-react';

const Workers = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // State management
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Load workers data
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const workersData = await workerService.getWorkers();
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading workers:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to load workers',
        description: error.message || 'Unable to fetch workers data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (workerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await workerService.toggleWorkerStatus(workerId, newStatus);
      
      // Update local state
      setWorkers(prev => prev.map(worker => 
        worker.workerID === workerId 
          ? { ...worker, disabled: newStatus, status: newStatus ? 'disabled' : 'active' }
          : worker
      ));
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Worker Status Updated',
        description: `Worker has been ${newStatus ? 'deactivated' : 'activated'} successfully.`
      });
    } catch (error) {
      console.error('Error updating worker status:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update status',
        description: error.message || 'Unable to update worker status.'
      });
    }
  };

  const handleViewWorker = (workerId) => {
    navigate(`/workers/${workerId}`);
  };

  const handleEditWorker = (workerId) => {
    navigate(`/workers/${workerId}`);
  };

  const handleCreateWorker = () => {
    navigate('/workers/create');
  };

  // Filter and sort workers
  const filteredAndSortedWorkers = workers
    .filter(worker => {
      const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.phone?.includes(searchTerm);
      
      const matchesRole = selectedRole === 'All' || worker.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || worker.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get statistics
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => !w.disabled).length;
  const disabledWorkers = workers.filter(w => w.disabled).length;
  
  const roleStats = Object.values(WORKER_ROLES).map(role => ({
    role,
    count: workers.filter(w => w.role === role).length,
    display: WORKER_ROLE_DISPLAY[role]
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading workers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workers Management</h1>
            <p className="text-gray-600">{totalWorkers} total workers, {activeWorkers} active</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadWorkers}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleCreateWorker}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorkers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Workers</p>
              <p className="text-2xl font-bold text-green-600">{activeWorkers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disabled Workers</p>
              <p className="text-2xl font-bold text-red-600">{disabledWorkers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <UserMinus className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Most Common Role</p>
              <p className="text-lg font-semibold text-gray-900">
                {roleStats.sort((a, b) => b.count - a.count)[0]?.display || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workers by name, username, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Roles</option>
              {Object.entries(WORKER_ROLES).map(([key, value]) => (
                <option key={key} value={value}>
                  {WORKER_ROLE_DISPLAY[value]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="role">Role</option>
              <option value="status">Status</option>
              <option value="created_at">Created Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredAndSortedWorkers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workers Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedRole !== 'All' || selectedStatus !== 'All' 
                ? "No workers match your current filters."
                : "No workers have been added yet."}
            </p>
            {(!searchTerm && selectedRole === 'All' && selectedStatus === 'All') && (
              <button
                onClick={handleCreateWorker}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add First Worker
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Worker</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Contact</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">Created</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedWorkers.map((worker) => (
                  <tr key={worker.workerID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                          <div className="text-sm text-gray-500">@{worker.username}</div>
                          <div className="text-sm text-gray-500">ID: {worker.workerID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${WORKER_ROLE_COLORS[worker.role]}`}>
                        {worker.role_display}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {worker.email && (
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 text-gray-400 mr-1" />
                            {worker.email}
                          </div>
                        )}
                        {worker.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-1" />
                            {worker.phone}
                          </div>
                        )}
                        {!worker.email && !worker.phone && (
                          <span className="text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${WORKER_STATUS_COLORS[worker.disabled ? 'disabled' : 'active']}`}>
                        {worker.disabled ? 'Inactive' : 'Active'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {worker.created_at ? new Date(worker.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewWorker(worker.workerID)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditWorker(worker.workerID)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Worker"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(worker.workerID, worker.disabled)}
                          className={`transition-colors ${
                            worker.disabled 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-red-600 hover:text-red-800'
                          }`}
                          title={worker.disabled ? 'Activate Worker' : 'Deactivate Worker'}
                        >
                          {worker.disabled ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workers;
