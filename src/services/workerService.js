import { api } from './apiConfig';

// Worker roles constants
export const WORKER_ROLES = {
  MANAGER: 'Manager',
  RECEIVING_CLERK: 'ReceivingClerk',
  PICKER: 'Picker',
  PACKER: 'Packer',
  DRIVER: 'Driver'
};

// Worker role display names
export const WORKER_ROLE_DISPLAY = {
  [WORKER_ROLES.MANAGER]: 'Manager',
  [WORKER_ROLES.RECEIVING_CLERK]: 'Receiving Clerk',
  [WORKER_ROLES.PICKER]: 'Picker',
  [WORKER_ROLES.PACKER]: 'Packer',
  [WORKER_ROLES.DRIVER]: 'Driver'
};

// Worker role colors for UI
export const WORKER_ROLE_COLORS = {
  [WORKER_ROLES.MANAGER]: 'bg-purple-100 text-purple-800',
  [WORKER_ROLES.RECEIVING_CLERK]: 'bg-blue-100 text-blue-800',
  [WORKER_ROLES.PICKER]: 'bg-green-100 text-green-800',
  [WORKER_ROLES.PACKER]: 'bg-yellow-100 text-yellow-800',
  [WORKER_ROLES.DRIVER]: 'bg-orange-100 text-orange-800'
};

// Worker status colors
export const WORKER_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  disabled: 'bg-red-100 text-red-800'
};

/**
 * Transform backend worker data to frontend format
 */
const transformWorkerData = (worker) => {
  if (!worker) return null;
  
  return {
    // Core fields
    id: worker._id,
    workerID: worker.workerID,
    name: worker.name,  // Backend uses 'name' field
    role: worker.role,
    role_display: WORKER_ROLE_DISPLAY[worker.role] || worker.role,
    username: worker.username,
    email: worker.email,
    phone: worker.phone,
    disabled: worker.disabled || false,
    
    // Status fields
    status: worker.disabled ? 'disabled' : 'active',
    status_display: worker.disabled ? 'Disabled' : 'Active',
    
    // Timestamps
    created_at: worker.created_at,
    updated_at: worker.updated_at,
    
    // Computed fields
    full_name: worker.name,
    contact_info: worker.email || worker.phone || 'No contact info',
    
    // Role-specific data
    role_color: WORKER_ROLE_COLORS[worker.role] || 'bg-gray-100 text-gray-800',
    status_color: WORKER_STATUS_COLORS[worker.disabled ? 'disabled' : 'active']
  };
};

/**
 * Transform frontend worker data to backend format
 */
const transformWorkerForBackend = (worker) => {
  return {
    name: worker.name,  // Backend expects 'name', frontend uses 'name'
    role: worker.role,
    email: worker.email || null,
    phone: worker.phone || null,
    username: worker.username,
    ...(worker.password && { password: worker.password })
  };
};

export const workerService = {
  // Get all workers with optional filtering
  getWorkers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.role && params.role !== 'All') queryParams.append('role', params.role);
      
      const response = await api.get(`/workers?${queryParams.toString()}`);
      
      // Transform backend data to frontend format
      const transformedData = response.data.map(transformWorkerData);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw error;
    }
  },

  // Get a single worker by ID
  getWorker: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: Worker ID must be provided.");
    }

    try {
      const response = await api.get(`/workers/${id}`);
      return transformWorkerData(response.data);
    } catch (error) {
      console.error(`Error fetching worker with ID ${id}:`, error.message);
      throw new Error(`Failed to fetch worker: ${error.message}`);
    }
  },

  // Create a new worker
  createWorker: async (workerData) => {
    try {
      const backendData = transformWorkerForBackend(workerData);
      const response = await api.post('/workers', backendData);
      return transformWorkerData(response.data);
    } catch (error) {
      console.error('Error creating worker:', error);
      throw new Error(`Failed to create worker: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Update an existing worker
  updateWorker: async (id, updateData) => {
    if (!id) {
      throw new Error("Invalid ID: Worker ID must be provided.");
    }

    try {
      const backendData = {};
      
      // Only include fields that are being updated
      if (updateData.name !== undefined) backendData.name = updateData.name;  // Backend expects 'name'
      if (updateData.role !== undefined) backendData.role = updateData.role;
      if (updateData.email !== undefined) backendData.email = updateData.email || null;
      if (updateData.phone !== undefined) backendData.phone = updateData.phone || null;
      if (updateData.disabled !== undefined) backendData.disabled = updateData.disabled;
      if (updateData.password !== undefined && updateData.password) {
        backendData.password = updateData.password;
      }
      
      const response = await api.put(`/workers/${id}`, backendData);
      return transformWorkerData(response.data);
    } catch (error) {
      console.error(`Error updating worker with ID ${id}:`, error.message);
      throw new Error(`Failed to update worker: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Deactivate a worker (soft delete)
  deactivateWorker: async (id) => {
    if (!id) {
      throw new Error("Invalid ID: Worker ID must be provided.");
    }

    try {
      const response = await api.delete(`/workers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating worker with ID ${id}:`, error.message);
      throw new Error(`Failed to deactivate worker: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Toggle worker status (activate/deactivate)
  toggleWorkerStatus: async (id, disabled) => {
    if (!id) {
      throw new Error("Invalid ID: Worker ID must be provided.");
    }

    try {
      const response = await api.put(`/workers/${id}`, { disabled });
      return transformWorkerData(response.data);
    } catch (error) {
      console.error(`Error toggling worker status with ID ${id}:`, error.message);
      throw new Error(`Failed to toggle worker status: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get workers by role
  getWorkersByRole: async (role) => {
    try {
      const response = await api.get(`/workers?role=${role}`);
      return response.data.map(transformWorkerData);
    } catch (error) {
      console.error(`Error fetching workers by role ${role}:`, error.message);
      throw new Error(`Failed to fetch workers by role: ${error.message}`);
    }
  },

  // Get active workers only
  getActiveWorkers: async () => {
    try {
      const workers = await workerService.getWorkers();
      return workers.filter(worker => !worker.disabled);
    } catch (error) {
      console.error('Error fetching active workers:', error.message);
      throw new Error(`Failed to fetch active workers: ${error.message}`);
    }
  },

  // Validate worker data
  validateWorkerData: (workerData) => {
    const errors = {};
    
    if (!workerData.name || !workerData.name.trim()) {
      errors.name = 'Worker name is required';
    }
    
    if (!workerData.role) {
      errors.role = 'Worker role is required';
    } else if (!Object.values(WORKER_ROLES).includes(workerData.role)) {
      errors.role = 'Invalid worker role';
    }
    
    if (!workerData.username || !workerData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (workerData.email && workerData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workerData.email)) {
        errors.email = 'Invalid email format';
      }
    }
    
    if (workerData.phone && workerData.phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(workerData.phone)) {
        errors.phone = 'Invalid phone number format';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default workerService;