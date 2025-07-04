import api from './api';

/**
 * Vehicle Service
 * 
 * Handles all vehicle-related API operations with proper error handling,
 * data transformation, and validation.
 */

// Vehicle status constants
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance'
};

// Vehicle type constants
export const VEHICLE_TYPES = {
  TRUCK: 'truck',
  VAN: 'van',
  DELIVERY: 'delivery'
};

/**
 * Transform vehicle data from backend format to frontend format
 */
const transformVehicleData = (vehicle) => {
  if (!vehicle) return null;
  
  return {
    id: vehicle.vehicleID,
    vehicleId: vehicle.vehicleID,
    vehicleType: vehicle.vehicle_type,
    licensePlate: vehicle.license_plate,
    capacity: vehicle.capacity,
    volume: vehicle.volume,
    model: vehicle.model,
    year: vehicle.year,
    status: vehicle.status,
    lastMaintenanceDate: vehicle.last_maintenance_date,
    nextMaintenanceDate: vehicle.next_maintenance_date,
    createdAt: vehicle.created_at,
    updatedAt: vehicle.updated_at
  };
};

/**
 * Transform vehicle data from frontend format to backend format
 */
const transformVehicleForBackend = (vehicle) => {
  return {
    vehicle_type: vehicle.vehicleType,
    license_plate: vehicle.licensePlate,
    capacity: parseFloat(vehicle.capacity),
    volume: parseFloat(vehicle.volume),
    model: vehicle.model,
    year: parseInt(vehicle.year)
  };
};

/**
 * Handle API response and errors
 */
const handleApiResponse = (response) => {
  return response.data;
};

/**
 * Validate vehicle data
 */
const validateVehicleData = (vehicle) => {
  const errors = {};
  
  if (!vehicle.vehicleType?.trim()) {
    errors.vehicleType = 'Vehicle type is required';
  }
  
  if (!vehicle.licensePlate?.trim()) {
    errors.licensePlate = 'License plate is required';
  } else if (!/^[A-Z0-9-]+$/.test(vehicle.licensePlate.trim())) {
    errors.licensePlate = 'License plate must contain only letters, numbers, and hyphens';
  }
  
  if (!vehicle.capacity || vehicle.capacity <= 0) {
    errors.capacity = 'Capacity must be a positive number';
  }
  
  if (!vehicle.volume || vehicle.volume <= 0) {
    errors.volume = 'Volume must be a positive number';
  }
  
  if (!vehicle.model?.trim()) {
    errors.model = 'Model is required';
  }
  
  if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
    errors.year = 'Year must be a valid year';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Vehicle Service Class
 */
class VehicleService {
  /**
   * Get all vehicles with optional filtering
   */
  async getVehicles(filters = {}) {
    try {
      const params = {};
      
      if (filters.skip) params.skip = filters.skip;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.vehicleType) params.vehicle_type = filters.vehicleType;
      
      const response = await api.get('/vehicles', { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data.map(transformVehicleData) : [],
        count: data.length
      };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch vehicles',
        data: []
      };
    }
  }

  /**
   * Get available vehicles with optional filtering
   */
  async getAvailableVehicles(filters = {}) {
    try {
      const params = {};
      
      if (filters.vehicleType) params.vehicle_type = filters.vehicleType;
      if (filters.minCapacity) params.min_capacity = filters.minCapacity;
      
      const response = await api.get('/vehicles/available', { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data.map(transformVehicleData) : []
      };
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch available vehicles',
        data: []
      };
    }
  }

  /**
   * Get a specific vehicle by ID
   */
  async getVehicle(vehicleId) {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      const response = await api.get(`/vehicles/${vehicleId}`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformVehicleData(data)
      };
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch vehicle'
      };
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicleData) {
    try {
      // Validate vehicle data
      const validation = validateVehicleData(vehicleData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const response = await api.post('/vehicles/', transformVehicleForBackend(vehicleData));
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformVehicleData(data),
        message: 'Vehicle created successfully'
      };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return {
        success: false,
        error: error.message || 'Failed to create vehicle'
      };
    }
  }

  /**
   * Update a vehicle
   */
  async updateVehicle(vehicleId, vehicleData) {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      // Validate vehicle data
      const validation = validateVehicleData(vehicleData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const response = await api.put(`/vehicles/${vehicleId}`, transformVehicleForBackend(vehicleData));
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformVehicleData(data),
        message: 'Vehicle updated successfully'
      };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return {
        success: false,
        error: error.message || 'Failed to update vehicle'
      };
    }
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId) {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      const response = await api.delete(`/vehicles/${vehicleId}`);
      const data = handleApiResponse(response);
      
      return {
        success: true,
        message: data.message || 'Vehicle deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete vehicle'
      };
    }
  }

  /**
   * Update vehicle status
   */
  async updateVehicleStatus(vehicleId, status) {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      if (!Object.values(VEHICLE_STATUS).includes(status)) {
        throw new Error('Invalid vehicle status');
      }
      
      const response = await api.put(`/vehicles/${vehicleId}/status`, null, {
        params: { status }
      });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformVehicleData(data),
        message: 'Vehicle status updated successfully'
      };
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update vehicle status'
      };
    }
  }

  /**
   * Record vehicle maintenance
   */
  async recordMaintenance(vehicleId, maintenanceData) {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      
      if (!maintenanceData.notes?.trim()) {
        throw new Error('Maintenance notes are required');
      }
      
      const params = {
        maintenance_notes: maintenanceData.notes
      };
      
      if (maintenanceData.nextMaintenanceDays) {
        params.next_maintenance_days = maintenanceData.nextMaintenanceDays;
      }
      
      const response = await api.post(`/vehicles/${vehicleId}/maintenance`, null, { params });
      const data = handleApiResponse(response);
      
      return {
        success: true,
        data: transformVehicleData(data),
        message: 'Maintenance recorded successfully'
      };
    } catch (error) {
      console.error('Error recording maintenance:', error);
      return {
        success: false,
        error: error.message || 'Failed to record maintenance'
      };
    }
  }

  /**
   * Get vehicle statistics
   */
  async getVehicleStats() {
    try {
      const result = await this.getVehicles();
      
      if (!result.success) {
        return result;
      }
      
      const vehicles = result.data;
      
      const stats = {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length,
        inUse: vehicles.filter(v => v.status === VEHICLE_STATUS.IN_USE).length,
        maintenance: vehicles.filter(v => v.status === VEHICLE_STATUS.MAINTENANCE).length,
        byType: {}
      };
      
      // Count by vehicle type
      vehicles.forEach(vehicle => {
        const type = vehicle.vehicleType;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting vehicle stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get vehicle statistics'
      };
    }
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();
export default vehicleService;
