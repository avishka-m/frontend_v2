import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import vehicleService, { VEHICLE_STATUS, VEHICLE_TYPES } from '../services/vehicleService';

const VehicleDetail = () => {
  const { vehicleId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    vehicleType: '',
    licensePlate: '',
    capacity: '',
    volume: '',
    model: '',
    year: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    notes: '',
    nextMaintenanceDays: 90
  });

  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const isManager = currentUser?.role === 'Manager';
  const isDriver = currentUser?.role === 'Driver';

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await vehicleService.getVehicle(vehicleId);
      
      if (result.success) {
        setVehicle(result.data);
        setFormData({
          vehicleType: result.data.vehicleType,
          licensePlate: result.data.licensePlate,
          capacity: result.data.capacity,
          volume: result.data.volume,
          model: result.data.model,
          year: result.data.year
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});

    try {
      const result = await vehicleService.updateVehicle(vehicleId, formData);

      if (result.success) {
        setVehicle(result.data);
        setIsEditing(false);
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const result = await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      if (result.success) {
        setVehicle(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update vehicle status');
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await vehicleService.recordMaintenance(vehicleId, maintenanceForm);
      if (result.success) {
        setVehicle(result.data);
        setShowMaintenanceForm(false);
        setMaintenanceForm({ notes: '', nextMaintenanceDays: 90 });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to record maintenance');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await vehicleService.deleteVehicle(vehicleId);
      if (result.success) {
        navigate('/vehicles', { 
          state: { 
            message: 'Vehicle deleted successfully!',
            type: 'success'
          }
        });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading vehicle details...</p>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="max-w-2xl mx-auto">
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
        <div className="mt-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-2">{getTypeIcon(vehicle?.vehicleType)}</span>
              {vehicle?.licensePlate}
            </h1>
            <p className="text-gray-600 mt-1">{vehicle?.model} • {vehicle?.year}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isManager && (
            <>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
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

      {/* Vehicle Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(vehicle?.status)}`}>
                {vehicle?.status?.replace('_', ' ')}
              </span>
              {(isManager || isDriver) && (
                <select
                  value={vehicle?.status || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1"
                >
                  <option value={VEHICLE_STATUS.AVAILABLE}>Available</option>
                  <option value={VEHICLE_STATUS.IN_USE}>In Use</option>
                  <option value={VEHICLE_STATUS.MAINTENANCE}>Maintenance</option>
                </select>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.vehicleType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value={VEHICLE_TYPES.TRUCK}>Truck</option>
                    <option value={VEHICLE_TYPES.VAN}>Van</option>
                    <option value={VEHICLE_TYPES.DELIVERY}>Delivery</option>
                  </select>
                  {validationErrors.vehicleType && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.vehicleType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.licensePlate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.licensePlate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.licensePlate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.model ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.model && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.model}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.year ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.year && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.capacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume (m³)
                  </label>
                  <input
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.volume ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.volume && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.volume}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vehicle Type</h3>
                <p className="text-gray-900 capitalize">{vehicle?.vehicleType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">License Plate</h3>
                <p className="text-gray-900">{vehicle?.licensePlate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Model</h3>
                <p className="text-gray-900">{vehicle?.model}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Year</h3>
                <p className="text-gray-900">{vehicle?.year}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Capacity</h3>
                <p className="text-gray-900">{vehicle?.capacity} kg</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Volume</h3>
                <p className="text-gray-900">{vehicle?.volume} m³</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h2>
            {isManager && (
              <button
                onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Record Maintenance
              </button>
            )}
          </div>

          {showMaintenanceForm && (
            <form onSubmit={handleMaintenanceSubmit} className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Notes
                  </label>
                  <textarea
                    value={maintenanceForm.notes}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the maintenance work performed..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Maintenance (days from now)
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.nextMaintenanceDays}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, nextMaintenanceDays: parseInt(e.target.value) }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Recording...
                      </>
                    ) : (
                      'Record Maintenance'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Last Maintenance</h3>
              <p className="text-gray-900">
                {vehicle?.lastMaintenanceDate
                  ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString()
                  : 'No maintenance records'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Next Maintenance</h3>
              <p className="text-gray-900">
                {vehicle?.nextMaintenanceDate
                  ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString()
                  : 'Not scheduled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <p className="text-gray-900">
                {vehicle?.createdAt
                  ? new Date(vehicle.createdAt).toLocaleString()
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
              <p className="text-gray-900">
                {vehicle?.updatedAt
                  ? new Date(vehicle.updatedAt).toLocaleString()
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
