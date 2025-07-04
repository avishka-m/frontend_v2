import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const WorkerDetail = () => {
  const { id: workerId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    disabled: false
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadWorker();
  }, [workerId]);

  const loadWorker = async () => {
    if (!workerId) {
      console.error('No worker ID provided');
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Worker',
        description: 'No worker ID was provided in the URL.'
      });
      navigate('/workers');
      return;
    }

    try {
      setLoading(true);
      const workerData = await workerService.getWorker(workerId);
      setWorker(workerData);
      
      // Initialize edit form with current data
      setEditForm({
        name: workerData.name || '',
        role: workerData.role || '',
        username: workerData.username || '',
        email: workerData.email || '',
        phone: workerData.phone || '',
        password: '',
        disabled: workerData.disabled || false
      });
    } catch (error) {
      console.error('Error loading worker:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to load worker',
        description: error.message || 'Unable to fetch worker details.'
      });
      navigate('/workers');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setErrors({});
    setShowPassword(false);
    
    if (!isEditing) {
      // Reset form when entering edit mode
      setEditForm({
        name: worker.name || '',
        role: worker.role || '',
        username: worker.username || '',
        email: worker.email || '',
        phone: worker.phone || '',
        password: '',
        disabled: worker.disabled || false
      });
    }
  };

  const validateForm = () => {
    const validation = workerService.validateWorkerData(editForm);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSave = async () => {
    if (!workerId) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Worker',
        description: 'No worker ID available.'
      });
      return;
    }

    if (!validateForm()) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Validation Error',
        description: 'Please fix the errors in the form before saving.'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Create update data, only including changed fields
      const updateData = {};
      if (editForm.name !== worker.name) updateData.name = editForm.name;
      if (editForm.role !== worker.role) updateData.role = editForm.role;
      if (editForm.email !== worker.email) updateData.email = editForm.email;
      if (editForm.phone !== worker.phone) updateData.phone = editForm.phone;
      if (editForm.disabled !== worker.disabled) updateData.disabled = editForm.disabled;
      if (editForm.password) updateData.password = editForm.password;
      
      const updatedWorker = await workerService.updateWorker(workerId, updateData);
      setWorker(updatedWorker);
      setIsEditing(false);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Worker Updated',
        description: 'Worker details have been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update worker',
        description: error.message || 'Unable to update worker details.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!workerId) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Invalid Worker',
        description: 'No worker ID available.'
      });
      return;
    }

    try {
      const newStatus = !worker.disabled;
      const updatedWorker = await workerService.toggleWorkerStatus(workerId, newStatus);
      setWorker(updatedWorker);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Status Updated',
        description: `Worker ${newStatus ? 'deactivated' : 'activated'} successfully.`
      });
    } catch (error) {
      console.error('Error toggling worker status:', error);
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update status',
        description: error.message || 'Unable to update worker status.'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (disabled) => {
    return disabled ? (
      <X className="w-4 h-4" />
    ) : (
      <CheckCircle className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading worker details...</span>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker Not Found</h2>
          <p className="text-gray-600 mb-4">The worker you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/workers')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Workers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workers')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Workers</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Worker Details</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={handleToggleStatus}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  worker.disabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {worker.disabled ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Activate</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Deactivate</span>
                  </>
                )}
              </button>
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Worker Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${WORKER_ROLE_COLORS[worker.role]}`}>
                  {worker.role_display}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${WORKER_STATUS_COLORS[worker.disabled ? 'disabled' : 'active']}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(worker.disabled)}
                    <span>{worker.disabled ? 'Inactive' : 'Active'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker ID</label>
                <p className="text-gray-900">{worker.workerID}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter worker name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{worker.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{worker.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                {isEditing ? (
                  <div>
                    <select
                      value={editForm.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      {Object.entries(WORKER_ROLES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {WORKER_ROLE_DISPLAY[value]}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{worker.role_display}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {worker.email || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {worker.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (leave empty to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editForm.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Status Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${worker.disabled ? 'text-red-600' : 'text-green-600'}`}>
                  {worker.disabled ? 'Inactive' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{worker.role_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(worker.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="font-medium">{formatDate(worker.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/workers')}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back to Workers List
              </button>
              {!worker.disabled && (
                <button
                  onClick={handleToggleStatus}
                  className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                >
                  Deactivate Worker
                </button>
              )}
              {worker.disabled && (
                <button
                  onClick={handleToggleStatus}
                  className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors"
                >
                  Activate Worker
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetail;
