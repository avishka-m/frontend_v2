import api from './api';

/**
 * Storing Service
 * 
 * Handles all storing job related API operations
 */

const API_BASE_URL = '/storing';

const storingService = {
  /**
   * Get all storing jobs with optional filtering
   */
  async getStoringJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.task_type) params.append('task_type', filters.task_type);
      if (filters.assigned_worker_id) params.append('assigned_worker_id', filters.assigned_worker_id);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`${API_BASE_URL}?${params.toString()}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching storing jobs:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch storing jobs'
      };
    }
  },

  /**
   * Get a specific storing job by ID
   */
  async getStoringJob(storingId) {
    try {
      const response = await api.get(`${API_BASE_URL}/${storingId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching storing job:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch storing job'
      };
    }
  },

  /**
   * Create a new storing job
   */
  async createStoringJob(storingData) {
    try {
      const response = await api.post(API_BASE_URL, storingData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating storing job:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to create storing job'
      };
    }
  },

  /**
   * Update a storing job
   */
  async updateStoringJob(storingId, updateData) {
    try {
      const response = await api.put(`${API_BASE_URL}/${storingId}`, updateData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating storing job:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to update storing job'
      };
    }
  },

  /**
   * Start a storing job
   */
  async startStoringJob(storingId) {
    try {
      const response = await api.post(`${API_BASE_URL}/${storingId}/start`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error starting storing job:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to start storing job'
      };
    }
  },

  /**
   * Complete a storing job
   */
  async completeStoringJob(storingId) {
    try {
      const response = await api.post(`${API_BASE_URL}/${storingId}/complete`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error completing storing job:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to complete storing job'
      };
    }
  },

  /**
   * Get storing jobs for current picker (assigned to them)
   */
  async getMyStoringJobs() {
    try {
      // This will automatically filter by assigned worker due to backend logic
      const response = await api.get(API_BASE_URL);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching my storing jobs:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch your storing jobs'
      };
    }
  }
};

export default storingService;
