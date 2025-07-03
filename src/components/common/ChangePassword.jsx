import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    
    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Password updated',
        description: 'Your password has been updated successfully.'
      });
      
      // Redirect to profile page
      navigate('/profile');
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to change password',
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Current Password
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </label>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>
          
          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                required
                minLength={8}
              />
            </label>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">Password must be at least 8 characters</p>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm New Password
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </label>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;