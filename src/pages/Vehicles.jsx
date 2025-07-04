import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import vehicleService, { VEHICLE_STATUS, VEHICLE_TYPES } from '../services/vehicleService';

const Vehicles = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadVehicles();
    loadStats();
  }, [filters.status, filters.vehicleType]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {};
      if (filters.status) filterParams.status = filters.status;
      if (filters.vehicleType) filterParams.vehicleType = filters.vehicleType;
      
      const result = await vehicleService.getVehicles(filterParams);
      
      if (result.success) {
        let filteredVehicles = result.data;
        
        // Apply search filter
        if (filters.search) {
          filteredVehicles = filteredVehicles.filter(vehicle =>
            vehicle.licensePlate.toLowerCase().includes(filters.search.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(filters.search.toLowerCase()) ||
            vehicle.vehicleType.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        setVehicles(filteredVehicles);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const result = await vehicleService.getVehicleStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      const result = await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      if (result.success) {
        loadVehicles();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update vehicle status');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }
    
    try {
      const result = await vehicleService.deleteVehicle(vehicleId);
      if (result.success) {
        loadVehicles();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete vehicle');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case VEHICLE_STATUS.IN_USE:
        return 'bg-blue-100 text-blue-800';
      case VEHICLE_STATUS.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'truck':
        return '🚛';
      case 'van':
        return '🚐';
      case 'delivery':
        return '📦';
      default:
        return '🚗';
    }
  };

  const canManageVehicles = currentUser?.role === 'Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Manage delivery vehicles, maintenance schedules, and routes</p>
        </div>
        {canManageVehicles && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => navigate('/vehicles/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Vehicles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.inUse}</div>
            <div className="text-sm text-gray-600">In Use</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
            <div className="text-sm text-gray-600">Maintenance</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && loadVehicles()}
              placeholder="License plate, model, or type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value={VEHICLE_STATUS.AVAILABLE}>Available</option>
              <option value={VEHICLE_STATUS.IN_USE}>In Use</option>
              <option value={VEHICLE_STATUS.MAINTENANCE}>Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value={VEHICLE_TYPES.TRUCK}>Truck</option>
              <option value={VEHICLE_TYPES.VAN}>Van</option>
              <option value={VEHICLE_TYPES.DELIVERY}>Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🚛</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.vehicleType
                ? 'No vehicles match your current filters.'
                : 'There are no vehicles in the system yet.'}
            </p>
            {canManageVehicles && !filters.search && !filters.status && !filters.vehicleType && (
              <button
                onClick={() => navigate('/vehicles/create')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getTypeIcon(vehicle.vehicleType)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.licensePlate}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{vehicle.vehicleType}</div>
                        <div className="text-gray-500">
                          {vehicle.capacity}kg • {vehicle.volume}m³ • {vehicle.year}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.replace('_', ' ')}
                        </span>
                        {canManageVehicles && (
                          <select
                            value={vehicle.status}
                            onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={VEHICLE_STATUS.AVAILABLE}>Available</option>
                            <option value={VEHICLE_STATUS.IN_USE}>In Use</option>
                            <option value={VEHICLE_STATUS.MAINTENANCE}>Maintenance</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {vehicle.lastMaintenanceDate && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(vehicle.lastMaintenanceDate).toLocaleDateString()}
                          </div>
                        )}
                        {vehicle.nextMaintenanceDate && (
                          <div className="text-xs text-gray-500">
                            Next: {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {canManageVehicles && (
                          <>
                            <button
                              onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
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

export default Vehicles;